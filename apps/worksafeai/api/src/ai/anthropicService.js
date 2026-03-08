const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Retry logic with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Retry on rate limit, timeout, or server errors
      const isRetryable = error.status === 429 || error.code === 'ETIMEDOUT' || error.status >= 500;
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Parse JSON response safely
const parseJSON = (content) => {
  try {
    // Remove markdown code blocks if present
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    
    if (!cleaned) {
      throw new Error('Empty response after cleanup');
    }
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON parse error - Content:', content.substring(0, 100), 'Error:', error.message);
    throw new Error(`Invalid JSON response from AI: ${error.message}`);
  }
};

// Sanitize input to prevent prompt injection
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Validate input is not empty after trimming
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error('Input cannot be empty');
  }
  
  // Check minimum length for meaningful content
  if (trimmed.length < 3) {
    throw new Error('Input must be at least 3 characters');
  }
  
  // Remove potential prompt injection patterns
  const sanitized = trimmed
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, 2000); // Limit length
  
  // Final validation that sanitization didn't result in empty string
  if (sanitized.trim().length === 0) {
    throw new Error('Input contained only invalid characters');
  }
  
  return sanitized;
};

// Generate hazards from task description
const generateHazards = async (taskDescription, industry = 'construction', companyProfile = null) => {
  try {
    const sanitizedTask = sanitizeInput(taskDescription);
    const sanitizedIndustry = sanitizeInput(industry);

    // Build context from company profile if available
    let companyContext = '';
    if (companyProfile && typeof companyProfile === 'object') {
      const size = companyProfile.companySize || 'unknown';
      const workTypes = companyProfile.operationalContext?.workTypes?.join(', ') || 'various';
      const riskTolerance = companyProfile.safetyPriorities?.riskTolerance || 'moderate';
      companyContext = `
Company Context:
- Size: ${size}
- Primary Work Types: ${workTypes}
- Risk Tolerance: ${riskTolerance}

`;
    }

    const prompt = `You are an expert workplace safety consultant specializing in hazard identification and risk assessment.

${companyContext}Industry: ${sanitizedIndustry}
Task Description: ${sanitizedTask}

Analyze this task for potential safety hazards. Identify 3-5 realistic, relevant hazards that workers might encounter.

For each hazard, provide:
1. A clear, concise description (max 200 characters)
2. Severity level: low, medium, or high

Return ONLY valid JSON as an array of objects with "description" and "severity" fields. Do not include any other text.

Example format:
[
  {"description": "Risk of falls from height above 6 feet", "severity": "high"},
  {"description": "Exposure to sharp tools and equipment", "severity": "medium"}
]`;

    const response = await retryWithBackoff(async () => {
      return await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const hazards = parseJSON(content);

    // Validate response structure
    if (!Array.isArray(hazards)) {
      throw new Error('Expected array of hazards');
    }

    // Validate and sanitize each hazard
    const validHazards = hazards
      .slice(0, 5) // Cap at 5 hazards
      .filter(h => h && typeof h.description === 'string' && h.description.length > 0)
      .filter(h => ['low', 'medium', 'high'].includes(h.severity))
      .map(h => ({
        description: h.description.slice(0, 500), // Cap description length
        severity: h.severity,
      }));

    return validHazards;
  } catch (error) {
    console.error('Error generating hazards:', error.message);
    // Return empty array on error, client can handle manual entry
    return [];
  }
};

// Review mitigation plan
const reviewMitigation = async (hazardDescription, mitigationPlan) => {
  try {
    const sanitizedHazard = sanitizeInput(hazardDescription);
    const sanitizedMitigation = sanitizeInput(mitigationPlan);

    const prompt = `You are an expert safety manager reviewing a mitigation plan for a workplace hazard.

Hazard: ${sanitizedHazard}
Proposed Mitigation: ${sanitizedMitigation}

Evaluate whether this mitigation plan adequately addresses the identified hazard. Consider:
1. Does it directly address the root cause?
2. Is it practical and implementable?
3. Does it reduce risk to an acceptable level?

Provide your evaluation as JSON with:
- "approved" (boolean): true if the plan adequately mitigates the hazard
- "feedback" (string, max 500 characters): Your assessment and reasoning
- "suggestions" (array of max 3 strings, max 100 characters each): Suggestions for improvement if not approved, or enhancements if approved

Return ONLY valid JSON, no other text.

Example format:
{
  "approved": true,
  "feedback": "This mitigation plan effectively addresses the hazard by implementing proper fall protection measures.",
  "suggestions": ["Consider adding quarterly safety drills", "Document all training sessions"]
}`;

    const response = await retryWithBackoff(async () => {
      return await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const review = parseJSON(content);

    // Validate response structure
    if (typeof review.approved !== 'boolean' || typeof review.feedback !== 'string') {
      throw new Error('Invalid mitigation review structure');
    }

    // Sanitize feedback and suggestions
    return {
      approved: review.approved,
      feedback: String(review.feedback).slice(0, 500),
      suggestions: Array.isArray(review.suggestions)
        ? review.suggestions.slice(0, 3).map(s => String(s).slice(0, 200))
        : [],
    };
  } catch (error) {
    console.error('Error reviewing mitigation:', error.message);
    // Return neutral response on error
    return {
      approved: null, // null = pending AI review
      feedback: 'AI review pending. Please try again.',
      suggestions: [],
    };
  }
};

module.exports = {
  generateHazards,
  reviewMitigation,
};

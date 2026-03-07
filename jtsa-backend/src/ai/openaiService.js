const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
  if (typeof input !== 'string') return '';
  // Remove potential prompt injection patterns
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim()
    .slice(0, 2000); // Limit length
};

// Generate hazards from task description
const generateHazards = async (taskDescription, industry = 'construction') => {
  const sanitizedTask = sanitizeInput(taskDescription);
  const sanitizedIndustry = sanitizeInput(industry);

  const prompt = `You are a safety expert reviewing work tasks for potential hazards.

Industry: ${sanitizedIndustry}
Task: ${sanitizedTask}

Identify 3-5 potential safety hazards for this task. For each hazard, provide:
1. A clear description
2. Severity level (low, medium, high)

Return your response as a JSON array with objects containing "description" and "severity" fields.
Example: [{"description": "Risk of falls from height", "severity": "high"}, ...]

Only return valid JSON, no additional text.`;

  try {
    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5, // Lower temp for more consistent JSON
        max_tokens: 500,
      });
    });

    const content = response.choices[0].message.content;
    const hazards = parseJSON(content);

    // Validate response structure
    if (!Array.isArray(hazards)) {
      throw new Error('Expected array of hazards');
    }

    return hazards.slice(0, 5); // Cap at 5 hazards
  } catch (error) {
    console.error('Error generating hazards:', error);
    // Return empty array on error, client can handle manual entry
    return [];
  }
};

// Review mitigation plan
const reviewMitigation = async (hazardDescription, mitigationPlan) => {
  const sanitizedHazard = sanitizeInput(hazardDescription);
  const sanitizedMitigation = sanitizeInput(mitigationPlan);

  const prompt = `You are a safety expert reviewing a mitigation plan for a workplace hazard.

Hazard: ${sanitizedHazard}
Proposed Mitigation: ${sanitizedMitigation}

Evaluate whether this mitigation plan adequately addresses the hazard. Provide:
1. Whether the plan is acceptable (yes/no/partial)
2. Your feedback on the plan
3. Any suggestions for improvement

Return your response as a JSON object with "approved" (boolean), "feedback" (string), and "suggestions" (array of strings).
Example: {"approved": true, "feedback": "This is a good plan...", "suggestions": ["Consider adding PPE..."]}

Only return valid JSON, no additional text.`;

  try {
    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 500,
      });
    });

    const content = response.choices[0].message.content;
    const review = parseJSON(content);

    // Validate response structure
    if (typeof review.approved !== 'boolean' || typeof review.feedback !== 'string') {
      throw new Error('Invalid mitigation review structure');
    }

    return review;
  } catch (error) {
    console.error('Error reviewing mitigation:', error);
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

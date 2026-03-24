/**
 * Vercel Cron Endpoint: DCWU Email Dispatch
 * 
 * Endpoint: /api/cron/dcwu-send-email
 * Schedule: Every Friday @ 9:00 AM EST
 * 
 * Sends Data Center Weekly Update email to Tim Ryan
 * Triggered automatically by Vercel cron
 * 
 * Environment Variables Required:
 * - GMAIL_USER: f5zothoi@gmail.com
 * - GMAIL_PASSWORD: Gmail app-specific password
 * - MAIL_FROM: lucy@elevationaiagents.com
 * - DCWU_RECIPIENT: tim.ryan@pro-tel.com
 * - DCWU_CONTENT_URL: URL/path to weekly content
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Initialize email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

/**
 * Log dispatch event to file
 */
function logDispatch(result) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    recipient: process.env.DCWU_RECIPIENT,
    subject: result.subject,
    messageId: result.messageId,
    status: result.status,
    error: result.error || null
  };

  const logPath = path.join(process.cwd(), 'logs', 'dcwu-dispatch.jsonl');
  const logDir = path.dirname(logPath);
  
  // Create logs directory if needed
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Append to JSONL log
  fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
  
  return logEntry;
}

/**
 * Load email content for the week
 * Default: DCWU_FIRST_EMAIL_DRAFT.md for Week 1 (3/28)
 */
function loadEmailContent() {
  const contentPath = process.env.DCWU_CONTENT_PATH || '/Users/timothyryan/.openclaw/workspace/DCWU_FIRST_EMAIL_DRAFT.md';
  
  try {
    if (fs.existsSync(contentPath)) {
      return fs.readFileSync(contentPath, 'utf8');
    }
  } catch (err) {
    console.error('Failed to load email content:', err);
  }

  // Fallback: generic template
  return `
# Data Center Weekly Update — Week of March 24-28, 2026

Hello Tim,

This week's Data Center Weekly Update is attached.

Best regards,
Lucy
AI Agent Orchestrator
lucy@elevationaiagents.com
  `.trim();
}

/**
 * Convert Markdown to HTML email
 * (Basic conversion; can be enhanced with markdown parser)
 */
function markdownToHtml(markdown) {
  // Simple conversion: preserve structure, basic formatting
  // For production: use a proper markdown-to-html library
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    h1 { font-size: 24px; color: #1a1a1a; margin: 20px 0 10px; }
    h2 { font-size: 18px; color: #2c3e50; margin: 15px 0 8px; }
    a { color: #0066cc; text-decoration: none; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    table { border-collapse: collapse; width: 100%; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f9f9f9; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto;">
    ${markdown
      .split('\n')
      .map(line => {
        if (line.startsWith('# ')) return `<h1>${line.replace('# ', '')}</h1>`;
        if (line.startsWith('## ')) return `<h2>${line.replace('## ', '')}</h2>`;
        if (line.startsWith('### ')) return `<h3>${line.replace('### ', '')}</h3>`;
        if (line.trim() === '') return '<p></p>';
        return `<p>${line}</p>`;
      })
      .join('\n')}
    <div class="footer">
      <p>Data Center Weekly Update sent automatically by Lucy</p>
      <p>Questions? Reply to this email or contact the team.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  
  return html;
}

/**
 * Main cron handler
 */
module.exports = async (req, res) => {
  // Verify this is a valid Vercel cron request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cron requests come from Vercel's internal service
  // In production, verify the request signature if needed
  
  const result = {
    subject: 'Data Center Weekly Update — Northeast Infrastructure Opportunity',
    status: 'failed',
    error: null,
    messageId: null
  };

  try {
    // Load email content
    const markdownContent = loadEmailContent();
    
    // Extract subject from markdown (first line starting with #)
    const subjectMatch = markdownContent.match(/^# (.+?)$/m);
    if (subjectMatch) {
      result.subject = `DCWU: ${subjectMatch[1].replace(/Data Center Weekly Update — /, '').substring(0, 50)}...`;
    }

    // Convert to HTML
    const htmlContent = markdownToHtml(markdownContent);

    // Prepare email
    const mailOptions = {
      from: process.env.MAIL_FROM || 'lucy@elevationaiagents.com',
      to: process.env.DCWU_RECIPIENT || 'tim.ryan@pro-tel.com',
      subject: result.subject,
      html: htmlContent,
      replyTo: process.env.MAIL_FROM || 'lucy@elevationaiagents.com',
      headers: {
        'X-Mailer': 'DCWU Automation',
        'X-Campaign': 'DCWU-Weekly',
        'X-Sent-By': 'Lucy AI Agent Orchestrator'
      }
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    result.status = 'success';
    result.messageId = info.messageId;

    // Log the successful dispatch
    const logEntry = logDispatch(result);
    
    console.log(`✅ DCWU email sent successfully to ${process.env.DCWU_RECIPIENT}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Subject: ${result.subject}`);
    
    return res.status(200).json({
      success: true,
      message: 'DCWU email sent successfully',
      data: logEntry
    });

  } catch (error) {
    result.status = 'failed';
    result.error = error.message;

    // Log the failure
    logDispatch(result);
    
    console.error('❌ DCWU email send failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: result
    });
  }
};

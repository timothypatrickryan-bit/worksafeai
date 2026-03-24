#!/usr/bin/env node

/**
 * Data Center Weekly Update Generator & Mailer
 * 
 * Generates professional HTML email with curated data center market intelligence
 * for NY/NJ/PA region and sends via Gmail SMTP.
 * 
 * Usage:
 *   node dc-weekly-update.js [--send] [--date YYYY-MM-DD] [--test]
 * 
 * Options:
 *   --send         Actually send the email (default: generate only)
 *   --test         Send to test recipient instead of production
 *   --date         Specific date to generate (default: current date)
 *   --mock         Use mock data (default: true for dev, false for prod)
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  sourceFile: path.join(__dirname, '../data/dc-sources.json'),
  templateFile: path.join(__dirname, '../templates/dc-weekly-email.html'),
  logsDir: path.join(__dirname, '../logs'),
  dataDir: path.join(__dirname, '../data'),
  
  // Email config (from env)
  smtp: {
    host: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.GMAIL_SMTP_PORT || '587'),
    secure: process.env.GMAIL_SMTP_SECURE === 'true',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  },
  
  from: process.env.EMAIL_FROM || 'lucy@elevationaiagents.com',
  to: process.env.EMAIL_TO || 'tim.ryan@pro-tel.com',
  testTo: process.env.EMAIL_TEST_TO || 'lucy@elevationaiagents.com',
  
  // Data retention
  dataRetentionDays: 30,
};

// ============================================================================
// UTILITIES
// ============================================================================

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  console.log(logMessage);
  
  // Also write to log file
  if (!fs.existsSync(CONFIG.logsDir)) {
    fs.mkdirSync(CONFIG.logsDir, { recursive: true });
  }
  
  const logFile = path.join(CONFIG.logsDir, `dc-weekly-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

function getWeekLabel(date = new Date()) {
  const endDate = date;
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - 6);
  
  return `Week of ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ============================================================================
// DATA LOADING & PROCESSING
// ============================================================================

function loadSources() {
  try {
    const data = fs.readFileSync(CONFIG.sourceFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    log(`Failed to load sources: ${error.message}`, 'error');
    return { sources: [], mockData: { insights: [] } };
  }
}

function loadStoredData() {
  const dataFile = path.join(CONFIG.dataDir, 'collected-data.json');
  if (fs.existsSync(dataFile)) {
    try {
      return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    } catch (error) {
      log(`Failed to load stored data: ${error.message}`, 'warn');
    }
  }
  return { insights: [], lastUpdated: null };
}

function getWeeklyInsights(useMock = true) {
  const sources = loadSources();
  
  if (useMock) {
    // Use mock data from sources.json
    const insights = sources.mockData.insights || [];
    log(`Using ${insights.length} mock insights`, 'info');
    return insights;
  }
  
  // In production, would load from collected-data.json
  const stored = loadStoredData();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyInsights = (stored.insights || []).filter(insight => {
    const insightDate = new Date(insight.date);
    return insightDate >= weekAgo;
  });
  
  log(`Loaded ${weeklyInsights.length} insights from past week`, 'info');
  return weeklyInsights;
}

// ============================================================================
// HTML GENERATION
// ============================================================================

function generateInsightHTML(insights) {
  return insights
    .slice(0, 7) // Top 7 insights per week
    .map((insight) => {
      const importance = insight.importance || 'medium';
      const regionDisplay = insight.region.replace(/_/g, ' ').toUpperCase();
      
      return `
    <div class="insight-item ${importance}">
      <div class="insight-title">${escapeHtml(insight.title)}</div>
      <div class="insight-description">${escapeHtml(insight.description)}</div>
      <div class="insight-meta">
        <span class="region">${regionDisplay}</span>
        <span class="type">${insight.type.replace(/_/g, ' ')}</span>
        <span class="source">${escapeHtml(insight.source)}</span>
      </div>
    </div>
      `.trim();
    })
    .join('\n');
}

function generateThemesHTML(insights) {
  // Group insights by type and create theme summaries
  const themes = {};
  
  insights.forEach((insight) => {
    const type = insight.type.replace(/_/g, ' ');
    if (!themes[type]) {
      themes[type] = { count: 0, items: [] };
    }
    themes[type].count++;
    themes[type].items.push(insight);
  });
  
  return Object.entries(themes)
    .slice(0, 4) // Top 4 themes
    .map(([themeName, data]) => {
      const topInsight = data.items[0];
      return `
    <div class="insight-item medium">
      <div class="insight-title">🔹 ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}</div>
      <div class="insight-description">${data.count} development${data.count > 1 ? 's' : ''} this week. ${escapeHtml(topInsight.description)}</div>
    </div>
      `.trim();
    })
    .join('\n');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function generateEmail(insights, date = new Date()) {
  try {
    let template = fs.readFileSync(CONFIG.templateFile, 'utf-8');
    
    const weekLabel = getWeekLabel(date);
    const generatedDate = formatDate(new Date());
    const insightsHTML = generateInsightHTML(insights);
    const themesHTML = generateThemesHTML(insights);
    
    const regions = new Set(insights.map((i) => i.region));
    const keyThemes = insights
      .slice(0, 3)
      .map((i) => i.type.replace(/_/g, ' '))
      .join(', ');
    
    const summaryStats = `${insights.length} developments across ${Array.from(regions).length} states (NY, NJ, PA). Focus areas: ${keyThemes}.`;
    
    // Replace placeholders
    template = template.replace('{{WEEK_LABEL}}', weekLabel);
    template = template.replace('{{WEEK_COUNT}}', insights.length.toString());
    template = template.replace('{{KEY_THEMES}}', escapeHtml(keyThemes));
    template = template.replace('{{SUMMARY_STATS}}', escapeHtml(summaryStats));
    template = template.replace('{{INSIGHTS_HTML}}', insightsHTML);
    template = template.replace('{{THEMES_HTML}}', themesHTML);
    template = template.replace('{{GENERATED_DATE}}', generatedDate);
    template = template.replace('{{CTA_URL}}', 'https://pro-tel.com/data-center-reports');
    template = template.replace('{{UNSUBSCRIBE_URL}}', 'https://pro-tel.com/unsubscribe?email=tim.ryan@pro-tel.com');
    template = template.replace('{{ARCHIVE_URL}}', 'https://pro-tel.com/data-center-updates');
    
    log('Email HTML generated successfully', 'info');
    return template;
  } catch (error) {
    log(`Failed to generate email: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================================================
// EMAIL SENDING
// ============================================================================

async function sendEmail(htmlContent, recipient, date = new Date()) {
  try {
    // Validate credentials
    if (!CONFIG.smtp.auth.user || !CONFIG.smtp.auth.pass) {
      throw new Error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    }
    
    const transporter = nodemailer.createTransport(CONFIG.smtp);
    
    // Test connection
    await transporter.verify();
    log('SMTP connection verified', 'info');
    
    const weekLabel = getWeekLabel(date);
    const subject = `Data Center Weekly Update: ${weekLabel}`;
    
    const mailOptions = {
      from: CONFIG.from,
      to: recipient,
      subject,
      html: htmlContent,
      text: `Data Center Weekly Update - ${weekLabel}. View the full email in an HTML-capable email client.`,
      headers: {
        'X-Mailer': 'DC-Weekly-Update/1.0',
        'X-Report-Type': 'data-center-market-intelligence',
      },
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    log(`Email sent successfully to ${recipient}`, 'info');
    log(`Message ID: ${info.messageId}`, 'debug');
    
    return { success: true, messageId: info.messageId, recipient };
  } catch (error) {
    log(`Failed to send email: ${error.message}`, 'error');
    throw error;
  }
}

// ============================================================================
// LOGGING & TRACKING
// ============================================================================

function logSendEvent(recipient, success, messageId = null, error = null) {
  const logsFile = path.join(CONFIG.logsDir, 'send-history.json');
  let history = [];
  
  if (fs.existsSync(logsFile)) {
    try {
      history = JSON.parse(fs.readFileSync(logsFile, 'utf-8'));
    } catch (e) {
      history = [];
    }
  }
  
  history.push({
    timestamp: new Date().toISOString(),
    recipient,
    success,
    messageId,
    error: error ? error.message : null,
  });
  
  // Keep last 100 records
  history = history.slice(-100);
  
  fs.writeFileSync(logsFile, JSON.stringify(history, null, 2));
  log(`Send event logged for ${recipient}`, 'debug');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const shouldSend = args.includes('--send');
  const isTest = args.includes('--test');
  const useMock = !args.includes('--no-mock');
  
  const dateArg = args.find((arg, i) => args[i - 1] === '--date');
  const date = dateArg ? new Date(dateArg) : new Date();
  
  const recipient = isTest ? CONFIG.testTo : CONFIG.to;
  
  log(`Starting Data Center Weekly Update generation`, 'info');
  log(`Configuration: send=${shouldSend}, test=${isTest}, mock=${useMock}, recipient=${recipient}`, 'info');
  
  try {
    // Load insights
    const insights = getWeeklyInsights(useMock);
    
    if (insights.length === 0) {
      log('No insights available for this week', 'warn');
      process.exit(1);
    }
    
    // Generate email
    const htmlContent = generateEmail(insights, date);
    
    // Save draft for review
    const draftFile = path.join(CONFIG.logsDir, `draft-${new Date().toISOString().split('T')[0]}.html`);
    fs.writeFileSync(draftFile, htmlContent);
    log(`Draft saved to ${draftFile}`, 'info');
    
    if (shouldSend) {
      // Send email
      const result = await sendEmail(htmlContent, recipient, date);
      logSendEvent(recipient, true, result.messageId);
      log(`✅ Email sent successfully to ${recipient}`, 'info');
    } else {
      log(`📧 Email generated (not sent). Use --send to deliver.`, 'info');
      log(`Preview: ${draftFile}`, 'info');
    }
    
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    logSendEvent(recipient, false, null, error);
    process.exit(1);
  }
}

main();

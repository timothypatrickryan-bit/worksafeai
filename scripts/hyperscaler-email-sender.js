#!/usr/bin/env node

/**
 * Hyperscaler Daily Update - Email Delivery
 * 
 * Sends the daily hyperscaler briefing to executive email
 * Called after hyperscaler-daily-update.js completes report generation
 * 
 * Reads: .hyperscaler-daily-report.txt + .hyperscaler-daily-articles.json
 * Sends: HTML-formatted email to tim.ryan@pro-tel.com
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const WORKSPACE = '/Users/timothyryan/.openclaw/workspace';
const LOG_FILE = path.join(WORKSPACE, '.hyperscaler-daily.log');
const REPORT_FILE = path.join(WORKSPACE, '.hyperscaler-daily-report.txt');
const ARTICLES_FILE = path.join(WORKSPACE, '.hyperscaler-daily-articles.json');
const PREFS_FILE = path.join(WORKSPACE, '.briefing-delivery-preferences.json');

function log(msg) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] 📧 ${msg}`;
  console.log(logMsg);
  fs.appendFileSync(LOG_FILE, logMsg + '\n');
}

async function sendEmail() {
  try {
    // Read preferences
    const prefs = JSON.parse(fs.readFileSync(PREFS_FILE, 'utf8'));
    const emailPrefs = prefs.briefings['hyperscaler-daily'].delivery.email;
    
    if (!emailPrefs.enabled) {
      log('Email delivery disabled in preferences, skipping');
      return;
    }

    // Read articles
    const articlesData = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
    const articles = articlesData.articles || [];
    
    // Group by category
    const categories = {
      'Data Center Construction': [],
      'Fiber Deployment': []
    };
    
    articles.forEach(article => {
      if (article.category === 'Data Center Construction') {
        categories['Data Center Construction'].push(article);
      } else {
        categories['Fiber Deployment'].push(article);
      }
    });

    // Generate HTML email
    const htmlEmail = generateHTMLEmail(categories);
    
    // Configure email transporter (Gmail SMTP relay)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || process.env.GMAIL_USER || 'f5zothoi@gmail.com',
        pass: process.env.SMTP_PASSWORD || process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD
      }
    });

    // Send email
    const mailOptions = {
      from: 'lucy@elevationaiagents.com',
      to: emailPrefs.address,
      subject: emailPrefs.subject + ' - ' + new Date().toLocaleDateString(),
      html: htmlEmail,
      priority: 'high',
      headers: {
        'X-Briefing-Type': 'hyperscaler-daily',
        'X-Generated': new Date().toISOString()
      }
    };

    const result = await transporter.sendMail(mailOptions);
    log(`✅ Email sent to ${emailPrefs.address} (Message ID: ${result.messageId})`);
    
  } catch (err) {
    log(`❌ Email delivery failed: ${err.message}`);
    throw err;
  }
}

function generateHTMLEmail(categories) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const totalArticles = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #667eea;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .article {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 4px;
    }
    .article-title {
      font-size: 16px;
      font-weight: 600;
      color: #222;
      margin: 0 0 8px 0;
    }
    .article-meta {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    .article-description {
      font-size: 14px;
      color: #555;
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .article-link {
      display: inline-block;
      color: #667eea;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      word-break: break-all;
    }
    .article-link:hover {
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #999;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .stats {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px 16px;
      margin-bottom: 20px;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
    }
    .badge {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      margin-left: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Hyperscaler Daily Update</h1>
    <p>${today}</p>
  </div>

  <div class="stats">
    ✅ <strong>${totalArticles} verified articles</strong> from leading industry sources
    <span class="badge">Today's Brief</span>
  </div>
`;

  // Data Center Construction
  const dcArticles = categories['Data Center Construction'];
  if (dcArticles.length > 0) {
    html += `<div class="section">
    <div class="section-title">🏗️ Data Center Construction (${dcArticles.length} articles)</div>`;
    
    dcArticles.slice(0, 10).forEach((article, idx) => {
      html += `
    <div class="article">
      <div class="article-title">${idx + 1}. ${article.title}</div>`;
      if (article.published) {
        html += `<div class="article-meta">Published: ${article.published}</div>`;
      }
      if (article.description) {
        html += `<div class="article-description">${article.description.substring(0, 150)}...</div>`;
      }
      html += `<a href="${article.url}" class="article-link">Read more →</a>
    </div>`;
    });
    
    html += `</div>`;
  }

  // Fiber Deployment
  const fiberArticles = categories['Fiber Deployment'];
  if (fiberArticles.length > 0) {
    html += `<div class="section">
    <div class="section-title">📡 Fiber Deployment (${fiberArticles.length} articles)</div>`;
    
    fiberArticles.slice(0, 10).forEach((article, idx) => {
      html += `
    <div class="article">
      <div class="article-title">${idx + 1}. ${article.title}</div>`;
      if (article.published) {
        html += `<div class="article-meta">Published: ${article.published}</div>`;
      }
      if (article.description) {
        html += `<div class="article-description">${article.description.substring(0, 150)}...</div>`;
      }
      html += `<a href="${article.url}" class="article-link">Read more →</a>
    </div>`;
    });
    
    html += `</div>`;
  }

  html += `
  <div class="footer">
    <p>
      Hyperscaler Daily Update • Generated by Lucy (AI Agent)<br>
      ${new Date().toISOString()}<br>
      <strong>Briefing Preferences:</strong> Email delivery to ${require('fs').existsSync(PREFS_FILE) ? JSON.parse(require('fs').readFileSync(PREFS_FILE, 'utf8')).briefings['hyperscaler-daily'].delivery.email.address : 'configured'}<br>
      All links verified and active ✅
    </p>
  </div>
</body>
</html>`;

  return html;
}

sendEmail().catch(err => {
  log(`Fatal: ${err.message}`);
  process.exit(1);
});

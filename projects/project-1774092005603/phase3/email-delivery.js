#!/usr/bin/env node

/**
 * Hyperscaler Update - Email Delivery Pipeline
 * Sends daily briefings via SMTP to Tim's email
 * Usage: node email-delivery.js --date YYYY-MM-DD [--test] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '/Users/timothyryan/.openclaw/workspace/.env' });

// Configuration - read from environment variables or .env file
const CONFIG = {
  // Email configuration
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: process.env.SMTP_PORT || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true' || false, // Use TLS
  fromEmail: process.env.FROM_EMAIL || 'lucy@elevationaiagents.com',
  fromName: process.env.FROM_NAME || 'Hyperscaler Update',
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  
  // Recipient configuration
  recipientEmail: process.env.RECIPIENT_EMAIL || '',
  ccEmails: (process.env.CC_EMAILS || '').split(',').filter(e => e.trim()),
  
  // File paths
  briefingDir: path.join(__dirname, '..', '..', 'briefings'),
  logFile: path.join(__dirname, '..', '..', 'briefings', 'delivery.log'),
  
  // Retry configuration
  maxRetries: 3,
  retryDelayMs: 5000,
};

class EmailDelivery {
  constructor(date) {
    this.date = date || new Date().toISOString().split('T')[0];
    this.logs = [];
    this.transporter = null;
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}`;
    this.logs.push(logLine);
    console.log(logLine);
  }

  /**
   * Validate SMTP configuration
   */
  validateConfig() {
    const errors = [];

    if (!CONFIG.recipientEmail) {
      errors.push('RECIPIENT_EMAIL environment variable not set');
    }
    if (!CONFIG.smtpUser) {
      errors.push('SMTP_USER environment variable not set');
    }
    if (!CONFIG.smtpPassword) {
      errors.push('SMTP_PASSWORD environment variable not set');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration errors:\n${errors.join('\n')}`);
    }

    this.log('SMTP configuration validated');
  }

  /**
   * Initialize SMTP transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: CONFIG.smtpHost,
        port: CONFIG.smtpPort,
        secure: CONFIG.smtpSecure,
        auth: {
          user: CONFIG.smtpUser,
          pass: CONFIG.smtpPassword,
        },
        // Increase timeout for slow connections
        connectionTimeout: 30000,
        socketTimeout: 30000,
      });

      this.log(`SMTP transporter initialized: ${CONFIG.smtpHost}:${CONFIG.smtpPort}`);
    } catch (error) {
      throw new Error(`Failed to initialize SMTP transporter: ${error.message}`);
    }
  }

  /**
   * Read briefing files
   */
  readBriefingFiles() {
    const htmlFile = path.join(CONFIG.briefingDir, `EMAIL_${this.date}.html`);
    const mdFile = path.join(CONFIG.briefingDir, `BRIEFING_${this.date}.md`);

    if (!fs.existsSync(htmlFile)) {
      throw new Error(`HTML briefing not found: ${htmlFile}`);
    }
    if (!fs.existsSync(mdFile)) {
      throw new Error(`Markdown briefing not found: ${mdFile}`);
    }

    const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
    const mdContent = fs.readFileSync(mdFile, 'utf-8');

    this.log(`Read briefing files for ${this.date}`);

    return { htmlFile, mdFile, htmlContent, mdContent };
  }

  /**
   * Generate email subject line
   */
  generateSubject() {
    const date = new Date(this.date);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return `Hyperscaler Update: ${dateStr}`;
  }

  /**
   * Send email with retries
   */
  async sendWithRetry(mailOptions, retryCount = 0) {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      if (retryCount < CONFIG.maxRetries) {
        this.log(`Send failed (attempt ${retryCount + 1}/${CONFIG.maxRetries}): ${error.message}`, 'WARN');
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelayMs));
        return this.sendWithRetry(mailOptions, retryCount + 1);
      } else {
        throw new Error(`Failed to send email after ${CONFIG.maxRetries} retries: ${error.message}`);
      }
    }
  }

  /**
   * Send test email
   */
  async sendTest(dryRun = false) {
    this.validateConfig();
    this.initializeTransporter();

    const testMailOptions = {
      from: `${CONFIG.fromName} <${CONFIG.fromEmail}>`,
      to: CONFIG.recipientEmail,
      subject: `[TEST] Hyperscaler Update - Email Delivery Test`,
      text: 'This is a test email from the Hyperscaler Update delivery pipeline.\n\nIf you received this, SMTP delivery is working correctly.',
      html: `
        <html>
          <head><meta charset="UTF-8"></head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2c5aa0;">Email Delivery Test</h1>
              <p>This is a test email from the Hyperscaler Update delivery pipeline.</p>
              <p><strong>If you received this, SMTP delivery is working correctly.</strong></p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                Sent at: ${new Date().toLocaleString()} EST<br>
                From: ${CONFIG.fromEmail}
              </p>
            </div>
          </body>
        </html>
      `,
    };

    if (dryRun) {
      this.log('[DRY RUN] Would send test email to: ' + CONFIG.recipientEmail);
      return { success: true, dryRun: true };
    }

    try {
      const info = await this.sendWithRetry(testMailOptions);
      this.log(`Test email sent successfully: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.log(`Test email failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
   * Send briefing email
   */
  async send(dryRun = false) {
    try {
      this.log(`Starting email delivery for ${this.date}`);
      this.log(`Dry run mode: ${dryRun ? 'ON' : 'OFF'}`);

      // Validate configuration
      this.validateConfig();

      // Read briefing files
      const { htmlContent, mdContent } = this.readBriefingFiles();

      // Initialize SMTP transporter (unless dry-run)
      if (!dryRun) {
        this.initializeTransporter();
      }

      // Prepare email
      const subject = this.generateSubject();
      const recipients = [CONFIG.recipientEmail, ...CONFIG.ccEmails].filter(e => e);

      const mailOptions = {
        from: `${CONFIG.fromName} <${CONFIG.fromEmail}>`,
        to: CONFIG.recipientEmail,
        cc: CONFIG.ccEmails.length > 0 ? CONFIG.ccEmails.join(',') : undefined,
        subject: subject,
        html: htmlContent,
        text: mdContent,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'MIME-Version': '1.0'
        }
      };

      if (dryRun) {
        this.log(`[DRY RUN] Would send email:`);
        this.log(`  From: ${mailOptions.from}`);
        this.log(`  To: ${CONFIG.recipientEmail}`);
        if (CONFIG.ccEmails.length > 0) {
          this.log(`  CC: ${CONFIG.ccEmails.join(', ')}`);
        }
        this.log(`  Subject: ${subject}`);
        this.log(`  HTML size: ${htmlContent.length} bytes`);
        this.log(`  Markdown size: ${mdContent.length} bytes`);
        return { success: true, dryRun: true, subject };
      }

      // Send email
      this.log(`Sending email to ${recipients.length} recipient(s)`);
      const info = await this.sendWithRetry(mailOptions);

      this.log(`Email delivery completed`);
      this.log(`Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        subject: subject,
        recipients: recipients,
        date: this.date,
      };
    } catch (error) {
      this.log(`Email delivery failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
   * Save delivery logs
   */
  async saveLogs(dryRun = false) {
    try {
      const logDir = path.dirname(CONFIG.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logContent = this.logs.join('\n') + '\n';

      if (!dryRun) {
        if (fs.existsSync(CONFIG.logFile)) {
          fs.appendFileSync(CONFIG.logFile, logContent, 'utf-8');
        } else {
          fs.writeFileSync(CONFIG.logFile, logContent, 'utf-8');
        }
      }

      this.log(`Logs saved to: ${CONFIG.logFile}`);
    } catch (error) {
      this.log(`Failed to save logs: ${error.message}`, 'ERROR');
    }
  }

  /**
   * Verify SMTP connection (test mode)
   */
  async verify() {
    try {
      this.validateConfig();
      this.initializeTransporter();

      this.log('Verifying SMTP connection...');
      await this.transporter.verify();
      this.log('SMTP connection verified successfully');

      return { success: true, host: CONFIG.smtpHost, port: CONFIG.smtpPort };
    } catch (error) {
      this.log(`SMTP verification failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  let date = null;
  let testMode = false;
  let dryRun = false;
  let verifyMode = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--date' && args[i + 1]) {
      date = args[++i];
    }
    if (args[i] === '--test') {
      testMode = true;
    }
    if (args[i] === '--dry-run') {
      dryRun = true;
    }
    if (args[i] === '--verify') {
      verifyMode = true;
    }
  }

  // Default to today's date
  if (!date) {
    const today = new Date();
    date = today.toISOString().split('T')[0];
  }

  try {
    const delivery = new EmailDelivery(date);

    if (verifyMode) {
      // Verify SMTP connection
      const result = await delivery.verify();
      console.log('\n✅ SMTP verification successful');
      console.log(`Host: ${result.host}:${result.port}`);
    } else if (testMode) {
      // Send test email
      const result = await delivery.sendTest(dryRun);
      console.log('\n✅ Test email sent successfully');
      if (!dryRun) {
        console.log(`Message ID: ${result.messageId}`);
      }
    } else {
      // Send briefing email
      const result = await delivery.send(dryRun);
      console.log('\n✅ Briefing delivered successfully');
      console.log(`Date: ${result.date}`);
      console.log(`Subject: ${result.subject}`);
      console.log(`Recipients: ${result.recipients.join(', ')}`);
      if (!dryRun) {
        console.log(`Message ID: ${result.messageId}`);
      }
    }

    // Save logs
    await delivery.saveLogs(dryRun);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '/Users/timothyryan/.openclaw/workspace/.env' });

const CONFIG = {
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: process.env.SMTP_PORT || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true' || false,
  fromEmail: process.env.FROM_EMAIL || 'lucy@elevationaiagents.com',
  fromName: 'Hyperscaler Update',
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  recipientEmail: process.env.RECIPIENT_EMAIL,
  briefingDir: '/Users/timothyryan/.openclaw/workspace/projects/briefings'
};

async function sendTestEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: CONFIG.smtpHost,
      port: CONFIG.smtpPort,
      secure: CONFIG.smtpSecure,
      auth: {
        user: CONFIG.smtpUser,
        pass: CONFIG.smtpPassword
      }
    });

    const htmlFile = path.join(CONFIG.briefingDir, 'EMAIL_2026-03-24.html');
    const htmlContent = fs.readFileSync(htmlFile, 'utf-8');

    const mailOptions = {
      from: `${CONFIG.fromName} <${CONFIG.fromEmail}>`,
      to: CONFIG.recipientEmail,
      subject: `[TEST] Hyperscaler Update: Premium HTML - March 24, 2026`,
      html: htmlContent,
      text: 'This is the HTML version of the newsletter. Please view in an HTML-capable email client.',
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      }
    };

    console.log('[TEST] Sending premium HTML email...');
    console.log(`To: ${CONFIG.recipientEmail}`);
    console.log(`HTML file size: ${htmlContent.length} bytes`);
    console.log(`Content-Type explicitly set to: text/html; charset=UTF-8`);

    const info = await transporter.sendMail(mailOptions);
    console.log('\n✅ Email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendTestEmail();

const nodemailer = require('nodemailer');
const fs = require('fs');

// Escape HTML to prevent template injection
const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (c) => map[c]);
};

// Validate URL to prevent javascript: protocol attacks
const validateUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return true;
  } catch (e) {
    return false;
  }
};

// Configure email transporter (uses environment variables)
const createTransporter = () => {
  // Support multiple email providers
  const provider = process.env.EMAIL_PROVIDER || 'smtp';

  if (provider === 'sendgrid') {
    // SendGrid via nodemailer
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // Generic SMTP fallback
    // In production, certificate verification MUST be enabled
    const rejectUnauthorized = process.env.NODE_ENV === 'production' ? true : false;
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465', // Use TLS if port 465, STARTTLS if 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized },
    });
  }
};

const transporter = createTransporter();

// Send JTSA completion email with PDF attachment
const sendJTSACompletionEmail = async (options) => {
  const {
    recipientEmail,
    recipientName,
    companyName,
    projectName,
    jtsa_id,
    pdfPath,
  } = options;

  try {
    // Validate inputs
    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new Error('Invalid recipient email');
    }
    if (!pdfPath) {
      throw new Error('PDF path required');
    }
    
    // Validate JTSA ID format (UUID only)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jtsa_id)) {
      throw new Error('Invalid JTSA ID format');
    }

    // Security: Ensure pdfPath is within pdfs directory (prevent directory traversal)
    const path = require('path');
    const pdfDir = path.resolve(__dirname, '../../pdfs');
    const resolvedPath = path.resolve(pdfPath);
    if (!resolvedPath.startsWith(pdfDir)) {
      throw new Error('Invalid PDF path');
    }

    if (!fs.existsSync(pdfPath)) {
      throw new Error('PDF file not found');
    }
    const pdfBuffer = fs.readFileSync(pdfPath);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@jtsa-tool.com',
      to: recipientEmail,
      subject: `JTSA Completed: ${escapeHtml(projectName)} - ${new Date().toLocaleDateString()}`,
      html: `
        <h2>Job Task Safety Analysis (JTSA) Completed</h2>
        <p>Hi ${escapeHtml(recipientName)},</p>
        <p>The JTSA for <strong>${escapeHtml(projectName)}</strong> on ${new Date().toLocaleDateString()} has been completed and is ready for review.</p>
        <p><strong>Company:</strong> ${escapeHtml(companyName)}</p>
        <p><strong>Project:</strong> ${escapeHtml(projectName)}</p>
        <p>Your completed JTSA document is attached as a PDF. This document contains all identified hazards, mitigations, and safety analysis for OSHA compliance.</p>
        <p>
          <a href="${escapeHtml((process.env.APP_URL || 'https://app.jtsa-tool.com') + '/jtsa/' + encodeURIComponent(jtsa_id))}" 
             style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            View JTSA Online
          </a>
        </p>
        <p>Best regards,<br>JTSA Tool Team</p>
      `,
      attachments: [
        {
          filename: `JTSA_${jtsa_id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipientEmail}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

// Send invite email to new employee
const sendInviteEmail = async (options) => {
  const {
    recipientEmail,
    recipientName,
    companyName,
    inviterName,
    role,
    inviteLink,
  } = options;

  try {
    // Validate invite link
    if (!validateUrl(inviteLink)) {
      throw new Error('Invalid invite link URL');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@jtsa-tool.com',
      to: recipientEmail,
      subject: `You've been invited to ${escapeHtml(companyName)} on JTSA Tool`,
      html: `
        <h2>Welcome to JTSA Tool</h2>
        <p>Hi ${escapeHtml(recipientName)},</p>
        <p>${escapeHtml(inviterName)} has invited you to join <strong>${escapeHtml(companyName)}</strong> on JTSA Tool as a <strong>${escapeHtml(role)}</strong>.</p>
        <p>JTSA Tool helps teams conduct AI-assisted job task safety analyses to identify and mitigate workplace hazards.</p>
        <p>
          <a href="${escapeHtml(inviteLink)}" 
             style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
            Accept Invitation
          </a>
        </p>
        <p>This invitation link expires in 7 days.</p>
        <p>If you have questions, contact your company administrator.</p>
        <p>Best regards,<br>JTSA Tool Team</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Invite sent to ${recipientEmail}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

// Verify email configuration
const testConnection = async () => {
  try {
    await transporter.verify();
    console.log('✓ Email service ready');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

// Send email verification email
const sendVerificationEmail = async (options) => {
  const { recipientEmail, recipientName, verificationLink } = options;

  try {
    // Validate verification link
    if (!validateUrl(verificationLink)) {
      throw new Error('Invalid verification link URL');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@jtsa-tool.com',
      to: recipientEmail,
      subject: 'Verify Your JTSA Tool Email Address',
      html: `
        <h2>Welcome to JTSA Tool</h2>
        <p>Hi ${escapeHtml(recipientName)},</p>
        <p>Thank you for registering with JTSA Tool. Please verify your email address to complete your account setup.</p>
        <p>
          <a href="${escapeHtml(verificationLink)}" 
             style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email Address
          </a>
        </p>
        <p><strong>This link expires in 7 days.</strong></p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
        <p>Best regards,<br>JTSA Tool Team</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${recipientEmail}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (options) => {
  const { recipientEmail, recipientName, resetLink } = options;

  try {
    // Validate reset link
    if (!validateUrl(resetLink)) {
      throw new Error('Invalid reset link URL');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@jtsa-tool.com',
      to: recipientEmail,
      subject: 'Reset Your JTSA Tool Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${escapeHtml(recipientName)},</p>
        <p>We received a request to reset the password for your JTSA Tool account.</p>
        <p>
          <a href="${escapeHtml(resetLink)}" 
             style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p><strong>This link expires in 24 hours.</strong></p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>Best regards,<br>JTSA Tool Team</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${recipientEmail}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = {
  sendJTSACompletionEmail,
  sendInviteEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  testConnection,
};

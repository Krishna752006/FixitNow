import nodemailer from 'nodemailer';
import environment from '../config/environment.js';

// Check if email credentials are configured
const emailUser = process.env.EMAIL_USER || environment.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || environment.EMAIL_PASS;

const isEmailConfigured = emailUser && emailPass;

if (!isEmailConfigured) {
  console.warn('⚠️  Email credentials not configured. OTP and notification emails will not be sent.');
  console.warn('📝 Please set EMAIL_USER and EMAIL_PASS (or EMAIL_PASSWORD) environment variables.');
}

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser || 'service.fixitnow@gmail.com',
    pass: emailPass || '',
  },
});

// Verify transporter connection
if (isEmailConfigured) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service error:', error.message);
    } else if (success) {
      console.log('✅ Email service is ready to send emails');
    }
  });
} else {
  console.warn('⚠️  Email service verification skipped - credentials not configured');
}

export const sendContactEmail = async (contactData) => {
  try {
    // Check if email is configured
    if (!isEmailConfigured) {
      const errorMsg = 'Email service is not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    const { subject, message, email, priority, userType, userName } = contactData;

    const mailOptions = {
      from: process.env.EMAIL_USER || environment.EMAIL_USER,
      to: process.env.EMAIL_USER || environment.EMAIL_USER,
      subject: `[${priority.toUpperCase()}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Support Message</h2>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>From:</strong> ${userName || 'User'}</p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            <p><strong>User Type:</strong> ${userType || 'User'}</p>
            <p><strong>Priority:</strong> <span style="color: ${priority === 'high' ? '#d32f2f' : priority === 'normal' ? '#f57c00' : '#388e3c'};">${priority.toUpperCase()}</span></p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            This is an automated email from FixItNow Support System. Please reply to this email to respond to the user.
          </p>
        </div>
      `,
      replyTo: email || undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Support email sent from:', email, '- Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending support email from', email, ':', error.message);
    throw error;
  }
};

export const isEmailServiceConfigured = () => isEmailConfigured;

export const sendNotificationEmail = async (to, subject, htmlContent) => {
  try {
    // Check if email is configured
    if (!isEmailConfigured) {
      const errorMsg = 'Email service is not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || environment.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Notification email sent to:', to, '- Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending notification email to', to, ':', error.message);
    throw error;
  }
};

export default { sendContactEmail, sendNotificationEmail };

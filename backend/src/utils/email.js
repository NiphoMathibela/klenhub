const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
let transporter;

const createTransporter = async () => {
  // If we're using Ethereal for testing, create a test account
  if (process.env.EMAIL_SERVICE === 'ethereal') {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test email account created:', testAccount.user);
    console.log('Test email password:', testAccount.pass);
    
    // Create a transporter using the test account
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } else if (process.env.EMAIL_SERVICE === 'smtp') {
    // Use custom SMTP configuration
    console.log('Using custom SMTP configuration for email');
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false
      }
    });
  } else {
    // Use the configured email service
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email text content (fallback)
 * @returns {Promise} - Nodemailer send result
 */
const sendEmail = async (options) => {
  // Create transporter if it doesn't exist
  if (!transporter) {
    transporter = await createTransporter();
  }
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML as fallback
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // If using Ethereal, log the preview URL
    if (process.env.EMAIL_SERVICE === 'ethereal') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
};

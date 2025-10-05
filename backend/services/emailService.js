const nodemailer = require('nodemailer');

let transporter = null;

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'mail.bindu.tconnecthub.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: false, // false for 587, true for 465
  requireTLS: true, // enable TLS for port 587
  auth: {
    user: process.env.SMTP_USER || 'test@bindu.tconnecthub.com',
    pass: process.env.SMTP_PASSWORD || 'your_email_password_here'
  }
};

// Initialize email service
const initializeEmailService = () => {
  try {
    transporter = nodemailer.createTransport(emailConfig);
    
    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email service verification failed:', error);
      } else {
        console.log('✅ Email service is ready to send emails');
        console.log(`📧 SMTP Host: ${emailConfig.host}:${emailConfig.port}`);
        console.log(`👤 SMTP User: ${emailConfig.auth.user}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error);
  }
};

// Email templates
const emailTemplates = {
  verification: (name, verificationLink) => ({
    subject: 'Verify your HappyMoments account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your HappyMoments account</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #ff6b35;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to HappyMoments!</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for signing up with HappyMoments! We're excited to help you find the perfect vendors for your special events.</p>
          
          <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">
            ${verificationLink}
          </p>
          
          <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create an account with HappyMoments, please ignore this email.</p>
          
          <p>Best regards,<br>
          The HappyMoments Team</p>
        </div>
        <div class="footer">
          <p>© 2024 HappyMoments. All rights reserved.</p>
          <p>This email was sent to ${name} because you signed up for a HappyMoments account.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},
      
      Welcome to HappyMoments! Thank you for signing up.
      
      To complete your registration, please verify your email address by clicking the link below:
      
      ${verificationLink}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with HappyMoments, please ignore this email.
      
      Best regards,
      The HappyMoments Team
    `
  })
};

// Send email function
const sendEmail = async (options) => {
  try {
    if (!transporter) {
      throw new Error('Email service not initialized');
    }

    const mailOptions = {
      from: `HappyMoments <${emailConfig.auth.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      messageId: result.messageId,
      to: options.to,
      subject: options.subject
    });

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Send verification email
const sendVerificationEmail = async (email, name, tokenOrUrl, baseUrl = null) => {
  try {
    let verificationLink;
    
    // Check if tokenOrUrl is already a full URL (for pre-signup verification)
    if (tokenOrUrl.startsWith('http://') || tokenOrUrl.startsWith('https://')) {
      verificationLink = tokenOrUrl;
    } else {
      // It's a token, so create the verification URL
      const encodedToken = encodeURIComponent(tokenOrUrl);
      verificationLink = `${baseUrl}/verify-email?token=${encodedToken}`;
    }
    
    // Use different template for pre-signup verification
    const template = emailTemplates.verification(name, verificationLink);

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return result;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send verification email'
    };
  }
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendVerificationEmail,
  emailTemplates
};

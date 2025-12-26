const nodemailer = require('nodemailer');

let transporter = null;

// Email configuration - lazy initialization to avoid startup timeouts
const getEmailConfig = () => {
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587; // Default to 587 (STARTTLS) instead of 465
  const isSecurePort = smtpPort === 465; // Port 465 uses SSL, port 587 uses STARTTLS

  return {
    host: process.env.SMTP_HOST || 'mail.bindu.tconnecthub.com',
    port: smtpPort,
    secure: isSecurePort, // true for 465 (SSL), false for 587 (STARTTLS)
    requireTLS: !isSecurePort, // enable TLS for port 587, not needed for 465
    auth: {
      user: process.env.SMTP_USER || 'test@bindu.tconnecthub.com',
      pass: process.env.SMTP_PASSWORD || 'your_email_password_here'
    },
    // Additional options for better connection handling
    connectionTimeout: 30000, // 30 seconds (increased from 10)
    greetingTimeout: 30000, // 30 seconds (increased from 10)
    socketTimeout: 30000, // 30 seconds (increased from 10)
    // Ignore TLS certificate errors (useful for self-signed certs)
    tls: {
      rejectUnauthorized: false
    }
  };
};

// Get or create transporter (lazy initialization)
const getTransporter = () => {
  if (!transporter) {
    const emailConfig = getEmailConfig();
    transporter = nodemailer.createTransport(emailConfig);
    console.log(`📧 Email service configured for ${emailConfig.host}:${emailConfig.port}`);
    console.log(`👤 SMTP User: ${emailConfig.auth.user}`);
  }
  return transporter;
};

// Initialize email service (non-blocking)
const initializeEmailService = () => {
  try {
    // Create transporter but don't verify on startup (to avoid blocking)
    getTransporter();
    console.log('📧 Email service initialized (lazy connection)');
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
  }),

  // Welcome email template
  welcome: (name, loginLink) => ({
    subject: 'Welcome to HappyMoments! Your account is ready',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HappyMoments</title>
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
          .feature {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #ff6b35;
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
          <p>Congratulations! Your account has been successfully verified and is now ready to use.</p>
          
          <p>You can now:</p>
          <div class="feature">
            <strong>🔍 Discover Vendors:</strong> Browse through our curated list of wedding vendors
          </div>
          <div class="feature">
            <strong>💬 Contact Vendors:</strong> Reach out to vendors directly via WhatsApp
          </div>
          <div class="feature">
            <strong>💝 Save Favorites:</strong> Save vendors you love for easy access
          </div>
          <div class="feature">
            <strong>⭐ Leave Reviews:</strong> Share your experiences with other couples
          </div>
          
          <div style="text-align: center;">
            <a href="${loginLink}" class="button">Start Exploring</a>
          </div>
          
          <p>If you have any questions or need help, feel free to reach out to our support team.</p>
          
          <p>Happy planning!<br>
          The HappyMoments Team</p>
        </div>
        <div class="footer">
          <p>© 2024 HappyMoments. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},
      
      Welcome to HappyMoments! Your account has been successfully verified and is now ready to use.
      
      You can now:
      - Discover Vendors: Browse through our curated list of wedding vendors
      - Contact Vendors: Reach out to vendors directly via WhatsApp
      - Save Favorites: Save vendors you love for easy access
      - Leave Reviews: Share your experiences with other couples
      
      Start exploring: ${loginLink}
      
      Happy planning!
      The HappyMoments Team
    `
  }),

  // Password reset email template
  passwordReset: (name, resetLink) => ({
    subject: 'Reset your HappyMoments password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your password</title>
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
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
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
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password for your HappyMoments account.</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">
            ${resetLink}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
          </div>
          
          <p>If you continue to have problems, please contact our support team.</p>
          
          <p>Best regards,<br>
          The HappyMoments Team</p>
        </div>
        <div class="footer">
          <p>© 2024 HappyMoments. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},
      
      We received a request to reset your password for your HappyMoments account.
      
      To reset your password, click the link below:
      ${resetLink}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      The HappyMoments Team
    `
  }),

  // Review notification email template
  reviewNotification: (vendorName, customerName, reviewText, rating) => ({
    subject: `New review received for ${vendorName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Review Received</title>
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
          .review-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #ff6b35;
          }
          .rating {
            color: #ff6b35;
            font-size: 18px;
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
          <h1>⭐ New Review Received!</h1>
        </div>
        <div class="content">
          <h2>Hi ${vendorName},</h2>
          <p>Great news! You've received a new review from ${customerName}.</p>
          
          <div class="review-box">
            <div class="rating">
              ${rating ? '⭐'.repeat(rating) + ' (' + rating + '/5)' : 'No rating provided'}
            </div>
            <p><strong>Review:</strong></p>
            <p style="font-style: italic; margin: 10px 0;">"${reviewText}"</p>
            <p><strong>- ${customerName}</strong></p>
          </div>
          
          <p>This review will help other couples discover your amazing services!</p>
          
          <p>Keep up the great work!<br>
          The HappyMoments Team</p>
        </div>
        <div class="footer">
          <p>© 2024 HappyMoments. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${vendorName},
      
      Great news! You've received a new review from ${customerName}.
      
      Rating: ${rating ? rating + '/5 stars' : 'No rating provided'}
      Review: "${reviewText}"
      
      This review will help other couples discover your amazing services!
      
      Keep up the great work!
      The HappyMoments Team
    `
  }),

  // Contact form notification email template
  contactNotification: (customerName, customerEmail, message, vendorName) => ({
    subject: `New inquiry from ${customerName} via HappyMoments`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Customer Inquiry</title>
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
          .inquiry-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #ff6b35;
          }
          .contact-info {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
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
          <h1>📧 New Customer Inquiry</h1>
        </div>
        <div class="content">
          <h2>Hi ${vendorName},</h2>
          <p>You have a new inquiry from a potential customer!</p>
          
          <div class="contact-info">
            <p><strong>Customer Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
          </div>
          
          <div class="inquiry-box">
            <p><strong>Message:</strong></p>
            <p style="margin: 10px 0;">${message}</p>
          </div>
          
          <p>Don't forget to respond promptly to convert this inquiry into a booking!</p>
          
          <p>Best regards,<br>
          The HappyMoments Team</p>
        </div>
        <div class="footer">
          <p>© 2024 HappyMoments. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${vendorName},
      
      You have a new inquiry from a potential customer!
      
      Customer Name: ${customerName}
      Email: ${customerEmail}
      
      Message: ${message}
      
      Don't forget to respond promptly to convert this inquiry into a booking!
      
      Best regards,
      The HappyMoments Team
    `
  })
};

// Send email function
const sendEmail = async (options) => {
  try {
    const emailConfig = getEmailConfig();
    
    // Create a fresh transporter for each email to ensure connection works
    const currentTransporter = nodemailer.createTransport(emailConfig);
    
    // Verify connection before sending
    try {
      await currentTransporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP connection verification failed:', verifyError);
      // Close the transporter
      currentTransporter.close();
      throw new Error(`SMTP connection failed: ${verifyError.message}`);
    }

    // Use the authenticated email address directly as the "From" address
    // Some SMTP servers require the From address to match the authenticated user
    const mailOptions = {
      from: emailConfig.auth.user, // Use email directly, not formatted
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    console.log(`📤 Attempting to send email to: ${options.to}`);
    console.log(`📧 Using SMTP: ${emailConfig.host}:${emailConfig.port}`);
    
    const result = await currentTransporter.sendMail(mailOptions);
    
    // Close the transporter after sending
    currentTransporter.close();
    
    console.log('✅ Email accepted by SMTP server:', {
      messageId: result.messageId,
      to: options.to,
      subject: options.subject,
      response: result.response
    });

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully',
      response: result.response
    };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      message: error.message,
      response: error.response,
      responseCode: error.responseCode
    });
    
    return {
      success: false,
      error: error.message,
      message: `Failed to send email: ${error.message}`,
      code: error.code,
      responseCode: error.responseCode
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

// Send welcome email
const sendWelcomeEmail = async (email, name, loginLink) => {
  try {
    const template = emailTemplates.welcome(name, loginLink);

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return result;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send welcome email'
    };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetLink) => {
  try {
    const template = emailTemplates.passwordReset(name, resetLink);

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return result;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send password reset email'
    };
  }
};

// Send review notification email to vendor
const sendReviewNotificationEmail = async (vendorEmail, vendorName, customerName, reviewText, rating) => {
  try {
    const template = emailTemplates.reviewNotification(vendorName, customerName, reviewText, rating);

    const result = await sendEmail({
      to: vendorEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return result;
  } catch (error) {
    console.error('❌ Error sending review notification email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send review notification email'
    };
  }
};

// Send contact form notification email to vendor
const sendContactNotificationEmail = async (vendorEmail, customerName, customerEmail, message, vendorName) => {
  try {
    const template = emailTemplates.contactNotification(customerName, customerEmail, message, vendorName);

    const result = await sendEmail({
      to: vendorEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return result;
  } catch (error) {
    console.error('❌ Error sending contact notification email:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send contact notification email'
    };
  }
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReviewNotificationEmail,
  sendContactNotificationEmail,
  emailTemplates
};

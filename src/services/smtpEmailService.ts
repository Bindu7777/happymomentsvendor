// SMTP Email Service Configuration
// This file contains the email service setup for production use

// Safe environment variable access that works in both browser and Node.js
const getEnvVar = (key: string, defaultValue?: string): string | undefined => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In browser, use import.meta.env (Vite) or fallback to undefined
    return (import.meta as any)?.env?.[key] || defaultValue;
  }
  // In Node.js, use process.env
  return process.env[key] || defaultValue;
};

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// SMTP Configuration for bindu.tconnecthub.com
export const emailConfig: EmailConfig = {
  host: 'mail.bindu.tconnecthub.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'test@bindu.tconnecthub.com',
    pass: getEnvVar('EMAIL_PASSWORD') || 'your_email_password_here' // Set this in environment variables
  }
};

// Email templates
export const emailTemplates = {
  verification: (name: string, verificationLink: string) => ({
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

// Email API configuration
const EMAIL_API_URL = getEnvVar('VITE_EMAIL_API_URL') || 'http://localhost:3001/api/email';

// Send email using the backend API
export const sendEmailWithNodemailer = async (options: EmailOptions): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('📧 Sending email via API to:', options.to);
    
    const response = await fetch(`${EMAIL_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Failed to send email:', result.error);
      return { success: false, error: result.error || 'Unknown error' };
    }
    
  } catch (error) {
    console.error('❌ Error calling email API:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

// Send verification email using the backend API
export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string,
  baseUrl?: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const verificationBaseUrl = baseUrl || window.location.origin;
    
    console.log('📧 Sending verification email via API to:', email);
    
    const response = await fetch(`${EMAIL_API_URL}/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        token,
        baseUrl: verificationBaseUrl
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Verification email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Failed to send verification email:', result.error);
      return { success: false, error: result.error || 'Unknown error' };
    }
    
  } catch (error) {
    console.error('❌ Error calling verification email API:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

// Resend verification email using the backend API
export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('📧 Resending verification email via API to:', email);
    
    const response = await fetch(`${EMAIL_API_URL}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Verification email resent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Failed to resend verification email:', result.error);
      return { success: false, error: result.error || 'Unknown error' };
    }
    
  } catch (error) {
    console.error('❌ Error calling resend verification email API:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

// Test email function
export const testEmailService = async (testEmail?: string): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('🧪 Testing email service...');
    
    const response = await fetch(`${EMAIL_API_URL}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail || 'test@example.com'
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Test email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Failed to send test email:', result.error);
      return { success: false, error: result.error || 'Unknown error' };
    }
    
  } catch (error) {
    console.error('❌ Error calling test email API:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

// Alternative email services for production
export const emailServiceProviders = {
  // SendGrid
  sendGrid: {
    apiKey: getEnvVar('SENDGRID_API_KEY'),
    from: 'test@bindu.tconnecthub.com'
  },
  
  // AWS SES
  awsSES: {
    region: 'us-east-1',
    accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY'),
    from: 'test@bindu.tconnecthub.com'
  },
  
  // Resend
  resend: {
    apiKey: getEnvVar('RESEND_API_KEY'),
    from: 'HappyMoments <test@bindu.tconnecthub.com>'
  }
};

// Environment variables needed for production
export const requiredEnvVars = [
  'EMAIL_PASSWORD', // Password for test@bindu.tconnecthub.com
  'SENDGRID_API_KEY', // If using SendGrid
  'AWS_ACCESS_KEY_ID', // If using AWS SES
  'AWS_SECRET_ACCESS_KEY', // If using AWS SES
  'RESEND_API_KEY' // If using Resend
];

// DNS records needed for better email delivery
export const dnsRecords = {
  SPF: 'v=spf1 include:_spf.bindu.tconnecthub.com ~all',
  DKIM: 'v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY',
  DMARC: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@bindu.tconnecthub.com'
};

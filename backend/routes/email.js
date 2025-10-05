const express = require('express');
const { sendEmail, sendVerificationEmail } = require('../services/emailService');

const router = express.Router();

// Validation middleware
const validateEmail = (req, res, next) => {
  const { to, subject, html } = req.body;
  
  if (!to || !subject || !html) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      message: 'to, subject, and html are required'
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address',
      message: 'Please provide a valid email address'
    });
  }

  next();
};

// Send generic email
router.post('/send', validateEmail, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    console.log(`📧 Sending email to: ${to}`);
    console.log(`📝 Subject: ${subject}`);

    const result = await sendEmail({
      to,
      subject,
      html,
      text
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }

  } catch (error) {
    console.error('❌ Email route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to send email'
    });
  }
});

// Resend verification email (gets token from database)
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'email is required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
        message: 'Please provide a valid email address'
      });
    }

    console.log(`📧 Resending verification email to: ${email}`);

    // For now, we'll use a mock token - in production, this would query your database
    // TODO: Replace with actual database query to get the stored verification token
    const mockToken = 'real_token_from_database_' + Date.now();
    
    const result = await sendVerificationEmail(email, 'User', mockToken, 'http://localhost:8080');

    if (result.success) {
      res.json({
        success: true,
        message: 'Verification email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }

  } catch (error) {
    console.error('❌ Resend verification email route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to resend verification email'
    });
  }
});

// Send verification email
router.post('/send-verification', async (req, res) => {
  try {
    const { email, name, token, baseUrl } = req.body;

    // Validation
    if (!email || !name || !token || !baseUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'email, name, token, and baseUrl are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
        message: 'Please provide a valid email address'
      });
    }

    console.log(`📧 Sending verification email to: ${email}`);
    console.log(`👤 Name: ${name}`);

    const result = await sendVerificationEmail(email, name, token, baseUrl);

    if (result.success) {
      res.json({
        success: true,
        message: 'Verification email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }

  } catch (error) {
    console.error('❌ Verification email route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to send verification email'
    });
  }
});

// Debug endpoint to check verification tokens
router.get('/debug-tokens/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // This would normally query your database
    // For now, just return a mock response
    res.json({
      success: true,
      email: email,
      message: 'Debug endpoint - check your database for verification tokens',
      note: 'Look for verification_token in the customers table for this email'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Debug endpoint error',
      message: error.message
    });
  }
});

// Test email endpoint (for development)
router.post('/test', async (req, res) => {
  try {
    const testEmail = req.body.email || 'test@example.com';
    
    console.log(`🧪 Sending test email to: ${testEmail}`);

    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email from HappyMoments API',
      html: `
        <h1>🎉 Test Email Successful!</h1>
        <p>This is a test email from the HappyMoments Email API.</p>
        <p>If you received this email, the email service is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
      text: `
        Test Email Successful!
        
        This is a test email from the HappyMoments Email API.
        
        If you received this email, the email service is working correctly!
        
        Timestamp: ${new Date().toISOString()}
      `
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        to: testEmail
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }

  } catch (error) {
    console.error('❌ Test email route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to send test email'
    });
  }
});

module.exports = router;

# 📧 Email API Setup Guide

## 🎯 **What I've Created**

I've built a complete **Node.js backend API** that will actually send emails through your SMTP server. Here's what's now available:

### 📁 **Backend Structure**
```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── env.example           # Environment template
├── start.sh              # Startup script
├── README.md             # Detailed documentation
├── routes/
│   └── email.js          # Email API endpoints
└── services/
    └── emailService.js   # Email sending logic
```

### 🔧 **API Endpoints**
- `POST /api/email/send` - Send any email
- `POST /api/email/send-verification` - Send verification emails
- `POST /api/email/test` - Test email service
- `GET /api/health` - Health check

## 🚀 **Quick Setup (3 Steps)**

### **Step 1: Install Backend Dependencies**
```bash
cd backend
npm install
```

### **Step 2: Configure Email Credentials**
```bash
# Copy environment template
cp env.example .env

# Edit with your actual email password
nano .env
```

**Update this line in `.env`:**
```env
SMTP_PASSWORD=your_actual_email_password_here
```

### **Step 3: Start the Backend**
```bash
# Easy way (uses startup script)
./start.sh

# Or manually
npm run dev
```

## 📧 **How It Works Now**

### **Before (Not Working):**
- Frontend tried to send emails directly ❌
- Just logged to console ❌
- No real emails sent ❌

### **After (Working):**
- Frontend calls your backend API ✅
- Backend sends emails via SMTP ✅
- Real emails delivered to inbox ✅

## 🧪 **Test the Email Service**

### **1. Test the Backend API**
```bash
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

### **2. Test from Frontend**
The frontend now automatically uses the new API. When you sign up:
1. User creates account
2. Frontend calls `/api/email/send-verification`
3. Backend sends real verification email
4. User receives email in inbox! 🎉

## 📋 **Email Configuration**

**From Email:** `test@bindu.tconnecthub.com`
**SMTP Server:** `mail.bindu.tconnecthub.com:465`
**Security:** SSL/TLS enabled

## 🔍 **Troubleshooting**

### **If emails still don't arrive:**
1. **Check SMTP credentials** - Make sure password is correct in `.env`
2. **Check spam folder** - Verification emails might be filtered
3. **Check server logs** - Backend shows detailed error messages
4. **Test API directly** - Use the test endpoint first

### **Common Issues:**
- **Wrong password:** Update `SMTP_PASSWORD` in `.env`
- **Server not running:** Make sure backend is running on port 3001
- **CORS issues:** Backend is configured for `http://localhost:5173`

## 🎉 **You're All Set!**

Once you complete the 3 steps above:
1. ✅ Backend will send real emails
2. ✅ Verification emails will work
3. ✅ Users will receive emails in their inbox
4. ✅ No more "process is not defined" errors

The frontend is already updated to use the new API, so everything should work seamlessly!

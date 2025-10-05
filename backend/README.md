# Event Vendor Email API Backend

A Node.js backend service for sending emails via SMTP using Nodemailer.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your actual email credentials
nano .env
```

### 3. Configure Email Settings
Update the `.env` file with your SMTP credentials:
```env
SMTP_HOST=mail.bindu.tconnecthub.com
SMTP_PORT=465
SMTP_USER=test@bindu.tconnecthub.com
SMTP_PASSWORD=your_actual_email_password_here
```

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## 📧 API Endpoints

### Health Check
```
GET /api/health
```

### Send Email
```
POST /api/email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Your Subject",
  "html": "<h1>Hello World</h1>",
  "text": "Hello World" // optional
}
```

### Send Verification Email
```
POST /api/email/send-verification
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "token": "verification_token_here",
  "baseUrl": "http://localhost:5173"
}
```

### Test Email
```
POST /api/email/test
Content-Type: application/json

{
  "email": "test@example.com" // optional
}
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password

### CORS
The API is configured to accept requests from your frontend URL. Update `FRONTEND_URL` in `.env` if needed.

### Rate Limiting
- 10 requests per 15 minutes per IP address
- Applied to all email endpoints

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request handling
- **Rate Limiting**: Prevents email spam
- **Input Validation**: Email format validation
- **Error Handling**: Comprehensive error responses

## 📝 Logs

The server logs all email sending attempts:
- ✅ Successful sends
- ❌ Failed sends with error details
- 📧 Email details (to, subject)

## 🧪 Testing

Test the email service:
```bash
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

## 🚨 Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Verify SMTP server is accessible
3. Check server logs for error details
4. Test with the `/api/email/test` endpoint

### CORS Issues
1. Update `FRONTEND_URL` in `.env`
2. Restart the server after changes

### Rate Limiting
If you hit rate limits during development, restart the server to reset the counter.

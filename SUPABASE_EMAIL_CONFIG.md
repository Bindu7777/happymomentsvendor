# Supabase Email Configuration

## Issue: Email Confirmation Required

The login is not working because Supabase requires email confirmation by default. Here are the solutions:

### Option 1: Disable Email Confirmation (For Development)

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Settings
3. Under "User Signups", disable "Enable email confirmations"
4. This will allow users to login immediately after signup

### Option 2: Configure Email Templates (For Production)

1. Go to Authentication > Email Templates
2. Configure the confirmation email template
3. Set up SMTP settings if using custom email provider
4. Or use Supabase's built-in email service

### Option 3: Use Magic Link Authentication

Instead of password-based auth, you can use magic links:
- User enters email
- Receives a magic link
- Clicks link to authenticate

### Current Status

✅ Supabase connection working
✅ User signup working  
⚠️ Email confirmation required before login
✅ Error handling improved
✅ Debug component added

### Testing Steps

1. Run `npm run dev`
2. Go to `/login`
3. Use the debug component to:
   - Test connection
   - Create a test user
   - Try to login (will show email confirmation error)
4. Either disable email confirmation in Supabase dashboard OR check email for verification link

### Environment Variables

Make sure `.env.local` exists with:
```
VITE_SUPABASE_URL=https://hemofpnccbnfcmlibxbr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

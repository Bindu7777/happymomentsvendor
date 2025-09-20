# Google Service Account Setup - No User Login Required

## 🎯 Overview
Service Account allows your app to upload to Google Drive without requiring users to sign in with their Google accounts.

## 📋 Step-by-Step Setup

### 1. Create Service Account

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project**: `happymoments-63594`
3. **Navigate to**: IAM & Admin → Service Accounts
4. **Click**: "+ CREATE SERVICE ACCOUNT"
5. **Fill in**:
   - **Service account name**: `vendor-image-uploader`
   - **Service account ID**: `vendor-image-uploader` (auto-filled)
   - **Description**: `Service account for uploading vendor images to Google Drive`
6. **Click**: "CREATE AND CONTINUE"
7. **Skip roles** (click "CONTINUE")
8. **Click**: "DONE"

### 2. Generate Service Account Key

1. **Click on your new service account**: `vendor-image-uploader`
2. **Go to**: "Keys" tab
3. **Click**: "ADD KEY" → "Create new key"
4. **Select**: JSON format
5. **Click**: "CREATE"
6. **Download the JSON file** (keep it secure!)

### 3. Share Google Drive Folder with Service Account

1. **Go to your Google Drive folder**: [https://drive.google.com/drive/folders/1WyLMdcHvf76_Q9uCN3Hog0P2Mn3ycIsr](https://drive.google.com/drive/folders/1WyLMdcHvf76_Q9uCN3Hog0P2Mn3ycIsr)
2. **Right-click** → **Share**
3. **Add the service account email** (from the JSON file - looks like: `vendor-image-uploader@happymoments-63594.iam.gserviceaccount.com`)
4. **Set permission**: **Editor**
5. **Click**: "Send"

### 4. Add Service Account Credentials to Environment

**Add these to your `.env.local` file:**

```env
# Existing configuration...
VITE_SUPABASE_URL=https://hemofpnccbnfcmlibxbr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

VITE_GOOGLE_DRIVE_API_KEY=AIzaSyBsMX0piWSsVwzynEFBNUTSBVJMgFSWuCA
VITE_GOOGLE_DRIVE_CLIENT_ID=295583515951-tv75o801vqgf92ouikuijhkjkgvp28g4.apps.googleusercontent.com
VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID=1WyLMdcHvf76_Q9uCN3Hog0P2Mn3ycIsr

# Service Account (copy from downloaded JSON file)
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=vendor-image-uploader@happymoments-63594.iam.gserviceaccount.com
VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

## 🔧 Benefits of Service Account

### ✅ **No User Authentication**
- Users don't need to sign in with Google
- No OAuth popups or redirects
- Seamless upload experience

### ✅ **Automatic Access**
- App has permanent access to your Google Drive
- No token expiration issues
- Reliable programmatic uploads

### ✅ **Secure**
- Service account has limited permissions
- Only access to your specific folder
- Can be revoked anytime

## 🎯 Expected Results

After setup:
- **Upload images** → No login required
- **Folders created** → 14/, 15/, etc. in your Google Drive
- **Subfolders** → catalog/, highlights/, profile/
- **Public URLs** → Proper Google Drive sharing links

## 🚨 Security Notes

- **Keep JSON key secure** (never commit to git)
- **Use environment variables** for all credentials
- **Limit service account permissions** to only your folder
- **Monitor usage** in Google Cloud Console

---

**Ready to set this up?** This approach will give you true centralized storage without any user authentication complexity!

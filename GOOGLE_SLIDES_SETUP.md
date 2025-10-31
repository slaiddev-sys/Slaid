# Google Slides API Setup Guide

This guide will help you set up Google Slides API integration for the Excel layouts export functionality.

## Prerequisites

You need a Google Cloud Console account and project.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Google Slides API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Slides API"
3. Click on it and press **Enable**
4. Also enable "Google Drive API" (required for file creation)

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in required fields:
     - App name: "Slaid"
     - User support email: your email
     - Developer contact information: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/presentations`
     - `https://www.googleapis.com/auth/drive.file`
4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "Slaid Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://www.slaidapp.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/excel-layouts` (for development)
     - `https://www.slaidapp.com/excel-layouts` (for production)

## Step 4: Configure Environment Variables

1. Copy your **Client ID** from the credentials page
2. Add it to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

## Step 5: Test the Integration

1. Restart your development server: `npm run dev`
2. Go to `http://localhost:3000/excel-layouts`
3. Click "Export to Google Slides"
4. You should see a Google authentication popup
5. After authentication, a new Google Slides presentation should be created with your layout content

## Production Deployment

For production deployment on Vercel:

1. Add the environment variable in Vercel dashboard:
   - Go to your project settings
   - Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` with your client ID
2. Update OAuth credentials to include your production domain
3. Deploy your changes

## Troubleshooting

### "Error 403: access_denied"
- Make sure your OAuth consent screen is properly configured
- Check that the required scopes are added
- Verify your authorized domains are correct

### "Error 400: invalid_request"
- Check that your client ID is correct
- Verify the authorized JavaScript origins match your domain exactly
- Make sure the redirect URIs are properly configured

### "Error 401: unauthorized"
- The access token may have expired
- The app will automatically prompt for re-authentication

## Security Notes

- Never commit your client ID to public repositories (it's already in .gitignore as part of .env.local)
- The client ID is safe to expose in frontend code (it's designed for public use)
- Access tokens are handled securely and never stored permanently
- Users must explicitly grant permission for each export operation

## API Limits

- Google Slides API has usage limits
- For high-volume usage, consider implementing request batching
- Monitor your API usage in Google Cloud Console

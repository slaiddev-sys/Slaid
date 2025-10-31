# Google Slides Export Setup

This guide explains how to set up Google OAuth credentials for the Google Slides export functionality.

## Prerequisites

- Google Cloud Console account
- Access to Google Cloud Console (https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "Slaid Google Slides Export"
5. Click "Create"

## Step 2: Enable Required APIs

1. In your project, go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Google Slides API**
   - **Google Drive API**

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "Slaid"
     - User support email: your email
     - Developer contact information: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/presentations`
     - `https://www.googleapis.com/auth/drive.file`
   - Add test users (your email addresses)

4. Create OAuth client ID:
   - Application type: "Web application"
   - Name: "Slaid Google Slides Export"
   - Authorized redirect URIs:
     - For development: `http://localhost:3000/api/export-google-slides`
     - For production: `https://www.slaidapp.com/api/export-google-slides`

## Step 4: Configure Environment Variables

1. Copy the Client ID and Client Secret from the credentials page
2. Add to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## Step 5: Update Production Settings

For production deployment on Vercel:

1. Add the environment variables in Vercel dashboard
2. Update the authorized redirect URI to use your production domain
3. Make sure the OAuth consent screen is published (not in testing mode)

## Testing

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/excel-layouts`
3. Select any layout
4. Click "Export to Google Slides"
5. You should see a Google OAuth popup
6. After authentication, a new Google Slides presentation should be created

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Make sure the redirect URI in Google Console matches exactly
   - Check for trailing slashes or http vs https

2. **"access_denied" error**
   - Make sure your email is added as a test user
   - Check that required scopes are added

3. **"invalid_client" error**
   - Verify Client ID and Client Secret are correct
   - Make sure they're properly set in environment variables

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test the OAuth URL generation
4. Check Google Cloud Console logs

## Security Notes

- Keep your Client Secret secure and never commit it to version control
- Use environment variables for all sensitive credentials
- Consider implementing additional security measures for production
- Regularly rotate your credentials

## API Limits

- Google Slides API has quotas and limits
- Monitor usage in Google Cloud Console
- Consider implementing rate limiting for production use

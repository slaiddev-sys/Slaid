"use client";

// Simple one-click Google authentication for Google Slides export
// Works like Skywork.ai - click button, auth popup, then direct action

export const authenticateAndExport = async (layoutName: string, layoutData: any = {}) => {
  return new Promise<void>((resolve, reject) => {
    // Load Google Identity Services if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        performAuth();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      
      document.head.appendChild(script);
    } else {
      performAuth();
    }

    function performAuth() {
      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
          reject(new Error('Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file. See GOOGLE_SLIDES_SETUP.md for instructions.'));
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/drive.file',
          callback: async (response: any) => {
            if (response.access_token) {
              try {
                // Immediately create the presentation with the token
                const apiResponse = await fetch('/api/export-google-slides', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    layoutName,
                    layoutData,
                    accessToken: response.access_token
                  }),
                });

                const result = await apiResponse.json();
                
                if (result.success) {
                  // Open Google Slides in new tab
                  window.open(result.presentationUrl, '_blank');
                  console.log(`✅ Created Google Slides presentation: "${layoutName}"`);
                  resolve();
                } else {
                  reject(new Error(result.message || 'Failed to create presentation'));
                }
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error('Failed to get access token'));
            }
          },
          error_callback: (error: any) => {
            reject(new Error(error.message || 'Authentication failed'));
          }
        });

        // Trigger the auth popup
        client.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    }
  });
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

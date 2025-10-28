"use client";

import { useEffect } from 'react';

interface FeaturebaseWidgetProps {
  appId: string;
}

declare global {
  interface Window {
    Featurebase?: any;
  }
}

export default function FeaturebaseWidget({ appId }: FeaturebaseWidgetProps) {
  useEffect(() => {
    console.log('🔥 FeaturebaseWidget: Starting simple initialization with appId:', appId);
    
    // Add CSS to hide the Featurebase widget icon
    const hideWidgetCSS = `
      /* Hide the Featurebase floating widget icon */
      [data-featurebase-widget],
      [data-featurebase-launcher],
      .featurebase-widget,
      .featurebase-launcher,
      iframe[src*="featurebase"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
      
      /* Only show the widget modal when it's opened */
      [data-featurebase-modal],
      .featurebase-modal,
      .featurebase-portal {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;
    
    // Inject the CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = hideWidgetCSS;
    document.head.appendChild(styleElement);
    
    // Simple approach: just initialize the queue and load the script directly
    if (!window.Featurebase) {
      console.log('📦 Creating Featurebase queue...');
      window.Featurebase = function(...args: any[]) {
        (window.Featurebase.q = window.Featurebase.q || []).push(args);
      };
      window.Featurebase.q = [];
    }

    // Load script directly
    if (!document.querySelector('script[src*="featurebase.app"]')) {
      console.log('📦 Loading Featurebase SDK directly...');
      const script = document.createElement('script');
      script.src = 'https://do.featurebase.app/js/sdk.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Featurebase SDK loaded');
        // Initialize widget
        setTimeout(() => {
          console.log('🎯 Initializing widget...');
          if (window.Featurebase) {
            console.log('📋 Using appId:', appId);
            
            // FIRST: Call boot method as required by Featurebase SDK
            try {
              console.log('🚀 Calling Featurebase boot...');
              window.Featurebase('boot', {
                appId: appId  // Use appId instead of organization
              });
              console.log('✅ Featurebase booted successfully');
              
              // THEN: Skip widget initialization - just rely on data-featurebase-feedback attribute
              setTimeout(() => {
                console.log('🔧 Skipping widget initialization to avoid validation errors');
                console.log('✅ Featurebase SDK is ready - widget will be triggered by data-featurebase-feedback attribute');
                // The Featurebase SDK will automatically handle widgets when buttons with data-featurebase-feedback are clicked
              }, 1000); // Wait 1 second after boot
              
            } catch (bootError) {
              console.log('❌ Featurebase boot failed:', bootError);
            }
          } else {
            console.log('❌ Featurebase not available on window');
          }
        }, 1000); // Increased delay to ensure SDK is fully loaded
      };
      script.onerror = () => {
        console.error('❌ Failed to load Featurebase SDK');
      };
      document.head.appendChild(script);
    }

    return () => {
      console.log('🧹 Cleanup');
      // Remove the injected CSS
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [appId]);

  return null;
}

// Simple function to trigger the widget
export const openFeaturebaseWidget = () => {
  console.log('🚀 Opening widget...');
  
  // Just trigger a click on the button with the data attribute
  const button = document.querySelector('[data-featurebase-feedback]');
  if (button) {
    console.log('✅ Found button, triggering click');
    (button as HTMLElement).click();
  } else {
    console.warn('⚠️ Button not found');
  }
};

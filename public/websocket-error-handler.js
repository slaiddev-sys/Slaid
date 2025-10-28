// WebSocket Error Handler for Next.js Development
// This script helps suppress common WebSocket connection errors in development

(function() {
  'use strict';
  
  // Store original console.error
  const originalConsoleError = console.error;
  
  // Override console.error to filter out WebSocket errors
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Filter out common WebSocket errors that are not critical
    if (
      message.includes('Failed to establish WebSocket connection') ||
      message.includes('WebSocket connection failed') ||
      message.includes('WebSocket is already in CLOSING or CLOSED state') ||
      message.includes('_app-client_') ||
      message.includes('hot-reload')
    ) {
      // Log a simplified message instead
      console.warn('🔄 Development server connection issue (this is normal and will auto-reconnect)');
      return;
    }
    
    // For all other errors, use the original console.error
    originalConsoleError.apply(console, args);
  };
  
  // Handle unhandled WebSocket errors
  window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('WebSocket')) {
      event.preventDefault();
      console.warn('🔄 WebSocket error suppressed (development mode)');
    }
  });
  
  // Handle unhandled promise rejections related to WebSockets
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.toString().includes('WebSocket')) {
      event.preventDefault();
      console.warn('🔄 WebSocket promise rejection suppressed (development mode)');
    }
  });
  
})();

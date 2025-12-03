import { useState, useEffect } from 'react';
import type { Language } from '../lib/translations';

// Detect user's preferred language based on browser settings
export function detectLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en'; // Default to English on server
  }

  // Get browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // Check if it's Spanish
  if (browserLang && browserLang.toLowerCase().startsWith('es')) {
    return 'es';
  }
  
  return 'en';
}

// Custom hook for language management
export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first for user preference
    const savedLang = localStorage.getItem('slaid-language') as Language | null;
    
    if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
      setLanguage(savedLang);
    } else {
      // Detect based on browser
      const detectedLang = detectLanguage();
      setLanguage(detectedLang);
      localStorage.setItem('slaid-language', detectedLang);
    }
    
    setIsLoading(false);
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('slaid-language', newLang);
  };

  return { language, changeLanguage, isLoading };
}






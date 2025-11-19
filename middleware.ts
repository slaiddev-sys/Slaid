import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Auto-detect user's locale from browser Accept-Language header
  localeDetection: true,

  // Always use default locale for root path
  localePrefix: 'as-needed'
});

export const config = {
  // Match only internationalized pathnames
  // Skip api routes, static files, images
  matcher: ['/', '/(en|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};


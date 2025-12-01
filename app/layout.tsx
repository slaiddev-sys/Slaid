import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./fonts.css";
import { AuthProvider } from "../components/AuthProvider";

export const metadata: Metadata = {
  title: "Slaid - AI Presentation Generator | Transform Excel to Professional Reports",
  description: "Transform your Excel data into professional presentations instantly with AI. Smart analysis, interactive charts, and PowerPoint-ready reports. Get 50 free credits.",
  keywords: ["excel to presentation", "AI presentation generator", "data visualization", "excel analysis", "powerpoint generator", "spreadsheet to slides", "data reports", "business intelligence"],
  authors: [{ name: "Slaid" }],
  creator: "Slaid",
  publisher: "Slaid",
  metadataBase: new URL('https://slaidapp.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Slaid - Transform Excel into Professional Data Presentations",
    description: "Upload any spreadsheet and get AI-powered analysis, interactive charts, and slide-ready reports in seconds. No design skills needed.",
    url: 'https://slaidapp.com',
    siteName: 'Slaid',
    images: [
      {
        url: '/Slide-Ready.png',
        width: 1200,
        height: 630,
        alt: 'Slaid AI Presentation Generator',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Slaid - Transform Excel into Professional Presentations",
    description: "AI-powered presentation generator. Upload Excel, get beautiful reports instantly.",
    images: ['/Slide-Ready.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/basic-plan.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    shortcut: '/basic-plan.png',
    apple: '/basic-plan.png',
  },
  verification: {
    google: 'google-site-verification-code-here', // You'll need to add this from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Direct Google Fonts import for better reliability */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600&family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=Oswald:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Lato:wght@300;400;700&family=Noto+Sans:wght@300;400;500;600;700&family=Bebas+Neue&family=Raleway:wght@300;400;500;600;700&family=DM+Serif+Display:wght@400&family=Cabin:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* DataFast Analytics */}
        <script
          defer
          data-website-id="dfid_r62yn1PDaQWjoh9Ej2Ivu"
          data-domain="slaidapp.com"
          src="https://datafa.st/js/script.js"
        />
        {/* WebSocket error handler for development */}
        {process.env.NODE_ENV === 'development' && (
          <script src="/websocket-error-handler.js" />
        )}
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning={true}
      >
        {/* Google Tag Manager (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-H3MH6EM5TB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-H3MH6EM5TB');
          `}
        </Script>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

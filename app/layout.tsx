import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import { AuthProvider } from "../components/AuthProvider";

export const metadata: Metadata = {
  title: "Slaid - AI Presentation Generator",
  description: "Transform Data to Professional Reports",
  icons: {
    icon: "/slaid-favicon-verde.png",
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

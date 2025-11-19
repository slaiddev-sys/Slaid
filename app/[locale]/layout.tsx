import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '../../i18n';
import "../globals.css";
import "../fonts.css";
import { AuthProvider } from "../../components/AuthProvider";

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export const metadata = {
  title: "Slaid - AI Presentation Generator",
  description: "Transform Data to Professional Reports",
  icons: {
    icon: [
      { url: '/basic-plan.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    shortcut: '/basic-plan.png',
    apple: '/basic-plan.png',
  },
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
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
      <body className="antialiased" suppressHydrationWarning={true}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


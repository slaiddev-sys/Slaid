'use client';

import { useRouter } from 'next/navigation';

export default function CookiePolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <div className="relative z-10 box-border flex flex-row items-center justify-between max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full border-b border-gray-200">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img 
            src="/basic-plan.png" 
            alt="Slaid Logo" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-semibold" style={{ color: '#002903' }}>Slaid</span>
        </button>
        
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-sm sm:text-base font-medium hover:opacity-80 transition"
            style={{ color: '#002903' }}
          >
            Login
          </a>
          <a
            href="/signup"
            className="text-sm sm:text-base font-medium text-white px-4 sm:px-6 py-2 rounded-full transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: '#002903' }}
          >
            Sign Up
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h1 className="font-helvetica-neue text-3xl sm:text-4xl md:text-5xl font-normal mb-4 tracking-tighter" style={{ color: '#002903' }}>
          Cookie Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: November 18, 2024</p>

        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>What Are Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This Cookie Policy explains how Slaid uses cookies and similar technologies to recognize you when you visit our website and use our services. It explains what these technologies are, why we use them, and your rights to control their use.
            </p>
          </section>

          {/* Why We Use Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Why We Use Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies for several important reasons:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Essential Functionality:</strong> To enable core features like authentication and account management</li>
              <li><strong>Security:</strong> To protect your account and detect fraudulent activity</li>
              <li><strong>Performance:</strong> To understand how our Service performs and identify areas for improvement</li>
              <li><strong>User Preferences:</strong> To remember your settings and preferences</li>
              <li><strong>Analytics:</strong> To understand how visitors use our website (using anonymized data)</li>
            </ul>
          </section>

          {/* Types of Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>1. Strictly Necessary Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies are essential for the website to function properly. They enable core functionality such as:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Authentication:</strong> To keep you logged in and manage your session</li>
              <li><strong>Security:</strong> To protect against unauthorized access and CSRF attacks</li>
              <li><strong>Account Management:</strong> To enable account-related features</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              These cookies cannot be disabled as they are necessary for the Service to work. They do not collect personal information and are deleted when you close your browser.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>2. Performance and Analytics Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies help us understand how visitors interact with our website by collecting anonymous information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Pages visited and features used</li>
              <li>Time spent on pages</li>
              <li>Error messages encountered</li>
              <li>Browser and device information</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              <strong>Important:</strong> All analytics data is aggregated and anonymized. We cannot identify individual users from this data. We do NOT track you across other websites.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>3. Functional Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies enable enhanced functionality and personalization:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Remembering your preferences (e.g., language, theme)</li>
              <li>Storing your workspace settings</li>
              <li>Remembering your previous choices</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              If you decline these cookies, some features may not work correctly or remember your preferences.
            </p>
          </section>

          {/* What We DON'T Do */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>What We DON'T Do</h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
              We are committed to your privacy. We DO NOT:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Use advertising cookies:</strong> We do not serve ads or use cookies for advertising purposes</li>
              <li><strong>Track you across websites:</strong> We do not use cross-site tracking cookies</li>
              <li><strong>Sell your data:</strong> We never sell cookie data or any other personal information</li>
              <li><strong>Share with advertisers:</strong> We do not share cookie data with advertising networks</li>
              <li><strong>Build profiles:</strong> We do not create detailed user profiles for marketing purposes</li>
              <li><strong>Use social media tracking:</strong> We do not use Facebook Pixel, Google Ads tracking, or similar technologies</li>
            </ul>
          </section>

          {/* Third-Party Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use a limited number of trusted third-party services that may set cookies:
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Analytics</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use privacy-focused analytics tools to understand website usage. These tools:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Collect only anonymized, aggregated data</li>
              <li>Do not track individual users</li>
              <li>Do not share data with advertising networks</li>
              <li>Are fully GDPR and privacy-compliant</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Authentication</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you sign in using Google OAuth, Google may set cookies according to their own cookie policy. We recommend reviewing Google's privacy policy for more information.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Payment Processing</h3>
            <p className="text-gray-700 leading-relaxed">
              Our payment processor may use cookies to securely process transactions. Payment data is handled directly by the processor and never stored on our servers.
            </p>
          </section>

          {/* Cookie Duration */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>How Long Cookies Last</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies can be either "session" or "persistent" cookies:
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Session Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These are temporary cookies that expire when you close your browser. We use session cookies for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Maintaining your logged-in state during a browsing session</li>
              <li>Temporarily storing form data</li>
              <li>Security features like CSRF protection</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Persistent Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These remain on your device until they expire or you delete them. We use persistent cookies for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Remember Me:</strong> To keep you logged in across sessions (expires after 30 days)</li>
              <li><strong>Preferences:</strong> To remember your settings (expires after 1 year)</li>
              <li><strong>Analytics:</strong> To distinguish users in aggregated statistics (expires after 2 years)</li>
            </ul>
          </section>

          {/* Your Choices */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Your Cookie Choices</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have several options to control or limit how cookies are used:
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Browser Settings</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>View and delete cookies</li>
              <li>Block all cookies (may affect website functionality)</li>
              <li>Block third-party cookies</li>
              <li>Clear cookies when you close the browser</li>
              <li>Set exceptions for specific websites</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Browser-Specific Instructions</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Impact of Blocking Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you choose to block cookies, please note that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You may not be able to log in or use certain features</li>
              <li>Your preferences and settings will not be saved</li>
              <li>The Service may not function as intended</li>
              <li>You'll need to re-enter information each visit</li>
            </ul>
          </section>

          {/* Do Not Track */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Do Not Track Signals</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Some browsers include "Do Not Track" (DNT) features that signal websites you visit that you do not want to have your online activity tracked.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We respect DNT signals. When we detect a DNT signal, we disable non-essential analytics cookies. However, strictly necessary cookies required for the Service to function will still be used.
            </p>
          </section>

          {/* Updates */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Changes to This Cookie Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Posting the updated Cookie Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification for significant changes</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@slaidapp.com</p>
              <p className="text-gray-700 mb-2"><strong>Website:</strong> slaidapp.com</p>
              <p className="text-gray-700">We will respond to all legitimate inquiries within 30 days.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}


'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: November 18, 2024</p>

        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Slaid, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. We are committed to protecting your data with the highest security standards.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using Slaid, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </section>

          {/* Data We Collect */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Account Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Password (encrypted and never stored in plain text)</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>File Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you upload files to Slaid:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Excel files (.xlsx, .xls, .csv) and their contents</li>
              <li>Generated presentations and associated metadata</li>
              <li>File upload timestamps and modification history</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              Important: All uploaded files are encrypted at rest and in transit. We do not access, read, or use your file contents for any purpose other than generating your requested presentations.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Usage Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We automatically collect certain information about your device and how you interact with Slaid:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Log data (IP address, browser type, operating system)</li>
              <li>Device information (device type, unique identifiers)</li>
              <li>Usage patterns (features used, time spent, click patterns)</li>
              <li>Performance data (load times, errors encountered)</li>
            </ul>
          </section>

          {/* How We Use Your Data */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your information solely for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Provide Services:</strong> To generate presentations from your uploaded data</li>
              <li><strong>Account Management:</strong> To create and maintain your account</li>
              <li><strong>Communication:</strong> To send you service-related notifications and updates</li>
              <li><strong>Improve Service:</strong> To analyze usage patterns and improve our platform (using aggregated, anonymized data only)</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
              We DO NOT use your data for marketing, advertising, or any third-party purposes. We DO NOT sell, rent, or share your personal information with third parties for their marketing purposes.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-leading security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
              <li><strong>Access Controls:</strong> Strict access controls ensure only authorized personnel can access systems</li>
              <li><strong>Authentication:</strong> Secure authentication protocols protect your account</li>
              <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
              <li><strong>Data Isolation:</strong> Each user's data is isolated and cannot be accessed by other users</li>
              <li><strong>Secure Infrastructure:</strong> Our servers are hosted in secure, certified data centers</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              While we implement robust security measures, no system is 100% secure. We continuously monitor and improve our security practices to protect your information.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Data Retention and Deletion</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your data only as long as necessary:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Active Accounts:</strong> Your data is retained while your account is active</li>
              <li><strong>Deleted Files:</strong> When you delete a file, it is permanently removed from our systems within 30 days</li>
              <li><strong>Account Deletion:</strong> When you delete your account, all associated data is permanently deleted within 90 days</li>
              <li><strong>Backup Data:</strong> Backup copies are securely deleted according to our backup retention schedule</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              You have complete control over your data. You can delete individual files or your entire account at any time from your account settings.
            </p>
          </section>

          {/* Data Sharing */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do NOT sell, rent, or trade your personal information. We may share your information only in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Service Providers:</strong> Trusted third-party services that help us operate our platform (e.g., cloud hosting, payment processing). These providers are contractually obligated to protect your data and use it only for specified purposes.</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
              <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to affected users)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              All third-party service providers are carefully vetted and must maintain the same level of data protection as we do.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Your Rights and Choices</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Delete your files or entire account at any time</li>
              <li><strong>Export:</strong> Download all your presentations and data</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from non-essential communications</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To exercise any of these rights, please contact us at privacy@slaidapp.com or use the tools available in your account settings.
            </p>
          </section>

          {/* International Users */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you are located outside the United States and choose to provide information to us, we transfer your data to the United States and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Slaid is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending you an email notification for significant changes</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Your continued use of Slaid after any changes indicates your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@slaidapp.com</p>
              <p className="text-gray-700 mb-2"><strong>Website:</strong> slaidapp.com</p>
              <p className="text-gray-700">We will respond to all legitimate requests within 30 days.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}


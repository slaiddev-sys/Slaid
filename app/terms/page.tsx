'use client';

import { useRouter } from 'next/navigation';

export default function TermsOfService() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: November 18, 2024</p>

        <div className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Service ("Terms") govern your access to and use of Slaid's services, website, and applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed font-semibold">
              If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          {/* Account Registration */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Account Registration and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use Slaid, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security and confidentiality of your password</li>
              <li>Notify us immediately of any unauthorized access or security breach</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You must be at least 13 years old to use the Service. If you are under 18, you may only use the Service with the consent of a parent or legal guardian.
            </p>
          </section>

          {/* Use of Service */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to use the Service only for lawful purposes. You agree NOT to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated scripts or bots to access the Service</li>
              <li>Resell, redistribute, or make the Service available to third parties</li>
              <li>Reverse engineer, decompile, or attempt to extract source code</li>
              <li>Remove or modify any copyright, trademark, or proprietary notices</li>
              <li>Use the Service to create competing products or services</li>
              <li>Upload content that infringes intellectual property rights</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              We reserve the right to suspend or terminate your account if you violate these terms.
            </p>
          </section>

          {/* Data Ownership */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Your Data and Content</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Ownership</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>You retain full ownership of all data and files you upload to Slaid.</strong> This includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Excel files and spreadsheet data</li>
              <li>Generated presentations and visualizations</li>
              <li>Any content you create using the Service</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>License Grant</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              By uploading content to Slaid, you grant us a limited, non-exclusive license to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Process your data to generate presentations</li>
              <li>Store your files on our secure servers</li>
              <li>Display your presentations back to you</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              This license exists solely to provide you with the Service. We do NOT use your data for any other purpose, and this license terminates when you delete your content or account.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Data Security and Privacy</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are committed to protecting your data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>All data is encrypted at rest and in transit</li>
              <li>We never access your files except to provide the Service</li>
              <li>We never share your data with third parties for their purposes</li>
              <li>You can delete your data at any time</li>
            </ul>
          </section>

          {/* Subscription and Payment */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Subscription and Payment</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Plans and Pricing</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Slaid offers various subscription plans with different features and credit allocations. Current pricing is available on our website and may be changed with notice.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Payment Terms</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>You authorize us to charge your payment method automatically</li>
              <li>You are responsible for providing valid payment information</li>
              <li>Failure to pay may result in service suspension or termination</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Credits System</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Credits are used to generate presentations</li>
              <li>Credit allocations vary by subscription plan</li>
              <li>Unused credits may expire according to your plan terms</li>
              <li>Credits are non-transferable and have no cash value</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Cancellation and Refunds</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may cancel your subscription at any time from your account settings. Cancellation will take effect at the end of your current billing period. We do not provide refunds for partial months or unused credits, except as required by law.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by Slaid and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may not copy, modify, distribute, sell, or lease any part of our Service or software, nor may you reverse engineer or attempt to extract the source code of that software, unless explicitly permitted by law or you have our written permission.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Disclaimers and Limitations</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Service Availability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service is provided "as is" and "as available." We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>Results obtained from the Service will be accurate or reliable</li>
              <li>The Service will meet your specific requirements</li>
              <li>Any errors or defects will be corrected</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>AI-Generated Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Slaid uses artificial intelligence to analyze data and generate presentations. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>You are responsible for reviewing and verifying all generated content</li>
              <li>You should not rely solely on AI-generated insights for critical decisions</li>
              <li>We are not liable for any decisions made based on AI-generated content</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: '#002903' }}>Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law, Slaid shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Loss of profits, data, use, or goodwill</li>
              <li>Service interruption or downtime</li>
              <li>Errors or inaccuracies in generated content</li>
              <li>Unauthorized access to your account or data</li>
            </ul>
            <p className="text-gray-700 leading-relaxed font-semibold">
              Our total liability to you for all claims shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Breach of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Violation of intellectual property rights</li>
              <li>Non-payment of fees</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Upon termination, your right to use the Service will cease immediately. We will make reasonable efforts to provide you with access to export your data within 30 days of termination, after which your data will be permanently deleted.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may terminate your account at any time by deleting it from your account settings. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to defend, indemnify, and hold harmless Slaid and its officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Governing Law and Disputes</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Any dispute arising from or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except that either party may seek injunctive or other equitable relief in a court of competent jurisdiction.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You agree to waive any right to a jury trial or to participate in a class action lawsuit.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Posting the updated Terms on our website</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending an email notification to your registered email address</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Your continued use of the Service after any changes indicates your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#002903' }}>Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@slaidapp.com</p>
              <p className="text-gray-700 mb-2"><strong>Website:</strong> slaidapp.com</p>
              <p className="text-gray-700">We will respond to all legitimate inquiries within 30 days.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}


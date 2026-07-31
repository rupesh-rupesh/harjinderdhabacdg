import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-dhaba-orange transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-stone-100 pb-8">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-dhaba-orange" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">Privacy Policy</h1>
              <p className="text-stone-500 mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-dhaba-orange">
            <h2 className="text-2xl font-bold text-stone-800 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              We collect information you provide directly to us when you use our website, place an order, or contact us. This may include your name, email address, phone number, delivery address, and payment information. We also collect certain information automatically when you visit our website, such as your IP address, browser type, and device information.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-stone-600 space-y-2">
              <li>Process and fulfill your orders, including sending order confirmations and delivery updates.</li>
              <li>Communicate with you about your orders, inquiries, and customer service requests.</li>
              <li>Improve and personalize your experience on our website.</li>
              <li>Send you marketing communications (if you have opted in), which you can opt out of at any time.</li>
              <li>Protect against fraudulent transactions and ensure the security of our website.</li>
            </ul>

            <h2 className="text-2xl font-bold text-stone-800 mt-8 mb-4">3. Information Sharing and Disclosure</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted third-party service providers who assist us in operating our website, processing payments, delivering orders, or analyzing website traffic. These service providers are contractually obligated to keep your information confidential and secure.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mt-8 mb-4">4. Data Security</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mt-8 mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can manage your cookie preferences through your browser settings, but disabling cookies may limit your ability to use certain features of our website.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mt-8 mb-4">6. Your Rights</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. To exercise these rights, please contact us using the information provided below.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mt-8 mb-4">7. Changes to This Privacy Policy</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-bold text-stone-800 mt-8 mb-4">8. Contact Us</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mt-6">
              <p className="text-stone-700 font-medium mb-1">Privacy Officer</p>
              <p className="text-stone-600">privacy@restaurant.com</p>
              <p className="text-stone-600">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

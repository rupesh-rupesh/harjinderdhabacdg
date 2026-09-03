import React, { useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  useEffect(() => {
    // Set page-specific title
    const prevTitle = document.title;
    document.title = 'Privacy Policy | Harjinder Tourist Dhaba';

    // Set canonical
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.href || '';
    if (canonical) canonical.href = 'https://harjindertouristdhaba.com/privacy-policy';

    return () => {
      document.title = prevTitle;
      if (canonical) canonical.href = prevCanonical;
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-stone-50 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[var(--color-brown)] to-stone-50 z-0"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-bold text-white/80 hover:text-white hover:translate-x-[-4px] transition-all duration-300 mb-8 bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-stone-200/50 p-8 sm:p-12 md:p-16 relative overflow-hidden">
          {/* Subtle gold glow inside card */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-12 border-b border-stone-100 pb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-gold)] to-[#b38827] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--color-gold)]/20 p-1">
              <div className="w-full h-full bg-[var(--color-brown)] rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-[var(--color-gold)]" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-stone-900 tracking-tight leading-tight mb-3">Privacy Policy</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] animate-pulse"></div>
                <p className="text-stone-500 text-sm font-medium">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-dhaba-orange prose-p:text-stone-600 prose-p:leading-relaxed">
            
            <section className="mb-10 group">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-brown)] mt-0 mb-5 flex items-center gap-3">
                <span className="text-[var(--color-gold)] opacity-50 text-xl font-sans">01.</span>
                Information We Collect
              </h2>
              <p className="pl-6 sm:pl-9 border-l-2 border-stone-100 group-hover:border-[var(--color-gold)]/40 transition-colors duration-300">
                We collect information you provide directly to us when you use our website, place an order, or contact us. This may include your name, email address, phone number, delivery address, and payment information. We also collect certain information automatically when you visit our website, such as your IP address, browser type, and device information.
              </p>
            </section>

            <section className="mb-10 group">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-brown)] mt-8 mb-5 flex items-center gap-3">
                <span className="text-[var(--color-gold)] opacity-50 text-xl font-sans">02.</span>
                How We Use Your Information
              </h2>
              <div className="pl-6 sm:pl-9 border-l-2 border-stone-100 group-hover:border-[var(--color-gold)]/40 transition-colors duration-300">
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-none space-y-3 pl-0">
                  {[
                    "Process and fulfill your orders, including sending order confirmations and delivery updates.",
                    "Communicate with you about your orders, inquiries, and customer service requests.",
                    "Improve and personalize your experience on our website.",
                    "Send you marketing communications (if you have opted in), which you can opt out of at any time.",
                    "Protect against fraudulent transactions and ensure the security of our website."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] mt-2.5 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mb-10 group">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-brown)] mt-8 mb-5 flex items-center gap-3">
                <span className="text-[var(--color-gold)] opacity-50 text-xl font-sans">03.</span>
                Information Sharing and Disclosure
              </h2>
              <p className="pl-6 sm:pl-9 border-l-2 border-stone-100 group-hover:border-[var(--color-gold)]/40 transition-colors duration-300">
                We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted third-party service providers who assist us in operating our website, processing payments, delivering orders, or analyzing website traffic. These service providers are contractually obligated to keep your information confidential and secure.
              </p>
            </section>

            <section className="mb-10 group">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-brown)] mt-8 mb-5 flex items-center gap-3">
                <span className="text-[var(--color-gold)] opacity-50 text-xl font-sans">04.</span>
                Data Security
              </h2>
              <p className="pl-6 sm:pl-9 border-l-2 border-stone-100 group-hover:border-[var(--color-gold)]/40 transition-colors duration-300">
                We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-10 group">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-brown)] mt-8 mb-5 flex items-center gap-3">
                <span className="text-[var(--color-gold)] opacity-50 text-xl font-sans">05.</span>
                Cookies and Tracking Technologies
              </h2>
              <p className="pl-6 sm:pl-9 border-l-2 border-stone-100 group-hover:border-[var(--color-gold)]/40 transition-colors duration-300">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can manage your cookie preferences through your browser settings, but disabling cookies may limit your ability to use certain features of our website.
              </p>
            </section>

            <section className="mb-10 group">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-brown)] mt-8 mb-5 flex items-center gap-3">
                <span className="text-[var(--color-gold)] opacity-50 text-xl font-sans">06.</span>
                Your Rights
              </h2>
              <p className="pl-6 sm:pl-9 border-l-2 border-stone-100 group-hover:border-[var(--color-gold)]/40 transition-colors duration-300">
                Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-10 group">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-brown)] mt-8 mb-5 flex items-center gap-3">
                <span className="text-[var(--color-gold)] opacity-50 text-xl font-sans">07.</span>
                Changes to This Privacy Policy
              </h2>
              <p className="pl-6 sm:pl-9 border-l-2 border-stone-100 group-hover:border-[var(--color-gold)]/40 transition-colors duration-300">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date.
              </p>
            </section>

            <section className="mt-12 pt-10 border-t border-stone-100/80">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-brown)] mb-6 flex items-center gap-3">
                <span className="text-[var(--color-gold)] opacity-50 text-xl font-sans">08.</span>
                Contact Us
              </h2>
              <p className="mb-6 pl-6 sm:pl-9">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="ml-6 sm:ml-9 bg-stone-50/50 p-6 sm:p-8 rounded-2xl border border-stone-200/60 inline-block shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_-5px_rgba(217,119,6,0.15)] transition-shadow duration-300">
                <p className="text-[var(--color-gold)] text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Privacy Officer
                </p>
                <a href="tel:+919056655093" className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-brown)] hover:text-dhaba-orange transition-colors">
                  +91 9056655093
                </a>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

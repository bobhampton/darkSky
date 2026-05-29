import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';
import { usePageMetadata } from '@/hooks';
import { Breadcrumbs } from '@/components';

/**
 * Privacy Policy page - Explains data collection and usage
 */
export function PrivacyPage() {
  usePageMetadata({
    title: 'Privacy Policy - darkSky Calculator',
    description: 'darkSky Calculator privacy policy. Learn about our data collection practices, use of Google Analytics, local storage, and your privacy rights. We do not collect personally identifiable information.',
  });

  const lastUpdated = 'May 27, 2026';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs />
      
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        </div>
        <p className="text-gray-400">
          Last updated: <time dateTime="2026-05-27">{lastUpdated}</time>
        </p>
      </header>

      {/* Content */}
      <div className="space-y-8 text-gray-300">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
          <p className="leading-relaxed">
            Welcome to darkSky, a dark sky time calculator. This privacy policy explains how we collect, use,
            and protect your information when you use our website.
          </p>
        </section>

        {/* Data Collection */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Data We Collect</h2>
          
          <h3 className="text-xl font-semibold text-white mb-3 mt-6">Analytics Data</h3>
          <p className="leading-relaxed mb-3">
            We use <strong className="text-blue-400">Google Analytics</strong> to understand how visitors use
            our website. Google Analytics collects:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Pages you visit and time spent on each page</li>
            <li>Your browser type and operating system</li>
            <li>Your approximate geographic location (country/city level)</li>
            <li>How you arrived at our site (referral source)</li>
            <li>Device type (desktop, mobile, tablet)</li>
          </ul>
          <p className="leading-relaxed mt-3">
            This data is collected anonymously and helps us improve the website's usability and performance.
          </p>

          <h3 className="text-xl font-semibold text-white mb-3 mt-6">Local Storage Data</h3>
          <p className="leading-relaxed mb-3">
            We store the following data in your browser's local storage (on your device only):
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-purple-400">Observer Location:</strong> Your saved latitude, longitude,
              elevation, and timezone preferences for the calculator
            </li>
            <li>
              <strong className="text-purple-400">Calculation Results:</strong> Dark sky time results you've
              generated (cached temporarily)
            </li>
          </ul>
          <p className="leading-relaxed mt-3">
            This data <strong>never leaves your device</strong> and is not transmitted to our servers or
            any third party. You can clear this data at any time using your browser's developer tools
            or by clearing your browser's local storage.
          </p>
        </section>

        {/* Data Usage */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Data</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-purple-400">Analytics:</strong> To understand usage patterns and improve
              the website
            </li>
            <li>
              <strong className="text-purple-400">Local Storage:</strong> To save your preferences and provide
              a better user experience
            </li>
          </ul>
          <p className="leading-relaxed mt-4">
            We do <strong>not</strong>:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
            <li>Collect personally identifiable information (name, email, etc.)</li>
            <li>Sell or share your data with third parties for marketing purposes</li>
            <li>Track you across other websites</li>
            <li>Require user accounts or authentication</li>
          </ul>
        </section>

        {/* Third-Party Services */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Services</h2>
          
          <h3 className="text-xl font-semibold text-white mb-3">Google Analytics</h3>
          <p className="leading-relaxed mb-3">
            Google Analytics is a web analytics service provided by Google, Inc. Google uses the collected
            data to track and monitor the use of our website.
          </p>
          <p className="leading-relaxed">
            For more information on Google's privacy practices, please visit:{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              Google Privacy Policy
            </a>
          </p>

          <h3 className="text-xl font-semibold text-white mb-3 mt-6">Astronomy Engine</h3>
          <p className="leading-relaxed">
            This website uses the{' '}
            <a
              href="https://github.com/cosinekitty/astronomy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              Astronomy Engine
            </a>{' '}
            library to perform astronomical calculations. All calculations are performed locally in your
            browser—no data is sent to external servers for computation.
          </p>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Cookies</h2>
          <p className="leading-relaxed mb-3">
            We use cookies only through Google Analytics for analytics purposes. These cookies help us
            understand how visitors interact with our website.
          </p>
          <p className="leading-relaxed">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            However, if you do not accept cookies, you may not be able to use some portions of our website.
          </p>
        </section>

        {/* User Rights */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
          <p className="leading-relaxed mb-3">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Opt out of Google Analytics tracking (use browser extensions like uBlock Origin)</li>
            <li>Clear your browser's local storage at any time</li>
            <li>Use the website without accepting cookies (though functionality may be limited)</li>
          </ul>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
          <p className="leading-relaxed">
            Since all your calculation data is stored locally on your device and we don't collect personal
            information, there is minimal risk of data breach. Google Analytics data is handled by Google
            according to their security standards.
          </p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Children's Privacy</h2>
          <p className="leading-relaxed">
            Our website does not knowingly collect any personal information from children under the age of 13.
            The website is suitable for educational use by students of all ages.
          </p>
        </section>

        {/* Changes to Policy */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any changes by
            updating the "Last updated" date at the top of this page.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
          <p className="leading-relaxed mb-3">
            If you have questions about this privacy policy, please visit our{' '}
            <a
              href="https://github.com/bobhampton/darkSky/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              GitHub Issues page
            </a>
            .
          </p>
        </section>
      </div>

      {/* Navigation */}
      <div className="mt-12 pt-8 border-t border-gray-700">
        <div className="text-center mb-6">
          <p className="text-gray-400 mb-4">
            Ready to calculate dark sky times?{' '}
            <Link
              to="/getting-started"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              Learn how to use the calculator
            </Link>
            {' '}or check our{' '}
            <Link
              to="/faq"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              FAQ
            </Link>
            {' '}for answers.
          </p>
        </div>
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <Home className="w-5 h-5" />
            Return to Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}

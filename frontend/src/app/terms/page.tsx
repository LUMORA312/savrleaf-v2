import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';

const TermsPage = () => (
  <>
    <Header />
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Terms of Service
        </h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            {/* Highlight Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-center">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                SavrLeaf™ Terms
              </h2>
              <p className="text-lg text-yellow-700 font-semibold">
                SavrLeaf™ is for informational purposes only. <br />
                We do not sell cannabis. Users must be 21+. <br />
                Deals and offers may change without notice.
              </p>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold mb-3">1. Platform Purpose</h3>
                <p className="text-gray-700">
                  SavrLeaf™ is an information-only platform that connects users with
                  cannabis deals and dispensary information. We do not sell,
                  distribute, or handle cannabis products directly.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">2. Age Requirement</h3>
                <p className="text-gray-700">
                  Users must be 21 years of age or older to access this platform. Age
                  verification may be required and is strictly enforced.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">3. Deal Information</h3>
                <p className="text-gray-700">
                  All deals, prices, and offers are subject to change without notice.
                  Information is provided by partner dispensaries, and SavrLeaf™ does
                  not guarantee accuracy, completeness, or availability.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">4. Legal Compliance</h3>
                <p className="text-gray-700">
                  This platform operates under Illinois law and applicable state
                  regulations. Users are responsible for ensuring compliance with
                  cannabis laws in their own jurisdiction.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">5. No Cannabis Sales</h3>
                <p className="text-gray-700">
                  SavrLeaf™ does not sell cannabis products. All transactions occur
                  directly between users and licensed dispensaries. We are not
                  responsible for product quality, availability, or transaction
                  issues.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Contact Information</h3>
                <p className="text-gray-700">
                  For questions about these terms or our platform, contact us at:{' '}
                  <span className="font-semibold">support@savrleaf.com</span>
                </p>
              </section>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default TermsPage;

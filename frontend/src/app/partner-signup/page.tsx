'use client';

import DispensaryApplicationForm from '@/components/DispensaryApplication';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function PartnerSignupPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen py-10 bg-gradient-to-br from-orange-50 to-white">
        <h1 className="text-3xl font-bold text-center text-orange-800 mb-4">Apply to join as a Dispensary Partner</h1>
        <DispensaryApplicationForm />
      </div>
      <Footer />
    </>
  );
}

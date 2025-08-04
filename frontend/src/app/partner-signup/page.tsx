'use client';

import { useEffect, useState } from 'react';
import DispensaryApplicationForm from '@/components/DispensaryApplication';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import axios from 'axios';
import { SubscriptionTier } from '@/types';

export default function PartnerSignupPage() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/subscription-tiers`);
        setTiers(res.data);
      } catch (error) {
        console.error('Error fetching subscription tiers', error);
      }
    };
    fetchTiers();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen py-10 bg-gradient-to-br from-orange-50 to-white px-4 md:px-16">
        <h1 className="text-3xl font-bold text-center text-orange-800 mb-8">
          Apply to join as a Dispensary Partner
        </h1>

        {/* Subscription Tiers Row */}
        <div className="flex flex-col items-center mb-2">
          <h2 className="text-xl font-semibold text-orange-700 mb-4">Choose Your Plan</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {tiers.map((tier) => (
              <div
                key={tier._id}
                className="w-full sm:w-64 border border-orange-200 rounded-lg p-4 shadow-sm bg-white"
              >
                <h3 className="text-lg font-bold text-orange-800">{tier.displayName}</h3>
                <p className="text-sm text-gray-600 mb-2">${tier.monthlyPrice} / month</p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                  {tier.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        <DispensaryApplicationForm />
      </div>
      <Footer />
    </>
  );
}

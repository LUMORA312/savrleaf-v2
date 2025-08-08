'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Deal, Dispensary } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function UserDispensaryPage() {
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found. Please log in.');

        const dispensaryRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dispensaries/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!dispensaryRes.data || !Array.isArray(dispensaryRes.data) || dispensaryRes.data.length === 0) {
          throw new Error('No dispensaries found for user');
        }

        setDispensaries(dispensaryRes.data);

        const dispensaryIds = dispensaryRes.data.map((d: Dispensary) => d._id);

        const dealsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/deals`, {
          params: { dispensaryId: dispensaryIds },
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!dealsRes.data.success) {
          throw new Error('Failed to fetch deals');
        }

        setDeals(dealsRes.data.deals || []);
      } catch (err: any) {
        console.error('Fetch error:', err);

        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => {
            window.location.href = '/partner-login';
          }, 1500);
          return;
        }

        setError(err.message || 'Failed to load dispensary data.');
        setDispensaries([]);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center p-10 text-gray-600">
          Loading your dispensary details...
        </main>
        <Footer />
      </>
    );
  }

  if (error || dispensaries.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center p-10 text-red-500">
          {error || 'No dispensary found for your account.'}
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 px-6 md:px-16 py-8">
        {/* Render All Dispensaries */}
        {dispensaries.map((dispensary) => (
          <section
            key={dispensary._id}
            className="bg-white rounded-xl p-6 shadow mb-10 max-w-4xl mx-auto"
          >
            <div className="flex items-center space-x-6 mb-4">
              {dispensary.logo ? (
                <Image
                  src={dispensary.logo}
                  alt={`${dispensary.name} logo`}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  No Logo
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{dispensary.name}</h1>
                <p className="text-sm text-gray-500">{dispensary.legalName}</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{dispensary.description}</p>

            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <strong>Address:</strong> {dispensary.address.street1}, {dispensary.address.city},{' '}
                {dispensary.address.state} {dispensary.address.zipCode}
              </p>
              {dispensary.phoneNumber && <p>📞 {dispensary.phoneNumber}</p>}
              {dispensary.websiteUrl && (
                <p>
                  🌐{' '}
                  <a
                    href={dispensary.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    Website
                  </a>
                </p>
              )}
            </div>
          </section>
        ))}

        {/* Render Deals for All Dispensaries */}
        <section className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Current Deals</h2>

          {deals.length === 0 ? (
            <p className="text-gray-600">No deals available at this time.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <div
                  key={deal._id}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
                >
                  {/* {deal.images?.[0] && (
                    <Image
                      src={deal.images[0]}
                      alt={deal.title}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover mb-3"
                    />
                  )} */}
                  <h3 className="text-lg font-medium">{deal.title}</h3>
                  <p className="text-gray-600 mt-1 mb-2">{deal.description}</p>
                  <div className="flex items-center justify-between text-green-600 font-semibold">
                    <span>
                      {deal.originalPrice
                        ? Math.round(
                            ((deal.originalPrice - deal.salePrice) / deal.originalPrice) * 100
                          )
                        : 0}
                      % off
                    </span>
                    <span className="text-sm text-gray-400">
                      Valid until {deal.endDate ? new Date(deal.endDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
                    Claim Deal
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout, { TabKey } from './components/DashboardLayout';
import DealsList from './components/DealsList';
import DealForm from './components/DealForm';
import UserInfo from './components/UserInfo';
import DispensaryInfo from './components/DispensaryInfo';
import axios from 'axios';

interface OverviewData {
  totalDeals: number;
  totalDispensaries: number;
  activeDeals: number;
}

export default function PartnerDashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showDealForm, setShowDealForm] = useState(false);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [dispensaries, setDispensaries] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== 'partner') {
        router.replace('/partner-login');
        return;
      }

      // Fetch dashboard data
      const fetchDashboard = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/partner/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setOverview(res.data.overview);
          setDispensaries(res.data.dispensaries);
          setDeals(res.data.deals);
          setFetching(false);
        } catch (err) {
          console.error('Dashboard fetch error:', err);
          setFetchError('Failed to load dashboard data');
          setFetching(false);
        }
      };

      fetchDashboard();
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <p>{fetchError}</p>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <h3 className="text-lg font-semibold">Total Deals</h3>
            <p className="text-4xl font-bold mt-2">{overview?.totalDeals}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <h3 className="text-lg font-semibold">Active Deals</h3>
            <p className="text-4xl font-bold mt-2">{overview?.activeDeals}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <h3 className="text-lg font-semibold">Dispensaries</h3>
            <p className="text-4xl font-bold mt-2">{overview?.totalDispensaries}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <h3 className="text-lg font-semibold">Status</h3>
            <p className="text-lg mt-2 text-green-600 font-bold">Approved</p>
          </div>
        </div>
      )}

      {activeTab === 'deals' && (
        <>
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">My Deals</h2>
            <button
              onClick={() => setShowDealForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Deal
            </button>
          </div>
          <DealsList deals={deals} />
        </>
      )}

      {activeTab === 'dispensary' && <DispensaryInfo dispensaries={dispensaries} />}
      {activeTab === 'user' && <UserInfo user={user} />}

      {showDealForm && <DealForm onClose={() => setShowDealForm(false)} />}
    </DashboardLayout>
  );
}

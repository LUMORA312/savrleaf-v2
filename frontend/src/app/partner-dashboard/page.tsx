'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout, { TabKey } from './components/DashboardLayout';
import DealsList from './components/DealsList';
import DealForm from './components/DealForm';
import UserInfo from './components/UserInfo';
import DispensaryInfo from './components/DispensaryInfo';

export default function PartnerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showDealForm, setShowDealForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== 'partner') {
        router.replace('/partner-login');
      }
    }
    setLoading(false);
  }, [isAuthenticated, user, router, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'partner') {
    return null;
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Total Deals</h3>
            <p className="text-3xl font-bold mt-2">8</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold">Dispensaries</h3>
            <p className="text-3xl font-bold mt-2">1</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
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
          <DealsList />
        </>
      )}

      {activeTab === 'dispensary' && <DispensaryInfo />}
      {activeTab === 'user' && <UserInfo />}

      {showDealForm && <DealForm onClose={() => setShowDealForm(false)} />}
    </DashboardLayout>
  );
}

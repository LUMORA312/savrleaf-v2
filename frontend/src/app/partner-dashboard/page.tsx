'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout, { TabKey } from '../../components/dashboard/DashboardLayout';
import DealsList from './components/DealsList';
import UserInfo from './components/UserInfo';
import DispensaryInfo from './components/DispensaryInfo';
import axios from 'axios';
import Modal from '@/components/Modal';
import DealForm from '@/components/DealForm';
import { Deal, Dispensary, User } from '@/types';

interface OverviewData {
  totalDeals: number;
  totalDispensaries: number;
  activeDeals: number;
  isUserActive: boolean;
}

export default function PartnerDashboardPage() {
  const { user: authUser, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showDealForm, setShowDealForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || authUser?.role !== 'partner') {
      router.replace('/partner-login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/partner/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);

        setOverview(res.data.overview);
        setDispensaries(res.data.dispensaries);
        setDeals(res.data.deals);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setFetchError('Failed to load dashboard data');
      } finally {
        setFetching(false);
      }
    };

    fetchDashboard();
  }, [loading, isAuthenticated, authUser, router]);

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

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDealForm(true);
  };

  const handleSaveDeal = (savedDeal: Deal) => {
    if (selectedDeal) {
      setDeals((prev) => prev.map((d) => (d._id === savedDeal._id ? savedDeal : d)));
    } else {
      setDeals((prev) => [savedDeal, ...prev]);
    }
    setShowDealForm(false);
  };

  const handleCancelForm = () => {
    setShowDealForm(false);
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <>
          <h2 className="mb-6 text-3xl font-extrabold text-orange-700 tracking-tight">
            My Deals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Total Deals */}
            <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-700">Total Deals</h3>
              <p className="text-5xl font-extrabold mt-2 text-gray-900">{overview?.totalDeals}</p>
            </div>

            {/* Active Deals */}
            <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center border border-green-200">
              <h3 className="text-lg font-semibold text-green-700">Active Deals</h3>
              <p className="text-5xl font-extrabold mt-2 text-gray-900">{overview?.activeDeals}</p>
            </div>

            {/* Dispensaries */}
            <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-700">Dispensaries</h3>
              <p className="text-5xl font-extrabold mt-2 text-gray-900">{overview?.totalDispensaries}</p>
            </div>

            {/* Status */}
            <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center border border-green-200">
              <h3 className="text-lg font-semibold text-green-700">Status</h3>
              {overview?.isUserActive ? (
                <span className="mt-3 px-4 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                  Active
                </span>
              ) : (
                <span className="mt-3 px-4 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-sm">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'deals' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-orange-700 tracking-tight">
              My Deals
            </h2>
            <button
              onClick={() => {
                if (!user) return;
                setShowDealForm(true);
              }}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-orange-400"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Deal
            </button>
          </div>
          <DealsList deals={deals} setDeals={setDeals} onEdit={handleEditDeal} />
        </>
      )}

      {activeTab === 'dispensary' && <DispensaryInfo dispensaries={dispensaries} />}

      {activeTab === 'user' && user && (
        <UserInfo user={user} /> // pass full backend user
      )}

      {user && showDealForm && (
        <Modal isOpen={true} onClose={handleCancelForm}>
          <DealForm
            initialData={selectedDeal}
            onSave={handleSaveDeal}
            onCancel={handleCancelForm}
            dispensaryOptions={dispensaries}
            userId={user?.id}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
}

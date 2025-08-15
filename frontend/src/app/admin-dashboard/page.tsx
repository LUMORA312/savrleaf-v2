'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout, { TabKey } from '../partner-dashboard/components/DashboardLayout';
// import UsersList from '../partner-dashboard/components/UsersList';
import DealsList from '../partner-dashboard/components/DealsList';
// import DispensariesList from './components/DispensariesList';
import axios from 'axios';
import Modal from '@/components/Modal';
import DealForm from '@/components/DealForm';

interface OverviewData {
  totalUsers: number;
  totalDeals: number;
  totalDispensaries: number;
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showDealForm, setShowDealForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [dispensaries, setDispensaries] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);

  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/admin-login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOverview(res.data.overview);
        setUsers(res.data.users);
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

  const handleEditDeal = (deal: any) => {
    setSelectedDeal(deal);
    setShowDealForm(true);
  };

  const handleSaveDeal = (savedDeal: any) => {
    if (selectedDeal) {
      setDeals((prev) => prev.map((d) => (d._id === savedDeal._id ? savedDeal : d)));
    } else {
      setDeals((prev) => [savedDeal, ...prev]);
    }
    setShowDealForm(false);
  };

  const handleCancelForm = () => setShowDealForm(false);

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} isAdmin>
      {activeTab === 'overview' && (
        <>
          <h2 className="mb-6 text-3xl font-extrabold text-orange-700 tracking-tight">
            Admin Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-700">Total Users</h3>
              <p className="text-5xl font-extrabold mt-2 text-gray-900">{overview?.totalUsers}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-700">Total Deals</h3>
              <p className="text-5xl font-extrabold mt-2 text-gray-900">{overview?.totalDeals}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center border border-green-200">
              <h3 className="text-lg font-semibold text-green-700">Total Dispensaries</h3>
              <p className="text-5xl font-extrabold mt-2 text-gray-900">{overview?.totalDispensaries}</p>
            </div>
          </div>
        </>
      )}

      {/* {activeTab === 'users' && (
        <>
          <h2 className="text-3xl font-extrabold text-orange-700 mb-6">Users</h2>
          <UsersList users={users} />
        </>
      )} */}

      {/* {activeTab === 'dispensaries' && (
        <>
          <h2 className="text-3xl font-extrabold text-orange-700 mb-6">Dispensaries</h2>
          <DispensariesList dispensaries={dispensaries} />
        </>
      )} */}

      {activeTab === 'deals' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-orange-700 tracking-tight">
              Deals
            </h2>
            <button
              onClick={() => setShowDealForm(true)}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-orange-400"
              type="button"
            >
              Add Deal
            </button>
          </div>
          <DealsList deals={deals} setDeals={setDeals} onEdit={handleEditDeal} />
        </>
      )}

      {showDealForm && (
        <Modal isOpen={true} onClose={handleCancelForm}>
          <DealForm
            initialData={selectedDeal}
            onSave={handleSaveDeal}
            onCancel={handleCancelForm}
            dispensaryOptions={dispensaries}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
}

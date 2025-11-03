'use client';

import { SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminTable from '@/components/AdminTable';
import DashboardLayout, { TabKey } from '../../components/dashboard/DashboardLayout';
import DealsList from '../partner-dashboard/components/DealsList';
import axios from 'axios';
import Modal from '@/components/Modal';
import DealForm from '@/components/DealForm';
import ApplicationModal from '@/components/ApplicationModal';
import { Application, Deal, Dispensary, Subscription, User } from '@/types';
import DispensaryModal from '@/components/DispensaryModal';
import UserModal from '@/components/UserModal';
import { countUserActiveDeals } from '@/utils/usedSkus';

interface OverviewData {
  totalUsers: number;
  totalDeals: number;
  totalDispensaries: number;
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('adminOverview');
  const [showDealForm, setShowDealForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const handleViewApplication = (app: Application) => setSelectedApplication(app);
  const handleCloseApplicationModal = () => setSelectedApplication(null);
  const [selectedDispensary, setSelectedDispensary] = useState<Dispensary | null>(null);
  const handleViewDispensary = (disp: Dispensary) => setSelectedDispensary(disp);
  const handleCloseDispensaryModal = () => setSelectedDispensary(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
        setApplications(res.data.applications);
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

  const handleCancelForm = () => setShowDealForm(false);

  const handleApproveApplication = async (id: string) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}/approve`,
        null,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const updatedApp = res.data.application;
      const updatedDisp = res.data.dispensary;

      // Update applications
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? updatedApp : a))
      );

      // Update dispensaries if there’s an associated dispensary
      if (updatedDisp) {
        setDispensaries((prev) =>
          prev.map((d) => (d._id === updatedDisp._id ? updatedDisp : d))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectApplication = async (id: string) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/applications/${id}/reject`,
        null,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const updatedApp = res.data.application;
      const updatedDisp = res.data.dispensary;

      setApplications((prev) =>
        prev.map((a) => (a._id === id ? updatedApp : a))
      );

      if (updatedDisp) {
        setDispensaries((prev) =>
          prev.map((d) => (d._id === updatedDisp._id ? updatedDisp : d))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateDispensaryStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/dispensaries/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDispensaries((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status } : d))
      );
      setSelectedDispensary(prev => prev?._id === id ? { ...prev, status } : prev);
    } catch (err) {
      console.error('Failed to update dispensary status', err);
    }
  };

  const updateUserStatus = async (id: string, status: 'active' | 'inactive') => {
    console.log("updating: ", id, status)
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isActive: status === 'active' } : u))
      );
      setSelectedUser(prev => prev?._id === id ? { ...prev, isActive: status === 'active' } : prev);
    } catch (err) {
      console.error('Failed to update user status', err);
    }
  };

  async function handleUpdateSubscription(id: string, adminSkuOverride: number) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminSkuOverride }),
      });

      if (!res.ok) throw new Error('Failed to update subscription');

      const updatedSubscription: Subscription = await res.json();

      setSelectedDispensary(prev =>
        prev && prev._id === id ? { ...prev, subscription: updatedSubscription } : prev
      );
      setDispensaries(prev =>
        prev.map(d =>
          d._id === id ? { ...d, subscription: updatedSubscription } : d
        )
      );
    } catch (err) {
      console.error('Subscription update failed:', err);
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} isAdmin>
      {activeTab === 'adminOverview' && (
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

      {activeTab === 'users' && (
        <>
          <h2 className="text-3xl font-extrabold text-orange-700 mb-6">Users</h2>
          <AdminTable
            data={users}
            columns={[
              {
                key: 'fullName',
                label: 'Full Name',
                render: (user: User) => `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role' },
              {
                key: 'isActive',
                label: 'Is Active?',
                render: (user: User) => (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
            ]}
            actions={(user) => (
              <button
                className={`px-3 py-1 rounded cursor-pointer text-white ${
                  user.isActive ? 'bg-red-600' : 'bg-green-600'
                }`}
                onClick={async (e) => {
                  e.stopPropagation();
                  await updateUserStatus(user._id, user.isActive ? 'inactive' : 'active');
                }}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
            )}
            onRowClick={(user: SetStateAction<User | null>) => setSelectedUser(user)}
          />
          {selectedUser && (
            <UserModal
              user={selectedUser}
              isOpen={!!selectedUser}
              onClose={() => setSelectedUser(null)}
              onUpdateSubscription={handleUpdateSubscription}
              usedSkus={countUserActiveDeals(selectedUser._id, deals, dispensaries)}
            />
          )}
        </>
      )}

      {activeTab === 'dispensary' && (
        <>
          <h2 className="text-3xl font-extrabold text-orange-700 mb-6">Dispensaries</h2>
          <AdminTable
            data={dispensaries}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'legalName', label: 'Legal Name' },
              { key: 'licenseNumber', label: 'License Number' },
              {
                key: 'status',
                label: 'Status',
                render: (disp: Dispensary) => (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      disp.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : disp.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {disp.status.toUpperCase()}
                  </span>
                ),
              },
            ]}
            actions={(disp) => (
              <button
                className={`px-3 py-1 rounded cursor-pointer ${
                  disp.status === 'approved'
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
                onClick={async (e) => {
                  e.stopPropagation();
                  await updateDispensaryStatus(
                    disp._id,
                    disp.status === 'approved' ? 'rejected' : 'approved'
                  );
                }}
              >
                {disp.status === 'approved' ? 'Deactivate' : 'Activate'}
              </button>
            )}
            onRowClick={handleViewDispensary}
          />
        </>
      )}

      {activeTab === 'deals' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-orange-700 tracking-tight">
              Deals
            </h2>
            {/* <button
              onClick={() => setShowDealForm(true)}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-orange-400"
              type="button"
            >
              Add Deal
            </button> */}
          </div>
          <DealsList deals={deals} setDeals={setDeals} onEdit={handleEditDeal} />
        </>
      )}

      {activeTab === 'applications' && (
        <>
          <h2 className="text-3xl font-extrabold text-orange-700 mb-6">Applications</h2>
          <AdminTable
            data={applications}
            columns={[
              {
                key: 'fullName',
                label: 'Full Name',
                render: (app: Application) => `${app?.firstName || ''} ${app?.lastName || ''}`.trim(),
              },
              { key: 'email', label: 'Email' },
              {
                key: 'status',
                label: 'Status',
                render: (app: Application) => (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : app.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {app.status.toUpperCase()}
                  </span>
                ),
              },
              { key: 'dispensaryName', label: 'Dispensary' },
            ]}
            actions={(app) => (
              <button
                className={`px-3 py-1 rounded cursor-pointer ${
                  app.status === 'approved'
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (app.status === 'approved') {
                    handleRejectApplication(app._id);
                  } else {
                    handleApproveApplication(app._id);
                  }
                }}
              >
                {app.status === 'approved' ? 'Reject' : 'Approve'}
              </button>
            )}
            onRowClick={handleViewApplication}
          />
        </>
      )}

      {/* {showDealForm && (
        <Modal isOpen={true} onClose={handleCancelForm}>
          <DealForm
            initialData={selectedDeal}
            onSave={handleSaveDeal}
            onCancel={handleCancelForm}
            dispensaryOptions={dispensaries}
          />
        </Modal>
      )} */}
      {selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          isOpen={!!selectedApplication}
          onClose={handleCloseApplicationModal}
          onApprove={handleApproveApplication}
          onReject={handleRejectApplication}
        />
      )}

      {selectedDispensary && (
        <DispensaryModal
          dispensary={selectedDispensary}
          isOpen={!!selectedDispensary}
          onClose={handleCloseDispensaryModal}
          onUpdateSubscription={handleUpdateSubscription}
        />
      )}
    </DashboardLayout>
  );
}

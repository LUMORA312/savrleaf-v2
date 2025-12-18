'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout, { TabKey } from '../../components/dashboard/DashboardLayout';
import DealsList from './components/DealsList';
import UserInfo from './components/UserInfo';
import DispensaryInfo from './components/DispensaryInfo';
import MapView from '@/components/MapView';
import axios from 'axios';
import Modal from '@/components/Modal';
import Alert from '@/components/Alert';
import DealForm from '@/components/DealForm';
import DispensaryForm from '@/components/DispensaryForm';
import { Deal, Dispensary, SubscriptionTier, User } from '@/types';
import ActivationPage from '../activate/page';
import type { AlertType } from '@/components/Alert';
import { purchaseSubscription } from '@/utils/subscription';

interface OverviewData {
  totalDeals: number;
  totalDispensaries: number;
  activeDeals: number;
  isUserActive: boolean;
}

function PartnerDashboardContent() {
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
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<AlertType>('warning');
  const [showAlert, setShowAlert] = useState(false);
  const [showAddDispensaryModal, setShowAddDispensaryModal] = useState(false);
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const addedSkuLimit = searchParams.get('added_sku_limit');
  const dispensaryId = searchParams.get('dispensaryId');

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
        if (res.data.user.firstLogin) {
          setActiveTab('planSelection');
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/${authUser?.email}/first-login`, {}, { headers: { Authorization: `Bearer ${token}` } });
        }
        setOverview(res.data.overview);
        setDispensaries(res.data.dispensaries);
        setDeals(res.data.deals);
      } catch (err) {
        // console.error('Dashboard fetch error:', err);
        // setFetchError('Failed to load dashboard data');
      } finally {
        setFetching(false);
      }
    };

    fetchDashboard();
  }, [loading, isAuthenticated, authUser, router]);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab as TabKey);
    }
  }, [tab]);

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
    setSelectedDeal(null);
    setShowDealForm(false);
  };

  const handleCancelForm = () => {
    setSelectedDeal(null);
    setShowDealForm(false);
  };
  const handleSelectTier = async (tierId: string) => {
    setShowConfirmModal(true);
    setSelectedTier(tiers.find((tier) => tier._id === tierId) || null);
  }
  const handleCancelSelectTier = () => {
    setShowConfirmModal(false);
    setSelectedTier(null);
  }
  const handleConfirmSelectTier = async () => {
    setShowConfirmModal(false);
    if (!selectedTier) return;
    try {
      const token = localStorage.getItem('token');
      if (!user || !token) return;
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`, { user: user.id, tier: selectedTier._id, status: 'pending', startDate: new Date(), metadata: { source: 'plan_selection' } }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 201) {
        const checkoutResp = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/create-subscription-session`,
          { subscriptionId: res.data._id }
        );
        const { url } = checkoutResp.data;
        if (url) {
          window.location.href = url;
        } else {
          setFetchError('Failed to create Stripe Checkout session.');
        }
      } else {
        setFetchError(res.data.error);
      }
    } catch (error) {
      console.error('Error selecting tier', error);
    }
  }
  const handleAddDispensary = async (newDispensary: Dispensary) => {
    try {
      const token = localStorage.getItem('token');
      if (!user || !token) return;
      
      // The form already created the dispensary, so we just need to:
      // 1. Refresh dashboard data to get the latest state
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/partner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDispensaries(res.data.dispensaries);
      setOverview(res.data.overview);
      setShowAddDispensaryModal(false);
      
      // 2. Handle subscription if needed (check if subscription exists)
      // The subscription ID should be in the dispensary object or we need to fetch it
      // For now, let's check if we need to redirect to payment
      // The backend creates a pending subscription, so we should redirect to payment
      if (newDispensary.subscription) {
        const subscriptionId = typeof newDispensary.subscription === 'string' 
          ? newDispensary.subscription 
          : newDispensary.subscription._id;
        if (subscriptionId) {
          await purchaseSubscription(subscriptionId);
        }
      }
    } catch (error) {
      console.error('Error adding dispensary', error);
      setFetchError('Failed to add dispensary');
    }
  }
  
  const handleCancelDispensary = () => {
    setShowAddDispensaryModal(false);
  }

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
              onClick={async () => {
                // const token = localStorage.getItem('token');
                // if (!user || !token) return;
                // const subscriptionStatus = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/subscription-status`, { headers: { Authorization: `Bearer ${token}` } });
                // if (subscriptionStatus.data.status !== 'active') {
                //   setActiveTab('planSelection');
                //   return;
                // }
                // if (subscriptionStatus.data.skuCount <= 0) {
                //   setAlertMessage('You have no SKUs left. Please upgrade your plan.');
                //   setAlertType('warning');
                //   setShowAlert(true);
                //   return;
                // }

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
          <DealsList deals={deals} setDeals={setDeals} onEdit={handleEditDeal} dispensaries={dispensaries} />
        </>
      )}

      {activeTab === 'dispensary' &&
        <div>
          <button name="add dispensary" disabled={!user?.allowMultipleLocations} onClick={() => {if(dispensaries.length < 1) {
            setAlertMessage('You must complete your profile first with inputing main dispensary information.');
            setAlertType('warning');
            setShowAlert(true);
            return;
          }
            setShowAddDispensaryModal(true);
          }} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-orange-400">Add Dispensary</button>
          <DispensaryInfo 
            dispensaries={dispensaries} 
            onDispensaryUpdate={async () => {
              try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/partner/dashboard`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setDispensaries(res.data.dispensaries);
                setOverview(res.data.overview);
              } catch (err) {
                console.error('Error refreshing dispensaries:', err);
              }
            }}
          />

        </div>
      }

      {activeTab === 'mapView' && (
        <div>
          <h2 className="mb-6 text-3xl font-extrabold text-orange-700 tracking-tight">
            Map View
          </h2>
          {dispensaries && dispensaries.length > 0 ? (
            <MapView dispensaries={dispensaries} />
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500">No dispensaries found to display on the map.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'user' && user && (
        <UserInfo user={user} dispensaries={dispensaries} />
      )}

      {activeTab === 'planSelection' && (
        <div className="flex flex-col items-center mb-2">
          <h2 className="text-xl font-semibold text-orange-700 mb-4">Choose Your Plan</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {tiers.map((tier) => (
              <div
                key={tier._id}
                onClick={() => handleSelectTier(tier._id)}
                className={`w-full sm:w-64 border rounded-lg p-4 shadow-sm cursor-pointer border-orange-200 bg-white hover:border-orange-600 transition-all duration-300`}
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
      {showConfirmModal && (
        <Modal isOpen={true} onClose={handleCancelSelectTier}>
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold text-orange-700 mb-4">Confirm Selection</h2>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to select this tier? This will cancel your current subscription and start a new one.</p>
            <div className="flex gap-4">
              <button onClick={handleConfirmSelectTier} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition focus:outline-none focus:ring-2 focus:ring-orange-400">Confirm</button>
              <button onClick={handleCancelSelectTier} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {/* Add Dispensary Modal */}
      {showAddDispensaryModal && (
        <Modal isOpen={true} onClose={handleCancelDispensary} maxWidth="4xl">
          <DispensaryForm
            initialData={null}
            onSave={handleAddDispensary}
            onCancel={handleCancelDispensary}
          />
        </Modal>
      )}
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
        type={alertType}
      />
    </DashboardLayout>
  );
}

export default function PartnerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    }>
      <PartnerDashboardContent />
    </Suspense>
  );
}

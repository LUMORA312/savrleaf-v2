'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAgeGate } from '@/context/AgeGateContext';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import AgeGateOverlay from '@/components/AgeGate';
import MaintenanceModePage from '@/components/MaintenanceModePage';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PublicHomepage from '@/components/PublicHomepage';
import MarketTicker from '@/components/MarketTicker';
import { TickerData } from '@/types';

export default function Home() {
  const { is21 } = useAgeGate();
  const { maintenanceMode, loading: maintenanceLoading } = useMaintenanceMode();
  const { user } = useAuth();
  const pathname = usePathname();

  // Ticker data — fetched here and passed to both MarketTicker and PublicHomepage
  const [ticker, setTicker] = useState<TickerData | null>(null);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/deals/savings-ticker`);
        if (res.data?.success) {
          setTicker({
            totalSavings: res.data.totalSavings ?? 0,
            avgDiscount: res.data.avgDiscount ?? 0,
            activeDeals: res.data.activeDeals ?? 0,
            maxDiscount: res.data.maxDiscount ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch savings ticker:', err);
        setTicker(null);
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if user is on admin route
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAdmin = user?.role === 'admin';

  // Show maintenance page if:
  // 1. Maintenance mode is ON
  // 2. User is not an admin
  // 3. User is not on admin route
  // 4. Not loading
  const showMaintenance = 
    !maintenanceLoading &&
    maintenanceMode?.maintenance === true &&
    !isAdmin &&
    !isAdminRoute;

  if (showMaintenance) {
    return <MaintenanceModePage message={maintenanceMode?.message} />;
  }

  return (
    <>
      {is21 === null && <AgeGateOverlay />}
      {is21 === false && <AgeGateOverlay />}
      {is21 === true && (
        <>
          <MarketTicker ticker={ticker} />
          <Header />
          <main className="w-full max-w-full">
            <PublicHomepage ticker={ticker} />
          </main>
          <Footer />
        </>
      )}
    </>
  );
}

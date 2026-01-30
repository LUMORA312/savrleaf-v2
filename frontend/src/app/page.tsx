'use client';

import { useAgeGate } from '@/context/AgeGateContext';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import AgeGateOverlay from '@/components/AgeGate';
import MaintenanceModePage from '@/components/MaintenanceModePage';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PublicHomepage from '@/components/PublicHomepage';

export default function Home() {
  const { is21 } = useAgeGate();
  const { maintenanceMode, loading: maintenanceLoading } = useMaintenanceMode();
  const { user } = useAuth();
  const pathname = usePathname();

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
          <Header />
          <main className="w-full max-w-full">
            <PublicHomepage />
          </main>
          <Footer />
        </>
      )}
    </>
  );
}

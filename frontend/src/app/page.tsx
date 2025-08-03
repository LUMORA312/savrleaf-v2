'use client';

import { useAgeGate } from '@/context/AgeGateContext';
import AgeGateOverlay from '@/components/AgeGate';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PublicHomepage from '@/components/PublicHomepage';
import { AuthProvider } from '@/context/AuthContext';

export default function Home() {
  const { is21 } = useAgeGate();

  return (
    <AuthProvider>
      {is21 === null && <AgeGateOverlay />}
      {is21 === false && <AgeGateOverlay />}
      {is21 === true && (
        <>
          <Header />
          <main>
            <PublicHomepage />
          </main>
          <Footer />
        </>
      )}
    </AuthProvider>
  );
}

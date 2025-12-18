'use client';

import { useAgeGate } from '@/context/AgeGateContext';
import AgeGateOverlay from '@/components/AgeGate';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PublicHomepage from '@/components/PublicHomepage';

export default function Home() {
  const { is21 } = useAgeGate();

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

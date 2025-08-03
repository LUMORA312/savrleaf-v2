'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Deal, Dispensary } from '@/types';
import HeroSection from './HeroSection';
import DealsDispensariesTabs from './DealsDispensariesTabs';

export default function PublicHomepage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
  };

  const handleSearch = () => {
    console.log(`Searching for: ${searchTerm}, zip: ${zipCode}`);
    // Implement filtering logic later or API call with query params
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation(pos.coords),
        (err) => setLocationError(err.message)
      );
    } else {
      setLocationError('Geolocation not supported');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dealsRes, dispensariesRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/deals`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dispensaries`),
        ]);
        setDeals(dealsRes.data.deals);
        setDispensaries(dispensariesRes.data.dispensaries);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <HeroSection
        userLocation={userLocation}
        locationError={locationError}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        zipCode={zipCode}
        handleZipCodeChange={handleZipCodeChange}
        handleSearch={handleSearch}
      />

      <DealsDispensariesTabs
        deals={deals}
        dispensaries={dispensaries}
        loading={loading}
      />
    </div>
  );
}

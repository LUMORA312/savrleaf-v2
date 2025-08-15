'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Deal, Dispensary } from '@/types';
import HeroSection from './HeroSection';
import DealsDispensariesTabs from './DealsDispensariesTabs';
import Filters, { FilterValues } from '@/components/Filters';
import { calculateDistanceInMiles, getCoordinatesForZip } from '@/utils/distance';

export default function PublicHomepage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterValues>({
    accessType: '',
    radius: '25',
    sortBy: '',
    amenities: [],
    searchTerm: '',
    zipCode: '',
  });
  const [activeTab, setActiveTab] = useState<'deal' | 'dispensary'>('deal');
  const [zipCode, setZipCode] = useState('');
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [zipCoordinates, setZipCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  // Geolocation
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
    if (filters.zipCode && filters.zipCode.length === 5) {
      getCoordinatesForZip(filters.zipCode).then(coords => {
        if (coords) {
          setZipCoordinates(coords);
        } else {
          setZipCoordinates(null);
        }
      });
    } else {
      setZipCoordinates(null);
    }
  }, [filters.zipCode]);

  // Fetch deals + dispensaries
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dealsRes, dispensariesRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/deals`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dispensaries`),
        ]);

        setDeals(dealsRes.data?.deals || []);
        setDispensaries(dispensariesRes.data?.dispensaries || []);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Determine location
  const currentLocation = useMemo(() => {
    return zipCoordinates || userLocation;
  }, [zipCoordinates, userLocation]);

  // ======== Filter Deals ========
  const filteredDeals = useMemo(() => {
    let result = [...deals];

    if (filters.accessType) {
      result = result.filter(d => d.accessType === filters.accessType);
    }

    // THC filter
    if (filters.thcMin !== undefined) {
      result = result.filter(d => d.thcContent !== undefined && d.thcContent >= filters.thcMin!);
    }
    if (filters.thcMax !== undefined) {
      result = result.filter(d => d.thcContent !== undefined && d.thcContent <= filters.thcMax!);
    }

    // CBD filter
    if (filters.cbdMin !== undefined) {
      result = result.filter(d => d.cbdContent !== undefined && d.cbdContent >= filters.cbdMin!);
    }
    if (filters.cbdMax !== undefined) {
      result = result.filter(d => d.cbdContent !== undefined && d.cbdContent <= filters.cbdMax!);
    }

    // Strain filter
    if (filters.strain) {
      const term = filters.strain.toLowerCase();
      result = result.filter(d => d.strain?.toLowerCase().includes(term));
    }

    // Category filter
    if (filters.category) {
      result = result.filter(d => d.category === filters.category);
    }

    if (filters.searchTerm && filters.searchTerm.length > 0) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(term) ||
        (d.brand?.toLowerCase().includes(term)) ||
        d.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (currentLocation) {
      result = result.filter(d => {
        const dispensary = d.dispensary;
        if (!dispensary?.coordinates) return false;
        const [longitude, latitude] = dispensary.coordinates.coordinates;
        const distance = calculateDistanceInMiles(
          currentLocation.latitude,
          currentLocation.longitude,
          latitude,
          longitude
        );
        return distance <= Number(filters.radius);
      });
    }

    if (filters.sortBy === 'priceAsc') {
      result.sort((a, b) => a.salePrice - b.salePrice);
    } else if (filters.sortBy === 'priceDesc') {
      result.sort((a, b) => b.salePrice - a.salePrice);
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => {
        const dateA = new Date(a.startDate || 0).getTime();
        const dateB = new Date(b.startDate || 0).getTime();
        return dateB - dateA;
      });
    }

    return result;
  }, [deals, filters, currentLocation]);

  // ======== Filter Dispensaries ========
  const filteredDispensaries = useMemo(() => {
    let result = [...dispensaries];

    if (filters.amenities.length > 0) {
      result = result.filter(d => filters.amenities.every(a => d.amenities.includes(a)));
    }

    if (filters.searchTerm && filters.searchTerm.length > 0) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(term) ||
        d.legalName.toLowerCase().includes(term)
      );
    }

    if (currentLocation) {
      result = result.filter(d => {
        if (!d.coordinates) return false;
        const [longitude, latitude] = d.coordinates.coordinates;
        const distance = calculateDistanceInMiles(
          currentLocation.latitude,
          currentLocation.longitude,
          latitude,
          longitude
        );
        return distance <= Number(filters.radius);
      });
    }

    if (filters.sortBy === 'ratingDesc') {
      result.sort((a, b) => {
        const aRating = a.ratings.length ? a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length : 0;
        const bRating = b.ratings.length ? b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length : 0;
        return bRating - aRating;
      });
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [dispensaries, filters, currentLocation]);

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      searchTerm: searchTerm.trim(),
      zipCode: zipCode.trim(),
    }));
  };

  return (
    <div>
      <HeroSection
        userLocation={userLocation}
        locationError={locationError}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        zipCode={zipCode}
        handleZipCodeChange={(e) => setZipCode(e.target.value)}
        handleSearch={handleSearch}
      />

      <Filters
        filterValues={filters}
        onFilterChange={setFilters}
        forType={activeTab}
        dispensaryAmenities={['Parking', 'Delivery', 'Wheelchair Accessible']}
      />

      <DealsDispensariesTabs
        deals={filteredDeals}
        dispensaries={filteredDispensaries}
        loading={loading}
        activeTab={activeTab === 'deal' ? 'deals' : 'dispensaries'}
        setActiveTab={(tab) => setActiveTab(tab === 'deals' ? 'deal' : 'dispensary')}
      />
    </div>
  );
}

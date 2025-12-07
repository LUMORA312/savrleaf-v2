'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Deal, Dispensary } from '@/types';
import HeroSection from './HeroSection';
import DealsDispensariesTabs from './DealsDispensariesTabs';
import Filters, { FilterValues } from '@/components/Filters';
import DealsMapView from './DealsMapView';
import { calculateDistanceInMiles, getCoordinatesForZip } from '@/utils/distance';
import { amenitiesOptions } from '@/constants/amenities';

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
    title: '',
    brand: '',
    strain: '',
    category: '',
  });
  const [activeTab, setActiveTab] = useState<'deal' | 'dispensary'>('deal');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
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
  
  // Determine location
  const currentLocation = useMemo(() => {
    return zipCoordinates || userLocation;
  }, [zipCoordinates, userLocation]);
  // Fetch deals with filters
  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = {};

        // Add filter parameters
        if (filters.accessType) params.accessType = filters.accessType;
        if (filters.category) params.category = filters.category;
        if (filters.brand) params.brand = filters.brand;
        if (filters.title) params.title = filters.title;
        if (filters.strain) params.strain = filters.strain;
        if (filters.thcMin !== undefined) params.thcMin = filters.thcMin;
        if (filters.thcMax !== undefined) params.thcMax = filters.thcMax;
        if (filters.searchTerm) params.search = filters.searchTerm;

        // Add location-based filtering only when location is available
        if (currentLocation && filters.radius) {
          const radius = Number(filters.radius);
          if (radius > 0) {
            params.lat = currentLocation.latitude;
            params.lng = currentLocation.longitude;
            params.distance = radius;
          }
        }

        // Add sorting
        if (filters.sortBy === 'priceAsc') {
          params.sortBy = 'price_asc';
        } else if (filters.sortBy === 'priceDesc') {
          params.sortBy = 'price_desc';
        } else if (filters.sortBy === 'newest') {
          params.sortBy = 'newest';
        } else if (currentLocation && filters.radius && Number(filters.radius) > 0) {
          params.sortBy = 'distance';
        }

        const dealsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/deals`, { params });
        setDeals(dealsRes.data?.deals || []);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch deals');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [filters, currentLocation]);

  // Fetch dispensaries (unchanged)
  useEffect(() => {
    const fetchDispensaries = async () => {
      try {
        const dispensariesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dispensaries`);
        setDispensaries(dispensariesRes.data?.dispensaries || []);
      } catch (err: unknown) {
        console.error('Failed to fetch dispensaries:', err);
      }
    };

    fetchDispensaries();
  }, []);


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
    console.log('searchTerm', searchTerm);
    console.log('zipCode', zipCode);
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
        dispensaryAmenities={amenitiesOptions}
      />

      {/* View Toggle - Only show for deals tab */}
      {activeTab === 'deal' && (
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {loading ? 'Loading...' : `${deals.length} ${deals.length === 1 ? 'Deal' : 'Deals'} Found`}
            </h2>
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'map'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Map View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map View or List View */}
      {activeTab === 'deal' && viewMode === 'map' ? (
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="w-full h-[calc(100vh-300px)] min-h-[500px] rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-500">Loading deals...</div>
            </div>
          ) : (
            <DealsMapView 
              deals={deals} 
              userLocation={currentLocation}
              radius={currentLocation && filters.radius ? Number(filters.radius) : undefined}
            />
          )}
        </div>
      ) : (
        <DealsDispensariesTabs
          deals={deals}
          dispensaries={filteredDispensaries}
          loading={loading}
          activeTab={activeTab === 'deal' ? 'deals' : 'dispensaries'}
          setActiveTab={(tab) => {
            setActiveTab(tab === 'deals' ? 'deal' : 'dispensary');
            // Reset to list view when switching to dispensaries
            if (tab === 'dispensaries') {
              setViewMode('list');
            }
          }}
        />
      )}
    </div>
  );
}

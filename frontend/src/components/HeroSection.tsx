'use client';

import React from 'react';
import Image from 'next/image';
import LocationStatus from './LocationStatus';
import SearchBar from './SearchBar';
import logo from '../assets/logo.png';

interface HeroSectionProps {
  userLocation: GeolocationPosition | GeolocationCoordinates | null;
  locationError: string | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  zipCode: string;
  handleZipCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: () => void;
}

export default function HeroSection({
  userLocation,
  locationError,
  searchTerm,
  setSearchTerm,
  zipCode,
  handleZipCodeChange,
  handleSearch,
}: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-orange-200 via-orange-100 to-orange-200 text-gray-900 pt-20 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
        <div className="flex justify-center mb-2">
          <Image src={logo} alt="SavrLeaf Logo" width={80} height={80} className="w-20 h-20 object-contain" />
        </div>
        <span className="text-3xl font-semibold text-gray-900 tracking-tight">
          SavrLeaf<sup className="text-xs align-super">™</sup>
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-4 mb-10 leading-snug text-gray-900">
          <span className="block">The First Cannabis Platform</span>
          <span className="block mt-1 text-gray-700 font-light mb-5">for Discounted and Sale Items Only</span>
          <span className="block mt-1 text-gray-700 font-light">No accounts, No logins, Just deals.</span>
          <span className="block mt-1 text-gray-700 font-light font-semibold">Use filters to narrow deals - or browse all discounts near you.</span>
        </h2>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          zipCode={zipCode}
          handleZipCodeChange={handleZipCodeChange}
          handleSearch={handleSearch}
        />

        <LocationStatus
          userLocation={userLocation}
          locationError={locationError}
          className="mt-6"
        />
      </div>
    </section>
  );
}

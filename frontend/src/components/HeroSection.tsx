'use client';

import React from 'react';
import LocationStatus from './LocationStatus';
import SearchBar from './SearchBar';
import logo from '../assets/logo.png';

interface HeroSectionProps {
  userLocation: any;
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
          <img src={logo.src} alt="SavrLeaf Logo" className="w-20 h-20 object-contain" />
        </div>
        <span className="text-3xl font-semibold text-gray-900 tracking-tight">
          SavrLeaf<sup className="text-xs align-super">™</sup>
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-4 mb-10 leading-snug text-gray-900 max-w-lg mx-auto">
          <span className="block">The First Cannabis Platform</span>
          <span className="block mt-1 text-gray-700 font-light">for Discounted and Sale Items Only</span>
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

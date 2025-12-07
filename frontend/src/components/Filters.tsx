'use client';

import { useState, useEffect } from 'react';

interface FiltersProps {
  filterValues: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  dealTags?: string[];
  dispensaryAmenities?: string[];
  forType: 'deal' | 'dispensary';
}

export interface FilterValues {
  accessType: 'both' | 'medical' | 'recreational' | '';
  radius: string;
  sortBy: 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'newest' | '';
  amenities: string[];
  searchTerm?: string;
  zipCode?: string;
  thcMin?: number;
  thcMax?: number;
  cbdMin?: number;
  cbdMax?: number;
  strain?: string;
  category?: string;
  title?: string;
  brand?: string;
}

export default function Filters({
  filterValues,
  onFilterChange,
  dealTags = [],
  dispensaryAmenities = [],
  forType,
}: FiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterValues>(filterValues);

  useEffect(() => {
    setLocalFilters(filterValues);
  }, [filterValues]);

  const handleChange = <K extends keyof FilterValues>(field: K, value: FilterValues[K]) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-6 bg-white rounded-lg shadow-md my-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Access Type */}
        {forType === 'deal' && (
          <div>
            <label htmlFor="accessType" className="block text-sm font-semibold mb-1">Access Type</label>
            <select
              id="accessType"
              value={localFilters.accessType}
              onChange={(e) => handleChange('accessType', e.target.value as FilterValues['accessType'])}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">All</option>
              <option value="both">Both</option>
              <option value="medical">Medical</option>
              <option value="recreational">Recreational</option>
            </select>
          </div>
        )}

        {/* THC % */}
        {forType === 'deal' && (
          <div>
            <label className="block text-sm font-semibold mb-1">THC %</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.thcMin ?? ''}
                onChange={(e) => handleChange('thcMin', e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={localFilters.thcMax ?? ''}
                onChange={(e) => handleChange('thcMax', e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* CBD %
        {forType === 'deal' && (
          <div>
            <label className="block text-sm font-semibold mb-1">CBD %</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.cbdMin ?? ''}
                onChange={(e) => handleChange('cbdMin', e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={localFilters.cbdMax ?? ''}
                onChange={(e) => handleChange('cbdMax', e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        )} */}

        {/* Strain  ["indica", "indica-dominant hybrid", "hybrid", "sativa-dominant hybrid", "sativa"] */}
        {forType === 'deal' && (
          <div>
            <label className="block text-sm font-semibold mb-1">Strain</label>
            <select 
              value={localFilters.strain ?? ''}
              onChange={(e) => handleChange('strain', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="indica">Indica</option>
              <option value="indica-dominant hybrid">Indica-dominant hybrid</option>
              <option value="hybrid">Hybrid</option>
              <option value="sativa-dominant hybrid">Sativa-dominant hybrid</option>
              <option value="sativa">Sativa</option>
            </select>
          </div>
        )}

        {/* Category ['flower', 'edibles', 'concentrates', 'vapes', 'topicals', 'other', 'pre-roll', 'tincture', 'beverage', 'capsule/pill']*/}
        {forType === 'deal' && (
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              value={localFilters.category ?? ''}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="flower">Flower</option>
              <option value="edibles">Edibles</option>
              <option value="concentrates">Concentrates</option>
              <option value="vapes">Vapes</option>
              <option value="topicals">Topicals</option>
              <option value="other">Other</option>
              <option value="pre-roll">Pre-roll</option>
              <option value="tincture">Tincture</option>
              <option value="beverage">Beverage</option>
              <option value="capsule/pill">Capsule/Pill</option>
            </select>
          </div>
        )}

        {/* Title */}
        {forType === 'deal' && (
          <div>
            <label className="block text-sm font-semibold mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter title"
              value={localFilters.title ?? ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* Brand */}
        {forType === 'deal' && (
          <div>
            <label className="block text-sm font-semibold mb-1">Brand</label>
            <input
              type="text"
              placeholder="Enter brand"
              value={localFilters.brand ?? ''}
              onChange={(e) => handleChange('brand', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* Radius */}
        <div>
          <label htmlFor="radius" className="block text-sm font-semibold mb-1">Radius (miles)</label>
          <input
            type="number"
            id="radius"
            min="1"
            step="1"
            placeholder="Enter radius"
            value={localFilters.radius}
            onChange={(e) => handleChange('radius', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Amenities */}
        {forType === 'dispensary' && (
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {dispensaryAmenities.map((amenity) => {
                const selected = localFilters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => {
                      const newAmenities = selected
                        ? localFilters.amenities.filter(a => a !== amenity)
                        : [...localFilters.amenities, amenity];
                      handleChange('amenities', newAmenities);
                    }}
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition ${
                      selected
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-green-100 hover:border-green-400'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sort By */}
        <div>
          <label htmlFor="sortBy" className="block text-sm font-semibold mb-1">Sort By</label>
          <select
            id="sortBy"
            value={localFilters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value as FilterValues['sortBy'])}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Default</option>
            {forType === 'deal' && (
              <>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </>
            )}
            {forType === 'dispensary' && (
              <>
                <option value="ratingDesc">Rating: High to Low</option>
              </>
            )}
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>
    </section>
  );
}

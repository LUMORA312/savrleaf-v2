'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Deal } from '@/types';
import defaultDealImg from '../assets/deal.jpg';
import { calculateDistanceInMiles } from '@/utils/distance';
import { getCategoryImage } from '@/utils/categoryImages';

interface DealCardProps {
  deal: Deal;
  userLocation?: { lat: number; lng: number };
}

export default function DealCard({ deal, userLocation }: DealCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use deal images if available, otherwise use category fallback, finally default image
  const categoryImage = getCategoryImage(deal.category, deal.images);
  const imageSrc = categoryImage.startsWith('/') 
    ? categoryImage 
    : (categoryImage || defaultDealImg.src);

  // Get dispensary name
  const dispensaryName = typeof deal.dispensary === 'object' && deal.dispensary !== null
    ? deal.dispensary.name
    : 'Unknown Dispensary';

  // Calculate distance if user location and dispensary coordinates are available
  let distance: number | null = null;
  if (userLocation && typeof deal.dispensary === 'object' && deal.dispensary?.coordinates) {
    const [lng, lat] = deal.dispensary.coordinates.coordinates;
    distance = calculateDistanceInMiles(userLocation.lat, userLocation.lng, lat, lng);
  }

  // Track deal click event for analytics (ADMIN ONLY - not partner facing)
  const trackDealClick = async () => {
    try {
      const dealId = typeof deal._id === 'string' ? deal._id : deal._id;
      if (!dealId) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId,
          distance: distance || null,
        }),
      });
    } catch (error) {
      // Silently fail - analytics tracking should not break the user experience
      console.error('Failed to track deal click:', error);
    }
  };

  return (
    <>
      {/* Card */}
      <div
        onClick={() => {
          setIsOpen(true);
          trackDealClick();
        }}
        className="cursor-pointer bg-gray-50 shadow-lg rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[320px] w-full flex flex-col justify-between"
      >
        <div>
          <div className="h-40 w-full rounded-xl overflow-hidden mb-3">
            <Image
              src={imageSrc}
              alt={deal.title}
              width={400}
              height={160}
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* Dispensary Name */}
          <div className="mb-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{dispensaryName}</p>
          </div>

          {/* Product Name */}
          <h3 className="text-lg font-bold mb-2 line-clamp-1">{deal.title}</h3>
          
          {/* Strain and THC Level */}
          <div className="flex items-center gap-3 mb-2 flex-wrap justify-between">
            {deal.strain && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                {deal.strain.replace(/-/g, ' ')}
              </span>
            )}
            {deal.thcContent !== undefined && (
              <span className="text-xs text-gray-600 font-medium">
                THC: {deal.thcContent}%
              </span>
            )}
          </div>

          {/* Description */}
          {deal.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{deal.description}</p>
          )}

          {/* Price and Distance */}
          <div className="mt-auto flex justify-between items-center text-sm">
            <div>
              <span className="line-through text-gray-400">${deal.originalPrice?.toFixed(2)}</span>{' '}
              <span className="text-green-600 font-semibold">${deal.salePrice?.toFixed(2)}</span>
            </div>
            {distance !== null && (
              <div className="text-xs text-gray-500 font-medium">
                {distance.toFixed(1)} mi
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              &times;
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 w-full md:w-1/2 h-64 md:h-auto rounded-xl overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={deal.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {/* Dispensary Name */}
                <div className="mb-1">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{dispensaryName}</p>
                </div>
                
                {/* Product Name */}
                <h2 className="text-2xl font-bold">{deal.title}</h2>
                
                {/* Brand */}
                {deal.brand && <p className="text-gray-600"><strong>Brand:</strong> {deal.brand}</p>}
                
                {/* Description */}
                {deal.description && <p className="text-gray-600">{deal.description}</p>}
                
                {/* Category */}
                <p className="text-gray-600">
                  <strong>Category:</strong> {deal.category} {deal.subcategory && `/ ${deal.subcategory}`}
                </p>
                
                {/* Strain */}
                {deal.strain && (
                  <p className="text-gray-600">
                    <strong>Strain:</strong> <span className="capitalize">{deal.strain.replace(/-/g, ' ')}</span>
                  </p>
                )}
                
                {/* THC and CBD Content */}
                <div className="flex gap-4">
                  {deal.thcContent !== undefined && (
                    <p className="text-gray-600"><strong>THC:</strong> {deal.thcContent}%</p>
                  )}
                  {deal.cbdContent !== undefined && (
                    <p className="text-gray-600"><strong>CBD:</strong> {deal.cbdContent}%</p>
                  )}
                </div>
                
                {/* Distance */}
                {distance !== null && (
                  <p className="text-gray-600"><strong>Distance:</strong> {distance.toFixed(1)} miles</p>
                )}
                
                {/* Price and Access Type */}
                <div className="mt-auto flex flex-col gap-3 pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="line-through text-gray-400">${deal.originalPrice?.toFixed(2)}</span>{' '}
                    <span className="text-green-600 font-semibold text-lg">${deal.salePrice?.toFixed(2)}</span>
                  </div>
                  {/* Redirect to deal purchase link or dispensary website */}
                  {deal.deal_purchase_link ? (
                    <a
                      href={deal.deal_purchase_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 text-center font-semibold rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition"
                    >
                      Get Deal — Visit {dispensaryName}
                    </a>
                  ) : typeof deal.dispensary === 'object' && deal.dispensary?.websiteUrl ? (
                    <a
                      href={deal.dispensary.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 text-center font-semibold rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition"
                    >
                      Get Deal — Visit {dispensaryName}
                    </a>
                  ) : (
                    <span
                      className="block w-full py-3 px-4 text-center font-semibold rounded-xl bg-orange-600 text-white cursor-default"
                    >
                      Get Deal
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

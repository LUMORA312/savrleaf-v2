'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dispensary } from '@/types';
import defaultDispensaryImg from '../assets/dispensary.jpg';

export default function DispensaryCard({ dispensary }: { dispensary: Dispensary }) {
  const [isOpen, setIsOpen] = useState(false);
  const imageSrc = dispensary.images?.[0] || defaultDispensaryImg.src;

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer bg-gray-50 shadow-lg rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[280px] w-full flex flex-col justify-between"
      >
        <div>
          {/* Logo and name */}
          <div className="flex items-center mb-4 gap-3">
            {dispensary.logo ? (
              <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={dispensary.logo}
                  alt={`${dispensary.name} logo`}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-semibold flex-shrink-0">
                No Logo
              </div>
            )}
            <h3 className="text-lg font-bold">{dispensary.name}</h3>
          </div>

          {/* Large image */}
          <div className="h-40 w-full rounded-xl overflow-hidden mb-4">
            <Image
              src={imageSrc}
              alt={dispensary.name}
              width={400}
              height={160}
              className="h-full w-full object-cover"
            />
          </div>

          <p className="text-sm text-gray-600">
            {dispensary.address.city}, {dispensary.address.state}
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {dispensary.description || 'No description available.'}
          </p>
        </div>

        <div className="text-xs text-gray-400 mt-4">
          License: {dispensary.licenseNumber}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
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
                  alt={dispensary.name}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h2 className="text-2xl font-bold">{dispensary.name}</h2>
                {dispensary.legalName && <p className="text-gray-600">Legal Name: {dispensary.legalName}</p>}
                <p className="text-gray-600">
                  Address: {dispensary.address.street1} {dispensary.address.street2 && `, ${dispensary.address.street2}`}, {dispensary.address.city}, {dispensary.address.state} {dispensary.address.zipCode}
                </p>
                {dispensary.phoneNumber && <p className="text-gray-600">Phone: {dispensary.phoneNumber}</p>}
                {dispensary.websiteUrl && <p className="text-gray-600">Website: <a href={dispensary.websiteUrl} target="_blank" className="text-orange-600 underline">{dispensary.websiteUrl}</a></p>}
                <p className="text-gray-600">{dispensary.description || 'No description available.'}</p>
                {dispensary.amenities.length > 0 && (
                  <p className="text-gray-600">Amenities: {dispensary.amenities.join(', ')}</p>
                )}
                <div className="mt-auto text-xs text-gray-400">
                  License: {dispensary.licenseNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

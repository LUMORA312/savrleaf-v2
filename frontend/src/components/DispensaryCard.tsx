'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dispensary } from '@/types';
import defaultDispensaryImg from '../assets/dispensary.jpg';

export default function DispensaryCard({ dispensary }: { dispensary: Dispensary }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  // const imageSrc = dispensary.images?.[0] || defaultDispensaryImg.src;
  const imageSrc = defaultDispensaryImg.src;

  const handleCardClick = () => {
    setIsOpen(true);
  };

  const handleViewDeals = () => {
    router.push(`/dispensary/${dispensary._id}`);
  };

  return (
    <>
      {/* Card */}
      <div
        className="cursor-pointer bg-gray-50 shadow-lg rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[280px] w-full flex flex-col justify-between"
      >
        <div onClick={handleCardClick}>
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold">{dispensary.name}</h3>
                {(dispensary as { isGeneric?: boolean }).isGeneric && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded">Generic</span>
                )}
              </div>
            </div>
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
          License: {dispensary.licenseNumber || 'N/A'}
        </div>
        <br/>
        <div className="flex justify-center space-x-4 mb-2">
          <button
            className="px-6 py-2 rounded-full text-sm font-semibold transition cursor-pointer bg-orange-600 text-white shadow-md"
            onClick={() => {
              if (dispensary.type) {
                handleViewDeals();
              } else {
                window.open(`https://www.google.com/maps/@${Number(dispensary.coordinates.coordinates[1])},${Number(dispensary.coordinates.coordinates[0])},15z`, '_blank');
              }
            }}
          >
            {dispensary.type ? 'View Deals' : 'Get Directions'}
          </button>
        </div>

      </div>

      {/* Dispensary Info Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              &times;
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="flex-shrink-0 w-full md:w-1/2 h-64 md:h-auto rounded-xl overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={dispensary.name}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  {dispensary.logo && (
                    <div className="h-14 w-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200">
                      <Image
                        src={dispensary.logo}
                        alt={`${dispensary.name} logo`}
                        width={56}
                        height={56}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{dispensary.name}</h2>
                    {(dispensary as { isGeneric?: boolean }).isGeneric && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-slate-200 text-slate-700 rounded">Generic</span>
                    )}
                  </div>
                </div>

                {dispensary.accessType && (
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium w-fit">
                    {dispensary.accessType.replace('/', ' & ')}
                  </span>
                )}

                <p className="text-gray-600">
                  <strong>Address:</strong> {dispensary.address.street1}
                  {dispensary.address.street2 && `, ${dispensary.address.street2}`}
                  <br />
                  {dispensary.address.city}, {dispensary.address.state} {dispensary.address.zipCode}
                </p>

                {dispensary.phoneNumber && (
                  <p className="text-gray-600">
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${dispensary.phoneNumber}`} className="text-orange-600 hover:underline">
                      {dispensary.phoneNumber}
                    </a>
                  </p>
                )}

                {dispensary.websiteUrl && (
                  <p className="text-gray-600">
                    <strong>Website:</strong>{' '}
                    <a
                      href={
                        dispensary.type
                          ? dispensary.websiteUrl
                          : `https://www.google.com/maps/@${Number(dispensary.coordinates.coordinates[1])},${Number(dispensary.coordinates.coordinates[0])},15z`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:underline"
                    >
                      {dispensary.name}
                    </a>
                  </p>
                )}

                {dispensary.description && (
                  <p className="text-gray-600 pt-2 border-t">
                    <strong>Description:</strong> {dispensary.description}
                  </p>
                )}

                {dispensary.amenities && dispensary.amenities.length > 0 && (
                  <p className="text-gray-600">
                    <strong>Amenities:</strong> {dispensary.amenities.join(', ')}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  License: {dispensary.licenseNumber || 'N/A'}
                </p>

                {/* View Deals button inside modal */}
                {dispensary.type && (
                  <button
                    onClick={handleViewDeals}
                    className="mt-4 w-full py-3 px-4 text-center font-semibold rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition cursor-pointer"
                  >
                    View Deals
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

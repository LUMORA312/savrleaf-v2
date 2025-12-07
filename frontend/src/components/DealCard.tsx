'use client';

import { useState } from 'react';
import { Deal } from '@/types';
import defaultDealImg from '../assets/deal.jpg';

export default function DealCard({ deal }: { deal: Deal }) {
  const [isOpen, setIsOpen] = useState(false);
  // TO DO: UNCOMMENT WHEN REAL DATA
  // const imageSrc = deal.images?.[0] || defaultDealImg.src;
  const imageSrc = defaultDealImg.src;

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer bg-gray-50 shadow-lg rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[280px] w-full flex flex-col justify-between"
      >
        <div>
          <div className="h-40 w-full rounded-xl overflow-hidden mb-4">
            <img
              src={imageSrc}
              alt={deal.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <h3 className="text-lg font-bold mb-1">{deal.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{deal.description}</p>
        </div>
        <div className="mt-4 flex justify-between items-center text-sm">
          <div>
            <span className="line-through text-gray-400">${deal.originalPrice?.toFixed(2)}</span>{' '}
            <span className="text-green-600 font-semibold">${deal.salePrice?.toFixed(2)}</span>
          </div>
          <div className="text-xs text-gray-500">{deal.accessType?.toUpperCase()}</div>
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
                <img
                  src={imageSrc}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h2 className="text-2xl font-bold">{deal.title}</h2>
                {deal.brand && <p className="text-gray-600">Brand: {deal.brand}</p>}
                <p className="text-gray-600">{deal.description}</p>
                <p className="text-gray-600">
                  Category: {deal.category} {deal.subcategory && `/ ${deal.subcategory}`}
                </p>
                {deal.strain && <p className="text-gray-600">Strain: {deal.strain}</p>}
                {deal.thcContent !== undefined && <p className="text-gray-600">THC: {deal.thcContent}%</p>}
                {deal.cbdContent !== undefined && <p className="text-gray-600">CBD: {deal.cbdContent}%</p>}
                <div className="mt-auto flex justify-between items-center text-sm">
                  <span className="line-through text-gray-400">${deal.originalPrice?.toFixed(2)}</span>
                  <span className="text-green-600 font-semibold">${deal.salePrice?.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">{deal.accessType?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

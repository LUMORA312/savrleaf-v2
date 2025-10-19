'use client';
import React from 'react';
import Modal from './Modal';
import { Dispensary, Subscription } from '@/types';

interface DispensaryModalProps {
  dispensary: Dispensary;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubscription?: (id: string, adminSkuOverride: number) => Promise<void>;
}

export default function DispensaryModal({
  dispensary,
  isOpen,
  onClose,
  onUpdateSubscription
}: DispensaryModalProps) {
  if (!dispensary) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto space-y-6 p-2">
        {/* Header */}
        <div className="flex items-center gap-4">
          {dispensary.logo && (
            <img
              src={dispensary.logo}
              alt={`${dispensary.name} logo`}
              className="w-16 h-16 rounded-full object-cover shadow-md"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-orange-700">{dispensary.name}</h2>
            <p className="text-gray-500">{dispensary.legalName}</p>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-50 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Address</h3>
          <p className="text-gray-700">
            {dispensary.address.street1}
            {dispensary.address.street2 ? `, ${dispensary.address.street2}` : ''}
          </p>
          <p className="text-gray-700">
            {dispensary.address.city}, {dispensary.address.state}{' '}
            {dispensary.address.zipCode}
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Contact</h3>
          {dispensary.phoneNumber && (
            <p className="text-gray-700">
              <span className="font-medium">Phone:</span> {dispensary.phoneNumber}
            </p>
          )}
          {dispensary.websiteUrl && (
            <p className="text-gray-700">
              <span className="font-medium">Website:</span>{' '}
              <a
                href={dispensary.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {dispensary.websiteUrl}
              </a>
            </p>
          )}
        </div>

        {/* License & Status */}
        <div className="bg-gray-50 rounded-xl shadow-sm p-4 grid grid-cols-2 gap-4">
          <p className="text-gray-700">
            <span className="font-medium">License #:</span> {dispensary.licenseNumber}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Status:</span>{' '}
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                dispensary.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : dispensary.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {dispensary.status.charAt(0).toUpperCase() +
                dispensary.status.slice(1)}
            </span>
          </p>
        </div>

        {/* Hours */}
        {dispensary.hours && (
          <div className="bg-gray-50 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Hours</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {Object.entries(dispensary.hours).map(([day, hrs]) => (
                <li key={day} className="flex justify-between">
                  <span className="capitalize">{day}:</span> <span>{hrs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Amenities */}
        {dispensary.amenities?.length > 0 && (
          <div className="bg-gray-50 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Amenities</h3>
            <ul className="flex flex-wrap gap-2">
              {dispensary.amenities.map((a, idx) => (
                <li
                  key={idx}
                  className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full shadow-sm"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Images */}
        {dispensary.images?.length > 0 && (
          <div className="bg-gray-50 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Images</h3>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {dispensary.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Dispensary image ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg shadow-sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {dispensary.description && (
          <div className="bg-gray-50 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
            <p className="text-gray-600">{dispensary.description}</p>
          </div>
        )}

        {/* Admin Notes */}
        {dispensary.adminNotes && (
          <div className="bg-gray-50 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Admin Notes</h3>
            <p className="text-gray-600">{dispensary.adminNotes}</p>
          </div>
        )}

        {/* Ratings */}
        {dispensary.ratings?.length > 0 && (
          <div className="bg-gray-50 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Ratings</h3>
            <p className="text-gray-600">
              Average:{' '}
              {(
                dispensary.ratings.reduce((acc, r) => acc + r, 0) /
                dispensary.ratings.length
              ).toFixed(1)}{' '}
              ⭐ ({dispensary.ratings.length} ratings)
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

import { Dispensary } from '@/types';
import React from 'react';

interface DispensaryInfoProps {
  dispensaries: Dispensary[];
}

export default function DispensaryInfo({ dispensaries }: DispensaryInfoProps) {
  if (!dispensaries || dispensaries.length === 0) {
    return <p>No dispensaries found.</p>;
  }

  return (
    <div className="space-y-6">
      {dispensaries.map((dispensary) => (
        <div
          key={dispensary._id}
          className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row gap-6"
        >
          {dispensary.logo && (
            <img
              src={dispensary.logo}
              alt={`${dispensary.name} logo`}
              className="w-32 h-32 object-contain rounded-md"
            />
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{dispensary.name}</h2>
            <p className="text-sm text-gray-600 mb-2 italic">{dispensary.legalName}</p>

            <p className="mb-2">
              <strong>Address:</strong>{' '}
              {dispensary.address.street1}
              {dispensary.address.street2 && `, ${dispensary.address.street2}`},{' '}
              {dispensary.address.city}, {dispensary.address.state} {dispensary.address.zipCode}
            </p>

            {dispensary.phoneNumber && (
              <p className="mb-2">
                <strong>Phone:</strong> {dispensary.phoneNumber}
              </p>
            )}

            {dispensary.websiteUrl && (
              <p className="mb-2">
                <strong>Website:</strong>{' '}
                <a href={dispensary.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {dispensary.websiteUrl}
                </a>
              </p>
            )}

            {dispensary.status && (
              <p className="mb-2">
                <strong>Status:</strong>{' '}
                <span
                  className={`font-semibold ${
                    dispensary.status === 'approved'
                      ? 'text-green-600'
                      : dispensary.status === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {dispensary.status.charAt(0).toUpperCase() + dispensary.status.slice(1)}
                </span>
              </p>
            )}

            {dispensary.description && (
              <p className="mb-2">{dispensary.description}</p>
            )}

            {dispensary.amenities && dispensary.amenities.length > 0 && (
              <div className="mb-2">
                <strong>Amenities:</strong>
                <ul className="list-disc list-inside">
                  {dispensary.amenities.map((amenity, idx) => (
                    <li key={idx}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}

            {dispensary.hours && (
              <div>
                <strong>Hours:</strong>
                <ul className="list-none">
                  {Object.entries(dispensary.hours).map(([day, hours]) => (
                    <li key={day}>
                      <span className="capitalize">{day}:</span> {hours}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { MapPin } from 'lucide-react';

interface LocationStatusProps {
  userLocation: any;
  locationError: string | null;
  className?: string;
}

export default function LocationStatus({
  userLocation,
  locationError,
  className = '',
}: LocationStatusProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {userLocation ? (
        <div className="bg-green-50 bg-gradient-to-r from-green-100 to-green-50 border border-green-300 text-green-800 rounded-xl p-2.5 max-w-xl mx-auto text-sm font-semibold flex items-center justify-center gap-2 shadow-sm">
          <MapPin size={16} className="text-green-700" aria-hidden="true" />
          📍 Using your current location
        </div>
      ) : (
        <div className="bg-yellow-50 bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl p-3 max-w-xl mx-auto text-sm font-semibold text-center shadow-sm">
          <p>
            ⚠️ {locationError
              ? 'Location access is blocked. Please enable it in your browser settings and refresh or enter your ZIP code above.'
              : 'Getting your location… or enter your ZIP code above.'}
          </p>
        </div>
      )}
    </div>
  );
}

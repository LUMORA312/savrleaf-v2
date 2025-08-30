import { Dispensary } from '@/types';
import defaultDispensaryImg from '../assets/dispensary.jpg';

export default function DispensaryCard({ dispensary }: { dispensary: Dispensary }) {
  const imageSrc = dispensary.images?.[0] || defaultDispensaryImg.src;

  return (
    <div className="bg-gray-50 shadow-lg rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[280px] max-w-[320px] w-full flex flex-col justify-between">
      <div>
        {/* Logo and name side by side */}
        <div className="flex items-center mb-4 gap-3">
          {dispensary.logo ? (
            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={dispensary.logo}
                alt={`${dispensary.name} logo`}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-semibold flex-shrink-0">
              No Logo
            </div>
          )}
          <h3 className="text-lg font-bold">{dispensary.name}</h3>
        </div>

        {/* Large image below logo+name */}
        <div className="h-40 w-full rounded-xl overflow-hidden mb-4">
          <img
            src={imageSrc}
            alt={dispensary.name}
            className="h-full w-full object-cover"
            loading="lazy"
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
  );
}

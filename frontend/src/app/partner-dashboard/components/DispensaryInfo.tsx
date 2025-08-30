import { Dispensary } from '@/types';
import defaultDispensaryImg from '@/assets/dispensary.jpg';

interface DispensaryInfoProps {
  dispensaries: Dispensary[];
}

export default function DispensaryInfo({ dispensaries }: DispensaryInfoProps) {
  if (!dispensaries || dispensaries.length === 0) {
    return <p className="text-gray-500">No dispensaries found.</p>;
  }

  if (dispensaries.length === 1) {
    const dispensary = dispensaries[0];
    const imageSrc = dispensary.images?.[0] || defaultDispensaryImg.src;

    return (
      <div className="flex justify-center">
        <DispensaryCard dispensary={dispensary} imageSrc={imageSrc} />
      </div>
    );
  }

  return (
    <div
      className="flex gap-6 overflow-x-auto px-4 py-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100"
      style={{ scrollPaddingLeft: '1rem' }}
    >
      {dispensaries.map((dispensary) => {
        const imageSrc = dispensary.images?.[0] || defaultDispensaryImg.src;
        return (
          <div
            key={dispensary._id}
            className="snap-start flex-shrink-0 w-80"
          >
            <DispensaryCard dispensary={dispensary} imageSrc={imageSrc} />
          </div>
        );
      })}
    </div>
  );
}

function DispensaryCard({
  dispensary,
  imageSrc,
}: {
  dispensary: Dispensary;
  imageSrc: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 min-h-[480px]">
      {/* Logo & Name */}
      <div className="flex items-center gap-4 mb-4">
        {dispensary.logo ? (
          <div className="h-14 w-14 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
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
        <h2 className="text-xl font-extrabold text-orange-700">{dispensary.name}</h2>
      </div>

      {/* Large Image */}
      <div className="h-44 w-full rounded-xl overflow-hidden mb-4">
        <img
          src={imageSrc}
          alt={dispensary.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Location & Description */}
      <p className="text-sm text-gray-600 mb-3">
        {dispensary.address.street1}
        {dispensary.address.street2 && `, ${dispensary.address.street2}`},{' '}
        {dispensary.address.city}, {dispensary.address.state} {dispensary.address.zipCode}
      </p>
      <p className="text-xs text-gray-500 mb-4 line-clamp-3 italic">
        {dispensary.description || 'No description available.'}
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-4">
        {dispensary.phoneNumber && (
          <div>
            <strong className="font-semibold text-gray-700">Phone:</strong> <br />
            {dispensary.phoneNumber}
          </div>
        )}
        {dispensary.websiteUrl && (
          <div>
            <strong className="font-semibold text-gray-700">Website:</strong> <br />
            <a
              href={dispensary.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline break-words"
            >
              {dispensary.websiteUrl}
            </a>
          </div>
        )}
        {dispensary.status && (
          <div>
            <strong className="font-semibold text-gray-700">Status:</strong> <br />
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full font-semibold text-xs ${
                dispensary.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : dispensary.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {dispensary.status.charAt(0).toUpperCase() + dispensary.status.slice(1)}
            </span>
          </div>
        )}
        {dispensary.licenseNumber && (
          <div>
            <strong className="font-semibold text-gray-700">License #:</strong> <br />
            {dispensary.licenseNumber}
          </div>
        )}
      </div>

      {/* Amenities */}
      {dispensary.amenities && dispensary.amenities.length > 0 && (
        <div className="mb-4">
          <strong className="font-semibold text-gray-700">Amenities:</strong>
          <ul className="list-disc list-inside text-gray-600 text-xs mt-1 max-h-20 overflow-auto">
            {dispensary.amenities.map((amenity, idx) => (
              <li key={idx}>{amenity}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hours */}
      {dispensary.hours && (
        <div className="mb-1">
          <strong className="font-semibold text-gray-700">Hours:</strong>
          <ul className="list-none text-gray-600 text-xs mt-1 max-h-28 overflow-auto">
            {Object.entries(dispensary.hours).map(([day, hours]) => (
              <li key={day}>
                <span className="capitalize font-semibold">{day}:</span> {hours}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

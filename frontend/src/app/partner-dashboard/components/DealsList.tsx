'use client';

import { format } from 'date-fns';
import defaultDealImg from '@/assets/deal.jpg';

interface DealsListProps {
  deals: any[];
  setDeals: (deals: any[]) => void;
  onEdit?: (deal: any) => void;
}

export default function DealsList({ deals, setDeals, onEdit }: DealsListProps) {
  if (deals.length === 0) {
    return <p className="text-gray-500">No deals found.</p>;
  }

  const displayAccessType = (type: string) => {
    if (type === 'both') return 'Med/Rec';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/${dealId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        setDeals(deals.filter((deal) => deal._id !== dealId));
      } else {
        alert(data.message || 'Failed to delete deal.');
      }
    } catch (err) {
      console.error('Error deleting deal:', err);
      alert('Error deleting deal.');
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => {
        const imageSrc = defaultDealImg.src;
        const startDate = deal.startDate
          ? format(new Date(deal.startDate), 'MMM dd, yyyy')
          : 'N/A';
        const endDate = deal.endDate
          ? format(new Date(deal.endDate), 'MMM dd, yyyy')
          : 'N/A';
        const accessTypes = Array.isArray(deal.accessType)
          ? deal.accessType
          : [deal.accessType].filter(Boolean);

        return (
          <div
            key={deal._id}
            className="bg-white shadow-lg rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-transform duration-200"
          >
            <div className="h-50 w-full rounded-xl overflow-hidden mb-4">
              <img
                src={imageSrc}
                alt={deal.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <h3 className="text-lg font-bold mb-1">{deal.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{deal.description}</p>

            <div className="mt-3 flex justify-between items-center text-sm">
              <div>
                {deal.originalPrice && (
                  <span className="line-through text-gray-400 mr-1">
                    ${Number(deal.originalPrice).toFixed(2)}
                  </span>
                )}
                <span className="text-green-600 font-semibold">
                  ${Number(deal.salePrice).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {accessTypes.map((type: string) => (
                  <span
                    key={type}
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      deal.accessType === 'medical'
                        ? 'bg-green-100 text-green-700'
                        : deal.accessType === 'recreational'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {displayAccessType(deal.accessType)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p><strong>Start:</strong> {startDate}</p>
              <p><strong>End:</strong> {endDate}</p>
              {deal.tags && deal.tags.length > 0 && (
                <p><strong>Tags:</strong> {deal.tags.join(', ')}</p>
              )}
              {deal.dispensary && (
                <p><strong>Dispensary:</strong> {deal.dispensary.name || deal.dispensary}</p>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => onEdit && onEdit(deal)}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white py-2 rounded-lg text-sm font-semibold shadow-md transition cursor-pointer"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6-9 3 3-9z" />
                </svg>
                Edit
              </button>

              <button
                onClick={() => handleDelete(deal._id)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 text-white py-2 rounded-lg text-sm font-semibold shadow-md transition cursor-pointer"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

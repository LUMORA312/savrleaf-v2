import { Deal } from '@/types';
import defaultDealImg from '../assets/deal.jpg';

export default function DealCard({ deal }: { deal: Deal }) {
  // TO DO: UNCOMMENT
  // const imageSrc = deal.images?.[0] || defaultDealImg.src;
  const imageSrc = defaultDealImg.src;

  return (
    <div className="bg-gray-50 shadow-lg rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[280px] w-full flex flex-col justify-between">
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
          <span className="line-through text-gray-400">${deal.originalPrice.toFixed(2)}</span>{' '}
          <span className="text-green-600 font-semibold">${deal.salePrice.toFixed(2)}</span>
        </div>
        <div className="text-xs text-gray-500">{deal.accessType.toUpperCase()}</div>
      </div>
    </div>
  );
}

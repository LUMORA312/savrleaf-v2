export default function DealsList({ deals }: { deals: any[] }) {
  return (
    <div>
      {deals.length === 0 && <p>No deals found.</p>}
      {deals.map((deal) => (
        <div key={deal._id} className="border p-4 mb-4 rounded">
          <h3 className="font-semibold">{deal.title}</h3>
          <p>{deal.description}</p>
          <p>
            <span className="line-through">${deal.originalPrice}</span> {' '}
            <span className="font-bold">${deal.salePrice}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

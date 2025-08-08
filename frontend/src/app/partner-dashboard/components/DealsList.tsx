'use client';

export default function DealsList() {
  const deals = [
    { id: 1, title: 'Summer Special', discount: '20%', expires: '2025-09-01' },
    { id: 2, title: 'Buy One Get One', discount: '50%', expires: '2025-08-30' },
  ];

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left px-4 py-2">Title</th>
            <th className="text-left px-4 py-2">Discount</th>
            <th className="text-left px-4 py-2">Expires</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id} className="border-b">
              <td className="px-4 py-2">{deal.title}</td>
              <td className="px-4 py-2">{deal.discount}</td>
              <td className="px-4 py-2">{deal.expires}</td>
              <td className="px-4 py-2 space-x-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

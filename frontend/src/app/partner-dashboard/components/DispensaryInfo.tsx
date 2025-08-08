'use client';

export default function DispensaryInfo() {
  const dispensary = {
    name: 'GreenLeaf Dispensary',
    legalName: 'GreenLeaf LLC',
    status: 'Approved',
    address: '123 Main St, Denver, CO 80205',
    phone: '(123) 456-7890',
    website: 'https://greenleaf.com',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-lg">
      <h2 className="text-2xl font-bold">Dispensary Information</h2>
      <p><strong>Name:</strong> {dispensary.name}</p>
      <p><strong>Legal Name:</strong> {dispensary.legalName}</p>
      <p><strong>Status:</strong> <span className="text-green-600 font-semibold">{dispensary.status}</span></p>
      <p><strong>Address:</strong> {dispensary.address}</p>
      <p><strong>Phone:</strong> {dispensary.phone}</p>
      <p>
        <strong>Website:</strong>{' '}
        <a href={dispensary.website} target="_blank" className="text-green-600 hover:underline">
          {dispensary.website}
        </a>
      </p>
      <div>
        <button className="mt-2 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          Contact Admin to Edit
        </button>
      </div>
    </div>
  );
}

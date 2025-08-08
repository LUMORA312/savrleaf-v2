'use client';

export default function UserInfo() {
  const user = {
    name: 'John Doe',
    email: 'partner@example.com',
    role: 'Partner',
    joined: '2025-01-01',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-lg">
      <h2 className="text-2xl font-bold">User Information</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Joined:</strong> {user.joined}</p>
    </div>
  );
}

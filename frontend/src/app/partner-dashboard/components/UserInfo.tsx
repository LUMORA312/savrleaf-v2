import { User } from '@/types';
import React from 'react';

interface UserInfoProps {
  user: User | null;
}

export default function UserInfo({ user }: UserInfoProps) {
  if (!user) {
    return <p>User information not available.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">User Information</h2>

      <p>
        <strong>Name:</strong>{' '}
        {user.firstName || user.lastName
          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
          : 'N/A'}
      </p>

      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <p>
        <strong>Role:</strong>{' '}
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </p>
    </div>
  );
}

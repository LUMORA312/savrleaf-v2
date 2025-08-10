import { User } from '@/types';
import React from 'react';

interface UserInfoProps {
  user: User | null;
}

export default function UserInfo({ user }: UserInfoProps) {
  if (!user) {
    return (
      <p className="text-center text-gray-500 mt-8">
        User information not available.
      </p>
    );
  }

  const fullName =
    user.firstName || user.lastName
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : 'N/A';

  return (
    <div className="bg-white max-w-md mx-auto p-6 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-6 text-orange-700">User Information</h2>

      <div className="space-y-4 text-gray-700">
        <p>
          <span className="font-semibold">Name:</span>{' '}
          <span className="text-gray-900">{fullName}</span>
        </p>

        <p>
          <span className="font-semibold">Email:</span>{' '}
          <span className="text-gray-900">{user.email}</span>
        </p>

        <p>
          <span className="font-semibold">Role:</span>{' '}
          <span className="capitalize text-gray-900">{user.role}</span>
        </p>
      </div>

      {/* TO DO: get the right contact flow */}
      <p className="mt-8 text-sm text-gray-500 italic text-center">
        If you need to make any changes to your information, feel free to{' '}
        <a
          href="mailto:support@savrleaf.com"
          className="text-orange-600 hover:underline"
        >
          reach out to us
        </a>
        .
      </p>
    </div>
  );
}

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

  const subscription = user.subscription;
  const tier = subscription?.tier;
  const baseLimit = tier?.baseSKULimit ?? 0;
  const bonus = subscription?.bonusSkus ?? 0;
  const override = subscription?.adminSkuOverride ?? null;
  const maxSKUs = override !== null ? override : baseLimit + bonus;
  const usedSKUs = user.usedSKUs ?? 0;
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

      {/* --- Subscription Section --- */}
      {subscription ? (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold text-orange-700 mb-4">Subscription</h3>

          <p>
            <span className="font-semibold">Plan:</span>{' '}
            <span className="text-gray-900">{tier?.displayName ?? 'N/A'}</span>
          </p>

          <p>
            <span className="font-semibold">Status:</span>{' '}
            <span className="capitalize text-gray-900">{subscription.status}</span>
          </p>

          <p>
            <span className="font-semibold">Base SKU Limit:</span>{' '}
            {baseLimit}
          </p>

          <p>
            <span className="font-semibold">Bonus SKUs:</span>{' '}
            {bonus}
          </p>

          {override !== null && (
            <p>
              <span className="font-semibold">Admin Override:</span>{' '}
              {override}
            </p>
          )}
          <p className="mt-2 font-semibold text-gray-900">
            SKUs Used: {usedSKUs} / {maxSKUs}
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            Total Allowed SKUs: {maxSKUs}
          </p>
        </div>
      ) : (
        <p className="mt-8 text-sm italic text-gray-500">
          No active subscription found.
        </p>
      )}

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

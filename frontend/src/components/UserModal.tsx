import React, { useState } from 'react';
import Modal from './Modal';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'partner' | 'admin';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  subscription?: {
    _id: string;
    status: string;
    bonusSkus?: number;
    adminSkuOverride?: number | null;
    tier?: {
      displayName?: string;
      baseSKULimit?: number;
    };
  };
}

interface UserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubscription?: (id: string, adminSkuOverride: number) => Promise<void>;
  usedSkus: number;
}

export default function UserModal({ user, isOpen, onClose, onUpdateSubscription, usedSkus }: UserModalProps) {
  const [overrideValue, setOverrideValue] = useState<number | ''>(
    user.subscription?.adminSkuOverride ?? ''
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;
  const fullName =
    user.firstName || user.lastName
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : 'N/A';

  const subscription = user.subscription;
  console.log("subscription", subscription)
  const tier = subscription?.tier;
  const baseLimit = tier?.baseSKULimit ?? 0;
  const bonus = subscription?.bonusSkus ?? 0;
  const override = subscription?.adminSkuOverride ?? null;
  const maxSKUs = (override || 0) + baseLimit + bonus;
  const usedSKUs = usedSkus;

  const handleSaveOverride = async () => {
    if (!subscription?._id) return;
    setIsSaving(true);
    try {
      await fetch(`/api/subscriptions/${subscription._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSkuOverride: overrideValue === '' ? null : Number(overrideValue) }),
      });
      if (onUpdateSubscription) onUpdateSubscription(subscription._id, overrideValue || 0);
    } catch (error) {
      console.error('Failed to update subscription override', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-lg mx-auto">
        <h3 className="text-2xl font-bold mb-4 text-orange-700">{fullName}</h3>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>

        {subscription ? (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-xl font-bold text-orange-700 mb-2">Subscription</h4>
            <p>
              <span className="font-semibold">Plan:</span>{' '}
              {tier?.displayName ?? 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Base SKU Limit:</span> {baseLimit}
            </p>
            <p>
              <span className="font-semibold">Bonus SKUs:</span> {bonus}
            </p>
            <p>
              <span className="font-semibold">SKUs Used:</span> {usedSKUs} / {maxSKUs}
            </p>
            <div className="mt-4">
              <label className="font-semibold block mb-1">Admin SKU Override</label>
              <input
                type="number"
                value={overrideValue}
                onChange={(e) => setOverrideValue(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Leave empty to remove override"
                className="w-full border rounded px-3 py-2"
              />
              <button
                onClick={handleSaveOverride}
                disabled={isSaving}
                className="mt-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                {isSaving ? 'Saving...' : 'Save Override'}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-6 italic text-gray-500">No active subscription.</p>
        )}

        <button
          onClick={onClose}
          className="mt-6 bg-gray-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

'use client';
import React from 'react';
import Modal from './Modal';
import { Application } from '@/types';

interface ApplicationModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function ApplicationModal({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ApplicationModalProps) {
  if (!application) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-lg space-y-4">
        <h2 className="text-3xl font-bold text-orange-700 text-center">
          {application.firstName} {application.lastName}
        </h2>

        <div className="grid grid-cols-1 gap-2">
          <p><span className="font-semibold text-gray-600">Email:</span> {application.email}</p>
          <p><span className="font-semibold text-gray-600">Dispensary:</span> {application.dispensaryName}</p>
          <p><span className="font-semibold text-gray-600">Status:</span> {application.status}</p>
          <p><span className="font-semibold text-gray-600">License Number:</span> {application.licenseNumber}</p>
          <p>
            <span className="font-semibold text-gray-600">Address:</span> 
            {application.address.street1}, {application.address.city}, {application.address.state} {application.address.zipCode}
          </p>
          {application.amenities.length > 0 && (
            <p><span className="font-semibold text-gray-600">Amenities:</span> {application.amenities.join(', ')}</p>
          )}
          {application.description && (
            <p><span className="font-semibold text-gray-600">Description:</span> {application.description}</p>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-4 w-full">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
            onClick={() => {
              onApprove(application._id);
              onClose();
            }}
          >
            Approve
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
            onClick={() => {
              onReject(application._id);
              onClose();
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </Modal>
  );
}

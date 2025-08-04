'use client';

import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useState } from 'react';

type ApplicationFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dispensaryName: string;
  legalName: string;
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  licenseNumber: string;
  phoneNumber?: string;
  websiteUrl?: string;
  description?: string;
  amenities: string[];
};

export default function DispensaryApplicationForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ApplicationFormData>({
    defaultValues: { amenities: [] }
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<ApplicationFormData | null>(null);

  async function onSubmit(data: ApplicationFormData) {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/applications`, data, {
        headers: { 'Content-Type': 'application/json' }
      });
      setSuccessMessage('Application submitted successfully!');
      setSubmittedData(data);
      reset();
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to submit application';

      setErrorMessage(message);
    }
  }

  const amenitiesOptions = [
    'Parking',
    'Wi-Fi',
    'Wheelchair Accessible',
    'Outdoor Seating',
    'Delivery',
    'Curbside Pickup',
    'Lounge Area',
    'Pet Friendly',
    'Cash Accepted',
    'ATM On-Site',
    'Private Consultation',
    'Educational Materials',
  ];

  if (submittedData) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow border border-orange-100">
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">Thank you for your application!</h2>
        <p className="mb-6 text-gray-700">
          You will be notified when your application is approved so you can make your payment and access your dashboard.
        </p>

        <h3 className="text-xl font-semibold mb-2">Submission Summary:</h3>
        <div className="space-y-3 text-gray-800">
          <p><strong>Name:</strong> {submittedData.firstName} {submittedData.lastName}</p>
          <p><strong>Email:</strong> {submittedData.email}</p>
          <p><strong>Dispensary Name:</strong> {submittedData.dispensaryName}</p>
          <p><strong>Legal Name:</strong> {submittedData.legalName}</p>
          <p><strong>License Number:</strong> {submittedData.licenseNumber}</p>
          <p><strong>Phone Number:</strong> {submittedData.phoneNumber || 'N/A'}</p>
          <p><strong>Website URL:</strong> {submittedData.websiteUrl || 'N/A'}</p>
          <p><strong>Description:</strong> {submittedData.description || 'N/A'}</p>
          <p><strong>Address:</strong> {`${submittedData.address.street1}${submittedData.address.street2 ? ', ' + submittedData.address.street2 : ''}, ${submittedData.address.city}, ${submittedData.address.state} ${submittedData.address.zipCode}`}</p>
          <p><strong>Amenities:</strong> {submittedData.amenities.length ? submittedData.amenities.join(', ') : 'None'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-orange-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* PERSONAL INFO */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">Personal Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="First Name*" error={errors.firstName?.message}>
                <input {...register('firstName', { required: 'First name is required' })} className="input" />
              </FormField>
              <FormField label="Last Name*" error={errors.lastName?.message}>
                <input {...register('lastName', { required: 'Last name is required' })} className="input" />
              </FormField>
              <FormField label="Email*" error={errors.email?.message} className="sm:col-span-2">
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/, message: 'Invalid email' },
                  })}
                  className="input"
                />
              </FormField>
              <FormField label="Password*" error={errors.password?.message} className="sm:col-span-2">
                <input
                  type="password"
                  {...register('password', { required: 'Password is required', minLength: 6 })}
                  className="input"
                />
              </FormField>
            </div>
          </section>

          {/* DISPENSARY INFO */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">Dispensary Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Dispensary Name*">
                <input {...register('dispensaryName', { required: true })} className="input" />
              </FormField>
              <FormField label="Legal Name*">
                <input {...register('legalName', { required: true })} className="input" />
              </FormField>
              <FormField label="License Number*" className="sm:col-span-2">
                <input {...register('licenseNumber', { required: true })} className="input" />
              </FormField>
              <FormField label="Phone Number" error={errors.phoneNumber?.message} className="sm:col-span-2">
                <input
                  type="tel"
                  {...register('phoneNumber', {
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Invalid phone number',
                    },
                  })}
                  className="input"
                />
              </FormField>
              <FormField label="Website URL" className="sm:col-span-2">
                <input type="url" {...register('websiteUrl')} className="input" />
              </FormField>
              <FormField label="Description" className="sm:col-span-2">
                <textarea {...register('description')} rows={4} className="input resize-y" />
              </FormField>
            </div>
          </section>

          {/* ADDRESS */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Street 1*">
                <input {...register('address.street1', { required: true })} className="input" />
              </FormField>
              <FormField label="Street 2">
                <input {...register('address.street2')} className="input" />
              </FormField>
              <FormField label="City*">
                <input {...register('address.city', { required: true })} className="input" />
              </FormField>
              <FormField label="State*">
                <input {...register('address.state', { required: true })} className="input" />
              </FormField>
              <FormField label="Zip Code*" error={errors.address?.zipCode?.message} className="sm:col-span-2">
                <input
                  {...register('address.zipCode', {
                    required: true,
                    pattern: { value: /^\d{5}(-\d{4})?$/, message: 'Invalid zip code' },
                  })}
                  className="input"
                />
              </FormField>
            </div>
          </section>

          {/* AMENITIES */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesOptions.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    value={option}
                    {...register('amenities')}
                    className="form-checkbox text-orange-600 rounded"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </section>

          {errorMessage && (
            <div className="mb-6 p-4 text-red-700 bg-red-100 border border-red-300 rounded">
              {errorMessage}
            </div>
          )}
          <div className="pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  error,
  className = '',
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block font-medium text-sm text-gray-800 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

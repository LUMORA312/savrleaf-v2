'use client';

import { useState, useEffect } from 'react';
import { Dispensary } from '@/types';
import { amenitiesOptions } from '@/constants/amenities';

interface DispensaryFormProps {
  initialData?: Dispensary | null;
  onSave: (dispensary: Dispensary) => void;
  onCancel: () => void;
}

export default function DispensaryForm({ initialData, onSave, onCancel }: DispensaryFormProps) {
  const [form, setForm] = useState({
    name: '',
    legalName: '',
    address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipCode: '',
    },
    licenseNumber: '',
    phoneNumber: '',
    websiteUrl: '',
    description: '',
    amenities: [] as string[],
    logo: '',
    images: '', // comma-separated URLs
    hours: {} as Record<string, string>,
  });

  const [hoursForm, setHoursForm] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        legalName: initialData.legalName || '',
        address: {
          street1: initialData.address?.street1 || '',
          street2: initialData.address?.street2 || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          zipCode: initialData.address?.zipCode || '',
        },
        licenseNumber: initialData.licenseNumber || '',
        phoneNumber: initialData.phoneNumber || '',
        websiteUrl: initialData.websiteUrl || '',
        description: initialData.description || '',
        amenities: initialData.amenities || [],
        logo: initialData.logo || '',
        images: initialData.images?.join(', ') || '',
        hours: initialData.hours || {},
      });

      if (initialData.hours) {
        setHoursForm({
          monday: initialData.hours.monday || '',
          tuesday: initialData.hours.tuesday || '',
          wednesday: initialData.hours.wednesday || '',
          thursday: initialData.hours.thursday || '',
          friday: initialData.hours.friday || '',
          saturday: initialData.hours.saturday || '',
          sunday: initialData.hours.sunday || '',
        });
      }
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHoursForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityChange = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!form.name || !form.legalName || !form.address.street1 || !form.address.city || !form.address.state || !form.address.zipCode || !form.licenseNumber) {
      setFormError('Please fill in all required fields.');
      return;
    }

    // Validate zip code format
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(form.address.zipCode)) {
      setFormError('Please enter a valid zip code (e.g., 12345 or 12345-6789).');
      return;
    }

    // Build hours object (only include non-empty values)
    const hours: Record<string, string> = {};
    Object.entries(hoursForm).forEach(([day, time]) => {
      if (time.trim()) {
        hours[day] = time.trim();
      }
    });

    const payload = {
      name: form.name,
      legalName: form.legalName,
      address: form.address,
      licenseNumber: form.licenseNumber,
      phoneNumber: form.phoneNumber || undefined,
      websiteUrl: form.websiteUrl || undefined,
      description: form.description || undefined,
      amenities: form.amenities,
      logo: form.logo || undefined,
      images: form.images.split(',').map((i) => i.trim()).filter(Boolean),
      hours: Object.keys(hours).length > 0 ? hours : undefined,
    };

    const isEdit = !!initialData?._id;
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/dispensaries/${initialData._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/dispensaries`;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success || res.status === 201) {
        // For create, the backend returns { success: true, dispensary, subscription }
        // For update, it returns { success: true, dispensary }
        const dispensaryToSave = data.dispensary || data;
        onSave(dispensaryToSave);
        return;
      } else {
        setFormError(data.message || (isEdit ? 'Error updating dispensary.' : 'Error creating dispensary.'));
      }
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto px-2">
      <h3 className="text-xl font-bold text-orange-700">
        {initialData?._id ? 'Edit Dispensary' : 'Create Dispensary'}
      </h3>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dispensary Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Dispensary name"
          required
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        />
      </div>

      {/* Legal Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name *</label>
        <input
          name="legalName"
          value={form.legalName}
          onChange={handleChange}
          placeholder="Legal business name"
          required
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        />
      </div>

      {/* Address */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
        <input
          name="address.street1"
          value={form.address.street1}
          onChange={handleChange}
          placeholder="Street Address 1 *"
          required
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        />
        <input
          name="address.street2"
          value={form.address.street2}
          onChange={handleChange}
          placeholder="Street Address 2 (optional)"
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="address.city"
            value={form.address.city}
            onChange={handleChange}
            placeholder="City *"
            required
            className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          />
          <input
            name="address.state"
            value={form.address.state}
            onChange={handleChange}
            placeholder="State *"
            required
            className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          />
          <input
            name="address.zipCode"
            value={form.address.zipCode}
            onChange={handleChange}
            placeholder="Zip Code *"
            required
            className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          />
        </div>
      </div>

      {/* License Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
        <input
          name="licenseNumber"
          value={form.licenseNumber}
          onChange={handleChange}
          placeholder="License number"
          required
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        />
      </div>

      {/* Phone & Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Phone number"
            className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
          <input
            name="websiteUrl"
            type="url"
            value={form.websiteUrl}
            onChange={handleChange}
            placeholder="https://example.com"
            className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description of your dispensary"
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          rows={3}
        />
      </div>

      {/* Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours (optional)</label>
        <div className="space-y-2">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <div key={day} className="flex items-center gap-2">
              <label className="w-24 text-sm capitalize">{day}:</label>
              <input
                name={day}
                value={hoursForm[day as keyof typeof hoursForm]}
                onChange={handleHoursChange}
                placeholder="e.g., 9:00 AM - 5:00 PM"
                className="flex-1 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {amenitiesOptions.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.amenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
        <input
          name="logo"
          type="url"
          value={form.logo}
          onChange={handleChange}
          placeholder="https://example.com/logo.png"
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
        <textarea
          name="images"
          value={form.images}
          onChange={handleChange}
          placeholder="Image URLs, comma separated"
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          rows={2}
        />
      </div>

      {formError && (
        <div className="p-3 bg-red-100 text-red-800 rounded">{formError}</div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-end pb-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 focus:ring focus:ring-orange-300 transition cursor-pointer"
        >
          {initialData?._id ? 'Update Dispensary' : 'Create Dispensary'}
        </button>
      </div>
    </form>
  );
}

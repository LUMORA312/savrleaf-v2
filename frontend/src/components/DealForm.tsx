'use client';

import { Deal } from '@/types';
import { useState, useEffect } from 'react';

interface DealFormProps {
  initialData?: Deal | null;
  dispensaryOptions: { _id: string; name: string; isActive: boolean; isPurchased: boolean }[];
  onSave: (deal: Deal) => void;
  onCancel: () => void;
  userId: string;
}

export default function DealForm({ initialData, dispensaryOptions, onSave, onCancel, userId }: DealFormProps) {
  const [form, setForm] = useState({
    title: '',
    brand: '',
    description: '',
    salePrice: '',
    originalPrice: '',
    accessType: 'both',
    tags: '',
    images: '', // comma-separated URLs
    dispensary: '',
    startDate: '',
    endDate: '',
    manuallyActivated: false,
    category: '',
    strain: 'indica',
    thcContent: 0,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        brand: initialData.brand || '',
        description: initialData.description || '',
        salePrice: initialData.salePrice?.toString() || '',
        originalPrice: initialData.originalPrice?.toString() || '',
        accessType: initialData.accessType || 'both',
        tags: initialData.tags?.join(', ') || '',
        images: initialData.images?.join(', ') || '',
        dispensary: typeof initialData.dispensary === 'string'
          ? initialData.dispensary
          : initialData.dispensary?._id || '',
        startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : '',
        endDate: initialData.endDate ? initialData.endDate.slice(0, 10) : '',
        manuallyActivated: initialData.manuallyActivated || false,
        category: initialData?.category || '',
        strain: initialData?.strain || 'indica',
        thcContent: initialData?.thcContent || 0,
      });
    }
  }, [initialData]);

  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setForm({
      title: '',
      brand: '',
      description: '',
      salePrice: '',
      originalPrice: '',
      accessType: 'both',
      tags: '',
      images: '',
      dispensary: '',
      startDate: '',
      endDate: '',
      manuallyActivated: false,
      category: '',
      strain: 'indica',
      thcContent: 0,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (Number(form.salePrice) > Number(form.originalPrice)) {
      setFormError('Sale price must be less than or equal to original price.');
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      setFormError('Start date must be before end date.');
      return;
    }

    const payload = {
      ...form,
      salePrice: Number(form.salePrice),
      originalPrice: Number(form.originalPrice),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: form.images.split(',').map((i) => i.trim()).filter(Boolean),
      manuallyActivated: form.manuallyActivated,
      userId: userId,
    };

    const method = initialData?._id ? 'PUT' : 'POST';
    const url = initialData?._id
      ? `${process.env.NEXT_PUBLIC_API_URL}/deals/${initialData._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/deals`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        onSave(data.deal);
        resetForm();
        return;
      } else {
        setFormError(data.message || 'Error saving deal.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-xl font-bold text-orange-700">
        {initialData?._id ? 'Edit Deal' : 'Create New Deal'}
      </h3>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Deal title"
          required
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        />
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
        <input
          name="brand"
          value={form.brand}
          onChange={handleChange}
          placeholder="Brand name"
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        >
          <option value="" disabled>Select a category</option>
          <option value="flower">Flower</option>
          <option value="edibles">Edibles</option>
          <option value="concentrates">Concentrates</option>
          <option value="vapes">Vapes</option>
          <option value="topicals">Topicals</option>
          <option value="pre-roll">Pre-Roll</option>
          <option value="tincture">Tincture</option>
          <option value="beverage">Beverage</option>
          <option value="capsule/pill">Capsule/Pill</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Short description of the deal"
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          rows={3}
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price *</label>
          <input
            name="salePrice"
            type="number"
            step="0.01"
            value={form.salePrice}
            onChange={handleChange}
            placeholder="0.00"
            required
            className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Price *</label>
          <input
            name="originalPrice"
            type="number"
            step="0.01"
            value={form.originalPrice}
            onChange={handleChange}
            placeholder="0.00"
            required
            className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          />
        </div>
      </div>

      {/* Access Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Access Type</label>
        <select
          name="accessType"
          value={form.accessType}
          onChange={handleChange}
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        >
          <option value="both">Med/Rec</option>
          <option value="medical">Medical</option>
          <option value="recreational">Recreational</option>
        </select>
      </div>

      {/* Strain */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Strain</label>
        <select
          name="strain"
          value={form.strain}
          onChange={handleChange}
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        >
          <option value="indica">Indica</option>
          <option value="indica-dominant hybrid">Indica-Dominant Hybrid</option>
          <option value="hybrid">Hybrid</option>
          <option value="sativa-dominant hybrid">Sativa-Dominant Hybrid</option>
          <option value="sativa">Sativa</option>
        </select>
      </div>

      {/* THC Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">THC Content *</label>
        <input
          name="thcContent"
          type="number"
          value={form.thcContent}
          onChange={handleChange}
          required
          min={0}
          max={100}
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        />
      </div>

      {/* Dispensary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dispensary *</label>
        <select
          name="dispensary"
          value={form.dispensary}
          onChange={handleChange}
          required
          className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
        >
          <option value="" disabled>
            Select a dispensary
          </option>
          {dispensaryOptions.filter((d) => d.isActive && d.isPurchased).map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
          <input
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
            min={form.startDate || new Date().toISOString().split('T')[0]}
            className="border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 w-full rounded-lg"
          />
        </div>
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

      {/* Manually Activated */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="manuallyActivated"
          checked={form.manuallyActivated}
          onChange={handleChange}
          id="manuallyActivated"
          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="manuallyActivated" className="text-sm text-gray-700">
          Manually Activate Deal
        </label>
      </div>

      {formError && (
        <div className="p-3 bg-red-100 text-red-800 rounded">{formError}</div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
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
          {initialData?._id ? 'Update Deal' : 'Create Deal'}
        </button>
      </div>
    </form>
  );
}

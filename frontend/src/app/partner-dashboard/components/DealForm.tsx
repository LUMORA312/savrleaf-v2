'use client';

interface DealFormProps {
  onClose: () => void;
}

export default function DealForm({ onClose }: DealFormProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add / Edit Deal</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-semibold">Title</label>
            <input className="w-full border px-3 py-2 rounded" type="text" />
          </div>
          <div>
            <label className="block text-sm font-semibold">Discount</label>
            <input className="w-full border px-3 py-2 rounded" type="text" />
          </div>
          <div>
            <label className="block text-sm font-semibold">Expires</label>
            <input className="w-full border px-3 py-2 rounded" type="date" />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

export default function Modal({ isOpen, onClose, children }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
}

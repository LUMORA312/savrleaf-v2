'use client';

interface TopbarProps {
  partnerName?: string;
  onLogout: () => void;
}

export default function Topbar({ partnerName, onLogout }: TopbarProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="h-16 px-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Partner Dashboard
        </h1>

        <div className="flex items-center space-x-4 text-sm text-orange-600 font-semibold">
          {partnerName && <span>Welcome, {partnerName}</span>}
          <button
            onClick={onLogout}
            className="hover:text-orange-700 transition-colors"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

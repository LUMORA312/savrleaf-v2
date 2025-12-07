'use client';

import { Menu } from 'lucide-react';

interface TopbarProps {
  partnerName?: string;
  onLogout: () => void;
  onMenuClick?: () => void;
}

export default function Topbar({ partnerName, onLogout, onMenuClick }: TopbarProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Hamburger menu button for mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Partner Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 text-sm text-orange-600 font-semibold">
          {partnerName && (
            <span className="hidden sm:inline">Welcome, {partnerName}</span>
          )}
          <button
            onClick={onLogout}
            className="hover:text-orange-700 transition-colors px-2 py-1 rounded"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

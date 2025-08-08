'use client';

import Image from 'next/image';
import logo from '@/assets/logo.png';

interface TopbarProps {
  partnerName?: string;
  onLogout: () => void;
}

export default function Topbar({ partnerName, onLogout }: TopbarProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2">
          <Image
            src={logo}
            alt="SavrLeaf Logo"
            className="h-8 w-auto"
            priority
          />
          <span className="text-xl font-semibold text-gray-900 tracking-tight">
            SavrLeaf<sup className="text-xs align-super">™</sup>
          </span>
        </div>

        {/* Partner Info + Logout */}
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

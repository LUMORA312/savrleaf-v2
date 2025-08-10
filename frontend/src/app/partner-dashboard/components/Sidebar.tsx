'use client';

import { TabKey } from './DashboardLayout';
import Image from 'next/image';
import logo from '@/assets/logo.png';

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tabKey: TabKey) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'deals', label: 'Deals' },
    { key: 'dispensary', label: 'Dispensary Info' },
    { key: 'user', label: 'User Info' },
  ];

  return (
    <aside className="w-64 bg-white shadow flex flex-col">
      <div className="h-16 px-4 flex items-center">
        <Image src={logo} alt="SavrLeaf Logo" className="h-8 w-auto" priority />
        <span className="ml-2 text-lg font-semibold text-gray-900">
          SavrLeaf<sup className="text-xs align-super">™</sup>
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`w-full text-left px-3 py-2 rounded transition cursor-pointer ${
              activeTab === item.key
                ? 'bg-green-100 text-green-700 font-semibold'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

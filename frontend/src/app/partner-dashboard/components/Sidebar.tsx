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
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="h-16 px-6 flex items-center">
        <Image src={logo} alt="SavrLeaf Logo" className="h-8 w-auto" priority />
        <span className="ml-3 text-xl font-extrabold text-orange-700 tracking-wide select-none">
          SavrLeaf<sup className="text-xs align-super">™</sup>
        </span>
      </div>

      <nav className="flex-1 p-2 space-y-3 bg-white">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`w-full text-left px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 text-sm font-semibold ${
              activeTab === item.key
                ? 'bg-orange-100 text-orange-800 shadow-inner'
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

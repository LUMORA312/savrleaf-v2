'use client';

import { TabKey } from './DashboardLayout';

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
      <div className="p-4 font-bold text-xl border-b">Partner Dashboard</div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`w-full text-left px-3 py-2 rounded transition ${
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

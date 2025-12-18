'use client';

import { TabKey } from './DashboardLayout';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { Home, Tag, Store, User, FileText, CreditCard, X, MapPin } from 'lucide-react';
import { JSX } from 'react';
import Link from 'next/link';

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tabKey: TabKey) => void;
  isAdmin?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const iconMap: Record<TabKey, JSX.Element> = {
  overview: <Home className="w-5 h-5" />,
  deals: <Tag className="w-5 h-5" />,
  dispensary: <Store className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  users: <User className="w-5 h-5" />,
  adminOverview: <Home className="w-5 h-5" />,
  applications: <FileText className="w-5 h-5" />,
  planSelection: <CreditCard className="w-5 h-5" />,
  mapView: <MapPin className="w-5 h-5" />,
};

export default function Sidebar({ activeTab, onTabChange, isAdmin = false, isOpen = false, onClose }: SidebarProps) {
  const navItems: { key: TabKey; label: string }[] = isAdmin
    ? [
        { key: 'adminOverview', label: 'Overview' },
        { key: 'deals', label: 'Deals' },
        { key: 'users', label: 'Users' },
        { key: 'dispensary', label: 'Dispensaries' },
        // { key: 'mapView', label: 'Map View' },
        { key: 'applications', label: 'Applications' },
      ]
    : [
        { key: 'overview', label: 'Overview' },
        { key: 'deals', label: 'Deals' },
        { key: 'dispensary', label: 'Dispensary Info' },
        // { key: 'mapView', label: 'Map View' },
        { key: 'user', label: 'User Info' },
        // { key: 'planSelection', label: 'Plan Selection' },
      ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={onClose}>
            <Image src={logo} alt="SavrLeaf Logo" className="h-8 w-auto" priority />
            <span className="ml-3 text-xl font-extrabold text-orange-700 tracking-wide select-none">
              SavrLeaf<sup className="text-xs align-super">™</sup>
            </span>
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-3 bg-white overflow-y-auto">
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
              <span
                className={`flex items-center justify-center ${
                  activeTab === item.key ? 'text-orange-700' : 'text-gray-400'
                }`}
              >
                {iconMap[item.key]}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

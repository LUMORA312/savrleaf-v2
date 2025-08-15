'use client';

import { useAuth } from '@/context/AuthContext'; 
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export type TabKey = 'overview' | 'deals' | 'dispensary' | 'user' | 'users' | 'adminOverview' | 'applications';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: TabKey;
  onTabChange: (tabKey: TabKey) => void;
  isAdmin?: boolean;
}

export default function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  isAdmin = false,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push(isAdmin ? '/admin-login' : '/partner-login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} isAdmin={isAdmin} />
      <div className="flex flex-col flex-1">
        <Topbar partnerName={user?.name} onLogout={handleLogout} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

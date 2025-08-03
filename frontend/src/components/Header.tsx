'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/partner-login');
  };

  const showPartnerLogin = !isAuthenticated || user?.role !== 'partner';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <img
            src={logo.src}
            alt="SavrLeaf Logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-semibold text-gray-900 tracking-tight">
            SavrLeaf<sup className="text-xs align-super">™</sup>
          </span>
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center space-x-5 text-sm text-orange-600">
            {showPartnerLogin ? (
              <li>
                <Link
                  href="/partner-login"
                  className="font-bold hover:text-orange-600 transition-colors"
                >
                  Partner Login
                </Link>
              </li>
            ) : (
              <li>
                <button
                  onClick={handleLogout}
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

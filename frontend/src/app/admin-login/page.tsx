'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === 'admin') {
      router.replace('/admin-dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data;

      login(token, user);
      router.push('/admin-dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-10 bg-gradient-to-br from-orange-50 to-white px-4 md:px-16 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center text-orange-800 mb-8">
          Admin Login
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded w-full max-w-md text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-orange-100 flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded transition cursor-pointer"
          >
            Log In
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}

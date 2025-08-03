'use client';

interface ErrorBannerProps {
  message: string;
  className?: string;
}

export default function ErrorBanner({ message, className = '' }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={`max-w-3xl mx-auto my-4 px-6 py-4 rounded-lg bg-red-100 text-red-800 border border-red-300 shadow-sm ${className}`}
    >
      <strong className="block font-semibold mb-1">Error</strong>
      <p className="text-sm">{message}</p>
    </div>
  );
}

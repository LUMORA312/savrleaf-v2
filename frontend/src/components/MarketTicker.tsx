'use client';

import { useEffect, useState, useMemo } from 'react';
import { TickerData } from '@/types';

interface CryptoPrices {
  btc: { price: number; change: number };
  eth: { price: number; change: number };
}

interface MarketTickerProps {
  ticker: TickerData | null;
}

export default function MarketTicker({ ticker }: MarketTickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);

  // Fetch crypto prices from CoinAPI.io
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_COINAPI_KEY;
    if (!apiKey) return;

    const fetchCrypto = async () => {
      try {
        const headers = { 'X-CoinAPI-Key': apiKey };
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        // Fetch current rates and 24h-ago rates in parallel
        const [btcRes, ethRes, btcYestRes, ethYestRes] = await Promise.all([
          fetch('https://rest.coinapi.io/v1/exchangerate/BTC/USD', { headers }),
          fetch('https://rest.coinapi.io/v1/exchangerate/ETH/USD', { headers }),
          fetch(`https://rest.coinapi.io/v1/exchangerate/BTC/USD?time=${yesterday}`, { headers }),
          fetch(`https://rest.coinapi.io/v1/exchangerate/ETH/USD?time=${yesterday}`, { headers }),
        ]);

        const [btc, eth, btcYest, ethYest] = await Promise.all([
          btcRes.json(), ethRes.json(), btcYestRes.json(), ethYestRes.json(),
        ]);

        const btcChange = btcYest.rate > 0 ? ((btc.rate - btcYest.rate) / btcYest.rate) * 100 : 0;
        const ethChange = ethYest.rate > 0 ? ((eth.rate - ethYest.rate) / ethYest.rate) * 100 : 0;

        setCryptoPrices({
          btc: { price: btc.rate, change: btcChange },
          eth: { price: eth.rate, change: ethChange },
        });
      } catch (err) {
        console.error('Crypto price fetch failed:', err);
      }
    };

    fetchCrypto();
    const interval = setInterval(fetchCrypto, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Build ticker items
  const items = useMemo(() => {
    const list: { label: string; color?: string }[] = [];

    if (ticker) {
      list.push({ label: `${ticker.activeDeals} new deals added` });
      list.push({ label: `SavrLeaf Avg Savings Today: ${ticker.avgDiscount.toFixed(1)}%` });
      if (ticker.maxDiscount > 0) {
        list.push({ label: `Biggest drop today: ${ticker.maxDiscount}%` });
      }
    }

    if (cryptoPrices) {
      const btcColor = cryptoPrices.btc.change >= 0 ? 'text-green-400' : 'text-red-400';
      const ethColor = cryptoPrices.eth.change >= 0 ? 'text-green-400' : 'text-red-400';
      const btcSign = cryptoPrices.btc.change >= 0 ? '+' : '';
      const ethSign = cryptoPrices.eth.change >= 0 ? '+' : '';
      list.push({
        label: `BTC $${cryptoPrices.btc.price.toLocaleString()} (${btcSign}${cryptoPrices.btc.change.toFixed(1)}%)`,
        color: btcColor,
      });
      list.push({
        label: `ETH $${cryptoPrices.eth.price.toLocaleString()} (${ethSign}${cryptoPrices.eth.change.toFixed(1)}%)`,
        color: ethColor,
      });
    }

    return list;
  }, [ticker, cryptoPrices]);

  // Rotate every 5 seconds (desktop)
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="bg-gray-900 text-white w-full" style={{ height: '36px' }}>
      {/* Desktop: fade rotation */}
      <div className="hidden md:flex items-center justify-center h-full relative overflow-hidden">
        {items.map((item, i) => (
          <span
            key={i}
            className={`absolute transition-opacity duration-500 text-sm font-medium ${
              item.color || 'text-white'
            } ${i === activeIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Mobile: horizontal swipe cards */}
      <div className="flex md:hidden items-center h-full overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 px-4">
        {items.map((item, i) => (
          <div
            key={i}
            className={`snap-center shrink-0 bg-gray-800 rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap ${
              item.color || 'text-white'
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

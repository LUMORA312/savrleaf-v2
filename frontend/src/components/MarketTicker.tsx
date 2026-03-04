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

interface TickerItem {
  key: string;
  label: string;
  value?: string;
  valueColor?: string;
}

export default function MarketTicker({ ticker }: MarketTickerProps) {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  // Fetch crypto prices from CoinAPI.io
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_COINAPI_KEY;
    if (!apiKey) return;

    const fetchCrypto = async () => {
      try {
        const headers = { 'X-CoinAPI-Key': apiKey };
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        const [btcRes, ethRes, btcYestRes, ethYestRes] = await Promise.all([
          fetch('https://rest.coinapi.io/v1/exchangerate/BTC/USD', { headers }),
          fetch('https://rest.coinapi.io/v1/exchangerate/ETH/USD', { headers }),
          fetch(`https://rest.coinapi.io/v1/exchangerate/BTC/USD?time=${yesterday}`, { headers }),
          fetch(`https://rest.coinapi.io/v1/exchangerate/ETH/USD?time=${yesterday}`, { headers }),
        ]);

        const [btc, eth, btcYest, ethYest] = await Promise.all([
          btcRes.json(), ethRes.json(), btcYestRes.json(), ethYestRes.json(),
        ]);

        if (typeof btc.rate !== 'number' || typeof eth.rate !== 'number') return;

        const btcChange = typeof btcYest.rate === 'number' && btcYest.rate > 0
          ? ((btc.rate - btcYest.rate) / btcYest.rate) * 100 : 0;
        const ethChange = typeof ethYest.rate === 'number' && ethYest.rate > 0
          ? ((eth.rate - ethYest.rate) / ethYest.rate) * 100 : 0;

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

  const items = useMemo<TickerItem[]>(() => {
    const list: TickerItem[] = [];

    if (ticker) {
      // Top deals first — most engaging content
      ticker.topDeals?.forEach((deal, i) => {
        const atStore = deal.dispensaryName ? ` at ${deal.dispensaryName}` : '';
        list.push({
          key: `topdeal-${i}`,
          label: `🔥 ${deal.title}${atStore}:`,
          value: `${deal.discountTier}% off — $${deal.salePrice}`,
          valueColor: 'text-orange-300',
        });
      });

      list.push({
        key: 'deals',
        label: '🔥 New Deals Added:',
        value: `${ticker.activeDeals}`,
        valueColor: 'text-orange-300',
      });
      list.push({
        key: 'avg',
        label: '🍃 SavrLeaf Avg Savings Today:',
        value: `${ticker.avgDiscount.toFixed(1)}%`,
        valueColor: 'text-green-400',
      });
      if (ticker.maxDiscount > 0) {
        list.push({
          key: 'max',
          label: '📉 Biggest Drop Today:',
          value: `${ticker.maxDiscount}% off`,
          valueColor: 'text-yellow-400',
        });
      }
    }

    if (cryptoPrices) {
      const btcSign = cryptoPrices.btc.change >= 0 ? '▲' : '▼';
      const ethSign = cryptoPrices.eth.change >= 0 ? '▲' : '▼';
      const btcColor = cryptoPrices.btc.change >= 0 ? 'text-green-400' : 'text-red-400';
      const ethColor = cryptoPrices.eth.change >= 0 ? 'text-green-400' : 'text-red-400';

      list.push({
        key: 'btc',
        label: '₿ BTC:',
        value: `$${Math.round(cryptoPrices.btc.price).toLocaleString()} ${btcSign}${Math.abs(cryptoPrices.btc.change).toFixed(1)}%`,
        valueColor: btcColor,
      });
      list.push({
        key: 'eth',
        label: 'Ξ ETH:',
        value: `$${Math.round(cryptoPrices.eth.price).toLocaleString()} ${ethSign}${Math.abs(cryptoPrices.eth.change).toFixed(1)}%`,
        valueColor: ethColor,
      });
    }

    return list;
  }, [ticker, cryptoPrices]);

  // Mobile: auto-rotate every 4s
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  // Build the marquee string for desktop (items repeated for seamless loop)
  const marqueeItems = [...items, ...items];

  return (
    <div className="bg-gray-950 border-b border-gray-800 text-white w-full overflow-hidden" style={{ height: '36px' }}>

      {/* Desktop: continuous marquee scroll */}
      <div className="hidden md:flex items-center h-full">
        <div className="flex animate-ticker whitespace-nowrap">
          {marqueeItems.map((item, i) => (
            <span key={`${item.key}-${i}`} className="inline-flex items-center gap-1.5 mx-8 text-xs font-medium">
              <span className="text-gray-400">{item.label}</span>
              {item.value && (
                <span className={`font-bold ${item.valueColor || 'text-white'}`}>{item.value}</span>
              )}
              <span className="text-gray-700 mx-2">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* Mobile: fade rotation */}
      <div className="flex md:hidden items-center justify-center h-full px-4">
        {items.map((item, i) => (
          <span
            key={item.key}
            className={`absolute flex items-center gap-1.5 text-xs font-medium transition-opacity duration-500 ${
              i === mobileIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-gray-400">{item.label}</span>
            {item.value && (
              <span className={`font-bold ${item.valueColor || 'text-white'}`}>{item.value}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

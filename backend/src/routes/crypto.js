import { Router } from 'express';

const router = Router();

let cache = { data: null, ts: 0 };
const CACHE_TTL = 60_000;

router.get('/prices', async (_req, res) => {
  try {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      return res.json(cache.data);
    }

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
    );
    const raw = await response.json();

    if (!raw.bitcoin?.usd || !raw.ethereum?.usd) {
      return res.status(502).json({ success: false, message: 'Upstream data unavailable' });
    }

    const payload = {
      success: true,
      btc: { price: raw.bitcoin.usd, change: raw.bitcoin.usd_24h_change ?? 0 },
      eth: { price: raw.ethereum.usd, change: raw.ethereum.usd_24h_change ?? 0 },
    };

    cache = { data: payload, ts: Date.now() };
    res.json(payload);
  } catch (err) {
    console.error('Crypto proxy fetch failed:', err);
    res.status(502).json({ success: false, message: 'Failed to fetch crypto prices' });
  }
});

export default router;

import express from 'express';
import SubscriptionTier from '../models/SubscriptionTier.js';

const router = express.Router();

// GET /subscription-tiers
router.get('/', async (req, res) => {
  try {
    const tiers = await SubscriptionTier.find();
    res.status(200).json(tiers);
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    res.status(500).json({ error: 'Failed to load subscription tiers' });
  }
});

export default router;

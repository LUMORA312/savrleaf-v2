import express from 'express';
import Subscription from '../models/Subscription.js';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

//create subscription
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { user, tier, status, startDate, metadata } = req.body;
    console.log('Creating subscription:', user, tier, status, startDate, metadata);
    if (!user || !tier || !status || !startDate || !metadata) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const subscription = await Subscription.create({ user, tier, status, startDate, metadata });
    res.status(201).json(subscription);
  } catch (err) {
    console.error('Error creating subscription:', err);
    res.status(400).json({ error: 'Failed to create subscription' });
  }
});

router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminSkuOverride } = req.body;

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { adminSkuOverride },
      { new: true, runValidators: true }
    )
      .populate('tier')
      .lean();

    if (!updatedSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(updatedSubscription);
  } catch (err) {
    console.error('Failed to update subscription:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

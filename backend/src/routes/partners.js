import express from 'express';
import User from '../models/User.js';
import Deal from '../models/Deal.js';
import Dispensary from '../models/Dispensary.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: 'subscription',
        populate: { path: 'tier' }
      })
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isActive) {
      return res.status(403).json({ message: 'User is deactivated. Contact support.' });
    }

    // Get dispensaries owned by user
    const dispensaries = await Dispensary.find({ user: userId }).lean();
    const dispensaryIds = dispensaries.map((d) => d._id);

    // Get deals for those dispensaries
    const deals = await Deal.find({ dispensary: { $in: dispensaryIds } }).lean();

    const totalDeals = deals.length;
    const totalDispensaries = dispensaries.length;
    const activeDeals = deals.filter(
      (deal) => new Date(deal.startDate) <= new Date() && new Date(deal.endDate) >= new Date()
    ).length;

    // Subscription calculations
    const subscription = user.subscription || null;
    let maxSKUs = 0;

    if (subscription?.tier) {
      const baseLimit = subscription.tier.baseSKULimit || 0;
      const bonus = subscription.bonusSkus || 0;
      const adminAdditions = subscription.adminSkuOverride || 0;
      maxSKUs = baseLimit + bonus + adminAdditions;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscription,
        maxSKUs,
        usedSKUs: totalDeals
      },
      overview: {
        totalDeals,
        totalDispensaries,
        activeDeals,
        isUserActive: user.isActive,
      },
      dispensaries,
      deals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

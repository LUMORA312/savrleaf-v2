import express from 'express';
import User from '../models/User.js';
import Deal from '../models/Deal.js';
import Dispensary from '../models/Dispensary.js';
import Application from '../models/Application.js';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalDeals = await Deal.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalDispensaries = await Dispensary.countDocuments();
    const totalApplications = await Application.countDocuments();

    const applications = await Application.find().lean();

    res.json({
      overview: { totalDeals, totalUsers, totalDispensaries, totalApplications },
      users: await User.find().lean(),
      deals: await Deal.find().lean(),
      dispensaries: await Dispensary.find().lean(),
      applications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

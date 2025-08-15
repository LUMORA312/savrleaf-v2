import express from 'express';
import User from '../models/User.js';
import Deal from '../models/Deal.js';
import Dispensary from '../models/Dispensary.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const adminMiddleware = (req, res, next) => {
  console.log(req.user)
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: admins only' });
  }
  next();
};

router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalDeals = await Deal.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalDispensaries = await Dispensary.countDocuments();

    res.json({
      overview: { totalDeals, totalUsers, totalDispensaries },
      users: await User.find().lean(),
      deals: await Deal.find().lean(),
      dispensaries: await Dispensary.find().lean(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

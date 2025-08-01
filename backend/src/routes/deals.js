import express from 'express';
import Deal from '../models/Deal.js';

const router = express.Router();

router.get('/', async (req, res) => {
  console.log("HIT");
  try {
    const deals = await Deal.find({})
      .populate('dispensary');

    res.status(200).json(deals);
  } catch (err) {
    console.error('Error fetching deals:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

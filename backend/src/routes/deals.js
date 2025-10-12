import express from 'express';
import Deal from '../models/Deal.js';
import Dispensary from '../models/Dispensary.js';
import { getDistanceFromCoords } from '../utils/geocode.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      category,
      priceRange,
      brand,
      search,
      lat,
      lng,
      distance = 25, // miles
      sortBy = 'distance',
      limit = 50,
      page = 1,
      dispensaryId
    } = req.query;

    const filters = {};
    if (dispensaryId) {
      filters.dispensary = dispensaryId;
    }
    if (category) filters.category = category;
    if (brand) filters.brand = brand;

    if (priceRange) {
      if (priceRange.includes('+')) {
        const minPrice = Number(priceRange.replace('+', ''));
        filters.salePrice = { $gte: minPrice };
      } else {
        const [min, max] = priceRange.split('-').map(Number);
        filters.salePrice = { $gte: min, $lte: max };
      }
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    let dispensaryIds;
    if (lat && lng) {
      const distanceMeters = Number(distance) * 1609.34;

      const nearbyDispensaries = await Dispensary.find({
        coordinates: {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: distanceMeters,
          },
        },
      }).select('_id');

      dispensaryIds = nearbyDispensaries.map((d) => d._id);

      filters.dispensary = { $in: dispensaryIds };
    }

    const perPage = Math.min(Number(limit), 100);
    const currentPage = Math.max(Number(page), 1);
    const skip = (currentPage - 1) * perPage;

    let query = Deal.find(filters).skip(skip).limit(perPage).populate('dispensary');

    if (sortBy === 'price_asc') {
      query = query.sort({ salePrice: 1 });
    } else if (sortBy === 'price_desc') {
      query = query.sort({ salePrice: -1 });
    } else if (sortBy !== 'distance') {
      query = query.sort({ createdAt: -1 });
    }

    const deals = await query.exec();

    let sortedDeals = deals;
    if (sortBy === 'distance' && lat && lng) {
      const userCoord = [Number(lng), Number(lat)];

      sortedDeals = deals.slice().sort((a, b) => {
        const aCoord = a.dispensary?.coordinates?.coordinates || [0, 0];
        const bCoord = b.dispensary?.coordinates?.coordinates || [0, 0];

        const aDist = getDistanceFromCoords(userCoord, aCoord);
        const bDist = getDistanceFromCoords(userCoord, bCoord);

        return aDist - bDist;
      });
    }

    const countFilters = { ...filters };
    const totalCount = await Deal.countDocuments(countFilters);

    res.json({
      success: true,
      deals: sortedDeals,
      pagination: {
        total: totalCount,
        page: currentPage,
        pages: Math.ceil(totalCount / perPage),
        perPage,
      },
    });
  } catch (err) {
    console.error('Error fetching filtered deals:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user._id; // auth middleware sets this
    const user = await User.findById(userId).populate({
      path: 'dispensaries subscription',
      populate: { path: 'tier' }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.subscription) return res.status(400).json({ success: false, message: 'No subscription found for partner' });

    const dispensaryIds = user.dispensaries.map(d => d._id);

    const dealCount = await Deal.countDocuments({ dispensary: { $in: dispensaryIds } });

    const baseLimit = user.subscription.tier?.baseSKULimit || 0;
    const bonusSkus = user.subscription.bonusSkus || 0;
    const adminBonusSkus = user.subscription.adminBonusSkus || 0;

    const maxLimit = baseLimit + bonusSkus + adminBonusSkus;

    if (dealCount >= maxLimit) {
      return res.status(400).json({
        success: false,
        message: `Deal limit reached for your subscription tier. You can only create ${maxLimit} deals (current: ${dealCount})`
      });
    }

    const {
      title,
      description,
      originalPrice,
      salePrice,
      category,
      brand,
      startDate,
      endDate,
      accessType,
      tags,
      dispensary,
      images
    } = req.body;

    const newDeal = new Deal({
      title,
      description,
      originalPrice,
      salePrice,
      category,
      brand,
      startDate,
      endDate,
      accessType,
      tags,
      dispensary,
      images
    });

    const savedDeal = await newDeal.save();
    res.status(201).json({ success: true, deal: savedDeal });

  } catch (err) {
    console.error('Error creating deal:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedDeal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedDeal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    res.json({ success: true, deal: updatedDeal });
  } catch (err) {
    console.error('Error updating deal:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedDeal = await Deal.findByIdAndDelete(req.params.id);

    if (!deletedDeal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (err) {
    console.error('Error deleting deal:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;

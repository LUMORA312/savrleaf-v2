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

export default router;

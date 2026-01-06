import express from 'express';
import User from '../models/User.js';
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
      title,
      search,
      lat,
      lng,
      distance = 25, // miles
      sortBy = 'distance',
      limit = 50,
      page = 1,
      dispensaryId,
      accessType,
      thcMin,
      thcMax,
      strain
    } = req.query;

    const filters = {};
    
    // Handle location-based filtering first
    let nearbyDispensaryIds = null;
    if (lat && lng && distance) {
      const distanceMeters = Number(distance) * 1609.34;

      const nearbyDispensaries = await Dispensary.find({
        coordinates: {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: distanceMeters,
          },
        },
      }).select('_id');
      nearbyDispensaryIds = nearbyDispensaries.map((d) => d._id.toString());
      if (nearbyDispensaryIds.length === 0) {
        // No dispensaries in range, return empty results
        filters.dispensary = { $in: [] };
      }
    }
    // Apply dispensary filter (either specific ID or nearby ones)
    if (nearbyDispensaryIds && nearbyDispensaryIds.length > 0) {
      if (dispensaryId) {
        // Check if specific dispensary is in range
        if (nearbyDispensaryIds.includes(dispensaryId.toString())) {
          filters.dispensary = dispensaryId;
        } else {
          // Specific dispensary is not in range, return empty
          filters.dispensary = { $in: [] };
        }
      } else {
        // Filter by nearby dispensaries
        filters.dispensary = { $in: nearbyDispensaryIds };
      }
    } else if (dispensaryId && (!lat || !lng || !distance)) {
      // Only apply specific dispensary filter if location filtering is not active
      filters.dispensary = dispensaryId;
    }

    // Other filters
    if (category) filters.category = category;
    if (brand) filters.brand = { $regex: brand, $options: 'i' };
    if (title) filters.title = { $regex: title, $options: 'i' };
    if (accessType) filters.accessType = accessType;

    // THC Content filter
    if (thcMin !== undefined || thcMax !== undefined) {
      filters.thcContent = {};
      if (thcMin !== undefined) filters.thcContent.$gte = Number(thcMin);
      if (thcMax !== undefined) filters.thcContent.$lte = Number(thcMax);
    }

    // Strain filter
    if (strain) {
      filters.strain = strain;
    }

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
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
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

    sortedDeals = sortedDeals
    .map(deal => deal.toObject())  // plain object
    .map(deal => ({
      ...deal,
      active:
        deal.manuallyActivated ||
        (new Date(deal.startDate) <= new Date() &&
         new Date(deal.endDate) >= new Date())
    }));


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
      images,
      userId,
      strain,
      thcContent,
      subcategory,
      descriptiveKeywords
    } = req.body;

    // const user = await User.findById(userId)
    //   .populate({
    //     path: 'subscription',
    //     populate: { path: 'tier' },
    //     strictPopulate: false
    //   })
    //   .populate('dispensaries');


    // if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // if (!user.subscription) return res.status(400).json({ success: false, message: 'No subscription found for partner' });

    // const dispensaryIds = user.dispensaries.map(d => d._id);

    // const dealCount = await Deal.countDocuments({ dispensary: { $in: dispensaryIds } });

    // const baseLimit = user.subscription.tier?.baseSKULimit || 0;
    // const bonusSkus = user.subscription.bonusSkus || 0;
    // const adminBonusSkus = user.subscription.adminBonusSkus || 0;

    // const maxLimit = baseLimit + bonusSkus + adminBonusSkus;


    const dispensaryObject = await Dispensary.findById(dispensary);
    if (!dispensaryObject) {
      return res.status(404).json({ success: false, message: 'Dispensary not found' });
    }
    if (dispensaryObject.usedSkus >= dispensaryObject.skuLimit + dispensaryObject.additionalSkuLimit) {
      return res.status(400).json({ success: false, message: 'Deal limit reached' });
    }

    // if (dealCount >= maxLimit) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Deal limit reached for your subscription tier. You can only create ${maxLimit} deals (current: ${dealCount})`
    //   });
    // }

    const newDeal = new Deal({
      title,
      description,
      originalPrice,
      salePrice,
      category,
      subcategory,
      brand,
      startDate,
      endDate,
      accessType,
      tags,
      dispensary,
      images,
      strain,
      thcContent,
      descriptiveKeywords: descriptiveKeywords || [],
      isActive: true
    });

    const savedDeal = await newDeal.save();
    await savedDeal.populate('dispensary');
    dispensaryObject.usedSkus += 1;
    await dispensaryObject.save();
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
    }).populate("dispensary");

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
    const dispensary = await Dispensary.findById(deletedDeal.dispensary);
    if (dispensary) {
      dispensary.usedSkus -= 1;
      await dispensary.save();
    }

    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (err) {
    console.error('Error deleting deal:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;

import express from 'express';
import Dispensary from '../models/Dispensary.js';
import { getDistanceFromCoords } from '../utils/geocode.js';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware.js';
import Subscription from '../models/Subscription.js';
import SubscriptionTier from '../models/SubscriptionTier.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      search,
      lat,
      lng,
      distance = 25, // miles
      limit = 50,
      page = 1,
      sortBy = 'createdAt',
      status,
    } = req.query;

    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { legalName: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } },
      ];
    }

    const perPage = Math.min(Number(limit), 100);
    const currentPage = Math.max(Number(page), 1);
    const skip = (currentPage - 1) * perPage;

    let query;

    if (lat && lng) {
      const distanceMeters = Number(distance) * 1609.34;

      query = Dispensary.find({
        ...filters,
        coordinates: {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: distanceMeters,
          },
        },
      });
    } else {
      query = Dispensary.find(filters);
    }

    query = query.skip(skip).limit(perPage);

    if (sortBy === 'distance' && lat && lng) {
      // MongoDB will sort by distance automatically with $nearSphere
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const dispensaries = await query.exec();

    let sortedDispensaries = dispensaries;

    if (sortBy === 'distance' && lat && lng && !query.options.sort) {
      const userCoord = [Number(lng), Number(lat)];
      sortedDispensaries = dispensaries.slice().sort((a, b) => {
        const aCoord = a.coordinates?.coordinates || [0, 0];
        const bCoord = b.coordinates?.coordinates || [0, 0];
        const aDist = getDistanceFromCoords(userCoord, aCoord);
        const bDist = getDistanceFromCoords(userCoord, bCoord);
        return aDist - bDist;
      });
    }

    const totalCount = await Dispensary.countDocuments(filters);

    res.json({
      success: true,
      dispensaries: sortedDispensaries,
      pagination: {
        total: totalCount,
        page: currentPage,
        pages: Math.ceil(totalCount / perPage),
        perPage,
      },
    });
  } catch (err) {
    console.error('Error fetching dispensaries:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const dispensaries = await Dispensary.find({ user: req.user._id });

    if (!dispensaries || dispensaries.length === 0) {
      return res.status(404).json({ message: 'Dispensary not found for this user' });
    }

    res.json(dispensaries);
  } catch (err) {
    console.error('Error in /dispensaries/my:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const dispensary = await Dispensary.findById(id).populate('application');
    if (!dispensary) return res.status(404).json({ message: 'Dispensary not found' });

    dispensary.status = status;
    dispensary.isActive = status === 'approved';
    await dispensary.save();

    if (dispensary.application) {
      dispensary.application.status = status === 'pending' ? 'pending' : status;
      await dispensary.application.save();
    }

    res.json({ success: true, dispensary, application: dispensary.application });
  } catch (err) {
    console.error('Error updating dispensary status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//add dispensary
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, address, type, licenseNumber, websiteUrl, hours, phoneNumber, description, amenities, logo, images, adminNotes, ratings, userId, accessType } = req.body;

    // If an admin is creating a dispensary on behalf of a partner, allow passing userId
    const user = (req.user.role === 'admin' && userId) ? userId : req.user._id;

    const dispensary = await Dispensary.create({
      name,
      address,
      type,
      licenseNumber,
      websiteUrl,
      hours,
      phoneNumber,
      description,
      amenities,
      logo,
      images,
      user,
      adminNotes,
      ratings,
      type: 'additional',
      accessType: accessType || 'medical/recreational'
    });
    //create subscription
    // const subscriptionTier = await SubscriptionTier.findOne({ name: 'additional_location' });
    // const subscription = await Subscription.create({ user, tier: subscriptionTier._id, status: 'pending', startDate: new Date(), metadata: { source: 'dispensary_addition' } });
    // dispensary.subscription = subscription._id;
    await dispensary.save();
    res.status(201).json({ success: true, dispensary });
  } catch (err) {
    console.error('Error adding dispensary:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//check purchased this 
router.get('/:id/purchase-status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const dispensary = await Dispensary.findById(id).populate('subscription');
    if (!dispensary) return res.status(404).json({ message: 'Dispensary not found' });
    res.json({ isActive: dispensary.isActive, skuLimit: dispensary.skuLimit, status: dispensary.status });
  }
  catch (err) {
    console.error('Error checking purchase status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//add extra limit
router.post('/:id/add-sku-limit', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const dispensary = await Dispensary.findById(id);
    if (!dispensary) return res.status(404).json({ message: 'Dispensary not found' });
    dispensary.additionalSkuLimit += 1;
    await dispensary.save();
    res.json({ success: true, dispensary, message: 'SKU limit added successfully' });
  } catch (err) {
    console.error('Error adding SKU limit:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//update dispensary extraLimit (admin only)
router.patch('/:id/extra-limit', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { extraLimit } = req.body;

    if (extraLimit === undefined || extraLimit === null) {
      return res.status(400).json({ success: false, message: 'extraLimit is required' });
    }

    if (typeof extraLimit !== 'number' || extraLimit < 0) {
      return res.status(400).json({ success: false, message: 'extraLimit must be a non-negative number' });
    }

    const dispensary = await Dispensary.findById(id);
    if (!dispensary) {
      return res.status(404).json({ success: false, message: 'Dispensary not found' });
    }

    dispensary.extraLimit = extraLimit;
    await dispensary.save();

    res.json({ success: true, dispensary });
  } catch (err) {
    console.error('Error updating dispensary extraLimit:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//update dispensary
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      legalName,
      address,
      licenseNumber,
      websiteUrl,
      hours,
      phoneNumber,
      description,
      amenities,
      logo,
      images,
      accessType,
    } = req.body;

    const dispensary = await Dispensary.findById(id);
    if (!dispensary) {
      return res.status(404).json({ success: false, message: 'Dispensary not found' });
    }

    // // Check if user owns this dispensary
    // if (dispensary.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: 'Unauthorized to edit this dispensary' });
    // }

    // Update fields
    if (name) dispensary.name = name;
    if (legalName) dispensary.legalName = legalName;
    if (address) dispensary.address = address;
    if (licenseNumber) dispensary.licenseNumber = licenseNumber;
    if (websiteUrl !== undefined) dispensary.websiteUrl = websiteUrl;
    if (hours !== undefined) dispensary.hours = hours;
    if (phoneNumber !== undefined) dispensary.phoneNumber = phoneNumber;
    if (description !== undefined) dispensary.description = description;
    if (amenities !== undefined) dispensary.amenities = amenities;
    if (logo !== undefined) dispensary.logo = logo;
    if (images !== undefined) dispensary.images = images;
    if (accessType !== undefined) dispensary.accessType = accessType;

    await dispensary.save();

    res.json({ success: true, dispensary });
  } catch (err) {
    console.error('Error updating dispensary:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;

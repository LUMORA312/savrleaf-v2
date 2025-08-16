import express from 'express';
import Dispensary from '../models/Dispensary.js';
import { getDistanceFromCoords } from '../utils/geocode.js';
import authMiddleware from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

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

router.post('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const dispensary = await Dispensary.findById(id);
    if (!dispensary) {
      return res.status(404).json({ message: 'Dispensary not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    dispensary.status = status;
    await dispensary.save();

    res.json({ success: true, dispensary });
  } catch (err) {
    console.error('Error updating dispensary status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;

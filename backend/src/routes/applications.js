import express from 'express';
import bcrypt from 'bcryptjs';
import Application from '../models/Application.js';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    dispensaryName,
    legalName,
    address,
    licenseNumber,
    phoneNumber,
    websiteUrl,
    description,
    amenities,
    subscriptionTier
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const application = new Application({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dispensaryName,
      legalName,
      address,
      licenseNumber,
      phoneNumber,
      websiteUrl,
      description,
      amenities,
      subscriptionTier,
    });

    await application.save();

    res.status(201).json({ message: 'Application submitted' });
  } catch (error) {
    console.error(error);

    if (error.code === 11000 && error.keyValue?.email) {
      return res.status(400).json({ error: `Email ${error.keyValue.email} is already in use.` });
    }

    res.status(400).json({ error: 'Error submitting application' });
  }
});

router.post('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    app.status = 'approved';
    await app.save();

    // TO DO: IMPLEMENT PAYMENT
    // sendEmail(app.email, 'Your application is approved! Proceed with payment.');

    res.json({ message: 'Application approved', application: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    app.status = 'rejected';
    await app.save();

    // TO DO: IMPLEMENT PAYMENT & EMAIL
    // sendEmail(app.email, 'Your application has been rejected.');

    res.json({ message: 'Application rejected', application: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

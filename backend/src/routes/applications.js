import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Application from '../models/Application.js';
import Dispensary from '../models/Dispensary.js';
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
    // 1️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ Create Application
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
      status: 'pending',
    });
    await application.save();

    // 3️⃣ Create User immediately but inactive
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'partner',
        isActive: false, // cannot log in until payment
      });
    }

    // 4️⃣ Create pending subscription (Stripe session later)
    const subscription = await Subscription.create({
      user: user._id,
      tier: subscriptionTier,
      status: 'pending', // waiting for Stripe payment
      startDate: new Date(),
      metadata: { source: 'application_submission' },
    });
    user.subscription = subscription._id;
    await user.save();

    // ✅ Return subscription ID for frontend Stripe integration
    res.status(201).json({
      message: 'Application submitted. User created. Proceed to payment.',
      application,
      user,
      subscriptionId: subscription._id, // 👈 important
    });

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
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.status === 'approved') {
      return res.status(400).json({ message: 'Already approved' });
    }

    // Find the associated user
    const user = await User.findOne({ email: application.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found for this application' });
    }

    // Update application status
    application.status = 'approved';
    await application.save();

    // ✅ Create Dispensary if not already exists
    let dispensary = await Dispensary.findOne({ application: application._id });
    if (!dispensary) {
      dispensary = await Dispensary.create({
        name: application.dispensaryName,
        legalName: application.legalName,
        address: {
          street1: application.address.street1,
          street2: application.address.street2,
          city: application.address.city,
          state: application.address.state,
          zipCode: application.address.zipCode,
        },
        licenseNumber: application.licenseNumber,
        websiteUrl: application.websiteUrl,
        phoneNumber: application.phoneNumber,
        description: application.description,
        amenities: application.amenities,
        user: user._id,
        application: application._id,
        status: 'approved',
      });
    }

    res.json({
      message: 'Application approved and dispensary created',
      application,
      dispensary,
    });
  } catch (err) {
    console.error('Error approving application:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    const user = await User.findOne({ email: app.email });
    const dispensary = await Dispensary.findOne({ application: app._id });

    app.status = 'rejected';
    await app.save();

    if (dispensary) {
      dispensary.status = 'rejected';
      await dispensary.save();
    }

    if (user) {
      user.isActive = false;
      await user.save();
    }

    res.json({ message: 'Application, user, and dispensary rejected', application: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

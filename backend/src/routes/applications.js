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
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status === 'approved') return res.status(400).json({ message: 'Already approved' });

    // 1️⃣ Create User if not exists
    let user = await User.findOne({ email: application.email });
    if (!user) {
      user = await User.create({
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        password: application.password,
        role: 'partner',
        isActive: true
      });
    } else {
      user.isActive = true;
      await user.save();
    }

    // 2️⃣ Create Dispensary for this application
    const dispensary = await Dispensary.create({
      name: application.dispensaryName,
      legalName: application.legalName,
      address: application.address,
      licenseNumber: application.licenseNumber,
      status: 'approved',
      application: application._id,
      user: user._id,
      phoneNumber: application.phoneNumber,
      websiteUrl: application.websiteUrl,
      description: application.description,
      amenities: application.amenities,
      adminNotes: 'Created on approval',
    });

    // 3️⃣ Add dispensary to user's array
    user.dispensaries = user.dispensaries || [];
    user.dispensaries.push(dispensary._id);
    await user.save();

    // 4️⃣ Attach subscription (optional for now, Stripe later)
    if (!user.subscription) {
      const subscriptionTier = application.subscriptionTier;
      if (subscriptionTier) {
        const subscription = await Subscription.create({
          user: user._id,
          tier: subscriptionTier,
          status: 'pending', // will be activated after Stripe payment
          startDate: new Date(),
          currentPeriodEnd: new Date(),
          metadata: { source: 'admin approval' },
        });
        user.subscription = subscription._id;
        await user.save();
      }
    }

    // 5️⃣ Approve application
    application.status = 'approved';
    await application.save();

    res.json({ message: 'Application approved and user created', user, dispensary });
  } catch (err) {
    console.error(err);
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

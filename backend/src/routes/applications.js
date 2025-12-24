import express from 'express';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Application from '../models/Application.js';
import Dispensary from '../models/Dispensary.js';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware.js';
import { generateActivationToken, generateActivationLink, sendActivationLink } from '../utils/user.js';
const router = express.Router();

router.post('/', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    dispensaryName,
    address,
    licenseNumber,
    phoneNumber,
    websiteUrl,
    description,
    amenities,
    subscriptionTier,
    accessType,
    additionalLocationsCount,
  } = req.body;

  try {
    // 1️⃣ Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ Create Application
    const application = new Application({
      firstName,
      lastName,
      email,
      password,
      dispensaryName,
      address,
      licenseNumber,
      phoneNumber,
      websiteUrl,
      description,
      amenities,
      subscriptionTier,
      accessType,
      additionalLocationsCount,
      status: 'pending',
    });
    await application.save();

    // 3️⃣ Create User immediately but inactive
    const activationToken = generateActivationToken();
    const activationLink = generateActivationLink(activationToken);
    console.log("activationLink", activationLink);
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName,
        lastName,
        email,
        password,
        activationToken,
        expirationTime: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
        role: 'partner',
        isActive: false, // cannot log in until payment
        isActiveByLink: false,
        firstLogin: true,
      });
    }else{
      return res.status(400).json({ error: `User already exists.` });
    }

    // 4️⃣ Create pending subscription (Stripe session later)
    const subscription = await Subscription.create({
      user: user._id,
      tier: subscriptionTier,
      status: 'pending', // waiting for Stripe payment
      startDate: new Date(),
      metadata: { source: 'application_submission' },
      additionalLocationsCount: additionalLocationsCount,
    });

    const dispensary = await Dispensary.create({
      name: dispensaryName,
      address: address,
      licenseNumber: licenseNumber,
      phoneNumber: phoneNumber,
      websiteUrl: websiteUrl,
      description: description,
      amenities: amenities,
      status: 'pending',
      application: application._id,
      user: user._id,
      subscription: subscription._id,
      accessType: accessType,
      additionalLocationsCount: additionalLocationsCount,
    });
    await dispensary.save();

    user.subscription = subscription._id;
    await user.save();
    
    // Send activation email
    try {
        await sendActivationLink(email, activationLink);
    } catch (emailError) {
        console.error('Failed to send activation email:', emailError);
        // Continue even if email fails - user can request resend
    }
    
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

    // Check if payment has been completed (subscription should be active)
    const subscription = await Subscription.findOne({ user: user._id });
    if (!subscription || subscription.status !== 'active') {
      return res.status(400).json({ 
        message: 'Payment not completed. Cannot approve application until payment is received.' 
      });
    }

    // Update application status
    application.status = 'approved';
    await application.save();

    // Activate user
    user.isActive = true;
    await user.save();

    const additionalLocationsCount = application.additionalLocationsCount || 0;
    const accessType = application.accessType || 'both';
    const totalLocations = 1 + additionalLocationsCount; // 1 main + additional
    const createdDispensaries = [];

    // Delete any existing dispensaries for this application (cleanup)
    await Dispensary.deleteMany({ application: application._id });

    // Create all locations: 1 main + additionalLocationsCount additional
    for (let i = 0; i < totalLocations; i++) {
      const isMain = i === 0;
      const locationNumber = !isMain ? ` - Location ${i + 1}` : '';
      const dispensaryName = !isMain 
        ? `${application.dispensaryName}${locationNumber}`
        : application.dispensaryName;

      const dispensary = await Dispensary.create({
        name: dispensaryName,
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
        skuLimit: 15, // Each location gets 15 SKUs
        isActive: true,
        isPurchased: true,
        type: isMain ? 'main' : 'additional',
        usedSkus: 0,
        extraLimit: 0,
        additionalSkuLimit: 0,
        subscription: subscription._id,
      });

      createdDispensaries.push(dispensary);
    }

    res.json({
      message: `Application approved. Created ${totalLocations} location(s) (1 main + ${additionalLocationsCount} additional) with 15 SKUs each. Access type: ${accessType}.`,
      application,
      dispensaries: createdDispensaries,
      count: createdDispensaries.length,
      accessType,
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

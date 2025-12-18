import express from 'express';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Dispensary from '../models/Dispensary.js';
import { generateActivationToken, generateActivationLink, saveActivationToken, sendActivationLink } from '../utils/user.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

  try {
    const { email, firstName, lastName } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exist' });
    }

    const activationToken = generateActivationToken();
    const activationLink = generateActivationLink(activationToken) + "&inviteByAdmin=true";
    console.log("activationLink", activationLink);

    user = await User.create({
      firstName,
      lastName,
      email,
      role: 'partner',
      isActive: true, // cannot log in until payment
      isActiveByLink: false,
      firstLogin: true,
      activationToken,
      expirationTime: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
    });

    // Send activation email
    try {
      await sendActivationLink(email, activationLink);
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError);
      // Continue even if email fails - user can request resend
    }

    return res.status(200).json({
      message: 'User created.',
      user,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/:id/status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log("status", status)
    console.log("user", user)
    user.isActive = status === 'active';
    await user.save();
    console.log("user", user)

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/:id/allow-multiple-locations', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    const { id } = req.params;
    const { allowMultipleLocations } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.allowMultipleLocations = allowMultipleLocations;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//set first login to false
router.post('/:email/first-login', authMiddleware, async (req, res) => {
  if (req.user.role !== 'partner' || req.user.email !== req.params.email) return res.status(403).json({ message: 'Not authorized' });

  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.firstLogin = false;
  await user.save();
  res.json({ success: true, user });
});

//check subscription status 
router.get('/:id/subscription-status', authMiddleware, async (req, res) => {

  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const subscription = await Subscription.findById(user.subscription);
    console.log('subscription', user.subscription);
    res.json({ success: true, status: subscription?.status, skuCount: subscription?.skuCount });
  } catch (err) {
    console.error('Failed to fetch subscription status:', err);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

//update user info
router.post('/:id/update-user-info', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, mainDispensary, subscription } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.firstName = firstName;
    user.lastName = lastName;
    await user.save();
    const dispensary = await Dispensary.findOne({ user: user._id });
    if (!dispensary) {
      const newDispensary = await Dispensary.create({
        name: mainDispensary.name,
        legalName: mainDispensary.legalName,
        address: mainDispensary.address,
        licenseNumber: mainDispensary.licenseNumber,
        phoneNumber: mainDispensary.phoneNumber,
        websiteUrl: mainDispensary.websiteUrl,
        description: mainDispensary.description,
        amenities: mainDispensary.amenities,
        logo: mainDispensary.logo,
        images: mainDispensary.images,
        status: 'pending',
        user: user._id,
        application: null,
        adminNotes: '',
        ratings: [],
        skuLimit: 0,
        isActive: false,
        subscription: subscription ? subscription : null,
      });
    } else {
      dispensary.name = mainDispensary.name;
      dispensary.legalName = mainDispensary.legalName;
      dispensary.address = mainDispensary.address;
      dispensary.licenseNumber = mainDispensary.licenseNumber;
      dispensary.phoneNumber = mainDispensary.phoneNumber;
      dispensary.websiteUrl = mainDispensary.websiteUrl;
      dispensary.description = mainDispensary.description;
      dispensary.amenities = mainDispensary.amenities;
      dispensary.logo = mainDispensary.logo;
      dispensary.images = mainDispensary.images;
      dispensary.status = 'pending';
      dispensary.application = null;
      dispensary.adminNotes = '';
      dispensary.ratings = [];
      dispensary.skuLimit = 0;
      dispensary.isActive = false;
      await dispensary.save();
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Failed to update user info:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
export default router;

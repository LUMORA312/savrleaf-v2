import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

const envFileName = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(process.cwd(), envFileName);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Failed to load env file:', result.error);
  process.exit(1);
} else {
  console.log('Env loaded');
}

import User from '../src/models/User.js';
import Application from '../src/models/Application.js';
import Deal from '../src/models/Deal.js';
import Dispensary from '../src/models/Dispensary.js';
import Subscription from '../src/models/Subscription.js';
import SubscriptionTier from '../src/models/SubscriptionTier.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear collections
  await Promise.all([
    User.deleteMany(),
    Application.deleteMany(),
    Deal.deleteMany(),
    Dispensary.deleteMany(),
    Subscription.deleteMany(),
    SubscriptionTier.deleteMany(),
  ]);

  const adminUser = new User({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  });
  await adminUser.save();

  const application = new Application({
    firstName: 'Partner',
    lastName: 'User',
    email: 'partner@example.com',
    password: 'password123',
    dispensaryName: 'Green Leaf Dispensary',
    legalName: 'Green Leaf LLC',
    address: {
      street1: '123 Bud Lane',
      street2: '',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
    licenseNumber: 'ABC123456',
    phoneNumber: '+1234567890',
    websiteUrl: 'https://greenleaf.example.com',
    description: 'A quality dispensary',
    amenities: ['Parking', 'Wheelchair Accessible'],
    status: 'approved',
    adminNotes: 'Seed data',
  });
  await application.save();

  const partnerUser = new User({
    firstName: 'Partner',
    lastName: 'User',
    email: 'partner@example.com',
    password: 'password123',
    role: 'partner',
  });
  await partnerUser.save();

  const tier = new SubscriptionTier({
    name: 'gold',
    displayName: 'Gold Tier',
    tier: 2,
    monthlyPrice: 29.99,
    annualPrice: 299.99,
    baseSKULimit: 10,
    features: [
      "Up to 10 active deals",
      "Deal Management"
    ]
  });
  await tier.save();

  const dispensary = new Dispensary({
    name: application.dispensaryName,
    legalName: application.legalName,
    address: application.address,
    licenseNumber: application.licenseNumber,
    status: 'approved',
    application: application._id,
    user: partnerUser._id,
    phoneNumber: application.phoneNumber,
    websiteUrl: application.websiteUrl,
    description: application.description,
    amenities: application.amenities,
    adminNotes: 'Created from seed',
  });
  await dispensary.save();

  const subscription = new Subscription({
    dispensary: dispensary._id,
    tier: tier._id,
    stripeSubscriptionId: 'sub_1234567890abcdef',
    stripeCustomerId: 'cus_1234567890abcdef',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    billingInterval: 'month',
    bonusSkus: 2,
    metadata: { source: 'seed script' },
  });
  await subscription.save();

  dispensary.subscription = subscription._id;
  await dispensary.save();

  const deal = new Deal({
    title: 'Buy 1 Get 1 Free Flower',
    description: 'Happy Hour Special: 4pm - 7pm daily',
    brand: 'High Spirits',
    category: 'flower',
    subcategory: 'indica',
    strain: 'OG Kush',
    thcContent: 22,
    cbdContent: 0.5,
    tags: ['happy hour', 'bogo', 'flower'],
    originalPrice: 20,
    salePrice: 10,
    images: ['https://example.com/deal-image.jpg'],
    dispensary: dispensary._id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    accessType: 'both',
    manuallyActivated: false,
  });
  await deal.save();

  console.log('✅ Seeded all data successfully');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

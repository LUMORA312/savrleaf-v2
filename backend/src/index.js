import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';

import dealsRouter from '../src/routes/deals.js';
import dispensariesRouter from '../src/routes/dispensaries.js';
import applicationsRouter from '../src/routes/applications.js';
import subscriptionTiersRouter from '../src/routes/subscriptionTiers.js';
import authRouter from '../src/routes/auth.js';
import partnersRouter from '../src/routes/partners.js';
import adminAuthRoutes from '../src/routes/adminAuth.js';
import adminRoutes from '../src/routes/adminRoutes.js';
import usersRouter from '../src/routes/users.js';
import subscriptionsRouter from '../src/routes/subscriptions.js';
import createSubscriptionSessionRouter from '../src/routes/create-subscription-session.js';
import createExtraPlanSessionRouter from '../src/routes/create-extra-plan-session.js';
import stripeWebhookRouter from '../src/routes/stripe-webhook.js';
import './models/Application.js';
import './models/Deal.js';
import './models/Dispensary.js';
import './models/Subscription.js';
import './models/SubscriptionTier.js';
import './models/User.js';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const app = express();

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://savrleaf.com',
  'savrleaf-v2.vercel.app',
  'https://savrleaf-v2-backend.onrender.com'
];

const vercelRegex = /^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    console.log('🔎 Incoming origin:', origin);

    // Allow non-browser requests (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || vercelRegex.test(origin)) {
      console.log('✅ CORS allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked:', origin);
      // Throw an error so browser sees proper CORS failure
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use('/api/stripe-webhook', stripeWebhookRouter);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/deals', dealsRouter);
app.use('/api/dispensaries', dispensariesRouter);
app.use('/api/subscription-tiers', subscriptionTiersRouter);
app.use('/api/partner', partnersRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/create-subscription-session', createSubscriptionSessionRouter);
app.use('/api/create-extra-plan-session', createExtraPlanSessionRouter);

app.get('/', (req, res) => res.send('Backend is running'));

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

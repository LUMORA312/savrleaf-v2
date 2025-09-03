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

const allowedOrigins = [
  'http://localhost:3000',
  'https://savrleaf-v2.vercel.app',
  /\.vercel\.app$/,
  'https://savrleaf.com'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.some(o =>
          o instanceof RegExp ? o.test(origin) : o === origin
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(express.json());

// Log every request for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/deals', dealsRouter);
app.use('/dispensaries', dispensariesRouter);
app.use('/applications', applicationsRouter);
app.use('/subscription-tiers', subscriptionTiersRouter);
app.use('/auth', authRouter);
app.use('/partner', partnersRouter);
app.use('/admin/auth', adminAuthRoutes);
app.use('/admin', adminRoutes);
app.use('/users', usersRouter);
app.use('/subscriptions', subscriptionsRouter);

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

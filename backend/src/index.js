import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import dealsRouter from '../src/routes/deals.js';
import dispensariesRouter from '../src/routes/dispensaries.js';

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

app.use(cors({
  // TO DO: RESTRICT
  origin: '*',
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

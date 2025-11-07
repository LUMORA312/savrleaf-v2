import express from 'express';
import { getStripe } from '../../lib/stripe.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = express.Router();

const PRICE_IDS = {
  starter: 'price_1SQoieP9VfxczzVgY4FPYD74',
  growth: 'price_1SQolIP9VfxczzVghN7Y3TId',
  pro: 'price_1SQon4P9VfxczzVgZSCgZscu',
};

router.post('/', async (req, res) => {
  const stripe = getStripe();
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscriptionId' });
    }

    const subscription = await Subscription.findById(subscriptionId).populate('tier user');
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    const user = subscription.user;
    const tier = subscription.tier;

    const priceId = PRICE_IDS[tier.name.toLowerCase()]; // adjust if your tier names differ
    if (!priceId) throw new Error('Invalid tier name');

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email, // optional: prefill email
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        userId: user._id.toString(),
        subscriptionId: subscription._id.toString(),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

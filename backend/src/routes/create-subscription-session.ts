import express from 'express';
import Stripe from 'stripe';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const PRICE_IDS: Record<string, string> = {
  bronze: 'price_1SK4SHP9VfxczzVgxrNIcyJM',
  silver: 'price_1SK4RiP9VfxczzVgzla0Ob85',
  gold: 'price_1SK4SHP9VfxczzVgxrNIcyJM',
};

router.post('/', async (req, res) => {
  try {
    const { subscriptionId } = req.body as { subscriptionId: string };

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscriptionId' });
    }

    const subscription = await Subscription.findById(subscriptionId).populate('tier user');
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    const user = subscription.user as any;
    const tier = subscription.tier as any;

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
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

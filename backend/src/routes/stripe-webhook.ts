import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    if (!sig || Array.isArray(sig)) return res.status(400).send('Missing Stripe signature');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userEmail = session.customer_email;

          if (!userEmail) break;

          const user = await User.findOne({ email: userEmail });
          if (user) {
            user.isActive = true;
            await user.save();
          }

          // Update subscription if exists
          const subscription = await Subscription.findOne({ user: user?._id });
          if (subscription) {
            subscription.status = 'active';
            subscription.stripeSubscriptionId = session.subscription as string;
            await subscription.save();
          }

          console.log(`✅ User ${userEmail} activated, subscription updated.`);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const userEmail = invoice.customer_email;

          if (userEmail) {
            const user = await User.findOne({ email: userEmail });
            if (user) {
              user.isActive = false;
              console.log(`⚠️ Payment failed for user ${userEmail}`);
              await user.save();
            }
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const stripeSub = event.data.object as Stripe.Subscription;
          const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
          if (subscription) {
            subscription.status = 'canceled';
            await subscription.save();
            console.log(`🛑 Subscription ${stripeSub.id} canceled`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Error processing webhook event:', err);
      res.status(500).send('Internal server error');
    }
  }
);

export default router;

import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    dispensary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispensary',
      required: true,
      unique: true,
    },

    tier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionTier',
      required: true,
    },

    stripeSubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },

    stripeCustomerId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ['inactive', 'active', 'trialing', 'past_due', 'unpaid', 'canceled'],
      default: 'inactive',
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    currentPeriodEnd: {
      type: Date, // from Stripe
    },

    billingInterval: {
      type: String,
      enum: ['month', 'year'],
      required: true,
    },

    bonusSkus: {
      type: Number,
      default: 0,
    },

    adminSkuOverride: {
      type: Number,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const applicationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    subscriptionTier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionTier',
      required: true,
    },
    dispensaryName: {
      type: String,
      required: true,
      trim: true,
    },
    legalName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street1: { type: String, required: true, trim: true },
      street2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: {
        type: String,
        required: true,
        match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid zip code'],
      },
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'],
      required: false,
      trim: true,
    },
    websiteUrl: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    adminNotes: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export default Application;

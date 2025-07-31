import mongoose from 'mongoose';
import { getCoordinatesFromAddress } from '../utils/geocode.js';

const { Schema, model } = mongoose;

const DispensarySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    legalName: {
      type: String,
      required: true,
    },
    address: {
      street1: { type: String, required: true },
      street2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: {
        type: String,
        required: true,
        match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid zip code'],
      },
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    websiteUrl: {
      type: String,
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'],
    },
    hours: {
      type: Map,
      of: String,
    },
    description: {
      type: String,
    },
    amenities: {
      type: [String],
      default: [],
    },
    logo: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: false,
    },
    adminNotes: {
      type: String,
    },
    ratings: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

DispensarySchema.pre('save', async function (next) {
  if (this.isModified('address')) {
    const { street1, street2, city, state, zipCode } = this.address;
    const fullAddress = `${street1}${street2 ? ' ' + street2 : ''}, ${city}, ${state} ${zipCode}`;
    const coords = await getCoordinatesFromAddress(fullAddress);
    if (coords) {
      this.coordinates = {
        type: 'Point',
        coordinates: coords,
      };
    }
  }
  next();
});

DispensarySchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.address) {
    const { street1, street2, city, state, zipCode } = update.address;
    const fullAddress = `${street1}${street2 ? ' ' + street2 : ''}, ${city}, ${state} ${zipCode}`;
    const coords = await getCoordinatesFromAddress(fullAddress);
    if (coords) {
      update.coordinates = {
        type: 'Point',
        coordinates: coords,
      };
    }
  }
  next();
});

export default model('Dispensary', DispensarySchema);

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
      }
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
      required: false,
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'], // E.164 format
      required: false,
    },
    hours: {
      type: Map,
      of: String, // e.g., { monday: "9am-5pm", tuesday: "Closed" }
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    amenities: {
      type: [String],
      required: false,
      default: [],
    },
    logo: {
      type: String, // URL
      required: false,
    },
    images: {
      type: [String], // URLs
      required: false,
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
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    adminNotes: {
      type: String,
      required: false,
    },
    ratings: {
      type: [Number],
      required: false,
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

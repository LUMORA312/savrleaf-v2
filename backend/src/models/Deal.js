import mongoose from 'mongoose';
import slugify from 'slugify';

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    brand: { type: String },
    tags: [String],
    description: { type: String },
    originalPrice: { type: Number, required: true },
    salePrice: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v <= this.originalPrice;
        },
        message: 'Sale price must be less than or equal to original price',
      },
    },
    images: [{ type: String }],
    dispensary: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispensary', required: true },
    startDate: {
      type: Date,
      required: true,
      min: [new Date(), 'Start date must be today or in the future'],
    },
    endDate: { type: Date, required: true },
    accessType: {
      type: String,
      enum: ['medical', 'recreational', 'both'],
      default: 'both',
    },
    slug: { type: String, unique: true },
    manuallyActivated: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtuals
dealSchema.virtual('savings').get(function () {
  return this.originalPrice - this.salePrice;
});

dealSchema.virtual('isExpired').get(function () {
  return new Date() > this.endDate;
});

dealSchema.virtual('isCurrentlyActive').get(function () {
  const now = new Date();
  return (
    (this.manuallyActivated || (now >= this.startDate && now <= this.endDate)) &&
    !this.isExpired
  );
});

dealSchema.virtual('primaryImage').get(function () {
  return this.images?.[0] ?? null;
});

dealSchema.virtual('expiresIn').get(function () {
  const now = new Date();
  const diff = this.endDate - now;
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
});

// Static method
dealSchema.statics.findCurrentlyActive = function () {
  const now = new Date();
  return this.find({
    $or: [
      {
        $and: [
          { startDate: { $lte: now } },
          { endDate: { $gte: now } },
        ],
      },
      { manuallyActivated: true },
    ],
  });
};

// Slug generation
dealSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Custom validation: startDate must be before endDate
dealSchema.pre('validate', function (next) {
  if (this.startDate >= this.endDate) {
    this.invalidate('startDate', 'Start date must be before end date');
  }
  next();
});

// Text index for search
dealSchema.index({ brand: 'text', tags: 'text' });

export default mongoose.models.Deal || mongoose.model('Deal', dealSchema);

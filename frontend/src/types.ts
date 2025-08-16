export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Coordinates {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Dispensary {
  _id: string;
  name: string;
  legalName: string;
  address: Address;
  coordinates: Coordinates;
  licenseNumber: string;
  websiteUrl?: string;
  phoneNumber?: string;
  hours?: Record<string, string>;
  description?: string;
  amenities: string[];
  logo?: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  application: string;
  user: string;
  subscription?: Subscription | null;
  adminNotes?: string;
  ratings: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Deal {
  _id: string;
  title: string;
  brand?: string;
  tags: string[];
  description?: string;
  originalPrice: number;
  salePrice: number;
  images: string[];
  dispensary: Dispensary;
  startDate: string;
  endDate: string;
  accessType: 'medical' | 'recreational' | 'both';
  slug?: string;
  manuallyActivated: boolean;
  category: 'flower' | 'edibles' | 'concentrates' | 'vapes' | 'topicals' | 'accessories' | 'other';
  subcategory?: string;
  strain?: string;
  thcContent?: number;
  cbdContent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type SubscriptionTier = {
  _id: string;
  name: string;
  displayName: string;
  tier: number;
  baseSKULimit: number;
  monthlyPrice: number;
  annualPrice: number;
  annualBonusSKUs: number;
  description?: string;
  features: string[];
  isActive: boolean;
  sortOrder?: number;
};

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'partner' | 'admin';
  isActive: boolean;
  dispensaries?: string[];
}

export interface Application {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  subscriptionTier: SubscriptionTier | string;
  dispensaryName: string;
  legalName: string;
  address: Address;
  licenseNumber: string;
  phoneNumber?: string;
  websiteUrl?: string;
  description?: string;
  amenities: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SubscriptionStatus =
  | "inactive"
  | "active"
  | "trialing"
  | "past_due"
  | "unpaid"
  | "canceled";

export type BillingInterval = "month" | "year";

export interface Subscription {
  _id: string;
  dispensary: string;
  tier: SubscriptionTier;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: SubscriptionStatus;
  startDate?: string;
  endDate?: string;
  currentPeriodEnd?: string;
  billingInterval: BillingInterval;
  bonusSkus: number;
  adminSkuOverride?: number | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

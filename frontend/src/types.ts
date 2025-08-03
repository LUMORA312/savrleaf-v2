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
  subscription?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

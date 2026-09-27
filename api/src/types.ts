// Every signed-in user of Mazaofiti acts as an aggregator — there is no
// separate farmer/admin role in the app itself. The product catalogue is
// managed out-of-band via the seed script (see scripts/seedProducts.ts),
// using the Firebase Admin SDK, which bypasses Firestore rules entirely.

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface UserProfile {
  id: string; // Firebase Auth uid
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

// A client is the aggregator's own customer/buyer — the party demanding
// product. Aggregators maintain their own client book.
export interface Client {
  id: string;
  aggregatorId: string;
  name: string;
  contact: string; // phone or email
  location: GeoLocation;
  createdAt: string;
}

export interface ProductGrade {
  grade: string; // e.g. "Grade A", "Grade B"
  unit: string; // e.g. "90kg bag", "kg", "crate"
  costPerUnit: number;
  currency: string; // e.g. "KES"
}

export interface Product {
  id: string;
  name: string;
  category: string;
  grades: ProductGrade[];
  isActive: boolean;
  updatedAt: string;
}

export type DemandStatus = "open" | "in_progress" | "fulfilled" | "cancelled";

// Demand = a client wants a quantity of a product at a specific grade.
// The cost is a snapshot of the product's grade cost at the time the
// request was created, so historical records stay accurate even if catalog
// prices change later.
export interface DemandRequest {
  id: string;
  aggregatorId: string;

  clientId: string;
  clientName: string; // denormalized
  clientLocation: GeoLocation; // denormalized snapshot, for route planning

  productId: string;
  productName: string; // denormalized
  grade: string;
  unit: string;
  costPerUnit: number;
  currency: string;

  quantityDemanded: number;
  fulfilledQuantity: number;
  totalCost: number; // quantityDemanded * costPerUnit, computed server-side

  status: DemandStatus;
  createdAt: string;
}

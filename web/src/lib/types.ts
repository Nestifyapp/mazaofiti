export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Client {
  id: string;
  aggregatorId: string;
  name: string;
  contact: string;
  location: GeoLocation;
  createdAt: string;
}

export interface ProductGrade {
  grade: string;
  unit: string;
  costPerUnit: number;
  currency: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  grades: ProductGrade[];
  isActive: boolean;
}

export type DemandStatus = "open" | "in_progress" | "fulfilled" | "cancelled";

export interface DemandRequest {
  id: string;
  aggregatorId: string;

  clientId: string;
  clientName: string;
  clientLocation: GeoLocation;

  productId: string;
  productName: string;
  grade: string;
  unit: string;
  costPerUnit: number;
  currency: string;

  quantityDemanded: number;
  fulfilledQuantity: number;
  totalCost: number;

  status: DemandStatus;
  createdAt: string;
}

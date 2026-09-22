export interface SkroutzConfig {
  enabled: boolean;
  feedUrl: string;
  lastSyncTime?: string;
  totalSyncedProducts: number;
  excludedProductIds: string[];
  autoSyncIntervalMinutes: number;
}

export interface SkroutzSyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  totalProducts: number;
  activeCount: number;
  message: string;
  durationMs: number;
}

export interface CourierConfig {
  id: 'acs' | 'boxnow' | 'store_pickup';
  name: string;
  active: boolean;
  apiKey?: string;
  testMode: boolean;
  baseCost: number;
  freeShippingThreshold: number;
}

export interface PaymentConfig {
  id: 'viva' | 'stripe' | 'klarna' | 'cod' | 'bank';
  name: string;
  active: boolean;
  testMode: boolean;
  instructions?: string;
}

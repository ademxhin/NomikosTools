export interface ProductSpecification {
  key: string;
  value: string;
  group?: string;
}

export interface ProductVariant {
  ean?: string;
  image?: string;
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  attributes: Record<string, string>;
}

export interface ProductManual {
  title: string;
  url: string;
  size: string;
}

export type AvailabilityStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order';

export interface Product {
  publicationStatus?: 'draft' | 'published' | 'archived';
  imageAlt?: Record<string, string>;
  saleStartsAt?: string;
  saleEndsAt?: string;
  shippingClass?: string;
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  sku: string;
  ean: string;
  manufacturerCode: string;
  brandId: string;
  categoryIds: string[];
  price: number; // Retail price with VAT or net depending on configuration
  salePrice?: number;
  costPrice: number;
  supplierStock?: number;
  vatRate: number; // e.g. 0.24 for 24% Greek VAT
  stockQuantity: number;
  lowStockThreshold: number;
  availabilityStatus: AvailabilityStatus;
  unit: string; // e.g. 'Τεμάχιο' | 'Σετ'
  packageQuantity: number;
  images: string[];
  videoUrl?: string;
  attributes: Record<string, string>; // e.g. { voltage: '18V', motor: 'Brushless', chuck: '13mm' }
  specifications: ProductSpecification[];
  variants?: ProductVariant[];
  includedItems: string[];
  compatibleProductIds: string[];
  relatedProductIds: string[];
  manualFiles: ProductManual[];
  warranty: string;
  weight: number; // in kg
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  seoTitle: string;
  seoDescription: string;
  active: boolean;
  featured: boolean;
  popular: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  isProfessional: boolean;
}

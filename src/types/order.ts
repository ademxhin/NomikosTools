export type OrderStatus =
  | 'Νέα'
  | 'Επιβεβαιωμένη'
  | 'Σε Προετοιμασία'
  | 'Σε Picking'
  | 'Έτοιμη για Συσκευασία'
  | 'Συσκευασμένη'
  | 'Απεστάλη'
  | 'Παραδόθηκε'
  | 'Ακυρώθηκε'
  | 'Επιστροφή'
  | 'Επιστροφή Χρημάτων';

export interface OrderItem {
  variantId?: string;
  productId: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  pickedQuantity?: number;
  weight?: number;
}

export interface CustomerBilling {
  type: 'receipt' | 'invoice';
  companyName?: string;
  vatNumber?: string; // ΑΦΜ
  taxOffice?: string;  // ΔΟΥ
  profession?: string; // Επάγγελμα / Δραστηριότητα
}

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  city: string;
  postalCode: string;
  region: string;
  notes?: string;
}

export interface ShippingDetails {
  carrier: 'acs' | 'boxnow' | 'store_pickup';
  carrierName: string;
  cost: number;
  trackingNumber?: string;
  lockerId?: string;
  lockerAddress?: string;
  pickupStore?: string;
}

export interface PaymentDetails {
  method: 'viva' | 'stripe' | 'klarna' | 'cod' | 'bank';
  methodName: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  installments?: number;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  user: string;
  note?: string;
}

export interface Order {
  customerId?: string;
  stockCommitted?: boolean;
  internalNotes?: { text: string; at: string; author: string }[];
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  items: OrderItem[];
  customer: Address;
  billing: CustomerBilling;
  shippingAddress: Address;
  shipping: ShippingDetails;
  payment: PaymentDetails;
  subtotal: number;
  vatTotal: number;
  shippingCost: number;
  discountTotal: number;
  couponCode?: string;
  total: number;
  notes?: string;
  isB2B: boolean;
}

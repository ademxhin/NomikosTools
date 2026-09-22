export interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  isMain: boolean;
  address: string;
}

export type MovementReason =
  | 'purchase_receipt'
  | 'order_sale'
  | 'order_return'
  | 'stock_adjustment'
  | 'inventory_count'
  | 'damaged_loss'
  | 'internal_transfer';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  locationId: string;
  locationName: string;
  quantityChange: number; // positive or negative
  previousQuantity: number;
  newQuantity: number;
  reason: MovementReason;
  reasonDetails?: string;
  referenceId?: string; // orderId, importSessionId, countId
  user: string;
  timestamp: string;
}

export interface InventoryCountItem {
  productId: string;
  sku: string;
  name: string;
  expectedQuantity: number;
  countedQuantity: number;
  difference: number;
  barcode: string;
  location: string;
}

export interface InventoryCountSession {
  id: string;
  sessionNumber: string;
  locationId: string;
  locationName: string;
  status: 'draft' | 'in_progress' | 'completed' | 'locked';
  startedAt: string;
  completedAt?: string;
  user: string;
  notes?: string;
  items: InventoryCountItem[];
}

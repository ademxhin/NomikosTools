import { Product } from '../types/product';

export function getSupplierStockView(product: Product) {
  if (typeof product.supplierStock === 'number' && Number.isFinite(product.supplierStock)) return { value: String(product.supplierStock), source: 'Πεδίο supplierStock' };
  const imported = product.attributes?.supplierStock?.trim();
  if (imported && /^\d+(?:[.,]\d+)?$/.test(imported)) return { value: imported.replace(',', '.'), source: 'Εισαγόμενα δεδομένα προμηθευτή' };
  return { value: '-', source: 'Εισαγόμενα δεδομένα προμηθευτή' };
}

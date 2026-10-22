import { Product } from '../types/product';

export function getSupplierStockView(product: Product) {
  if (typeof product.supplierStock === 'number') return { value: String(product.supplierStock), source: 'Πεδίο supplierStock' };
  const imported = product.attributes?.supplierStock?.trim();
  if (imported) return { value: imported, source: 'Εισαγόμενα δεδομένα προμηθευτή' };
  return { value: 'Δεν υπάρχει διαθέσιμη ένδειξη', source: 'Απαιτείται σύνδεση feed προμηθευτή' };
}

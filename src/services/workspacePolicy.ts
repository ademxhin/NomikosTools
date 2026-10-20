import { AdminRole, User } from '../types/user';
import { Order, OrderStatus } from '../types/order';
import { Product } from '../types/product';
import { Category } from '../types/category';

export type Permission = 'catalog' | 'orders' | 'warehouse' | 'support' | 'settings';
export const roleNames: Record<AdminRole, string> = {
  'Super Admin': 'Ιδιοκτήτης', Administrator: 'Διαχειριστής', 'Catalog Manager': 'Κατάλογος',
  'Warehouse Operator': 'Αποθήκη', 'Order Manager': 'Παραγγελίες', 'Support Agent': 'Υποστήριξη', 'Read Only': 'Μόνο ανάγνωση',
};
const grants: Record<AdminRole, Permission[]> = {
  'Super Admin': ['catalog', 'orders', 'warehouse', 'support', 'settings'],
  Administrator: ['catalog', 'orders', 'warehouse', 'support', 'settings'],
  'Catalog Manager': ['catalog'], 'Warehouse Operator': ['warehouse', 'orders'],
  'Order Manager': ['orders', 'warehouse'], 'Support Agent': ['support'], 'Read Only': [],
};
// Demo UX policy only. Production must enforce identical checks on the server.
export const can = (user: User | null, permission: Permission) =>
  user?.role === 'admin' && !!user.adminRole && grants[user.adminRole]?.includes(permission);
export const ownsOrder = (user: User | null, order: Order) => !!user && order.customerId === user.id;
export const money = (value: number) => new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(value);
export const dateTime = (value: string) => {
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('el-GR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Athens' }).format(date);
};
export const orderSteps: OrderStatus[] = ['Νέα', 'Επιβεβαιωμένη', 'Σε Προετοιμασία', 'Σε Picking', 'Έτοιμη για Συσκευασία', 'Συσκευασμένη', 'Απεστάλη', 'Παραδόθηκε'];
export function validateProduct(product: Product, products: Product[]) {
  if (!product.name.trim() || !product.sku.trim() || !product.slug.trim()) throw new Error('Συμπληρώστε τίτλο, SKU και σύνδεσμο.');
  if (products.some(p => p.id !== product.id && (p.sku === product.sku || p.slug === product.slug))) throw new Error('Το SKU ή ο σύνδεσμος χρησιμοποιείται ήδη.');
  if (![product.price, product.stockQuantity, product.lowStockThreshold, product.weight].every(n => Number.isFinite(n) && n >= 0)) throw new Error('Τιμές, βάρος και ποσότητες πρέπει να είναι μη αρνητικά.');
  if (!Number.isInteger(product.stockQuantity)) throw new Error('Το απόθεμα πρέπει να είναι ακέραιος αριθμός.');
  if (product.salePrice !== undefined && (!Number.isFinite(product.salePrice) || product.salePrice < 0 || product.salePrice > product.price)) throw new Error('Η προσφορά πρέπει να είναι μεταξύ μηδέν και κανονικής τιμής.');
  const variants = product.variants ?? [];
  if (new Set(variants.map(v => v.sku)).size !== variants.length || new Set(variants.map(v => JSON.stringify(Object.entries(v.attributes).sort()))).size !== variants.length) throw new Error('Διπλό SKU ή συνδυασμός παραλλαγής.');
  if (variants.some(v => !v.sku || v.price < 0 || !Number.isInteger(v.stockQuantity) || v.stockQuantity < 0)) throw new Error('Ελέγξτε τις παραλλαγές.');
}
export function nextOrderStatus(order: Order, status: OrderStatus) {
  if (status === order.status) return false;
  if (status === 'Ακυρώθηκε' && orderSteps.indexOf(order.status) >= 0 && orderSteps.indexOf(order.status) < 6) return true;
  if (orderSteps.indexOf(status) !== orderSteps.indexOf(order.status) + 1 || orderSteps.indexOf(order.status) < 0) throw new Error('Η μετάβαση κατάστασης δεν επιτρέπεται.');
  if (status === 'Έτοιμη για Συσκευασία' && order.items.some(i => (i.pickedQuantity ?? 0) !== i.quantity)) throw new Error('Ολοκληρώστε πρώτα τη συλλογή όλων των ειδών.');
  if (status === 'Απεστάλη' && order.shipping.carrier !== 'store_pickup' && !order.shipping.trackingNumber) throw new Error('Καταχωρίστε πρώτα αριθμό αποστολής.');
  return true;
}

export function validateCategoryParent(categories: Category[], categoryId: string, parentId?: string | null) {
  let parent = parentId;
  const visited = new Set([categoryId]);
  while (parent) {
    if (visited.has(parent)) throw new Error('Δεν επιτρέπεται κυκλική σχέση κατηγοριών.');
    visited.add(parent);
    parent = categories.find(category => category.id === parent)?.parentId;
  }
}

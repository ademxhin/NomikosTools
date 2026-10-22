import { test } from 'node:test';
import assert from 'node:assert/strict';
import { can, ownsOrder, nextOrderStatus, validateCategoryParent, validateProduct } from '../src/services/workspacePolicy.ts';
import { commitOrder, releaseOrderStock } from '../src/services/orderTransaction.ts';
import { parseCsv } from '../src/services/catalogImport.ts';
import type { Product } from '../src/types/product.ts';
import { initialProducts } from '../src/data/productsData.ts';
import type { Order } from '../src/types/order.ts';
import { couponDiscount } from '../src/services/coupons.ts';
import { getSupplierStockView } from '../src/services/productAdmin.ts';
const product: Product = { ...initialProducts[0], id: 'p', name: 'Εργαλείο', sku: 'SKU-1', slug: 'tool', ean: '0012345', active: true, price: 12.4, salePrice: undefined, variants: [], stockQuantity: 2, lowStockThreshold: 1, weight: 1, vatRate: .24, images: [], categoryIds: [] };
const order = { id: 'o', customerId: 'u1', status: 'Νέα', items: [{ productId: 'p', sku: 'SKU-1', quantity: 1, price: .01 }], shippingCost: 0, discountTotal: 0, payment: { status: 'paid' }, shipping: { carrier: 'acs' }, customer: { email: 'test@example.test' } } as Order;
test('role permissions are limited by responsibility', () => {
  const user = { id: 'u', name: 'x', email: 'x', role: 'admin' as const, adminRole: 'Catalog Manager' as const };
  assert.equal(can(user, 'catalog'), true); assert.equal(can(user, 'orders'), false); assert.equal(can({ ...user, role: 'customer' }, 'catalog'), false);
});
test('order ownership cannot be claimed by matching an email', () => {
  assert.equal(ownsOrder({ id: 'u2', email: 'test@example.test', name: 'x', role: 'customer' }, order), false);
  assert.equal(ownsOrder({ id: 'u1', email: 'different', name: 'x', role: 'customer' }, order), true);
});
test('transaction uses catalog prices and preserves independent snapshots', () => {
  const result = commitOrder([product], [], order, 'u1');
  assert.equal(result.order.total, 12.4); assert.equal(result.order.vatTotal, 2.4); assert.equal(result.order.payment.status, 'pending'); assert.equal(result.products[0].stockQuantity, 1);
  assert.notEqual(result.order.customer, order.customer); assert.equal(product.stockQuantity, 2);
});
test('repeated order is idempotent and competing orders cannot oversell', () => {
  const first = commitOrder([{ ...product, stockQuantity: 1 }], [], order, 'u1');
  const repeat = commitOrder(first.products, first.orders, order, 'u1');
  assert.equal(repeat.products[0].stockQuantity, 0); assert.equal(repeat.orders.length, 1);
  assert.throws(() => commitOrder(first.products, first.orders, { ...order, id: 'other' }, 'u2'), /απόθεμα/);
});
test('cancellation releases committed stock, never uncommitted stock', () => {
  const first = commitOrder([product], [], order, 'u1');
  assert.equal(releaseOrderStock(first.products, first.order)[0].stockQuantity, 2);
  assert.equal(releaseOrderStock(first.products, { ...first.order, stockCommitted: false })[0].stockQuantity, 1);
});
test('barcode remains a string, duplicate product SKU is rejected', () => {
  validateProduct(product, []); assert.equal(product.ean, '0012345'); assert.throws(() => validateProduct({ ...product, id: 'different' }, [product]), /SKU/);
});
test('purchase price is validated and supplier stock never falls back to a fake zero', () => {
  assert.throws(() => validateProduct({ ...product, costPrice: -1 }, []), /μη αρνητικά/);
  assert.deepEqual(getSupplierStockView({ ...product, supplierStock: 7 }), { value: '7', source: 'Πεδίο supplierStock' });
  assert.deepEqual(getSupplierStockView({ ...product, supplierStock: undefined, attributes: { supplierStock: 'Διαθέσιμο' } }), { value: 'Διαθέσιμο', source: 'Εισαγόμενα δεδομένα προμηθευτή' });
  assert.match(getSupplierStockView({ ...product, supplierStock: undefined, attributes: {} }).value, /Δεν υπάρχει/);
});
test('variant duplicates and overselling a variant are rejected', () => {
  const variant = { id: 'v', name: 'Μικρό', sku: 'V-1', price: 10, stockQuantity: 1, attributes: { size: 'S' } };
  assert.throws(() => validateProduct({ ...product, variants: [variant, { ...variant, id: 'v2' }] }, []), /Διπλό/);
  const input = { ...order, items: [{ ...order.items[0], variantId: 'v', quantity: 2 }] };
  assert.throws(() => commitOrder([{ ...product, variants: [variant] }], [], input), /παραλλαγής/);
});
test('cannot skip preparation or claim a refund by changing status', () => {
  assert.throws(() => nextOrderStatus(order, 'Απεστάλη'));
  assert.throws(() => nextOrderStatus(order, 'Επιστροφή Χρημάτων'));
  assert.throws(() => nextOrderStatus({ ...order, status: 'Σε Picking' }, 'Έτοιμη για Συσκευασία'));
  assert.equal(nextOrderStatus(order, 'Επιβεβαιωμένη'), true);
});
test('CSV handles quoted separators, BOM and leading zeros', () => {
  assert.deepEqual(parseCsv('\uFEFFsku;ean;name\r\nA;00123;"Ένα; δύο"'), [['sku','ean','name'], ['A','00123','Ένα; δύο']]);
  assert.throws(() => parseCsv('sku,name\nA,"unfinished'));
});
test('category hierarchy cannot contain a cycle', () => {
  const categories = [
    { id: 'a', name: 'A', slug: 'a', parentId: null, level: 1 as const, order: 1, active: true },
    { id: 'b', name: 'B', slug: 'b', parentId: 'a', level: 2 as const, order: 1, active: true },
  ];
  assert.throws(() => validateCategoryParent(categories, 'a', 'b'), /κυκλική/);
  assert.doesNotThrow(() => validateCategoryParent(categories, 'b', null));
});
test('coupons respect category, minimum and usage rules', () => {
  const coupon = { id: 'c', code: 'TOOLS10', type: 'percent' as const, amount: 10, minimum: 10, starts: '', ends: '', limit: 2, active: true, categoryIds: ['tools'], stackable: false };
  assert.equal(couponDiscount(coupon, [{ price: 20, quantity: 2, categoryIds: ['tools'], onSale: false }], 0), 4);
  assert.throws(() => couponDiscount(coupon, [{ price: 5, quantity: 1, categoryIds: ['other'], onSale: false }], 0));
  assert.throws(() => couponDiscount(coupon, [{ price: 20, quantity: 1, categoryIds: ['tools'], onSale: false }], 2));
});

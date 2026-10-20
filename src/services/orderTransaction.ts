import { Order } from '../types/order';
import { Product } from '../types/product';
// Pure transaction shared by the demo adapter and domain tests. A production
// adapter must run its equivalent inside a database transaction with row locks.
export function commitOrder(products: Product[], orders: Order[], input: Order, customerId?: string) {
  if (orders.some(o => o.id === input.id)) return { products, orders, order: orders.find(o => o.id === input.id)! };
  if (!input.items.length) throw new Error('Η παραγγελία δεν έχει προϊόντα.');
  const quantities = new Map<string, number>(); const variants = new Map<string, number>(); let vatCents = 0;
  const items = input.items.map(item => {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new Error('Μη έγκυρη ποσότητα.');
    const product = products.find(p => p.id === item.productId && p.active);
    if (!product) throw new Error('Το προϊόν δεν είναι πλέον διαθέσιμο.');
    const variant = item.variantId ? product.variants?.find(v => v.id === item.variantId) : undefined;
    if (product.variants?.length && !variant) throw new Error('Επιλέξτε διαθέσιμη παραλλαγή.');
    quantities.set(product.id, (quantities.get(product.id) ?? 0) + item.quantity);
    if (variant) { const key = `${product.id}:${variant.id}`; variants.set(key, (variants.get(key) ?? 0) + item.quantity); if (variants.get(key)! > variant.stockQuantity) throw new Error('Ανεπαρκές απόθεμα παραλλαγής.'); }
    if (quantities.get(product.id)! > product.stockQuantity) throw new Error('Το διαθέσιμο απόθεμα έχει αλλάξει. Ελέγξτε το καλάθι.');
    const price = variant?.salePrice ?? variant?.price ?? product.salePrice ?? product.price;
    vatCents += Math.round(Math.round(price * 100) * item.quantity * product.vatRate / (1 + product.vatRate));
    return { ...item, name: product.name, image: variant?.image ?? product.images[0], sku: variant?.sku ?? product.sku, price, pickedQuantity: 0 };
  });
  const subtotalCents = items.reduce((s,i) => s + Math.round(i.price * 100) * i.quantity, 0);
  if (!Number.isFinite(input.shippingCost) || input.shippingCost < 0 || !Number.isFinite(input.discountTotal) || input.discountTotal < 0 || input.discountTotal * 100 > subtotalCents) throw new Error('Μη έγκυρα σύνολα.');
  const order: Order = structuredClone({ ...input, customerId, items, stockCommitted: true, subtotal: subtotalCents / 100, vatTotal: vatCents / 100, total: (subtotalCents + Math.round(input.shippingCost * 100) - Math.round(input.discountTotal * 100)) / 100, payment: { ...input.payment, status: 'pending', transactionId: undefined } });
  return { order, orders: [order, ...orders], products: products.map(p => { const stockQuantity = p.stockQuantity - (quantities.get(p.id) ?? 0); return { ...p, stockQuantity, availabilityStatus: (stockQuantity === 0 ? 'out_of_stock' : stockQuantity <= p.lowStockThreshold ? 'low_stock' : 'in_stock') as Product['availabilityStatus'], variants: p.variants?.map(v => ({ ...v, stockQuantity: v.stockQuantity - (variants.get(`${p.id}:${v.id}`) ?? 0) })) }; }) };
}
export function releaseOrderStock(products: Product[], order: Order) {
  if (!order.stockCommitted) return products;
  return products.map(p => ({ ...p, stockQuantity: p.stockQuantity + order.items.filter(i => i.productId === p.id).reduce((s,i) => s + i.quantity, 0), variants: p.variants?.map(v => ({ ...v, stockQuantity: v.stockQuantity + order.items.filter(i => i.productId === p.id && i.variantId === v.id).reduce((s,i) => s + i.quantity, 0) })) }));
}

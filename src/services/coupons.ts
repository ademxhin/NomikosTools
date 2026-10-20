export interface Coupon { id: string; code: string; type: 'percent' | 'fixed'; amount: number; minimum: number; starts: string; ends: string; limit: number; categoryIds: string[]; stackable: boolean; active: boolean }
export function couponDiscount(coupon: Coupon, lines: { price: number; quantity: number; categoryIds: string[]; onSale: boolean }[], uses: number, now = Date.now()) {
  if (!coupon.active || (coupon.starts && now < new Date(coupon.starts).getTime()) || (coupon.ends && now > new Date(coupon.ends).getTime()) || uses >= coupon.limit) throw new Error('Το κουπόνι δεν είναι διαθέσιμο.');
  const total = lines.reduce((s, l) => s + Math.round(l.price * 100) * l.quantity, 0);
  if (total < Math.round(coupon.minimum * 100)) throw new Error('Δεν καλύπτεται η ελάχιστη αξία του κουπονιού.');
  const eligible = lines.filter(l => (coupon.stackable || !l.onSale) && (!coupon.categoryIds.length || l.categoryIds.some(id => coupon.categoryIds.includes(id)))).reduce((s, l) => s + Math.round(l.price * 100) * l.quantity, 0);
  return Math.min(eligible, coupon.type === 'percent' ? Math.round(eligible * coupon.amount / 100) : Math.round(coupon.amount * 100)) / 100;
}

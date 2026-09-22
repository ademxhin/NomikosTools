export interface ShipmentResult {
  success: boolean;
  trackingNumber: string;
  carrier: 'acs' | 'boxnow' | 'store_pickup';
  labelUrl?: string;
  estimatedDelivery: string;
  cost: number;
}

export const courierService = {
  calculateShipping(carrier: 'acs' | 'boxnow' | 'store_pickup', subtotal: number, weightKg: number): number {
    if (carrier === 'store_pickup') return 0;
    if (carrier === 'boxnow') {
      return subtotal >= 40 ? 0 : 2.50;
    }
    // ACS: Free for subtotal >= 50, otherwise 3.50 + 1.00 for every kg above 2kg
    if (subtotal >= 50) return 0;
    const base = 3.50;
    const extraWeight = Math.max(0, weightKg - 2) * 1.00;
    return Number((base + extraWeight).toFixed(2));
  },

  async createShipment(
    carrier: 'acs' | 'boxnow' | 'store_pickup',
    orderNumber: string,
    recipient: { name: string; phone: string; address: string; city: string; postalCode: string }
  ): Promise<ShipmentResult> {
    // Simulated carrier API adapter call
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (carrier === 'acs') {
      const trackingNumber = `ACS-${Math.floor(100000000 + Math.random() * 900000000)}GR`;
      return {
        success: true,
        trackingNumber,
        carrier: 'acs',
        estimatedDelivery: '1-2 εργάσιμες ημέρες',
        cost: 3.50,
      };
    } else if (carrier === 'boxnow') {
      const trackingNumber = `BN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      return {
        success: true,
        trackingNumber,
        carrier: 'boxnow',
        estimatedDelivery: '24 ώρες (Παραλαβή 24/7)',
        cost: 2.50,
      };
    } else {
      return {
        success: true,
        trackingNumber: `PICKUP-${orderNumber}`,
        carrier: 'store_pickup',
        estimatedDelivery: 'Άμεσα διαθέσιμο στο κατάστημα',
        cost: 0,
      };
    }
  },

  getTrackingStatus(trackingNumber: string): { status: string; history: { date: string; location: string; event: string }[] } {
    return {
      status: 'Σε μεταφορά προς τον τελικό προορισμό',
      history: [
        { date: '2026-03-01 10:30', location: 'HUB Ασπροπύργου', event: 'Παραλαβή από αποστολέα (Nomikos Tools)' },
        { date: '2026-03-01 14:15', location: 'Κεντρική Διαλογή Αθηνών', event: 'Διαλογή αποστολής' },
        { date: '2026-03-02 08:00', location: 'Κατάστημα Διανομής', event: 'Προς παράδοση με courier' },
      ],
    };
  },
};

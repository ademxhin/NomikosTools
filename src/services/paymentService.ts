export interface PaymentProcessResult {
  success: boolean;
  transactionId: string;
  message: string;
  redirectUrl?: string;
}

export const paymentService = {
  async processPayment(
    method: 'viva' | 'stripe' | 'klarna' | 'cod' | 'bank',
    amount: number,
    orderId: string
  ): Promise<PaymentProcessResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    switch (method) {
      case 'viva':
        return {
          success: true,
          transactionId: `VIVA-${Date.now().toString().slice(-8)}`,
          message: 'Η συναλλαγή μέσω Viva Wallet Smart Checkout εγκρίθηκε επιτυχώς.',
        };
      case 'stripe':
        return {
          success: true,
          transactionId: `ch_stripe_${Date.now().toString().slice(-8)}`,
          message: 'Η κάρτα χρεώθηκε επιτυχώς μέσω Stripe Secure Gateway.',
        };
      case 'klarna':
        return {
          success: true,
          transactionId: `KLARNA-${Date.now().toString().slice(-8)}`,
          message: 'Εγκρίθηκε το πλάνο 3 άτοκων δόσεων Klarna.',
        };
      case 'cod':
        return {
          success: true,
          transactionId: `COD-${orderId}`,
          message: 'Η παραγγελία καταχωρήθηκε με πληρωμή κατά την παράδοση (Αντικαταβολή).',
        };
      case 'bank':
        return {
          success: true,
          transactionId: `BANK-PENDING-${orderId}`,
          message: 'Παρακαλούμε καταθέστε το ποσό στους τραπεζικούς λογαριασμούς της Nomikos Tools.',
        };
    }
  },
};

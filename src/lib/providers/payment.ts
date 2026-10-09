import type { Paise } from "@/lib/money";

/**
 * Taking payments. Real implementation: Razorpay in TEST mode (v0.6). Tests: FakePaymentProvider.
 *
 * Flow: server creates an order (amount from OUR database, never from the browser)
 * → browser checkout → server verifies the payment signature
 * → the verified webhook grants access (idempotently).
 */

/** Razorpay's minimum order amount is ₹1. */
export const MIN_ORDER_PAISE = 100;

export interface CreateOrderInput {
  amount: Paise;
  /** Our own reference (e.g. our order id), shown in the provider dashboard. Max 40 chars. */
  receipt: string;
  notes?: Record<string, string>;
}

export interface ProviderOrder {
  /** The provider's order id, e.g. "order_Nx...". */
  id: string;
  amount: Paise;
  currency: "INR";
  receipt: string;
}

export interface PaymentSignature {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<ProviderOrder>;
  /** True only if the signature proves the provider confirmed this payment for this order. */
  verifyPaymentSignature(input: PaymentSignature): Promise<boolean>;
  /** True only if the webhook body was signed by the provider. Pass the RAW request body. */
  verifyWebhook(rawBody: string, signatureHeader: string | null): Promise<boolean>;
}

/** Shared input rules every implementation applies before calling the provider. */
export function validateCreateOrder(input: CreateOrderInput): void {
  if (input.amount < MIN_ORDER_PAISE) {
    throw new RangeError(`Order amount must be at least ${MIN_ORDER_PAISE} paise (₹1).`);
  }
  if (input.receipt.length === 0 || input.receipt.length > 40) {
    throw new RangeError("Order receipt must be 1 to 40 characters.");
  }
}

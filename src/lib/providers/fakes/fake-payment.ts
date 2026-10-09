import {
  type CreateOrderInput,
  type PaymentProvider,
  type PaymentSignature,
  type ProviderOrder,
  validateCreateOrder,
} from "@/lib/providers/payment";

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Behaves like a payment provider without a network or keys.
 * Signatures are deterministic, and test helpers produce valid ones, so tests can
 * cover both "genuine" and "tampered" payments and webhooks.
 */
export class FakePaymentProvider implements PaymentProvider {
  readonly orders: ProviderOrder[] = [];

  async createOrder(input: CreateOrderInput): Promise<ProviderOrder> {
    validateCreateOrder(input);
    const order: ProviderOrder = {
      id: `order_fake_${this.orders.length + 1}`,
      amount: input.amount,
      currency: "INR",
      receipt: input.receipt,
    };
    this.orders.push(order);
    return order;
  }

  async verifyPaymentSignature(input: PaymentSignature): Promise<boolean> {
    return input.signature === (await this.signPayment(input.orderId, input.paymentId));
  }

  async verifyWebhook(rawBody: string, signatureHeader: string | null): Promise<boolean> {
    return signatureHeader !== null && signatureHeader === (await this.signWebhook(rawBody));
  }

  /** Test helper: the signature a genuine checkout would return for this order and payment. */
  async signPayment(orderId: string, paymentId: string): Promise<string> {
    return `fake_${await sha256Hex(`${orderId}|${paymentId}`)}`;
  }

  /** Test helper: the signature header a genuine webhook would carry for this body. */
  async signWebhook(rawBody: string): Promise<string> {
    return `fake_${await sha256Hex(rawBody)}`;
  }
}

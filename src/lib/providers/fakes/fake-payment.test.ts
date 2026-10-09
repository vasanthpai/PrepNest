import { describe, expect, it } from "vitest";
import { assertPaise, rupeesToPaise } from "@/lib/money";
import { FakePaymentProvider } from "@/lib/providers/fakes/fake-payment";
import { MIN_ORDER_PAISE } from "@/lib/providers/payment";

describe("FakePaymentProvider.createOrder", () => {
  it("creates an INR order for the exact amount in paise", async () => {
    const payments = new FakePaymentProvider();
    const order = await payments.createOrder({ amount: rupeesToPaise(499), receipt: "ord_1" });
    expect(order).toMatchObject({ amount: 49900, currency: "INR", receipt: "ord_1" });
    expect(order.id).toMatch(/^order_fake_/);
  });

  it("gives every order a unique id", async () => {
    const payments = new FakePaymentProvider();
    const a = await payments.createOrder({ amount: assertPaise(100), receipt: "a" });
    const b = await payments.createOrder({ amount: assertPaise(100), receipt: "b" });
    expect(a.id).not.toBe(b.id);
  });

  it("rejects amounts below ₹1", async () => {
    const payments = new FakePaymentProvider();
    await expect(
      payments.createOrder({ amount: assertPaise(MIN_ORDER_PAISE - 1), receipt: "x" }),
    ).rejects.toThrow(RangeError);
  });

  it.each(["", "x".repeat(41)])("rejects receipt of length %#", async (receipt) => {
    const payments = new FakePaymentProvider();
    await expect(payments.createOrder({ amount: assertPaise(100), receipt })).rejects.toThrow(
      RangeError,
    );
  });

  it("only accepts amounts typed as Paise (rupees are a compile error)", async () => {
    const payments = new FakePaymentProvider();
    // @ts-expect-error: a plain number (could be rupees) is not Paise
    await expect(payments.createOrder({ amount: 499, receipt: "x" })).resolves.toBeDefined();
  });
});

describe("FakePaymentProvider signatures", () => {
  it("accepts a genuine payment signature", async () => {
    const payments = new FakePaymentProvider();
    const signature = await payments.signPayment("order_1", "pay_1");
    expect(
      await payments.verifyPaymentSignature({ orderId: "order_1", paymentId: "pay_1", signature }),
    ).toBe(true);
  });

  it("rejects a signature reused for a different payment", async () => {
    const payments = new FakePaymentProvider();
    const signature = await payments.signPayment("order_1", "pay_1");
    expect(
      await payments.verifyPaymentSignature({ orderId: "order_1", paymentId: "pay_2", signature }),
    ).toBe(false);
  });

  it("accepts a genuine webhook and rejects a tampered or unsigned one", async () => {
    const payments = new FakePaymentProvider();
    const body = JSON.stringify({ event: "payment.captured", amount: 49900 });
    const header = await payments.signWebhook(body);
    expect(await payments.verifyWebhook(body, header)).toBe(true);
    expect(await payments.verifyWebhook(body.replace("49900", "100"), header)).toBe(false);
    expect(await payments.verifyWebhook(body, null)).toBe(false);
  });
});

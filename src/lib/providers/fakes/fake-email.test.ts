import { describe, expect, it } from "vitest";
import type { EmailMessage } from "@/lib/providers/email";
import { ProviderError } from "@/lib/providers/errors";
import { FakeEmailProvider } from "@/lib/providers/fakes/fake-email";

const message = (to: string): EmailMessage => ({
  to,
  subject: "Confirm your email",
  html: "<p>Click to confirm</p>",
  text: "Click to confirm",
});

describe("FakeEmailProvider", () => {
  it("records sent messages and returns unique ids", async () => {
    const email = new FakeEmailProvider();
    const first = await email.send(message("a@example.com"));
    const second = await email.send(message("b@example.com"));
    expect(email.sent).toHaveLength(2);
    expect(first.id).not.toBe(second.id);
  });

  it("filters messages by recipient", async () => {
    const email = new FakeEmailProvider();
    await email.send(message("a@example.com"));
    await email.send(message("b@example.com"));
    await email.send(message("a@example.com"));
    expect(email.sentTo("a@example.com")).toHaveLength(2);
  });

  it("can simulate a single failure, then recovers", async () => {
    const email = new FakeEmailProvider();
    email.failNextWith(new ProviderError("fake-email", "rate limited", { retryable: true }));
    await expect(email.send(message("a@example.com"))).rejects.toMatchObject({ retryable: true });
    expect(email.sent).toHaveLength(0);
    await expect(email.send(message("a@example.com"))).resolves.toBeDefined();
    expect(email.sent).toHaveLength(1);
  });
});

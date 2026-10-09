import type { EmailMessage, EmailProvider, SendEmailResult } from "@/lib/providers/email";
import type { ProviderError } from "@/lib/providers/errors";

/** Records messages instead of sending them. For tests and local development. */
export class FakeEmailProvider implements EmailProvider {
  readonly sent: EmailMessage[] = [];
  private nextError: ProviderError | undefined;

  async send(message: EmailMessage): Promise<SendEmailResult> {
    if (this.nextError) {
      const error = this.nextError;
      this.nextError = undefined;
      throw error;
    }
    this.sent.push(message);
    return { id: `email_fake_${this.sent.length}` };
  }

  /** Test helper: messages sent to one address. */
  sentTo(address: string): EmailMessage[] {
    return this.sent.filter((message) => message.to === address);
  }

  /** Test helper: make the next send() fail, to test error handling. */
  failNextWith(error: ProviderError): void {
    this.nextError = error;
  }
}

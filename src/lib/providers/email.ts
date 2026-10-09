/**
 * Sending transactional email (confirmations, receipts).
 * Real implementation: Resend (v0.4). Tests and local dev: FakeEmailProvider.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  /** HTML body. */
  html: string;
  /** Plain-text body: required for deliverability and accessibility. */
  text: string;
  replyTo?: string;
  /** Labels for analytics in the provider dashboard, e.g. { type: "receipt" }. */
  tags?: Record<string, string>;
}

export interface SendEmailResult {
  /** The provider's message id, for support and debugging. */
  id: string;
}

export interface EmailProvider {
  /** Throws ProviderError if the message could not be accepted for delivery. */
  send(message: EmailMessage): Promise<SendEmailResult>;
}

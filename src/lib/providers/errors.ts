/**
 * Thrown by any provider implementation when an outside service fails.
 * `retryable` tells callers whether trying again later might succeed
 * (timeouts, rate limits) or not (invalid input, bad credentials).
 */
export class ProviderError extends Error {
  readonly provider: string;
  readonly retryable: boolean;

  constructor(
    provider: string,
    message: string,
    options: { retryable?: boolean; cause?: unknown } = {},
  ) {
    super(`[${provider}] ${message}`, { cause: options.cause });
    this.name = "ProviderError";
    this.provider = provider;
    this.retryable = options.retryable ?? false;
  }
}

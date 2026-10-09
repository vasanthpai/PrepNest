/**
 * File storage (free PDF downloads, course material).
 * Real implementation: Cloudflare R2 (v0.4). Tests: InMemoryStorageProvider.
 */

/** `Uint8Array<ArrayBuffer>`: a normal byte array (not one backed by SharedArrayBuffer). */
export type StorageBody =
  ReadableStream<Uint8Array> | ArrayBuffer | Uint8Array<ArrayBuffer> | string;

export interface StoredObject {
  body: ReadableStream<Uint8Array>;
  contentType: string;
  /** Size in bytes. */
  size: number;
}

export interface StorageProvider {
  put(key: string, body: StorageBody, options: { contentType: string }): Promise<void>;
  /** Returns null if the object does not exist. */
  get(key: string): Promise<StoredObject | null>;
  /** Deleting a missing key is not an error. */
  delete(key: string): Promise<void>;
  /** A temporary URL that lets a browser download the object directly. */
  getDownloadUrl(key: string, expiresInSeconds: number): Promise<string>;
}

/** Download links last at most 1 hour: long enough to download, short enough not to share. */
export const MAX_DOWNLOAD_URL_SECONDS = 60 * 60;

const SAFE_KEY = /^[a-z0-9][a-z0-9/_.-]*$/;

/**
 * Keys look like "lead-magnets/react-cheatsheet.pdf".
 * Lowercase, no leading slash, no "..", no empty segments: prevents path traversal and
 * keeps keys identical across storage backends.
 */
export function assertValidKey(key: string): void {
  if (
    key.length > 512 ||
    !SAFE_KEY.test(key) ||
    key.includes("..") ||
    key.includes("//") ||
    key.endsWith("/")
  ) {
    throw new RangeError(`Invalid storage key: "${key}".`);
  }
}

export function assertValidExpiry(expiresInSeconds: number): void {
  if (
    !Number.isInteger(expiresInSeconds) ||
    expiresInSeconds <= 0 ||
    expiresInSeconds > MAX_DOWNLOAD_URL_SECONDS
  ) {
    throw new RangeError(
      `Download URL expiry must be 1 to ${MAX_DOWNLOAD_URL_SECONDS} seconds, got ${expiresInSeconds}.`,
    );
  }
}

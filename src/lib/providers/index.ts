/**
 * Public API for outside services. Feature code imports interfaces from here,
 * never a vendor SDK. Fakes live in ./fakes and are imported directly by tests.
 */
export type { EmailMessage, EmailProvider, SendEmailResult } from "@/lib/providers/email";
export { ProviderError } from "@/lib/providers/errors";
export {
  type CreateOrderInput,
  MIN_ORDER_PAISE,
  type PaymentProvider,
  type PaymentSignature,
  type ProviderOrder,
  validateCreateOrder,
} from "@/lib/providers/payment";
export {
  assertValidExpiry,
  assertValidKey,
  MAX_DOWNLOAD_URL_SECONDS,
  type StorageBody,
  type StorageProvider,
  type StoredObject,
} from "@/lib/providers/storage";

import {
  assertValidExpiry,
  assertValidKey,
  type StorageBody,
  type StorageProvider,
  type StoredObject,
} from "@/lib/providers/storage";

interface MemoryObject {
  bytes: ArrayBuffer;
  contentType: string;
}

/** Keeps objects in a Map. For tests and local development. */
export class InMemoryStorageProvider implements StorageProvider {
  private readonly objects = new Map<string, MemoryObject>();

  async put(key: string, body: StorageBody, options: { contentType: string }): Promise<void> {
    assertValidKey(key);
    const bytes = await new Response(body).arrayBuffer();
    this.objects.set(key, { bytes, contentType: options.contentType });
  }

  async get(key: string): Promise<StoredObject | null> {
    assertValidKey(key);
    const object = this.objects.get(key);
    if (!object) return null;
    return {
      body: new Blob([object.bytes]).stream(),
      contentType: object.contentType,
      size: object.bytes.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    assertValidKey(key);
    this.objects.delete(key);
  }

  async getDownloadUrl(key: string, expiresInSeconds: number): Promise<string> {
    assertValidKey(key);
    assertValidExpiry(expiresInSeconds);
    const expires = Date.now() + expiresInSeconds * 1000;
    return `memory://storage/${key}?expires=${expires}`;
  }
}

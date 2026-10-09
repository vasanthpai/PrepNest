import { describe, expect, it } from "vitest";
import { MAX_DOWNLOAD_URL_SECONDS, type StorageProvider } from "@/lib/providers/storage";

/**
 * Contract test: the behaviour EVERY StorageProvider must have.
 * Run it for each implementation (in-memory now, R2 in v0.4):
 *
 *   runStorageContract("InMemoryStorageProvider", () => new InMemoryStorageProvider());
 *
 * Not named *.test.ts on purpose: it is imported by implementation test files.
 */
export function runStorageContract(name: string, create: () => StorageProvider): void {
  describe(`StorageProvider contract: ${name}`, () => {
    const read = async (storage: StorageProvider, key: string) => {
      const object = await storage.get(key);
      if (!object) return null;
      return { ...object, text: await new Response(object.body).text() };
    };

    it("round-trips content, content type and size", async () => {
      const storage = create();
      await storage.put("docs/hello.txt", "Hello, PrepNest", { contentType: "text/plain" });
      const object = await read(storage, "docs/hello.txt");
      expect(object).toMatchObject({
        text: "Hello, PrepNest",
        contentType: "text/plain",
        size: 15,
      });
    });

    it.each([
      ["string", () => "abc"],
      ["Uint8Array", () => new TextEncoder().encode("abc")],
      ["ArrayBuffer", () => new TextEncoder().encode("abc").buffer],
      ["ReadableStream", () => new Blob(["abc"]).stream()],
    ])("accepts a %s body", async (_kind, makeBody) => {
      const storage = create();
      await storage.put("body/test.bin", makeBody(), { contentType: "application/octet-stream" });
      expect((await read(storage, "body/test.bin"))?.text).toBe("abc");
    });

    it("overwrites an existing key", async () => {
      const storage = create();
      await storage.put("a.txt", "first", { contentType: "text/plain" });
      await storage.put("a.txt", "second", { contentType: "text/plain" });
      expect((await read(storage, "a.txt"))?.text).toBe("second");
    });

    it("returns null for a missing key", async () => {
      expect(await create().get("missing/file.pdf")).toBeNull();
    });

    it("deletes, and deleting a missing key is not an error", async () => {
      const storage = create();
      await storage.put("gone.txt", "x", { contentType: "text/plain" });
      await storage.delete("gone.txt");
      expect(await storage.get("gone.txt")).toBeNull();
      await expect(storage.delete("gone.txt")).resolves.toBeUndefined();
    });

    it.each([
      "../secret.pdf",
      "/absolute.pdf",
      "UPPER.pdf",
      "a//b.pdf",
      "folder/",
      "",
      "sp ace.pdf",
    ])("rejects unsafe key %j", async (key) => {
      const storage = create();
      await expect(storage.put(key, "x", { contentType: "text/plain" })).rejects.toThrow(
        RangeError,
      );
      await expect(storage.get(key)).rejects.toThrow(RangeError);
      await expect(storage.delete(key)).rejects.toThrow(RangeError);
    });

    it("creates a download URL that refers to the key", async () => {
      const url = await create().getDownloadUrl("lead-magnets/react.pdf", 300);
      expect(url).toContain("lead-magnets/react.pdf");
    });

    it.each([0, -1, 1.5, MAX_DOWNLOAD_URL_SECONDS + 1])(
      "rejects download URL expiry of %s seconds",
      async (seconds) => {
        await expect(create().getDownloadUrl("a.pdf", seconds)).rejects.toThrow(RangeError);
      },
    );
  });
}

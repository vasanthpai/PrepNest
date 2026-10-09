import { InMemoryStorageProvider } from "@/lib/providers/fakes/memory-storage";
import { runStorageContract } from "@/lib/providers/storage.contract";

runStorageContract("InMemoryStorageProvider", () => new InMemoryStorageProvider());

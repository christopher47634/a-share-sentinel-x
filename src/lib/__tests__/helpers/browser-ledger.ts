import { vi } from "vitest";

/** trade-engine 只在浏览器里跑：内存版 localStorage + window，fetch 一律 404（不连服务端账本） */
export class MemoryStorage {
  private data = new Map<string, string>();
  failWrites = false;
  getItem(key: string) {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
}

export function installBrowserLedger(): MemoryStorage {
  const storage = new MemoryStorage();
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 404 })));
  return storage;
}

/** 北京时间 date 的 10:00（盘中） */
export function shanghaiMorning(date: string): Date {
  return new Date(`${date}T02:00:00Z`);
}

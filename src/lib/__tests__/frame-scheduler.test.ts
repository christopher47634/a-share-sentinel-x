import { afterEach, describe, expect, it, vi } from "vitest";

// 手动驱动的 requestAnimationFrame
let queued: ((t: number) => void) | null = null;
vi.stubGlobal("requestAnimationFrame", (cb: (t: number) => void) => {
  queued = cb;
  return 1;
});
vi.stubGlobal("cancelAnimationFrame", () => {
  queued = null;
});
const doc = { hidden: false, addEventListener: vi.fn() };
vi.stubGlobal("document", doc);

const { activeFrameSubscribers, subscribeFrame } = await import("@/lib/frame-scheduler");

function step(t: number) {
  const cb = queued;
  queued = null;
  cb?.(t);
}

describe("frame-scheduler", () => {
  afterEach(() => {
    queued = null;
  });

  it("runs every subscriber on one shared frame and stops when the last one leaves", () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = subscribeFrame(a);
    const offB = subscribeFrame(b);
    step(16);
    expect(a).toHaveBeenCalledWith(16);
    expect(b).toHaveBeenCalledWith(16);
    offA();
    offB();
    expect(activeFrameSubscribers()).toBe(0);
    expect(queued).toBeNull();
  });

  it("keeps looping when one subscriber throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const good = vi.fn();
    const offBad = subscribeFrame(() => {
      throw new Error("boom");
    });
    const offGood = subscribeFrame(good);
    step(16);
    step(32);
    expect(good).toHaveBeenCalledTimes(2);
    offBad();
    offGood();
  });

  it("does not schedule frames while the tab is hidden", () => {
    doc.hidden = true;
    const off = subscribeFrame(vi.fn());
    expect(queued).toBeNull();
    off();
    doc.hidden = false;
  });
});

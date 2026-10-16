/**
 * 全站共用的一个 requestAnimationFrame 循环。动效组件订阅后每帧收到时间戳；
 * 没有订阅者、或者标签页在后台时循环完全停下。一个订阅者抛错不会带走其他订阅者。
 */
type FrameCallback = (time: number) => void;

const subscribers = new Set<FrameCallback>();
let rafId = 0;

function tick(time: number) {
  rafId = 0;
  if (typeof document !== "undefined" && document.hidden) return;
  subscribers.forEach((callback) => {
    try {
      callback(time);
    } catch (error) {
      console.error("[frame-scheduler] subscriber threw", error);
    }
  });
  if (subscribers.size > 0) rafId = requestAnimationFrame(tick);
}

function start() {
  if (rafId || subscribers.size === 0 || (typeof document !== "undefined" && document.hidden)) return;
  rafId = requestAnimationFrame(tick);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else {
      start();
    }
  });
}

/** 订阅每帧回调，返回取消函数 */
export function subscribeFrame(callback: FrameCallback): () => void {
  subscribers.add(callback);
  start();
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
}

/** 当前订阅者数量（调试、测试用） */
export function activeFrameSubscribers(): number {
  return subscribers.size;
}

"use client";

import { useEffect, useRef } from "react";

/**
 * 页面可见时按间隔重复执行 task：挂载时立即执行一次；切到后台暂停，回到前台立刻补一次。
 * 上一次没跑完不会叠着发下一次。key 变化时重新开始（例如请求的代码列表变了）。
 * task 收到的 isCancelled() 在卸载或 key 变化后返回 true，用来丢弃过期结果。
 */
export function useVisiblePolling(task: (isCancelled: () => boolean) => Promise<void>, intervalMs: number, key = "") {
  const taskRef = useRef(task);
  taskRef.current = task;

  useEffect(() => {
    let cancelled = false;
    let running = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const isCancelled = () => cancelled;

    const schedule = () => {
      if (timer) clearTimeout(timer);
      if (!cancelled) timer = setTimeout(run, intervalMs);
    };
    async function run() {
      if (cancelled || running) return;
      if (document.hidden) return schedule();
      running = true;
      try {
        await taskRef.current(isCancelled);
      } catch {
        // 失败时保持现有数据，下一轮再试
      } finally {
        running = false;
        schedule();
      }
    }
    const onVisible = () => {
      if (!document.hidden) void run();
    };

    void run();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs, key]);
}

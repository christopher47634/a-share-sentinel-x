"use client";

import { useEffect, useRef, type RefObject } from "react";
import { subscribeFrame } from "@/lib/frame-scheduler";

/** 回到视口或前台时，第一帧最多推进这么多秒，避免动画跳一大截 */
const MAX_DELTA_S = 0.1;

/**
 * 板块 Canvas 的共用动画循环：
 * - 按设备像素比设置画布尺寸（最多 2 倍）；
 * - 减弱动效或关闭动画时只画一帧静态图；
 * - 只在画布进入视口时订阅全站共用的帧循环，离开视口就退订（以前离开视口仍每帧唤醒）；
 * - 标签页在后台时帧循环整体暂停。
 * frame(t) 收到的是累计的「可见时长」（秒），离开视口期间动画时间不前进。
 */
export function useCanvasLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number,
  animationsEnabled: boolean,
  render: { frame: (time: number) => void; still: () => void }
) {
  const renderRef = useRef(render);
  renderRef.current = render;
  const elapsedRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.getContext("2d")?.scale(dpr, dpr);

    if (reducedMotion || !animationsEnabled) {
      renderRef.current.still();
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let last = 0;
    const onFrame = (time: number) => {
      const delta = last ? Math.min((time - last) / 1000, MAX_DELTA_S) : 0;
      last = time;
      elapsedRef.current += delta;
      renderRef.current.frame(elapsedRef.current);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (visible && !unsubscribe) {
          last = 0;
          unsubscribe = subscribeFrame(onFrame);
        } else if (!visible && unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      unsubscribe?.();
    };
  }, [canvasRef, width, height, animationsEnabled]);
}

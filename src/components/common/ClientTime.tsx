"use client";

import { useEffect, useState } from "react";

/**
 * 时间只在浏览器挂载后渲染：服务端渲染时刻和客户端水合时刻不同，直接渲染会触发 hydration 不一致。
 * 统一按北京时间显示。
 */
export default function ClientTime({
  value,
  seconds = false,
}: {
  /** ISO 字符串；不传表示「当前时间」 */
  value?: string;
  seconds?: boolean;
}) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      setText("--");
      return;
    }
    setText(
      date.toLocaleTimeString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
        ...(seconds ? { second: "2-digit" as const } : {}),
      })
    );
  }, [value, seconds]);

  return <>{text ?? "--:--"}</>;
}

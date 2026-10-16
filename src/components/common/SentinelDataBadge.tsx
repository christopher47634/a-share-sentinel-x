import type { SentinelDataSource } from "@/hooks/useSentinelCore";

/**
 * 页面标题旁的数据来源标注。AI 结论来自哪里必须一眼看清：
 * - 演示数据：内置的 5 只股票、6 个板块和写死账户（实时行情拿不到时）；
 * - 实时行情：内置观察样本的实时报价，板块由样本成分股汇总；账户是本地模拟账本或演示账户。
 */
export default function SentinelDataBadge({ source }: { source?: SentinelDataSource }) {
  if (!source || source.mode === "demo") {
    return (
      <span
        title="AI 结果基于内置演示样本（5 只股票、6 个板块、演示账户），非实时行情"
        className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 align-middle text-[11px] font-medium text-amber-500"
      >
        演示数据
      </span>
    );
  }
  const account = source.account === "local" ? "本地模拟账户" : "演示账户";
  return (
    <span
      title={`实时报价 ${source.liveCount}/${source.sampleSize} 只（${source.sourceLabel}）；板块由样本成分股汇总，量比、涨速等字段暂缺；账户：${account}`}
      className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 align-middle text-[11px] font-medium text-emerald-500"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      实时样本 {source.liveCount} 只 · {account}
    </span>
  );
}

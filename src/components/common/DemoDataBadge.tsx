/**
 * 页面上的 AI 结果来自 generateSentinelDemoData() 的固定样本（5 只股票、6 个板块、写死账户），
 * 不是真实行情和你的模拟账户。在接入真实数据之前，这些页面必须明确标出来。
 */
export default function DemoDataBadge({ note = "AI 结果基于内置样本，非实时行情" }: { note?: string }) {
  return (
    <span
      title={note}
      className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 align-middle text-[11px] font-medium text-amber-500"
    >
      演示数据
    </span>
  );
}

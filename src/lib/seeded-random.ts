/**
 * 确定性伪随机数（mulberry32）。演示数据如果用 Math.random()：页面在构建时预渲染一份，
 * 浏览器水合时又生成另一份，数字对不上就触发 hydration 报错，每次刷新也都不一样。
 */
export function seededRandom(seedText: string): () => number {
  let seed = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    seed = Math.imul(seed ^ seedText.charCodeAt(i), 16777619);
  }
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

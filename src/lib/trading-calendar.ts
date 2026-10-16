import { shanghaiDate } from "./time";

/**
 * 沪深交易日历。
 *
 * 规则：周六周日不开市（调休补班的周末也不开市），下表里的法定节假日休市。
 * 节假日表来自国务院办公厅公布的当年放假安排，交易所休市安排与之一致；
 * 每年年底交易所发布次年休市通知后需要补一年数据。
 * 表里没有的年份直接抛错，不按「只排除周末」猜，避免把节假日当成交易日。
 */
const HOLIDAYS: Record<number, readonly string[]> = {
  2026: [
    // 元旦
    "2026-01-01", "2026-01-02",
    // 春节
    "2026-02-16", "2026-02-17", "2026-02-18", "2026-02-19", "2026-02-20", "2026-02-23",
    // 清明节
    "2026-04-06",
    // 劳动节
    "2026-05-01", "2026-05-04", "2026-05-05",
    // 端午节
    "2026-06-19",
    // 中秋节
    "2026-09-25",
    // 国庆节
    "2026-10-01", "2026-10-02", "2026-10-05", "2026-10-06", "2026-10-07",
  ],
};

const holidaySets = new Map<number, Set<string>>(
  Object.entries(HOLIDAYS).map(([year, days]) => [Number(year), new Set(days)]),
);

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function calendarYears(): number[] {
  return Array.from(holidaySets.keys()).sort();
}

function parse(date: string): { year: number; utc: Date } {
  const m = DATE_RE.exec(date);
  if (!m) throw new RangeError(`日期格式应为 YYYY-MM-DD：${date}`);
  const utc = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (utc.toISOString().slice(0, 10) !== date) throw new RangeError(`无效日期：${date}`);
  return { year: Number(m[1]), utc };
}

function format(utc: Date): string {
  return utc.toISOString().slice(0, 10);
}

/** 是否交易日。日期按上海日历的 YYYY-MM-DD 传入。 */
export function isTradingDay(date: string): boolean {
  const { year, utc } = parse(date);
  const holidays = holidaySets.get(year);
  if (!holidays) throw new RangeError(`交易日历缺少 ${year} 年的休市数据`);
  const weekday = utc.getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return !holidays.has(date);
}

function stepTradingDay(date: string, step: 1 | -1): string {
  const cursor = parse(date).utc;
  // 最长的休市（春节）加两头周末也不超过 15 天
  for (let i = 0; i < 15; i += 1) {
    cursor.setUTCDate(cursor.getUTCDate() + step);
    const day = format(cursor);
    if (isTradingDay(day)) return day;
  }
  throw new RangeError(`${date} 附近 15 天内找不到交易日，休市数据可能有误`);
}

/** date 之后的第一个交易日（不含 date 本身）。 */
export function nextTradingDay(date: string): string {
  return stepTradingDay(date, 1);
}

/** date 之前的最后一个交易日（不含 date 本身）。 */
export function previousTradingDay(date: string): string {
  return stepTradingDay(date, -1);
}

/** T+1：date 买入的股票最早可以卖出的日期，即下一个交易日。 */
export function sellableFrom(buyDate: string): string {
  return nextTradingDay(buyDate);
}

export type TradingSession =
  | "closed"
  | "pre-open"
  | "opening-auction"
  | "morning"
  | "lunch-break"
  | "afternoon"
  | "closing-auction";

function shanghaiMinutes(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const minute = Number(parts.find((p) => p.type === "minute")?.value);
  return hour * 60 + minute;
}

/**
 * 当前处于哪个交易时段（上海时间）。
 * 9:15–9:25 集合竞价，9:30–11:30 上午连续竞价，13:00–14:57 下午连续竞价，14:57–15:00 收盘集合竞价。
 */
export function tradingSession(now: Date = new Date()): TradingSession {
  if (!isTradingDay(shanghaiDate(now))) return "closed";
  const t = shanghaiMinutes(now);
  if (t < 9 * 60 + 15) return "pre-open";
  if (t < 9 * 60 + 25) return "opening-auction";
  if (t < 9 * 60 + 30) return "pre-open";
  if (t < 11 * 60 + 30) return "morning";
  if (t < 13 * 60) return "lunch-break";
  if (t < 14 * 60 + 57) return "afternoon";
  if (t < 15 * 60) return "closing-auction";
  return "closed";
}

/** 连续竞价或集合竞价期间才有实时成交，其余时段行情是上一笔的静态值。 */
export function isMarketOpen(now: Date = new Date()): boolean {
  const s = tradingSession(now);
  return s === "opening-auction" || s === "morning" || s === "afternoon" || s === "closing-auction";
}

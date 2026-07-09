// ─── Order Mock Data ──────────────────────────────────────────────
// Enhanced order model with realistic fields:
//   - Partial fills, avg fill price
//   - Commission (0.025%) and stamp tax (sell-only, 0.05%)
//   - Rejection reasons
//   - Real-looking order IDs: WT + YYYYMMDD + 6-digit sequence

import { MARKET_DATE } from "./market";

/** Sequential counter for realistic order ID generation */
let orderSeq = 1;

export interface MockOrder {
  id: string;
  stockCode: string;
  stockName: string;
  side: "buy" | "sell";
  price: number;
  quantity: number;
  totalAmount: number;
  status:
    | "submitted"
    | "matching"
    | "partial_filled"
    | "filled"
    | "cancelled"
    | "rejected";
  createdAt: number; // unix timestamp ms
  filledAt?: number;
  /** Quantity actually filled (for partial fills) */
  filledQuantity: number;
  /** Volume-weighted average fill price */
  avgFillPrice: number;
  /** Broker commission: 0.025% of trade value (min ¥5) */
  commission: number;
  /** Stamp tax: sell-only, 0.05% of trade value */
  stampTax: number;
  /** Rejection reason (only for "rejected" status) */
  rejectReason?: string;
}

const STORAGE_KEY = "nexus-trade-orders";

/** Generate a realistic order ID: WT + date + 6-digit sequence */
function generateOrderId(): string {
  const dateStr = MARKET_DATE.replace(/-/g, "");
  const seq = String(orderSeq++).padStart(6, "0");
  return `WT${dateStr}${seq}`;
}

/** Generate a realistic intraday timestamp between 09:30 and 15:00 */
function randomIntradayTimestamp(): number {
  const date = new Date(`${MARKET_DATE}T00:00:00+08:00`);
  // Market hours: 09:30 - 11:30 (morning) or 13:00 - 15:00 (afternoon)
  const isMorning = Math.random() > 0.45;
  if (isMorning) {
    date.setHours(9, 30 + Math.floor(Math.random() * 120), Math.floor(Math.random() * 60));
  } else {
    date.setHours(13, Math.floor(Math.random() * 120), Math.floor(Math.random() * 60));
  }
  return date.getTime();
}

/** Calculate commission: 0.025% of trade value, minimum ¥5 */
function calcCommission(totalAmount: number): number {
  return Math.max(5, parseFloat((totalAmount * 0.00025).toFixed(2)));
}

/** Calculate stamp tax: sell-only, 0.05% of trade value */
function calcStampTax(totalAmount: number, side: "buy" | "sell"): number {
  if (side === "buy") return 0;
  return parseFloat((totalAmount * 0.0005).toFixed(2));
}

/** Load orders from localStorage (falls back to in-memory during SSR) */
function loadOrders(): MockOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MockOrder[];
  } catch {
    return [];
  }
}

/** Save orders to localStorage (no-op during SSR) */
function saveOrders(list: MockOrder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// In-memory store: hydrated from localStorage on first client-side access
let orders: MockOrder[] = [];
let initialised = false;

function ensureInit(): void {
  if (!initialised && typeof window !== "undefined") {
    orders = loadOrders();
    initialised = true;
  }
}

export function createOrder(params: {
  stockCode: string;
  stockName: string;
  side: "buy" | "sell";
  price: number;
  quantity: number;
}): MockOrder {
  ensureInit();
  const totalAmount = parseFloat((params.price * params.quantity).toFixed(2));
  const order: MockOrder = {
    id: generateOrderId(),
    stockCode: params.stockCode,
    stockName: params.stockName,
    side: params.side,
    price: params.price,
    quantity: params.quantity,
    totalAmount,
    status: "submitted",
    createdAt: randomIntradayTimestamp(),
    filledQuantity: 0,
    avgFillPrice: 0,
    commission: 0,
    stampTax: 0,
  };
  orders.unshift(order);
  // Keep last 50 orders
  if (orders.length > 50) orders = orders.slice(0, 50);
  saveOrders(orders);
  return order;
}

export function updateOrderStatus(
  orderId: string,
  status: MockOrder["status"]
): MockOrder | undefined {
  ensureInit();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;

    if (status === "filled") {
      order.filledAt = Date.now();
      order.filledQuantity = order.quantity;
      order.avgFillPrice = order.price;
      order.commission = calcCommission(order.totalAmount);
      order.stampTax = calcStampTax(order.totalAmount, order.side);
    }

    if (status === "partial_filled") {
      order.filledAt = Date.now();
      // Simulate 60-90% fill
      const fillRatio = 0.6 + Math.random() * 0.3;
      order.filledQuantity = Math.floor(order.quantity * fillRatio / 100) * 100;
      order.avgFillPrice = order.price;
      const partialAmount = order.price * order.filledQuantity;
      order.commission = calcCommission(partialAmount);
      order.stampTax = calcStampTax(partialAmount, order.side);
    }

    if (status === "rejected") {
      order.filledAt = Date.now();
      order.rejectReason = "委托价格超出涨跌幅限制";
    }

    saveOrders(orders);
  }
  return order;
}

export function getOrders(): MockOrder[] {
  ensureInit();
  return [...orders];
}

export function getOrdersByStock(stockCode: string): MockOrder[] {
  ensureInit();
  return orders.filter((o) => o.stockCode === stockCode);
}

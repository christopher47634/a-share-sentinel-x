import type { AccountTransaction } from '@/types/account';

// ─── Mock Account Transactions ─────────────────────────────────────
// ~10 transactions corresponding to position building activity
// Uses realistic order IDs and timestamps

export const mockTransactions: AccountTransaction[] = [
  {
    id: 'txn-001',
    type: 'buy',
    stockCode: '600519',
    amount: -165_000, // Cash outflow
    createdAt: '2026-05-22T09:35:12.000Z',
    relatedOrderId: 'ord-20260522-001',
  },
  {
    id: 'txn-002',
    type: 'fee',
    stockCode: '600519',
    amount: -165, // 佣金 0.1%
    createdAt: '2026-05-22T09:35:12.000Z',
    relatedOrderId: 'ord-20260522-001',
  },
  {
    id: 'txn-003',
    type: 'buy',
    stockCode: '300308',
    amount: -24_000,
    createdAt: '2026-05-26T10:12:45.000Z',
    relatedOrderId: 'ord-20260526-002',
  },
  {
    id: 'txn-004',
    type: 'fee',
    stockCode: '300308',
    amount: -24,
    createdAt: '2026-05-26T10:12:45.000Z',
    relatedOrderId: 'ord-20260526-002',
  },
  {
    id: 'txn-005',
    type: 'sell',
    stockCode: '000858', // 五粮液 — sold earlier position
    amount: 45_500,
    realizedPnL: 1_200,
    createdAt: '2026-05-28T14:22:33.000Z',
    relatedOrderId: 'ord-20260528-003',
  },
  {
    id: 'txn-006',
    type: 'fee',
    stockCode: '000858',
    amount: -45.5,
    createdAt: '2026-05-28T14:22:33.000Z',
    relatedOrderId: 'ord-20260528-003',
  },
  {
    id: 'txn-007',
    type: 'buy',
    stockCode: '300750',
    amount: -29_250,
    createdAt: '2026-05-30T09:45:18.000Z',
    relatedOrderId: 'ord-20260530-004',
  },
  {
    id: 'txn-008',
    type: 'fee',
    stockCode: '300750',
    amount: -29.25,
    createdAt: '2026-05-30T09:45:18.000Z',
    relatedOrderId: 'ord-20260530-004',
  },
  {
    id: 'txn-009',
    type: 'buy',
    stockCode: '688256',
    amount: -26_000,
    createdAt: '2026-06-05T10:08:52.000Z',
    relatedOrderId: 'ord-20260605-005',
  },
  {
    id: 'txn-010',
    type: 'fee',
    stockCode: '688256',
    amount: -26,
    createdAt: '2026-06-05T10:08:52.000Z',
    relatedOrderId: 'ord-20260605-005',
  },
  {
    id: 'txn-011',
    type: 'dividend',
    stockCode: '600519',
    amount: 500, // 茅台分红
    createdAt: '2026-06-10T09:00:00.000Z',
    relatedOrderId: 'ord-div-20260610-001',
  },
];

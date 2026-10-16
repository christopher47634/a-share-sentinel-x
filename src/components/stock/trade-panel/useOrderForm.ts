"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Stock } from "@/mock/stocks";
import type { MockOrder } from "@/mock/orders";
import { getAccount } from "@/lib/account-storage";
import {
  calcCommission,
  calcStampTax,
  executeBuy,
  executeSell,
  getAvailableSellQuantity,
  maxBuyQuantityFor,
} from "@/lib/trade-engine";

export type TradeSide = "buy" | "sell";
export type OrderStep = "input" | "confirm" | "submitted" | "matching" | "filled";
export type OrderType = "limit" | "market";

/** 模拟撮合的节奏：已提交 → 撮合中 → 成交 */
const MATCHING_AT_MS = 1200;
const FILLED_AT_MS = 3000;
/** 价格最小变动单位 */
const TICK = 0.01;

/**
 * 下单面板的全部状态和计算。账户数据（可用资金、可卖数量）只在挂载、成交后和账本变更事件时读一次，
 * 不再每次渲染都解析 localStorage。
 */
export function useOrderForm(stock: Stock, initialSide: TradeSide) {
  const [side, setSide] = useState<TradeSide>(initialSide);
  const [price, setPrice] = useState(stock.price.toFixed(2));
  const [quantity, setQuantity] = useState(100);
  const [step, setStep] = useState<OrderStep>("input");
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [error, setError] = useState<string | null>(null);
  const readLedger = useCallback(
    () => ({ availableCash: getAccount().availableCash, availableSellQty: getAvailableSellQuantity(stock.code) }),
    [stock.code],
  );
  const [ledger, setLedger] = useState(readLedger);
  const orderRef = useRef<MockOrder | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 账本变了（本面板成交后交易引擎会发事件、别的标签页下单触发 storage）就重读
  useEffect(() => {
    const refresh = () => setLedger(readLedger());
    refresh();
    window.addEventListener("sentinel:account-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sentinel:account-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [readLedger]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const priceNum = parseFloat(price) || 0;
  const totalAmount = priceNum * quantity;
  const commission = calcCommission(totalAmount);
  const stampTax = side === "sell" ? calcStampTax(totalAmount) : 0;
  const netAmount = side === "buy" ? totalAmount + commission : totalAmount - commission - stampTax;
  const quantityLots = quantity / 100;

  const maxBuy = maxBuyQuantityFor(ledger.availableCash, priceNum);

  /** 价格微调，下限一个最小变动单位，不会出现 0 或负价 */
  const nudgePrice = useCallback((direction: 1 | -1) => {
    setPrice((current) => Math.max(TICK, (parseFloat(current) || 0) + direction * TICK).toFixed(2));
  }, []);

  const submit = () => {
    setError(null);
    setStep("confirm");
  };

  const confirm = () => {
    const result =
      side === "buy"
        ? executeBuy({
            stockCode: stock.code,
            stockName: stock.name,
            sectorId: stock.sectorId,
            price: priceNum,
            quantity,
            prevClose: stock.prevClose,
          })
        : executeSell({
            stockCode: stock.code,
            stockName: stock.name,
            price: priceNum,
            quantity,
            prevClose: stock.prevClose,
          });

    if (!result.success) {
      setError(result.error ?? "交易失败");
      setStep("input");
      return;
    }

    orderRef.current = result.order ?? null;
    setStep("submitted");
    timers.current.push(setTimeout(() => setStep("matching"), MATCHING_AT_MS));
    timers.current.push(setTimeout(() => setStep("filled"), FILLED_AT_MS));
  };

  const cancelConfirm = () => setStep("input");

  const reset = () => {
    setStep("input");
    orderRef.current = null;
  };

  return {
    stock,
    side,
    setSide,
    price,
    setPrice,
    nudgePrice,
    quantity,
    setQuantity,
    quantityLots,
    step,
    orderType,
    setOrderType,
    error,
    priceNum,
    totalAmount,
    commission,
    stampTax,
    netAmount,
    availableCash: ledger.availableCash,
    availableSellQty: ledger.availableSellQty,
    maxBuy,
    order: orderRef.current,
    submit,
    confirm,
    cancelConfirm,
    reset,
  };
}

export type OrderForm = ReturnType<typeof useOrderForm>;

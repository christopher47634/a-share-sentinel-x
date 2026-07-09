import { getAccount, saveAccount, getPositions, savePositions, getTransactions, saveTransactions, recordPortfolioSnapshot } from './account-storage'
import { syncLocalLedgerSnapshot } from './local-ledger'
import { getAccountSummary } from '@/mock/account'
import { createOrder, updateOrderStatus } from '@/mock/orders'
import type { AccountTransaction, AccountSummary } from '@/types/account'
import type { MockOrder } from '@/mock/orders'

interface BuyParams {
  stockCode: string
  stockName: string
  sectorId: string
  price: number
  quantity: number
}

interface SellParams {
  stockCode: string
  stockName: string
  price: number
  quantity: number
}

interface TradeResult {
  success: boolean
  order?: MockOrder
  error?: string
  updatedAccount?: AccountSummary
}

/** Commission: 0.025% of total, minimum ¥5 */
export function calcCommission(total: number): number {
  return Math.max(5, parseFloat((total * 0.00025).toFixed(2)));
}

/** Stamp tax: sell-only, 0.05% of total */
export function calcStampTax(total: number): number {
  return parseFloat((total * 0.0005).toFixed(2));
}

export function executeBuy(params: BuyParams): TradeResult {
  const { stockCode, stockName, sectorId, price, quantity } = params
  
  if (quantity <= 0 || quantity % 100 !== 0) {
    return { success: false, error: '买入数量必须是100股的整数倍' }
  }
  
  const totalAmount = price * quantity
  const commission = calcCommission(totalAmount)
  const totalCost = totalAmount + commission
  
  const account = getAccount()
  if (account.availableCash < totalCost) {
    return { success: false, error: `可用资金不足。需要 ¥${totalCost.toLocaleString()}，当前可用 ¥${account.availableCash.toLocaleString()}` }
  }
  
  account.availableCash -= totalCost
  
  const positions = getPositions()
  const existingIndex = positions.findIndex(p => p.stockCode === stockCode)
  
  if (existingIndex >= 0) {
    const existing = positions[existingIndex]
    const oldCost = existing.avgCost * existing.quantity
    const newCost = price * quantity + commission
    const newQuantity = existing.quantity + quantity
    
    existing.avgCost = (oldCost + newCost) / newQuantity
    existing.quantity = newQuantity
    existing.availableQuantity = newQuantity
    existing.currentPrice = price
    existing.marketValue = price * newQuantity
    existing.unrealizedPnL = (price - existing.avgCost) * newQuantity
    existing.unrealizedPnLPercent = existing.avgCost > 0 ? ((price - existing.avgCost) / existing.avgCost) * 100 : 0
    existing.todayPnL = (price - existing.openPrice) * newQuantity
  } else {
    positions.push({
      stockCode, stockName, sectorId,
      quantity, availableQuantity: quantity,
      avgCost: (totalAmount + commission) / quantity,
      openPrice: price, currentPrice: price,
      marketValue: totalAmount,
      unrealizedPnL: 0, unrealizedPnLPercent: 0, todayPnL: 0,
      positionRatio: 0, riskLevel: 'medium'
    })
  }
  
  const updatedAccount = getAccountSummary(positions)
  updatedAccount.availableCash = account.availableCash
  
  const order = createOrder({ stockCode, stockName, side: 'buy', price, quantity })
  setTimeout(() => updateOrderStatus(order.id, 'filled'), 100)
  
  const txn: AccountTransaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'buy', stockCode, amount: -totalCost,
    createdAt: new Date().toISOString(), relatedOrderId: order.id
  }
  
  const txns = getTransactions()
  txns.unshift(txn)
  
  savePositions(positions)
  saveAccount(updatedAccount)
  saveTransactions(txns)
  recordPortfolioSnapshot(updatedAccount)
  void syncLocalLedgerSnapshot('trade-buy')
  
  return { success: true, order, updatedAccount }
}

export function executeSell(params: SellParams): TradeResult {
  const { stockCode, stockName, price, quantity } = params
  
  if (quantity <= 0 || quantity % 100 !== 0) {
    return { success: false, error: '卖出数量必须是100股的整数倍' }
  }
  
  const positions = getPositions()
  const positionIndex = positions.findIndex(p => p.stockCode === stockCode)
  
  if (positionIndex < 0) return { success: false, error: '没有该股票的持仓' }
  
  const position = positions[positionIndex]
  if (position.availableQuantity < quantity) {
    return { success: false, error: `可卖数量不足。可卖 ${position.availableQuantity} 股，您要卖 ${quantity} 股` }
  }
  
  const totalAmount = price * quantity
  const commission = calcCommission(totalAmount)
  const stampTax = calcStampTax(totalAmount)
  const netAmount = totalAmount - commission - stampTax
  const realizedPnL = (price - position.avgCost) * quantity - commission - stampTax
  
  const account = getAccount()
  account.availableCash += netAmount
  
  position.quantity -= quantity
  position.availableQuantity -= quantity
  
  if (position.quantity === 0) {
    positions.splice(positionIndex, 1)
  } else {
    position.currentPrice = price
    position.marketValue = price * position.quantity
    position.unrealizedPnL = (price - position.avgCost) * position.quantity
    position.unrealizedPnLPercent = position.avgCost > 0 ? ((price - position.avgCost) / position.avgCost) * 100 : 0
    position.todayPnL = (price - position.openPrice) * position.quantity
  }
  
  const updatedAccount = getAccountSummary(positions)
  updatedAccount.availableCash = account.availableCash
  
  const order = createOrder({ stockCode, stockName, side: 'sell', price, quantity })
  setTimeout(() => updateOrderStatus(order.id, 'filled'), 100)
  
  const txn: AccountTransaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'sell', stockCode, amount: netAmount, realizedPnL,
    createdAt: new Date().toISOString(), relatedOrderId: order.id
  }
  
  const txns = getTransactions()
  txns.unshift(txn)
  
  savePositions(positions)
  saveAccount(updatedAccount)
  saveTransactions(txns)
  recordPortfolioSnapshot(updatedAccount)
  void syncLocalLedgerSnapshot('trade-sell')
  
  return { success: true, order, updatedAccount }
}

export function getMaxBuyQuantity(price: number): number {
  const account = getAccount()
  const commission = calcCommission(price * 100)
  const costPerLot = price * 100 + commission
  return Math.floor(account.availableCash / costPerLot) * 100
}

export function getAvailableSellQuantity(stockCode: string): number {
  const positions = getPositions()
  return positions.find(p => p.stockCode === stockCode)?.availableQuantity ?? 0
}

export function resetDemoAccount(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('nexus-trade-account')
  localStorage.removeItem('nexus-trade-positions')
  localStorage.removeItem('nexus-trade-transactions')
  localStorage.removeItem('nexus-trade-history')
  localStorage.removeItem('nexus-trade-orders')
  // Re-import to avoid circular dependency issues
  import('./account-storage').then(({ initializeAccount }) => initializeAccount())
}

// Sentinel 引擎的输入输出类型。

export type MarketRegime =
  | "全面强势"
  | "结构性强势"
  | "震荡偏强"
  | "震荡分化"
  | "弱势调整"
  | "恐慌下跌";

export type MarketStyle =
  | "科技成长"
  | "低估值防御"
  | "权重拉升"
  | "题材活跃"
  | "消费修复"
  | "金融护盘"
  | "小盘活跃"
  | "大盘分化"
  | "风险偏好上升"
  | "风险偏好下降"
  | "暂无明确风格";

export type AlertLevel = "High" | "Medium" | "Low" | "Risk";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type SignalType =
  | "PRICE"
  | "VOLUME"
  | "SPEED"
  | "SECTOR"
  | "POSITION"
  | "PLAN"
  | "RISK";

export interface SentinelStock {
  code: string;
  name: string;
  price: number;
  prevClose?: number;
  changePct: number;
  fiveMinChangePct?: number;
  tenMinChangePct?: number;
  speed?: number;
  volumeRatio?: number;
  turnoverRate?: number;
  amount?: number;
  volume?: number;
  avg20Volume?: number;
  high20?: number;
  low20?: number;
  sector?: string;
  concepts?: string[];
  isWatchlist?: boolean;
}

export interface SentinelSector {
  name: string;
  changePct: number;
  upCount: number;
  downCount: number;
  turnoverRate?: number;
  leadingStock?: string;
  leadingStockChangePct?: number;
  heatScore?: number;
}

export interface SentinelIndex {
  code: string;
  name: string;
  price: number;
  changePct: number;
  amount?: number;
}

export interface SentinelPosition {
  code: string;
  name: string;
  quantity: number;
  costPrice: number;
  currentPrice: number;
  marketValue: number;
  positionRatio: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  sector?: string;
  concepts?: string[];
  plan?: string;
  riskLevel?: RiskLevel;
  watchReason?: string;
  stopLossPrice?: number;
  targetPrice?: number;
}

export interface SentinelOrder {
  id: string;
  code: string;
  name: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  amount: number;
  status: "submitted" | "matching" | "filled" | "rejected" | "cancelled";
  createdAt: string;
}

export interface SentinelTrade {
  id: string;
  orderId?: string;
  code: string;
  name: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  amount: number;
  fee?: number;
  createdAt: string;
}

export interface SentinelAccount {
  totalAssets: number;
  cash: number;
  marketValue: number;
  todayPnl: number;
  totalPnl: number;
  totalReturnPct: number;
  maxDrawdownPct?: number;
  positions: SentinelPosition[];
  orders?: SentinelOrder[];
  trades?: SentinelTrade[];
}

export interface MarketSnapshotInput {
  indices: SentinelIndex[];
  stocks: SentinelStock[];
  sectors: SentinelSector[];
  account?: SentinelAccount;
}

export interface MarketRadarResult {
  marketTemperature: number;
  marketRegime: MarketRegime;
  marketStyle: MarketStyle;
  upCount: number;
  downCount: number;
  flatCount: number;
  hotSectors: SentinelSector[];
  weakSectors: SentinelSector[];
  hotStocks: SentinelStock[];
  weakStocks: SentinelStock[];
  highVolumeStocks: SentinelStock[];
  riskSignals: string[];
  oneLineSummary: string;
  brief: string;
  observationPoints: string[];
}

export interface Signal {
  id: string;
  code: string;
  name: string;
  signalName: string;
  signalType: SignalType;
  score: number;
  evidence: string[];
  relatedToPosition: boolean;
  relatedToPlan: boolean;
  triggeredAt: string;
}

export interface Alert {
  id: string;
  code: string;
  name: string;
  level: AlertLevel;
  score: number;
  title: string;
  signals: Signal[];
  evidence: string[];
  aiExplanation: string;
  riskNote: string;
  observationPoints: string[];
  relatedToPosition: boolean;
  relatedToPlan: boolean;
  createdAt: string;
}

export interface RiskItem {
  id: string;
  level: RiskLevel;
  title: string;
  reason: string;
  affectedPositions: string[];
  evidence: string[];
  observationPoints: string[];
}

export interface RiskShieldResult {
  overallRiskLevel: RiskLevel;
  riskScore: number;
  riskItems: RiskItem[];
  explanation: string;
  observationPoints: string[];
}

export interface CausalityReport {
  code: string;
  name: string;
  oneLineSummary: string;
  marketFacts: string[];
  shallowAttribution: string[];
  structuralAttribution: string[];
  marketStyleAttribution: string[];
  eventAttribution: string[];
  portfolioImpact: string[];
  planCheck: string[];
  riskNotes: string[];
  observationPoints: string[];
  finalText: string;
}

export interface JournalResult {
  date: string;
  accountSummary: string[];
  marketSummary: string[];
  alertSummary: string[];
  tradeSummary: string[];
  riskSummary: string[];
  effectiveAlerts: Alert[];
  highPriorityAlerts: Alert[];
  nextDayWatchlist: string[];
  reviewText: string;
}

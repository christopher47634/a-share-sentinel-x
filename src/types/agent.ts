export type AgentStatus = "running" | "idle" | "success" | "warning" | "error";

export type AgentRole =
  | "data" | "portfolio" | "market" | "signal" | "watch"
  | "attribution" | "risk" | "explain" | "review" | "compliance";

export interface AgentState {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  lastRunAt: string;     // ISO timestamp
  durationMs: number;
  inputSummary: string;
  outputSummary: string;
  error?: string;
  recentLogs: string[];
}

export interface IntelligenceEvent {
  id: string;
  timestamp: string;     // "HH:MM" format
  agent: AgentRole;
  message: string;       // 中文消息，如 "半导体板块进入热度 Top 3"
  level: "info" | "warning" | "critical" | "success";
  relatedStock?: string;
  relatedSector?: string;
}

export interface SentinelDimension {
  label: string;         // 中文标签
  value: number;         // 0-100
  color: string;         // CSS 变量或颜色值
  description: string;   // 中文说明
}

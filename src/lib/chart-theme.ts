// ECharts dark theme config for the financial terminal
export const echartsDarkTheme = {
  backgroundColor: "transparent",
  textStyle: {
    color: "#94A3B8",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
  },
  title: {
    textStyle: {
      color: "#E2E8F0",
      fontSize: 14,
      fontWeight: 500,
    },
  },
  tooltip: {
    backgroundColor: "rgba(10, 22, 40, 0.95)",
    borderColor: "rgba(255, 255, 255, 0.12)",
    textStyle: {
      color: "#E2E8F0",
      fontSize: 12,
    },
    extraCssText: "backdrop-filter: blur(16px); border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);",
  },
  grid: {
    left: "3%",
    right: "3%",
    top: "15%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    axisLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
    axisTick: { show: false },
    axisLabel: { color: "#64748B", fontSize: 10 },
    splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
  },
  yAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "#64748B", fontSize: 10 },
    splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
  },
};

// Lightweight Charts theme
export const lwChartTheme = {
  layout: {
    background: { type: "solid" as const, color: "transparent" },
    textColor: "#94A3B8",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: "rgba(255, 255, 255, 0.04)" },
    horzLines: { color: "rgba(255, 255, 255, 0.04)" },
  },
  crosshair: {
    vertLine: {
      color: "rgba(212, 165, 116, 0.4)",
      labelBackgroundColor: "#D4A574",
    },
    horzLine: {
      color: "rgba(212, 165, 116, 0.4)",
      labelBackgroundColor: "#D4A574",
    },
  },
  rightPriceScale: {
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  timeScale: {
    borderColor: "rgba(255, 255, 255, 0.06)",
    timeVisible: false,
  },
};

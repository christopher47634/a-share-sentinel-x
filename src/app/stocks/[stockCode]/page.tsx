import StockPageClient from "./StockPageClient";

export function generateStaticParams() {
  return [
    { stockCode: "300308" }, { stockCode: "300502" }, { stockCode: "300394" },
    { stockCode: "600487" }, { stockCode: "300548" }, { stockCode: "000977" },
    { stockCode: "603019" }, { stockCode: "000938" }, { stockCode: "002415" },
    { stockCode: "688256" }, { stockCode: "688981" }, { stockCode: "002371" },
    { stockCode: "603501" }, { stockCode: "688012" }, { stockCode: "688396" },
    { stockCode: "002466" }, { stockCode: "601899" }, { stockCode: "601088" },
    { stockCode: "600519" }, { stockCode: "300750" }, { stockCode: "300015" },
    { stockCode: "000858" }, { stockCode: "601012" }, { stockCode: "000768" },
    { stockCode: "002049" }, { stockCode: "600809" }, { stockCode: "600276" },
    { stockCode: "300124" }, { stockCode: "300607" }, { stockCode: "000568" },
  ];
}

export default function StockPage() {
  return <StockPageClient />;
}

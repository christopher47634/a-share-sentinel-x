import SectorPageClient from "./SectorPageClient";

export function generateStaticParams() {
  return [
    { sectorId: "optical-communication" }, { sectorId: "computing-power" },
    { sectorId: "semiconductor" }, { sectorId: "low-altitude" },
    { sectorId: "robotics" }, { sectorId: "new-energy" },
    { sectorId: "baijiu" }, { sectorId: "pharma" },
    { sectorId: "mining" }, { sectorId: "military" },
  ];
}

export default function SectorPage() {
  return <SectorPageClient />;
}

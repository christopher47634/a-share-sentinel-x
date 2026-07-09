"use client";

import { type ReactNode } from "react";
import { DemoProvider } from "@/components/demo/DemoMode";
import DemoGuide from "@/components/demo/DemoGuide";
import { LayoutGroup } from "framer-motion";

export default function DemoWrapper({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <LayoutGroup>
        {children}
      </LayoutGroup>
      <DemoGuide />
    </DemoProvider>
  );
}

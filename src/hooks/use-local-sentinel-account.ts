"use client";

import { useState, useEffect, useCallback } from "react";
import {
  loadLocalSentinelAccountSnapshot,
  getHeldCodes,
  isHeldCode,
  type LocalSentinelAccountSnapshot,
} from "@/lib/sentinel-local-account-adapter";

export function useLocalSentinelAccount() {
  const [snapshot, setSnapshot] = useState<LocalSentinelAccountSnapshot | null>(null);

  const refresh = useCallback(() => {
    setSnapshot(loadLocalSentinelAccountSnapshot());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("sentinel:account-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sentinel:account-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return {
    snapshot,
    heldCodes: getHeldCodes(snapshot),
    hasLocalPortfolio: snapshot !== null && snapshot.positions.length > 0,
    isHeld: (code: string) => isHeldCode(code, snapshot),
    refresh,
  };
}

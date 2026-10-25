import { useEffect } from "react";
import { createSettleScheduler } from "@/lib/altar/settle";
import { useAltarStore } from "@/lib/altar/store";

/** Calls evaluate() SETTLE_MS after the cauldron's contents stop changing (idle only). */
export function useSettleEvaluate() {
  useEffect(() => createSettleScheduler(useAltarStore).connect(), []);
}

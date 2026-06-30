import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { calculateAllocation, emergencyFundSplit } from "../lib/allocation";

export function useFinancialAllocation() {
  const { state } = useApp();

  return useMemo(() => {
    const allocation = calculateAllocation(state.transactions, state.activeMonth, state.allocationSettings);
    const split = emergencyFundSplit(allocation.emergencyAllocated);
    return { ...allocation, emergencyFundSplit: split, settings: state.allocationSettings };
  }, [state.transactions, state.activeMonth, state.allocationSettings]);
}

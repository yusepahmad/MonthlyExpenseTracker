import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { calculateAllocation, emergencyFundSplit, calculateInvestmentReturn } from "../lib/allocation";

export function useFinancialAllocation() {
  const { state } = useApp();

  return useMemo(() => {
    const allocation = calculateAllocation(state.transactions, state.activeMonth, state.allocationSettings);
    const split = emergencyFundSplit(allocation.emergencyAllocated);
    const investmentReturn =
      state.allocationSettings.investmentValue !== null
        ? calculateInvestmentReturn(
            state.transactions,
            state.activeMonth,
            state.allocationSettings.investmentPercent,
            state.allocationSettings.investmentValue
          )
        : null;
    return { ...allocation, emergencyFundSplit: split, settings: state.allocationSettings, investmentReturn };
  }, [state.transactions, state.activeMonth, state.allocationSettings]);
}

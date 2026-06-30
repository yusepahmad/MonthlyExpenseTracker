const MIN_BALANCE_RATIO = 0.2;

// "Tunda" kalau pembelian ini melanggar SALAH SATU aturan:
// 1. Sisa saldo setelah beli < kebutuhan burn-rate 1 minggu ke depan.
// 2. Sisa saldo setelah beli < 20% dari saldo saat ini.
export function evaluatePurchase(item, currentBalance, netBurnPerDay) {
  const price = Number(item.price) || 0;
  const remainingAfterPurchase = currentBalance - price;

  const weeklyBurn = Math.max(netBurnPerDay, 0) * 7;
  const failsBurnRateCheck = remainingAfterPurchase < weeklyBurn;
  const failsBalanceRatioCheck = remainingAfterPurchase < currentBalance * MIN_BALANCE_RATIO;

  const recommendation = failsBurnRateCheck || failsBalanceRatioCheck ? "tunda" : "ok";

  return {
    remainingAfterPurchase,
    recommendation,
    failsBurnRateCheck,
    failsBalanceRatioCheck,
  };
}

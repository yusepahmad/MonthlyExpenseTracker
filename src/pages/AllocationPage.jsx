import { useState } from "react";
import { Settings2, ShieldCheck, TrendingUp, TrendingDown, Wallet, AlertTriangle, PencilLine } from "lucide-react";
import { useFinancialAllocation } from "../hooks/useFinancialAllocation";
import { formatCurrency } from "../lib/utils";
import AllocationSettingsForm from "../components/allocation/AllocationSettingsForm";
import InvestmentValueForm from "../components/allocation/InvestmentValueForm";
import Modal from "../components/ui/Modal";

function ProgressRow({ label, allocated, target, percent, barClass }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-light text-gray-600 dark:text-gray-300">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(allocated)} / {formatCurrency(target)}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CarryOverNote({ amount, label }) {
  if (amount <= 0) return null;
  return (
    <p className="flex items-start gap-1.5 text-xs font-light text-amber-600 dark:text-amber-400 mt-2">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      Ada kekurangan {label} {formatCurrency(amount)} dari bulan-bulan sebelumnya, ikut ditambahkan ke target bulan ini — seperti hutang ke diri sendiri sampai tertutup.
    </p>
  );
}

export default function AllocationPage() {
  const allocation = useFinancialAllocation();
  const [showSettings, setShowSettings] = useState(false);
  const [showInvestmentValue, setShowInvestmentValue] = useState(false);

  const hasIncome = allocation.monthIncome > 0;
  const hasInvestmentValue = allocation.investmentReturn !== null;
  const isGain = hasInvestmentValue && allocation.investmentReturn.gain >= 0;
  const isOverspent = allocation.realRemainingForLiving < 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-display text-lg font-medium text-gray-900 dark:text-white">Alokasi Keuangan</h2>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-light rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all"
        >
          <Settings2 className="w-4 h-4" />
          Atur Persentase
        </button>
      </div>

      {!hasIncome ? (
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-8 text-center shadow-soft animate-fade-in">
          <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            Belum ada pemasukan bulan ini. Catat pemasukan dulu supaya alokasi bisa dihitung.
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div
            className={`relative overflow-hidden rounded-2xl backdrop-blur-2xl backdrop-saturate-150 text-white p-5 sm:p-6 shadow-glow border border-white/20 animate-fade-in ${
              isOverspent
                ? "bg-gradient-to-br from-red-500/90 via-rose-600/90 to-red-700/90"
                : "bg-gradient-to-br from-indigo-500/90 via-purple-600/90 to-pink-500/90"
            }`}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <p className="relative text-sm font-light text-white/80">
              {isOverspent ? "Sudah Minus Sebesar" : "Sisa yang Benar-Benar Bisa Dipakai"}
            </p>
            <p className="relative font-display text-3xl sm:text-4xl font-medium mt-1">
              {isOverspent && "-"}
              {formatCurrency(Math.abs(allocation.realRemainingForLiving))}
            </p>
            <p className="relative text-xs font-light text-white/70 mt-2">
              Jatah Biaya Hidup {formatCurrency(allocation.netForLiving)}, sudah dipakai {formatCurrency(allocation.livingSpent)}.
              {isOverspent && " Pengeluaran sudah melebihi jatah bulan ini — coba tahan dulu sampai akhir bulan."}
            </p>
          </div>

          <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dana Darurat ({allocation.settings.emergencyPercent}%)
              </h3>
            </div>
            <ProgressRow
              label="Bulan ini"
              allocated={allocation.emergencyAllocated}
              target={allocation.emergencyTarget}
              percent={allocation.emergencyProgress}
              barClass="bg-gradient-to-r from-amber-500 to-orange-400"
            />
            <CarryOverNote amount={allocation.emergencyCarryOver} label="Dana Darurat" />
            {allocation.emergencyAllocated > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white/30 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/50 px-3 py-2">
                  <p className="font-light text-gray-400">Tabungan (70%)</p>
                  <p className="font-medium text-gray-700 dark:text-gray-200 mt-0.5">
                    {formatCurrency(allocation.emergencyFundSplit.savings)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/30 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/50 px-3 py-2">
                  <p className="font-light text-gray-400">Money Market (30%)</p>
                  <p className="font-medium text-gray-700 dark:text-gray-200 mt-0.5">
                    {formatCurrency(allocation.emergencyFundSplit.moneyMarket)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Investasi ({allocation.settings.investmentPercent}%)
                </h3>
              </div>
              <button
                onClick={() => setShowInvestmentValue(true)}
                className="flex items-center gap-1 text-xs text-purple-600 font-medium hover:underline"
              >
                <PencilLine className="w-3 h-3" />
                Update Nilai
              </button>
            </div>
            <ProgressRow
              label="Bulan ini"
              allocated={allocation.investmentAllocated}
              target={allocation.investmentTarget}
              percent={allocation.investmentProgress}
              barClass="bg-gradient-to-r from-indigo-500 to-purple-500"
            />
            <CarryOverNote amount={allocation.investmentCarryOver} label="Investasi" />

            {allocation.investmentSpent > 0 && (
              <p className="text-xs font-light text-gray-500 dark:text-gray-400 mt-2">
                Termasuk {formatCurrency(allocation.investmentSpent)} dari pengeluaran kategori "Investasi" (mis. Pendidikan/kuliah) — sudah dihitung sebagai bagian dari alokasi ini, bukan biaya hidup.
              </p>
            )}

            {hasInvestmentValue ? (
              <div className="mt-3 rounded-xl bg-white/30 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/50 px-3 py-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-light text-gray-400">Total dialokasikan sejak awal</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {formatCurrency(allocation.investmentReturn.invested)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-light text-gray-400">Nilai sekarang</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {formatCurrency(allocation.investmentReturn.currentValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-white/40 dark:border-gray-700/40">
                  <span className="flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300">
                    {isGain ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    )}
                    {isGain ? "Untung" : "Rugi"}
                  </span>
                  <span className={`font-medium ${isGain ? "text-green-600" : "text-red-500"}`}>
                    {isGain ? "+" : ""}
                    {formatCurrency(allocation.investmentReturn.gain)} ({allocation.investmentReturn.gainPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs font-light text-gray-400 mt-3">
                Masukkan nilai portofolio investasi kamu sekarang untuk melihat untung/rugi.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Biaya Hidup ({allocation.settings.livingPercent}%)
              </h3>
            </div>
            <ProgressRow
              label="Sudah dipakai"
              allocated={allocation.livingSpent}
              target={allocation.netForLiving}
              percent={allocation.netForLiving > 0 ? Math.min(100, (allocation.livingSpent / allocation.netForLiving) * 100) : 0}
              barClass={isOverspent ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-gradient-to-r from-gray-500 to-gray-400"}
            />
            <p className="text-xs font-light text-gray-400 mt-2">
              Jatah {formatCurrency(allocation.netForLiving)} dihitung otomatis dari sisa pemasukan setelah Dana Darurat & Investasi — kategori dengan pos "Investasi" (mis. Pendidikan) tidak masuk hitungan ini.
            </p>
          </div>
        </div>
      )}

      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Atur Persentase Alokasi">
        <AllocationSettingsForm onSaved={() => setShowSettings(false)} onCancel={() => setShowSettings(false)} />
      </Modal>

      <Modal open={showInvestmentValue} onClose={() => setShowInvestmentValue(false)} title="Update Nilai Investasi">
        <InvestmentValueForm onSaved={() => setShowInvestmentValue(false)} onCancel={() => setShowInvestmentValue(false)} />
      </Modal>
    </div>
  );
}

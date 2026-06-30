import { useState } from "react";
import { Settings2, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { useFinancialAllocation } from "../hooks/useFinancialAllocation";
import { formatCurrency } from "../lib/utils";
import AllocationSettingsForm from "../components/allocation/AllocationSettingsForm";
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

export default function AllocationPage() {
  const allocation = useFinancialAllocation();
  const [showSettings, setShowSettings] = useState(false);

  const hasIncome = allocation.monthIncome > 0;

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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/90 via-purple-600/90 to-pink-500/90 backdrop-blur-2xl backdrop-saturate-150 text-white p-5 sm:p-6 shadow-glow border border-white/20 animate-fade-in">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <p className="relative text-sm font-light text-white/80">Dana Bersih untuk Hidup</p>
            <p className="relative font-display text-3xl sm:text-4xl font-medium mt-1">
              {formatCurrency(allocation.netForLiving)}
            </p>
            <p className="relative text-xs font-light text-white/70 mt-2">
              Total pemasukan bulan ini {formatCurrency(allocation.monthIncome)}, dikurangi yang sudah dialokasikan ke Dana Darurat & Investasi.
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
              label="Teralokasikan"
              allocated={allocation.emergencyAllocated}
              target={allocation.emergencyTarget}
              percent={allocation.emergencyProgress}
              barClass="bg-gradient-to-r from-amber-500 to-orange-400"
            />
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
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Investasi ({allocation.settings.investmentPercent}%)
              </h3>
            </div>
            <ProgressRow
              label="Teralokasikan"
              allocated={allocation.investmentAllocated}
              target={allocation.investmentTarget}
              percent={allocation.investmentProgress}
              barClass="bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>

          <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
            <div className="flex items-center gap-2 mb-1.5">
              <Wallet className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Biaya Hidup ({allocation.settings.livingPercent}%)
              </h3>
            </div>
            <p className="text-xs font-light text-gray-400 mb-2">
              Target alokasi: {formatCurrency(allocation.livingTarget)}. Tandai pemasukan sebagai Dana Darurat/Investasi di form Tambah Transaksi — sisanya otomatis masuk pos ini.
            </p>
          </div>
        </div>
      )}

      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Atur Persentase Alokasi">
        <AllocationSettingsForm onSaved={() => setShowSettings(false)} onCancel={() => setShowSettings(false)} />
      </Modal>
    </div>
  );
}

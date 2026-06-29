# PLANNING.md — Monthly Expense Tracker

## Overview

Aplikasi manajemen pengeluaran bulanan berbasis web (SPA). Data disimpan di file `.xlsx` — tidak ada backend, tidak ada database server. User bisa import file Excel lama, kelola transaksi, dan export kembali ke Excel yang terformat rapi.

**Target pengguna:** personal use (satu user).  
**Deployment:** static site (Vercel / GitHub Pages / buka langsung via browser).

---

## Tech Stack

| Layer | Library | Versi |
|---|---|---|
| Framework | React + Vite | React 18, Vite 5 |
| Excel engine | SheetJS (`xlsx`) | `^0.18.5` |
| Charts | Recharts | `^2.x` |
| Styling | TailwindCSS + shadcn/ui | Tailwind 3 |
| Notifications | Browser Notification API | native |
| Date utility | `date-fns` | `^3.x` |
| State | React Context + `useReducer` | — |

```bash
npm create vite@latest expense-tracker -- --template react
cd expense-tracker
npm install xlsx recharts date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# optional: shadcn/ui untuk komponen siap pakai
```

---

## Folder Structure

```
expense-tracker/
├── public/
│   └── template.xlsx          # template Excel kosong untuk user baru
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopBar.jsx
│   │   ├── dashboard/
│   │   │   ├── MonthSummary.jsx
│   │   │   ├── CategoryChart.jsx
│   │   │   ├── BudgetProgress.jsx
│   │   │   └── RecentTransactions.jsx
│   │   ├── transactions/
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   ├── TransactionFilter.jsx
│   │   │   └── TransactionRow.jsx
│   │   ├── budget/
│   │   │   ├── BudgetForm.jsx
│   │   │   └── BudgetList.jsx
│   │   ├── recurring/
│   │   │   ├── RecurringForm.jsx
│   │   │   └── RecurringList.jsx
│   │   └── ui/
│   │       ├── Modal.jsx
│   │       ├── Badge.jsx
│   │       └── EmptyState.jsx
│   ├── context/
│   │   └── AppContext.jsx      # global state: transactions, budgets, recurring
│   ├── hooks/
│   │   ├── useExcel.js         # import/export logic
│   │   ├── useBudget.js        # kalkulasi sisa budget
│   │   ├── useRecurring.js     # auto-populate recurring
│   │   └── useNotification.js  # browser notification API
│   ├── lib/
│   │   ├── excel.js            # semua fungsi SheetJS
│   │   ├── categories.js       # daftar kategori + warna
│   │   └── utils.js            # format currency, tanggal, dsb
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── TransactionsPage.jsx
│   │   ├── BudgetPage.jsx
│   │   └── RecurringPage.jsx
│   ├── App.jsx
│   └── main.jsx
```

---

## Excel Schema

File `.xlsx` punya 4 sheet. **Jangan ubah nama sheet** — dipakai sebagai key saat import/export.

### Sheet: `Transaksi`

| Kolom | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `id` | string | `txn_1718000000` | timestamp-based ID |
| `date` | string | `2025-06-15` | format ISO |
| `category` | string | `Makan` | lihat daftar kategori |
| `amount` | number | `45000` | selalu positif |
| `type` | string | `expense` / `income` | |
| `description` | string | `Ayam geprek` | opsional |
| `is_recurring` | boolean | `true` | |
| `recurring_id` | string | `rec_001` | null jika bukan recurring |

### Sheet: `Budget`

| Kolom | Tipe | Contoh |
|---|---|---|
| `month` | string | `2025-06` |
| `category` | string | `Makan` |
| `budget_amount` | number | `800000` |

Satu baris = satu kategori per bulan. Kalau kategori belum punya budget di bulan itu, dianggap unlimited.

### Sheet: `Recurring`

| Kolom | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `id` | string | `rec_001` | |
| `name` | string | `Spotify` | label tampilan |
| `category` | string | `Hiburan` | |
| `amount` | number | `54990` | |
| `frequency` | string | `monthly` | `monthly` / `weekly` |
| `day_of_month` | number | `1` | 1–28 untuk monthly |
| `is_active` | boolean | `true` | |

### Sheet: `Summary`

Di-generate otomatis saat export. User tidak perlu edit manual.

| Kolom | Tipe |
|---|---|
| `month` | string |
| `total_expense` | number |
| `total_income` | number |
| `net` | number |
| `by_category` | JSON string |

---

## Kategori Default

```js
// src/lib/categories.js
export const CATEGORIES = [
  { name: "Makan",      color: "#F59E0B", icon: "🍜" },
  { name: "Transport",  color: "#3B82F6", icon: "🚗" },
  { name: "Belanja",    color: "#8B5CF6", icon: "🛍️" },
  { name: "Hiburan",    color: "#EC4899", icon: "🎮" },
  { name: "Kesehatan",  color: "#10B981", icon: "💊" },
  { name: "Tagihan",    color: "#EF4444", icon: "📱" },
  { name: "Pendidikan", color: "#06B6D4", icon: "📚" },
  { name: "Lainnya",    color: "#6B7280", icon: "📦" },
  // income categories
  { name: "Gaji",       color: "#22C55E", icon: "💼", type: "income" },
  { name: "Freelance",  color: "#84CC16", icon: "💻", type: "income" },
];
```

---

## State Shape (AppContext)

```js
const initialState = {
  transactions: [],    // array of transaction objects
  budgets: [],         // array of budget objects
  recurring: [],       // array of recurring objects
  activeMonth: "2025-06",  // format YYYY-MM, default: bulan ini
  fileName: null,      // nama file .xlsx yang sedang aktif
};
```

Actions: `ADD_TRANSACTION`, `UPDATE_TRANSACTION`, `DELETE_TRANSACTION`, `SET_BUDGETS`, `SET_RECURRING`, `LOAD_FROM_EXCEL`, `SET_ACTIVE_MONTH`.

---

## Core Logic: `src/lib/excel.js`

### Import

```js
import * as XLSX from "xlsx";

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "array" });
      resolve({
        transactions: sheetToJson(wb, "Transaksi"),
        budgets:      sheetToJson(wb, "Budget"),
        recurring:    sheetToJson(wb, "Recurring"),
      });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function sheetToJson(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws);
}
```

### Export

```js
export function exportToExcel(state, fileName = "pengeluaran.xlsx") {
  const wb = XLSX.utils.book_new();

  appendSheet(wb, "Transaksi", state.transactions);
  appendSheet(wb, "Budget",    state.budgets);
  appendSheet(wb, "Recurring", state.recurring);
  appendSheet(wb, "Summary",   buildSummary(state.transactions));

  XLSX.writeFile(wb, fileName);
}

function appendSheet(wb, name, data) {
  const ws = XLSX.utils.json_to_sheet(data);
  styleHeader(ws); // bold header row
  XLSX.utils.book_append_sheet(wb, ws, name);
}
```

---

## Core Logic: `src/hooks/useRecurring.js`

Saat app dibuka di bulan baru, cek recurring yang `is_active: true` dan `day_of_month <= hari ini`. Kalau belum ada transaksinya di bulan ini, auto-tambah ke state.

```js
export function useRecurring() {
  const { state, dispatch } = useContext(AppContext);

  useEffect(() => {
    const today = new Date();
    const currentMonth = format(today, "yyyy-MM");

    state.recurring
      .filter(r => r.is_active)
      .forEach(r => {
        const alreadyAdded = state.transactions.some(
          t => t.recurring_id === r.id &&
               t.date.startsWith(currentMonth)
        );
        if (!alreadyAdded && today.getDate() >= r.day_of_month) {
          dispatch({
            type: "ADD_TRANSACTION",
            payload: {
              id: `txn_${Date.now()}_${r.id}`,
              date: `${currentMonth}-${String(r.day_of_month).padStart(2, "0")}`,
              category: r.category,
              amount: r.amount,
              type: "expense",
              description: r.name,
              is_recurring: true,
              recurring_id: r.id,
            },
          });
        }
      });
  }, [state.activeMonth]);
}
```

---

## Core Logic: `src/hooks/useNotification.js`

```js
export function useNotification() {
  const { state } = useContext(AppContext);

  // Minta permission saat pertama kali
  async function requestPermission() {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  }

  // Panggil ini setiap kali transaksi baru ditambah
  function checkBudgetAlert(category, totalSpent, budgetLimit) {
    if (Notification.permission !== "granted") return;
    const pct = (totalSpent / budgetLimit) * 100;
    if (pct >= 90) {
      new Notification(`⚠️ Budget ${category} hampir habis`, {
        body: `Sudah terpakai ${pct.toFixed(0)}% (Rp ${totalSpent.toLocaleString("id-ID")})`,
      });
    }
  }

  return { requestPermission, checkBudgetAlert };
}
```

---

## Development Phases

### Phase 1 — Core (3–4 hari)
**Goal:** bisa input, lihat list, import, dan export. Ini yang harus jalan dulu.

- [ ] Setup Vite + React + Tailwind
- [ ] Buat `AppContext` + reducer dengan action LOAD/ADD/UPDATE/DELETE
- [ ] Implementasi `src/lib/excel.js` (parseExcelFile + exportToExcel)
- [ ] `TransactionForm` — input tanggal, kategori, amount, deskripsi, tipe
- [ ] `TransactionList` + `TransactionFilter` (filter per bulan)
- [ ] Tombol Import (drag-and-drop atau file picker) di TopBar
- [ ] Tombol Export di TopBar
- [ ] Layout dasar: Sidebar navigasi + TopBar + main content area
- [ ] `src/lib/categories.js` dengan daftar kategori + warna
- [ ] Generate `template.xlsx` kosong dengan 4 sheet header

### Phase 2 — Dashboard (2–3 hari)
**Goal:** visualisasi data bulanan.

- [ ] `MonthSummary` — total pemasukan, pengeluaran, saldo bulan ini
- [ ] `CategoryChart` — pie/donut chart pengeluaran per kategori (Recharts)
- [ ] `BudgetProgress` — progress bar tiap kategori vs budget-nya
- [ ] `RecentTransactions` — 5 transaksi terakhir dengan quick-delete
- [ ] Month switcher di TopBar (prev/next bulan)
- [ ] `useBudget` hook — kalkulasi spent vs limit per kategori

### Phase 3 — Planning (2–3 hari)
**Goal:** budget planning dan recurring management.

- [ ] `BudgetPage` — set budget per kategori per bulan
- [ ] `BudgetForm` — pilih kategori + input nominal limit
- [ ] `RecurringPage` — daftar pengeluaran rutin
- [ ] `RecurringForm` — nama, kategori, amount, frekuensi, tanggal
- [ ] `useRecurring` hook — auto-populate recurring di bulan baru
- [ ] Toggle aktif/nonaktif recurring
- [ ] Copy budget bulan lalu ke bulan ini (QoL feature)

### Phase 4 — Polish (1–2 hari)
**Goal:** notifikasi, UX improvement, export rapi.

- [ ] `useNotification` — request permission, alert 90%+ budget
- [ ] Reminder notifikasi di awal bulan (cek recurring belum di-log)
- [ ] Excel export dengan header bold + column width auto-fit
- [ ] Summary sheet otomatis di export
- [ ] Empty state di setiap halaman kalau belum ada data
- [ ] Loading state saat import file besar
- [ ] Konfirmasi sebelum delete transaksi
- [ ] Validasi form (amount > 0, tanggal tidak future, dsb)

---

## Catatan Implementasi

**Format currency:** Selalu tampil sebagai `Rp 45.000` (locale `id-ID`). Simpan di Excel sebagai angka murni tanpa format supaya SheetJS bisa baca balik.

**ID generation:** Pakai `Date.now()` + random suffix — cukup untuk single-user, tidak perlu UUID.

**Persistent state:** Tidak ada localStorage. Setiap buka app = fresh state, user harus import file dulu. Ini by design supaya Excel tetap sebagai source of truth.

**Month boundary:** `activeMonth` format `YYYY-MM`. Filter transaksi pakai `transaction.date.startsWith(activeMonth)`. Jangan pakai Date comparison supaya tidak ada timezone issue.

**SheetJS array vs object mode:** Pakai `sheet_to_json` dengan default header row (row pertama jadi key). Pastikan nama kolom di Excel persis sama dengan field name di JS object.

**Tailwind dark mode:** Tambah `darkMode: 'class'` di `tailwind.config.js`. Toggle via `document.documentElement.classList.toggle('dark')`.

---

## Urutan Build yang Disarankan untuk Claude Code

```
1. src/lib/categories.js
2. src/lib/utils.js              (formatCurrency, formatDate)
3. src/lib/excel.js              (parseExcelFile, exportToExcel)
4. src/context/AppContext.jsx    (state + reducer)
5. src/hooks/useExcel.js
6. src/components/layout/
7. src/components/transactions/  (Form + List + Filter)
8. src/pages/TransactionsPage.jsx
9. src/hooks/useBudget.js
10. src/components/dashboard/
11. src/pages/DashboardPage.jsx
12. src/components/budget/
13. src/pages/BudgetPage.jsx
14. src/hooks/useRecurring.js
15. src/components/recurring/
16. src/pages/RecurringPage.jsx
17. src/hooks/useNotification.js
18. Polish: empty states, validasi, export styling
```

Mulai dari nomor 1 dan jangan lompat phase. Setiap file yang dibuat harus bisa ditest mandiri sebelum lanjut ke berikutnya.

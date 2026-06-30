# Monthly Expense Tracker — Status & Lanjutan

Plan lengkap (semua 13 fase, detail desain & file): `/home/yusep/.claude/plans/tutup-navbar-nya-structured-kettle.md`

## Sudah selesai (Fase 0–10)

- **Fase 0** — Bug fixes & UI polish: sidebar dirampingkan, search blur fix, custom DatePicker, modal scroll fix, draft form preservation saat klik-luar-modal.
- **Fase 1** — Dashboard Insight: pengeluaran/pendapatan terbesar (`useInsights.js`), kalimat tren kategori bulan-ke-bulan.
- **Fase 2** — Budget Alert: pesan "sudah mencapai 80%" / "telah terlampaui" di `useBudget.js` + `BudgetProgress.jsx` (tanpa state baru).
- **Fase 3** — Recurring Transaction CRUD lengkap + dialog konfirmasi jatuh tempo (`RecurringDueDialog`) + halaman `RecurringPage.jsx`. Subscription Tracker disatukan ke fitur ini (tampilan "tagihan berikutnya N hari").
- **Fase 4** — Halaman Laporan (`ReportsPage.jsx`): toggle Mingguan/Bulanan/Tahunan + Pie/Bar/Line chart, export CSV & PDF (print-to-PDF browser).
- **Fase 5** — Target Tabungan: halaman tersendiri `SavingsGoalsPage.jsx`, progress manual (`currentAmount` diedit langsung, bukan auto dari transaksi).
- **Fase 6** — Smart Suggestion & rule-based "AI" Categorization (`categoryKeywords.js`, `smartSuggestion.js`) — **bukan AI/LLM sungguhan**, murni keyword dictionary + substring match lokal, tanpa network call.
- **Fase 7** — Cash Flow Prediction: `useCashFlowPrediction.js` + `CashFlowPredictionCard.jsx`, label "Saldo Keseluruhan" dipisah jelas dari "Saldo Bulan Ini" di `MonthSummary.jsx` agar tidak ambigu.
- **Fase 8** — Wishlist: halaman tersendiri `WishlistPage.jsx`, saran beli/tunda di `lib/wishlist.js` (`evaluatePurchase`) reuse burn-rate dari `useCashFlowPrediction`. Aturan tunda: sisa saldo setelah beli < 1 minggu burn-rate **ATAU** < 20% saldo saat ini (gabungan, tunda jika salah satu terpenuhi). State baru `wishlist[]` + tabel Supabase `wishlist` (`supabase/migration_003_wishlist.sql`) + sheet Excel `Wishlist`.
- **Fase 10** — Reminder Notifikasi Harian (dikerjakan sebelum Fase 9 atas permintaan user): `useReminder.js` minta izin Notification API via prompt sekali (`ReminderPromptDialog.jsx`, tampil saat pertama buka app, tidak pernah nanya lagi setelah dijawab), cek jam 20:00 apakah hari itu sudah ada transaksi, kalau belum kirim browser notification. **Limitasi jelas dilabel di UI**: hanya aktif selagi tab terbuka (app tidak punya service worker/PWA, bukan push notification sungguhan).
- **Fase 9** — Multi-Account + Transfer: halaman `AccountsPage.jsx` (CRUD akun, saldo per-akun via `useAccountBalances.js`), `TransactionForm.jsx` punya Dropdown pilih akun + toggle mode "Transfer" (`TransferForm.jsx`). Transfer = 2 transaksi terhubung via `transfer_id` (expense di akun asal + income di akun tujuan, kategori "Lainnya") — bukan tipe transaksi baru. **Migrasi data lama**: semua transaksi existing tanpa `account` di-default ke `acc_cash` ("Cash"), baik di `AppContext.jsx` (state lokal/fallback) maupun Supabase (`supabase/migration_004_accounts.sql` — ALTER TABLE + backfill otomatis). **Audit regresi penting**: transfer dikecualikan dari semua total pemasukan/pengeluaran (`excludeTransfers()` di `lib/utils.js`, dipakai di `useInsights`, `useReportData`, `useBudget`, `useCashFlowPrediction`, `MonthSummary`, `CategoryChart`, `excel.js buildSummary()`) — kalau tidak, transfer akan dihitung dua kali sebagai pemasukan DAN pengeluaran sungguhan, menggelembungkan kedua total. Diverifikasi langsung: migrasi data lama ke Cash, transfer antar akun, dan totals dashboard TIDAK berubah setelah transfer (hanya saldo per-akun yang berubah).

Sejak Fase 6 juga sudah migrasi ke Supabase (cross-device cloud sync, lihat `src/lib/api/`, `AppContext.jsx`) dan beberapa bug fix tambahan di luar plan asli:
- Fix kategori duplikat saat tambah/edit kategori (override-by-name pattern di `categories.js`).
- Fitur Kelola Kategori (CRUD kategori + sub-kategori, termasuk edit kategori default) via modal di `TransactionForm.jsx` → `CategoryManager.jsx`.
- Fix Modal kedua (Kelola Kategori dari dalam form Tambah Transaksi) bertumpuk dengan modal pertama — `Modal.jsx` sekarang pakai React Portal ke `document.body`.
- Fix bug rename kategori default (mis. "Makan" → "Makan & Minuman") yang menyebabkan duplikat — ditambah field stabil `overridesDefault` (kolom Supabase `overrides_default`, lihat `supabase/migration_002_overrides_default.sql`) yang tetap terhubung ke kategori default aslinya walau di-rename berkali-kali.
- Warna kategori baru/custom dijamin unik (cek warna yang sudah dipakai default+custom sebelum assign, fallback ke hash warna deterministik).

Semua fase di atas sudah diverifikasi end-to-end via browser (Playwright) dan `npm run build` sukses tanpa error.

## Sisa pekerjaan (Fase 11, 12)

| Fase | Nama | Kompleksitas | Catatan kunci |
|---|---|---|---|
| 11 | Challenges (gamifikasi) | Sedang | Mulai dengan 2 tipe saja sesuai contoh user (no-spend kategori X selama N hari, hemat kategori Y di bawah Rp tertentu). |
| 12 | Financial Health Score | Sedang | **Keputusan tertunda**: komponen "hutang" di formula skor tidak punya data sama sekali di app ini. Opsi (a) skip dari skor v1 + label "belum memperhitungkan utang" (direkomendasikan), atau (b) bangun debt-tracking dasar dulu. |

## Cara lanjut sesi berikutnya

Baca file plan di atas untuk detail desain tiap fase (file yang disentuh, skema data, keputusan teknis). Semua fase 0-10 sudah selesai — lanjutkan ke Fase 11 secara berurutan, atau user bisa minta lompat/reprioritaskan fase tertentu.

# Monthly Expense Tracker — Status

Plan lengkap (semua 13 fase, detail desain & file): `/home/yusep/.claude/plans/tutup-navbar-nya-structured-kettle.md`

## Semua 13 fase selesai (Fase 0–12)

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
- **Fase 11** — Challenges (gamifikasi): halaman `ChallengesPage.jsx`, evaluasi murni di `lib/challenges.js` (`evaluateChallenge`, didesain sebagai registry per tipe — `EVALUATORS` map — supaya tipe baru tinggal ditambah entry, tidak perlu ubah pemanggil). 2 tipe sesuai permintaan user: `no_spend` (gagal begitu ADA pengeluaran kategori tsb dalam window tanggal) dan `spending_limit` (gagal kalau total pengeluaran kategori tsb melebihi target). Status (`upcoming`/`active`/`completed`/`failed`) **selalu dihitung ulang dari transaksi + tanggal hari ini**, tidak pernah disimpan sebagai field statis — supaya tidak pernah stale. State baru `challenges[]` + tabel Supabase `challenges` (`supabase/migration_005_challenges.sql`) + sheet Excel `Challenges`. Diverifikasi langsung: challenge no-spend berstatus "Berjalan" sampai transaksi kategori terkait ditambahkan, lalu otomatis berubah jadi "Gagal" dengan progress bar merah.
- **Fase 12** — Financial Health Score: **user memilih opsi (b)** dari dua pilihan yang ditawarkan plan — bangun debt-tracking dasar dulu (bukan skip komponen hutang). Halaman baru `DebtsPage.jsx` (CRUD hutang, progress manual `remainingAmount` mirip pola Savings Goal — bukan auto dari transaksi), state `debts[]` + tabel Supabase `debts` (`supabase/migration_006_debts.sql`) + sheet Excel `Debts`. Skor dihitung di `useFinancialHealthScore.js` dari **5 faktor berbobot sama (20 poin masing-masing)**: rasio tabungan bulan ini, kepatuhan budget (`useBudget`), tren arus kas (`useCashFlowPrediction`), stabilitas pengeluaran (coefficient of variation 6 bulan terakhir), dan rasio hutang (`total sisa hutang / pemasukan bulan ini`). Faktor dengan data belum cukup diberi skor netral (50%) dan dilabel jelas "Data belum cukup" di UI, bukan dihitung sebagai 0. Ditampilkan via `HealthScoreCard.jsx` di `DashboardPage.jsx`. Diverifikasi langsung: skor turun dari 67→54 setelah menambah hutang dengan sisa besar relatif terhadap pemasukan, lalu kembali ke 67 setelah hutang dihapus.

Sejak Fase 6 juga sudah migrasi ke Supabase (cross-device cloud sync, lihat `src/lib/api/`, `AppContext.jsx`) dan beberapa bug fix tambahan di luar plan asli:
- Fix kategori duplikat saat tambah/edit kategori (override-by-name pattern di `categories.js`).
- Fitur Kelola Kategori (CRUD kategori + sub-kategori, termasuk edit kategori default) via modal di `TransactionForm.jsx` → `CategoryManager.jsx`.
- Fix Modal kedua (Kelola Kategori dari dalam form Tambah Transaksi) bertumpuk dengan modal pertama — `Modal.jsx` sekarang pakai React Portal ke `document.body`.
- Fix bug rename kategori default (mis. "Makan" → "Makan & Minuman") yang menyebabkan duplikat — ditambah field stabil `overridesDefault` (kolom Supabase `overrides_default`, lihat `supabase/migration_002_overrides_default.sql`) yang tetap terhubung ke kategori default aslinya walau di-rename berkali-kali.
- Warna kategori baru/custom dijamin unik (cek warna yang sudah dipakai default+custom sebelum assign, fallback ke hash warna deterministik).

Semua fase di atas sudah diverifikasi end-to-end via browser (Playwright) dan `npm run build` sukses tanpa error.

## Fitur pasca-plan: Alokasi Keuangan (20/10/70)

Di luar 13 fase asli — diminta user setelah Fase 12 selesai, supaya app aktif mengarahkan alokasi pemasukan ke dana darurat/investasi, bukan cuma mencatat pasif.

**Konsep**: rumus 20% Dana Darurat / 10% Investasi / 70% Biaya Hidup (referensi dari user), dihitung dari **total pemasukan bulan berjalan** — semua transaksi `type: income`, bukan cuma gaji pokok (freelance dll ikut terhitung). Persentase bisa diubah user (`allocationSettings` di state, default 20/10/70).

**Cara kerja**: bukan kategori transaksi baru — setiap transaksi income punya field opsional `allocationTag` (`"emergency" | "investment" | null`), ditandai langsung di `TransactionForm.jsx` saat user pilih tipe Pemasukan (segmented control "Alokasikan ke"). Pemasukan yang tidak ditandai otomatis masuk hitungan "Dana Bersih untuk Hidup" (`netForLiving = monthIncome - emergencyAllocated - investmentAllocated`).

**File kunci**:
- `lib/allocation.js` — `calculateAllocation()` (pure function, hitung target & realisasi per pocket) + `emergencyFundSplit()` (breakdown internal 70% tabungan / 30% money market fund, murni informational dari strategi referensi user, tidak disimpan sebagai state terpisah).
- `hooks/useFinancialAllocation.js` — wrapper hook.
- `pages/AllocationPage.jsx` — halaman penuh: Dana Bersih untuk Hidup, progress Dana Darurat (+ breakdown tabungan/MMF), progress Investasi, target Biaya Hidup.
- `components/allocation/AllocationSettingsForm.jsx` — edit persentase custom (live preview sisa % biaya hidup).
- `components/dashboard/AllocationSummaryCard.jsx` — widget ringkas di Dashboard (hanya render kalau ada pemasukan bulan ini).
- State baru: `allocationSettings` (single object, bukan array — pola sama seperti `activeMonth`) + kolom `allocation_tag` di tabel `transactions` + 3 kolom baru (`emergency_percent`, `investment_percent`, `living_percent`) di `app_settings` (`supabase/migration_007_allocation.sql`). Sheet Excel baru `AllocationSettings`.

Diverifikasi langsung: income Rp1jt ditandai "Dana Darurat" → progress bar & breakdown 70/30 muncul benar, "Dana Bersih untuk Hidup" otomatis berkurang sebesar itu; ubah persentase ke 30/15/55 lalu kembali ke 20/10/70 — keduanya tersimpan & ter-apply dengan benar.

## Status: plan 13-fase selesai + 1 fitur tambahan

Tidak ada fase tersisa dari plan asli. Untuk kelanjutan, baca file plan di atas untuk konteks desain sebelumnya, atau tanya user fitur/perbaikan baru apa yang diinginkan.

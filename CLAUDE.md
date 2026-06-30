# Monthly Expense Tracker — Status & Lanjutan

Plan lengkap (semua 13 fase, detail desain & file): `/home/yusep/.claude/plans/tutup-navbar-nya-structured-kettle.md`

## Sudah selesai (Fase 0–8, 10)

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

Sejak Fase 6 juga sudah migrasi ke Supabase (cross-device cloud sync, lihat `src/lib/api/`, `AppContext.jsx`) dan beberapa bug fix tambahan di luar plan asli:
- Fix kategori duplikat saat tambah/edit kategori (override-by-name pattern di `categories.js`).
- Fitur Kelola Kategori (CRUD kategori + sub-kategori, termasuk edit kategori default) via modal di `TransactionForm.jsx` → `CategoryManager.jsx`.
- Fix Modal kedua (Kelola Kategori dari dalam form Tambah Transaksi) bertumpuk dengan modal pertama — `Modal.jsx` sekarang pakai React Portal ke `document.body`.
- Fix bug rename kategori default (mis. "Makan" → "Makan & Minuman") yang menyebabkan duplikat — ditambah field stabil `overridesDefault` (kolom Supabase `overrides_default`, lihat `supabase/migration_002_overrides_default.sql`) yang tetap terhubung ke kategori default aslinya walau di-rename berkali-kali.
- Warna kategori baru/custom dijamin unik (cek warna yang sudah dipakai default+custom sebelum assign, fallback ke hash warna deterministik).

Semua fase di atas sudah diverifikasi end-to-end via browser (Playwright) dan `npm run build` sukses tanpa error.

## Sisa pekerjaan (Fase 9, 11, 12)

| Fase | Nama | Kompleksitas | Catatan kunci |
|---|---|---|---|
| 9 | Multi-Account + Transfer | **Besar/berisiko** | Migrasi data transaksi existing (tambah field `account`, default "Cash" untuk data lama). Transfer = 2 transaksi terhubung via `transfer_id`, bukan tipe baru. Wajib audit ulang semua hook yang menjumlahkan transaksi (`useBudget`, `useInsights`, `CategoryChart`, dst). |
| 11 | Challenges (gamifikasi) | Sedang | Mulai dengan 2 tipe saja sesuai contoh user (no-spend kategori X selama N hari, hemat kategori Y di bawah Rp tertentu). |
| 12 | Financial Health Score | Sedang | **Keputusan tertunda**: komponen "hutang" di formula skor tidak punya data sama sekali di app ini. Opsi (a) skip dari skor v1 + label "belum memperhitungkan utang" (direkomendasikan), atau (b) bangun debt-tracking dasar dulu. |

## Cara lanjut sesi berikutnya

Baca file plan di atas untuk detail desain tiap fase (file yang disentuh, skema data, keputusan teknis). Fase 10 sudah dikerjakan lompat duluan atas permintaan user — sisanya Fase 9, 11, 12 bisa dikerjakan berurutan atau user bisa minta lompat/reprioritaskan fase tertentu.

**Catatan untuk Fase 9 (Multi-Account)**: karena app sekarang sudah pakai Supabase (bukan cuma localStorage seperti saat plan awal ditulis), migrasi data transaksi existing harus dilakukan di level Supabase (ALTER TABLE + backfill), bukan cuma di `AppContext.jsx` init seperti yang dijelaskan di plan asli. Sesuaikan detail teknisnya saat fase itu dimulai.

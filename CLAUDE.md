# Monthly Expense Tracker — Status & Lanjutan

Plan lengkap (semua 13 fase, detail desain & file): `/home/yusep/.claude/plans/tutup-navbar-nya-structured-kettle.md`

## Sudah selesai (Fase 0–6)

- **Fase 0** — Bug fixes & UI polish: sidebar dirampingkan, search blur fix, custom DatePicker, modal scroll fix, draft form preservation saat klik-luar-modal.
- **Fase 1** — Dashboard Insight: pengeluaran/pendapatan terbesar (`useInsights.js`), kalimat tren kategori bulan-ke-bulan.
- **Fase 2** — Budget Alert: pesan "sudah mencapai 80%" / "telah terlampaui" di `useBudget.js` + `BudgetProgress.jsx` (tanpa state baru).
- **Fase 3** — Recurring Transaction CRUD lengkap + dialog konfirmasi jatuh tempo (`RecurringDueDialog`) + halaman `RecurringPage.jsx`. Subscription Tracker disatukan ke fitur ini (tampilan "tagihan berikutnya N hari").
- **Fase 4** — Halaman Laporan (`ReportsPage.jsx`): toggle Mingguan/Bulanan/Tahunan + Pie/Bar/Line chart, export CSV & PDF (print-to-PDF browser).
- **Fase 5** — Target Tabungan: halaman tersendiri `SavingsGoalsPage.jsx`, progress manual (`currentAmount` diedit langsung, bukan auto dari transaksi).
- **Fase 6** — Smart Suggestion & rule-based "AI" Categorization (`categoryKeywords.js`, `smartSuggestion.js`) — **bukan AI/LLM sungguhan**, murni keyword dictionary + substring match lokal, tanpa network call.

Semua fase di atas sudah diverifikasi end-to-end via browser (Playwright) dan `npm run build` sukses tanpa error.

## Sisa pekerjaan (Fase 7–12)

| Fase | Nama | Kompleksitas | Catatan kunci |
|---|---|---|---|
| 7 | Cash Flow Prediction | Kecil | Murni kalkulasi baru (`useCashFlowPrediction.js`), tidak ada state baru. **Cek dulu** definisi "saldo" yang dipakai `MonthSummary.jsx` agar tidak ada 2 angka saldo berbeda di dashboard. |
| 8 | Wishlist + saran tunda beli | Sedang | **Harus setelah Fase 7** — reuse burn-rate dari Cash Flow Prediction untuk aturan "tunda pembelian". Perlu state baru `wishlist[]` + sheet Excel baru. |
| 9 | Multi-Account + Transfer | **Besar/berisiko** | Migrasi data transaksi existing (tambah field `account`, default "Cash" untuk data lama). Transfer = 2 transaksi terhubung via `transfer_id`, bukan tipe baru. Wajib audit ulang semua hook yang menjumlahkan transaksi (`useBudget`, `useInsights`, `CategoryChart`, dst). |
| 10 | Reminder notifikasi harian | Kecil | **Limitasi**: Notification API + setInterval hanya jalan selagi tab terbuka (app tidak punya service worker/PWA). Perlu label jelas di UI. |
| 11 | Challenges (gamifikasi) | Sedang | Mulai dengan 2 tipe saja sesuai contoh user (no-spend kategori X selama N hari, hemat kategori Y di bawah Rp tertentu). |
| 12 | Financial Health Score | Sedang | **Keputusan tertunda**: komponen "hutang" di formula skor tidak punya data sama sekali di app ini. Opsi (a) skip dari skor v1 + label "belum memperhitungkan utang" (direkomendasikan), atau (b) bangun debt-tracking dasar dulu. |

## Cara lanjut sesi berikutnya

Baca file plan di atas untuk detail desain tiap fase (file yang disentuh, skema data, keputusan teknis). Lanjutkan dari Fase 7 secara berurutan, atau user bisa minta lompat/reprioritaskan fase tertentu.

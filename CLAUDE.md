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

Di luar 13 fase asli — diminta user setelah Fase 12 selesai, supaya app aktif mengarahkan alokasi pemasukan ke dana darurat/investasi, bukan cuma mencatat pasif. Tujuan besarnya: membantu user menuju *financial freedom*, kasih "tekanan" sadar supaya tidak boros dan rutin investasi.

**Konsep (v2, full-auto)**: rumus 20% Dana Darurat / 10% Investasi / 70% Biaya Hidup (referensi dari user), dihitung **otomatis** dari total pemasukan bulan berjalan — semua transaksi `type: income` (gaji, freelance, dll). **Tidak ada tagging manual** (versi v1 sempat pakai tag per-transaksi `allocationTag`, lalu user minta dirombak supaya full-otomatis tanpa perlu effort manual — kolom `allocation_tag` di DB dibiarkan ada tapi sudah tidak dipakai app, tidak ada migrasi drop).

**Carry-over seperti hutang ke diri sendiri**: kalau suatu bulan realisasi alokasi (`income x persen` bulan itu) kurang dari target normalnya, kekurangannya otomatis ditambahkan ke target bulan berikutnya — akumulatif sampai tertutup oleh bulan dengan income tinggi. Dihitung ulang LIVE dari riwayat transaksi tiap render (`calculateAllocation` di `lib/allocation.js`), bukan snapshot tersimpan — supaya otomatis konsisten kalau ada koreksi transaksi lama.

**Tracking return investasi**: user update manual "nilai portofolio sekarang" (`allocationSettings.investmentValue`, mirip pola Savings Goal/Debt), sistem hitung untung/rugi vs. total yang sudah ter-auto-alokasi ke investasi sejak awal data (`cumulativeInvested()` / `calculateInvestmentReturn()` di `lib/allocation.js`).

**File kunci**:
- `lib/allocation.js` — `calculateAllocation()` (auto + carry-over), `emergencyFundSplit()` (breakdown informational 70% tabungan / 30% money market fund), `cumulativeInvested()` + `calculateInvestmentReturn()` (gain/loss).
- `hooks/useFinancialAllocation.js` — wrapper hook, gabung allocation + investmentReturn.
- `pages/AllocationPage.jsx` — Dana Bersih untuk Hidup, progress + carry-over warning per pocket, breakdown tabungan/MMF, untung/rugi investasi, form "Update Nilai".
- `components/allocation/AllocationSettingsForm.jsx` — edit persentase custom.
- `components/allocation/InvestmentValueForm.jsx` — update nilai portofolio investasi.
- `components/dashboard/AllocationSummaryCard.jsx` — widget ringkas Dashboard + badge peringatan kalau ada carry-over.
- State: `allocationSettings` (single object: `emergencyPercent`, `investmentPercent`, `livingPercent`, `investmentValue`) + kolom `investment_value` di `app_settings` (`supabase/migration_007_allocation.sql`, `migration_008_investment_value.sql`).

Diverifikasi langsung: pemasukan otomatis ter-allocate 20/10/70 tanpa tagging apapun; set nilai investasi Rp500rb vs. total teralokasi Rp662rb → benar muncul "Rugi Rp -162.006,3 (-24,5%)".

### v3: pengeluaran kategori "Investasi" (mis. kuliah) + sisa riil yang minus

User merasa "Dana Bersih untuk Hidup" menyesatkan — itu cuma jatah/budget, bukan sisa uang riil (belum dikurangi pengeluaran yang sudah terjadi), dan ingin kuliah dihitung sebagai investasi (ke diri sendiri), bukan biaya hidup.

**Pos alokasi per kategori expense**: `allocationPocket` (`"living"` default, atau `"investment"`) ditandai per kategori via `CategoryForm.jsx` (toggle "Masuk Pos Alokasi"), badge indigo "Investasi" di `CategoryManager.jsx`. Default "Pendidikan" = `"investment"`. Pengeluaran di kategori `"investment"` (mis. UKT/SPP) **menambah** kontribusi investasi bulan ini (di atas alokasi otomatis 10%) — bukan mengurangi jatah Biaya Hidup. Kolom `allocation_pocket` baru di `custom_categories` (`supabase/migration_010_allocation_pocket.sql`).

**Sisa riil**: `realRemainingForLiving = netForLiving - livingSpent` (jatah Biaya Hidup dikurangi yang BENAR-BENAR sudah dipakai di kategori pos "living"). Ini angka utama yang ditampilkan sekarang (hero card Dashboard & halaman Alokasi), **bisa minus** dan ditandai jelas merah + label "Sudah Minus Sebesar" kalau pengeluaran sudah melebihi jatah bulan ini.

**Bug yang ditemukan & diperbaiki saat verifikasi**: `fetchCustomCategories` di `categoriesApi.js` awalnya selalu set `allocationPocket: row.allocation_pocket || "living"` untuk SEMUA override row expense — termasuk override lama yang dibuat sebelum kolom `allocation_pocket` ada (mis. override "Pendidikan" yang aslinya cuma untuk `isEssential`). Ini diam-diam menimpa default `allocationPocket: "investment"` jadi `"living"`. Fix: hanya sertakan key `allocationPocket` di hasil fetch kalau `row.allocation_pocket` benar-benar terisi — kalau tidak, key dihilangkan sepenuhnya supaya merge `{...default, ...override}` di `categories.js` jatuh balik ke nilai default. Diverifikasi: sebelum fix, toggle "Pendidikan" salah default ke "Biaya Hidup"; setelah fix, benar default ke "Investasi", dan "Sisa Riil" naik dari Rp79rb ke Rp1,53jt setelah pengeluaran UKT Rp1,45jt benar dipindah dari hitungan Biaya Hidup ke Investasi.

## Fitur pasca-plan: Insight Pemborosan

Lanjutan dari goal *financial freedom* user — "uang yang disia-siakan" didefinisikan jadi 3 hal konkret: (1) pengeluaran non-esensial yang membengkak vs rata-rata, (2) total kelebihan budget bulan ini, (3) subscription/recurring yang sudah lama jalan (≥3 bulan) — reminder "masih dipakai?".

**Kategori esensial vs non-esensial**: user tandai sendiri per kategori expense (toggle "Esensial"/"Non-Esensial" di `CategoryForm.jsx`, badge kuning "Non-Esensial" muncul di `CategoryManager.jsx`). Default kategori bawaan: Makan/Transport/Kesehatan/Tagihan/Pendidikan = esensial; Belanja/Hiburan/Lainnya = non-esensial. Kategori custom baru default `isEssential: true` (supaya tidak salah-flag sebagai boros). Field `isEssential` ikut pola override `categories.js` yang sudah ada (kolom `is_essential` baru di `custom_categories`, `supabase/migration_009_is_essential.sql`).

**Bug yang sempat ditemukan saat membangun ini**: `AddSubcategoryForm` di `CategoryManager.jsx` (fitur "+ Tambah Sub-kategori") tidak meneruskan `isEssential` saat dispatch `UPDATE_CATEGORY` — karena reducer punya default `isEssential ?? true`, ini akan diam-diam me-reset kategori non-esensial manapun balik jadi esensial begitu ditambah sub-kategori. Sudah diperbaiki dengan eksplisit meneruskan `selected.isEssential`.

**File kunci**:
- `lib/wasteInsight.js` — 3 fungsi murni: `nonEssentialTrend()` (bandingkan bulan ini vs rata-rata 3 bulan lalu, exclude kategori esensial), `totalBudgetOverspend()` (sum kelebihan dari `useBudget` rows yang over), `subscriptionsToReview()` (recurring aktif dengan ≥3 bulan transaksi ter-log, dihitung dari riwayat transaksi aktual — bukan tanggal dibuat, karena recurring tidak punya field itu).
- `hooks/useWasteInsight.js` — wrapper hook gabung ketiganya.
- `components/dashboard/WasteInsightCard.jsx` — card di Dashboard, **sengaja tidak render apapun kalau tidak ada insight** (tidak ada overspend, tidak ada lonjakan non-esensial, tidak ada subscription ≥3 bulan) — supaya tidak menampilkan insight kosong/menyesatkan untuk user baru dengan sedikit data.

Diverifikasi via unit test logic langsung (`nonEssentialTrend`, `totalBudgetOverspend`, `subscriptionsToReview` — semua benar menghitung rata-rata, exclude esensial, dan threshold 3 bulan) karena akun live belum punya cukup riwayat data (1 bulan transaksi, belum ada budget diset) untuk memicu kondisi insight secara natural — perilaku card menyembunyikan diri saat itu sudah dikonfirmasi benar (bukan bug).

## Status: plan 13-fase selesai + 3 fitur tambahan

Tidak ada fase tersisa dari plan asli. Untuk kelanjutan, baca file plan di atas untuk konteks desain sebelumnya, atau tanya user fitur/perbaikan baru apa yang diinginkan.

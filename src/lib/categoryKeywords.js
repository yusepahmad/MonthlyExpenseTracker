// Static keyword dictionary — NOT AI/ML. Pure substring matching against a
// manually-curated word list per category. No network call, no model.
export const CATEGORY_KEYWORDS = {
  Makan: [
    "nasi", "makan", "ayam", "geprek", "warteg", "padang", "kopi", "gofood",
    "grabfood", "bakso", "mie", "soto", "sate", "warung", "restoran", "kafe",
    "cafe", "snack", "jajan", "minum", "es teh", "burger", "pizza",
  ],
  Transport: [
    "bensin", "pertalite", "pertamax", "solar", "ojek", "gojek", "grab",
    "parkir", "tol", "taksi", "taxi", "busway", "krl", "mrt", "angkot",
    "bbm", "service motor", "bengkel",
  ],
  Belanja: [
    "baju", "celana", "sepatu", "tas", "belanja", "shopee", "tokopedia",
    "lazada", "elektronik", "skincare", "kosmetik",
  ],
  Hiburan: [
    "netflix", "spotify", "bioskop", "nonton", "game", "steam", "mobile legends",
    "konser", "tiket", "hiburan",
  ],
  Kesehatan: [
    "obat", "dokter", "apotek", "vitamin", "rumah sakit", "klinik", "bpjs",
  ],
  Tagihan: [
    "listrik", "pdam", "air", "wifi", "internet", "pulsa", "token listrik",
    "indihome", "telkomsel", "pln",
  ],
  Pendidikan: [
    "kursus", "buku", "spp", "sekolah", "kuliah", "les", "ukt",
  ],
  Gaji: ["gaji", "payroll", "salary"],
  Freelance: ["freelance", "proyek", "klien"],
};

export function suggestCategory(description) {
  if (!description) return null;
  const text = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }
  return null;
}

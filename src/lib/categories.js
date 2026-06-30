// isEssential only matters for expense categories — drives the "Insight
// Pemborosan" feature (waste/overspend insight). Default mapping below is
// just a sensible starting point; the user can re-tag any category via
// CategoryForm.
export const DEFAULT_CATEGORIES = [
  { name: "Makan", color: "#F59E0B", icon: "Utensils", type: "expense", subcategories: ["Restoran", "Warung", "Kafe", "Snack"], isEssential: true },
  { name: "Transport", color: "#3B82F6", icon: "Car", type: "expense", subcategories: ["Bensin", "Parkir", "Ojek/Taksi", "Tol"], isEssential: true },
  { name: "Belanja", color: "#8B5CF6", icon: "ShoppingBag", type: "expense", subcategories: ["Pakaian", "Elektronik", "Kebutuhan Rumah"], isEssential: false },
  { name: "Hiburan", color: "#EC4899", icon: "Gamepad2", type: "expense", subcategories: ["Streaming", "Game", "Nonton", "Hobi"], isEssential: false },
  { name: "Kesehatan", color: "#10B981", icon: "Pill", type: "expense", subcategories: ["Obat", "Dokter", "Vitamin"], isEssential: true },
  { name: "Tagihan", color: "#EF4444", icon: "Receipt", type: "expense", subcategories: ["Listrik", "Air", "Internet", "Pulsa"], isEssential: true },
  { name: "Pendidikan", color: "#06B6D4", icon: "BookOpen", type: "expense", subcategories: ["Kursus", "Buku", "SPP"], isEssential: true },
  { name: "Lainnya", color: "#6B7280", icon: "Package", type: "expense", subcategories: [], isEssential: false },
  { name: "Gaji", color: "#22C55E", icon: "Briefcase", type: "income", subcategories: [] },
  { name: "Freelance", color: "#84CC16", icon: "Laptop", type: "income", subcategories: [] },
  { name: "Piket", color: "#0EA5E9", icon: "Clock", type: "income", subcategories: [] },
  { name: "Tunjangan", color: "#A855F7", icon: "Gift", type: "income", subcategories: [] },
  { name: "Bonus", color: "#F97316", icon: "Star", type: "income", subcategories: [] },
];

const FALLBACK_COLORS = [
  "#0D9488", "#D946EF", "#F43F5E", "#65A30D", "#0284C7", "#CA8A04",
  "#7C3AED", "#DB2777", "#059669", "#EA580C", "#4F46E5", "#0891B2",
  "#B91C1C", "#15803D", "#9333EA", "#C2410C",
];

// Deterministic hash fallback once the curated palette is exhausted —
// guarantees *a* color rather than reusing one, even with 100+ categories.
function hashColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

function normalizeName(name) {
  return (name || "").trim().toLowerCase();
}

// customCategories can both ADD brand-new categories and OVERRIDE a default
// category's name/color/icon/subcategories. Overrides are matched by the
// stable `overridesDefault` key (the default category's original name) —
// NOT by the override's current `name` — so renaming a default category
// (e.g. "Makan" -> "Makan & Minuman") still replaces it instead of leaving
// the old default behind and creating a duplicate.
export function getAllCategories(customCategories = []) {
  const overridesByKey = new Map();
  const newCategories = [];

  for (const c of customCategories) {
    if (c.overridesDefault) {
      overridesByKey.set(normalizeName(c.overridesDefault), c);
    } else {
      newCategories.push(c);
    }
  }

  const merged = DEFAULT_CATEGORIES.map((d) => {
    const override = overridesByKey.get(normalizeName(d.name));
    return override ? { ...d, ...override, isDefault: true } : { ...d, isDefault: true };
  });

  return [
    ...merged,
    ...newCategories.map((c) => ({
      ...c,
      isDefault: false,
      isEssential: c.isEssential ?? true, // default to essential so new categories aren't mislabeled as waste
    })),
  ];
}

export function getCategory(name, customCategories = []) {
  const key = normalizeName(name);
  return getAllCategories(customCategories).find((c) => normalizeName(c.name) === key);
}

export function getCategoriesByType(type, customCategories = []) {
  return getAllCategories(customCategories).filter((c) => c.type === type);
}

export function getSubcategories(categoryName, customCategories = []) {
  return getCategory(categoryName, customCategories)?.subcategories || [];
}

export function isCategoryNameTaken(name, customCategories = [], excludeName = null) {
  const key = normalizeName(name);
  if (excludeName && normalizeName(excludeName) === key) return false;
  return getAllCategories(customCategories).some((c) => normalizeName(c.name) === key);
}

// Picks a color not already used by any existing category (default or
// custom), so chart segments never collide. Falls back to a deterministic
// hash-based color once the curated palette is exhausted.
export function makeCustomCategoryColor(customCategories = [], seed = "") {
  const usedColors = new Set(getAllCategories(customCategories).map((c) => c.color));
  const free = FALLBACK_COLORS.find((color) => !usedColors.has(color));
  if (free) return free;

  let candidate = hashColor(seed || String(Date.now()));
  let attempt = 0;
  while (usedColors.has(candidate) && attempt < 20) {
    candidate = hashColor(`${seed}-${attempt}`);
    attempt += 1;
  }
  return candidate;
}

export const CUSTOM_CATEGORY_ICON = "Tag";

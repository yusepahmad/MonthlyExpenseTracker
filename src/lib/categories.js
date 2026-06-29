export const DEFAULT_CATEGORIES = [
  { name: "Makan", color: "#F59E0B", icon: "Utensils", type: "expense", subcategories: ["Restoran", "Warung", "Kafe", "Snack"] },
  { name: "Transport", color: "#3B82F6", icon: "Car", type: "expense", subcategories: ["Bensin", "Parkir", "Ojek/Taksi", "Tol"] },
  { name: "Belanja", color: "#8B5CF6", icon: "ShoppingBag", type: "expense", subcategories: ["Pakaian", "Elektronik", "Kebutuhan Rumah"] },
  { name: "Hiburan", color: "#EC4899", icon: "Gamepad2", type: "expense", subcategories: ["Streaming", "Game", "Nonton", "Hobi"] },
  { name: "Kesehatan", color: "#10B981", icon: "Pill", type: "expense", subcategories: ["Obat", "Dokter", "Vitamin"] },
  { name: "Tagihan", color: "#EF4444", icon: "Receipt", type: "expense", subcategories: ["Listrik", "Air", "Internet", "Pulsa"] },
  { name: "Pendidikan", color: "#06B6D4", icon: "BookOpen", type: "expense", subcategories: ["Kursus", "Buku", "SPP"] },
  { name: "Lainnya", color: "#6B7280", icon: "Package", type: "expense", subcategories: [] },
  { name: "Gaji", color: "#22C55E", icon: "Briefcase", type: "income", subcategories: [] },
  { name: "Freelance", color: "#84CC16", icon: "Laptop", type: "income", subcategories: [] },
  { name: "Piket", color: "#0EA5E9", icon: "Clock", type: "income", subcategories: [] },
  { name: "Tunjangan", color: "#A855F7", icon: "Gift", type: "income", subcategories: [] },
  { name: "Bonus", color: "#F97316", icon: "Star", type: "income", subcategories: [] },
];

const FALLBACK_COLORS = ["#0D9488", "#D946EF", "#F43F5E", "#65A30D", "#0284C7", "#CA8A04"];

function normalizeName(name) {
  return (name || "").trim().toLowerCase();
}

// customCategories can both ADD brand-new categories and OVERRIDE a default
// category's color/icon/subcategories (matched by name, case-insensitive).
// This lets users edit "Makan"'s subcategories without duplicating it.
export function getAllCategories(customCategories = []) {
  const overridesByName = new Map();
  const newCategories = [];

  for (const c of customCategories) {
    const key = normalizeName(c.name);
    const isOverrideOfDefault = DEFAULT_CATEGORIES.some((d) => normalizeName(d.name) === key);
    if (isOverrideOfDefault) {
      overridesByName.set(key, c);
    } else {
      newCategories.push(c);
    }
  }

  const merged = DEFAULT_CATEGORIES.map((d) => {
    const override = overridesByName.get(normalizeName(d.name));
    return override ? { ...d, ...override, isDefault: true } : { ...d, isDefault: true };
  });

  return [...merged, ...newCategories.map((c) => ({ ...c, isDefault: false }))];
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

export function makeCustomCategoryColor(index) {
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export const CUSTOM_CATEGORY_ICON = "Tag";

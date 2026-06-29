-- Run this once in the Supabase SQL Editor to fix the duplicate-category-on-rename bug.
-- Adds a stable link from an override row back to the default category it overrides,
-- so renaming a default category (e.g. "Makan" -> "Makan & Minuman") replaces it
-- instead of leaving the old default visible and creating a duplicate.

alter table custom_categories add column if not exists overrides_default text;

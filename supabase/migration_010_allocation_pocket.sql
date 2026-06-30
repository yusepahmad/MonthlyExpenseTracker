-- Run this once in the Supabase SQL Editor to let expense categories
-- (e.g. Pendidikan/kuliah) count against the Investasi allocation pocket
-- instead of Biaya Hidup.

alter table custom_categories add column if not exists allocation_pocket text
  check (allocation_pocket in ('living', 'investment'));

-- Run this once in the Supabase SQL Editor to add Financial Allocation
-- support (20/10/70 emergency fund / investment / living costs rule).

alter table transactions add column if not exists allocation_tag text
  check (allocation_tag in ('emergency', 'investment'));

alter table app_settings add column if not exists emergency_percent numeric;
alter table app_settings add column if not exists investment_percent numeric;
alter table app_settings add column if not exists living_percent numeric;

-- Run this once in the Supabase SQL Editor to add Investment Return
-- tracking support (gain/loss vs. cumulative auto-allocated investment).

alter table app_settings add column if not exists investment_value numeric;

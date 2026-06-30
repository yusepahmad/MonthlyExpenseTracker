-- Run this once in the Supabase SQL Editor to add the "Insight Pemborosan"
-- (waste/overspend insight) prerequisite: essential vs non-essential
-- expense categories.

alter table custom_categories add column if not exists is_essential boolean;

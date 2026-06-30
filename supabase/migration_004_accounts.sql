-- Run this once in the Supabase SQL Editor to add Multi-Account + Transfer support (Fase 9).

create table if not exists accounts (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

alter table accounts enable row level security;

create policy "Users manage their own accounts" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Add the new columns to the existing transactions table, backfilling
-- every existing row to the default "Cash" account so nothing old breaks.
alter table transactions add column if not exists account text not null default 'acc_cash';
alter table transactions add column if not exists transfer_id text;

-- Seed a default "Cash" account for every user who already has transactions,
-- so the account dropdown isn't empty after this migration runs.
insert into accounts (id, user_id, name, is_default)
select 'acc_cash', user_id, 'Cash', true
from (select distinct user_id from transactions) t
on conflict (id, user_id) do nothing;

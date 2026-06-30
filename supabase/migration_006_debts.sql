-- Run this once in the Supabase SQL Editor to add Debt Tracking support (Fase 12 prerequisite).

create table if not exists debts (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  total_amount numeric not null,
  remaining_amount numeric not null,
  due_date date,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

alter table debts enable row level security;

create policy "Users manage their own debts" on debts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

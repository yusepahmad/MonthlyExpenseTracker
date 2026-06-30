-- Run this once in the Supabase SQL Editor to add Challenges support (Fase 11).

create table if not exists challenges (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('no_spend', 'spending_limit')),
  category text not null,
  target_amount numeric,
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

alter table challenges enable row level security;

create policy "Users manage their own challenges" on challenges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

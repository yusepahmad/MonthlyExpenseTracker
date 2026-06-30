-- Run this once in the Supabase SQL Editor to add Wishlist support (Fase 8).

create table if not exists wishlist (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price numeric not null,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz default now(),
  primary key (id, user_id)
);

alter table wishlist enable row level security;

create policy "Users manage their own wishlist" on wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

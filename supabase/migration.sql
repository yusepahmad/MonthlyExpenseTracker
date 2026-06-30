-- Monthly Expense Tracker — Initial schema
-- Run this once in Supabase SQL Editor (Dashboard > SQL Editor > New query)

create table if not exists accounts (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

create table if not exists transactions (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  category text not null,
  subcategory text default '',
  amount numeric not null,
  type text not null check (type in ('expense', 'income')),
  description text default '',
  is_recurring boolean default false,
  recurring_id text,
  -- References accounts.id (not a foreign key — accounts are created
  -- lazily/per-user and the default "Cash" account is seeded in app code,
  -- not guaranteed to exist in the DB before the first transaction does).
  account text not null default 'acc_cash',
  -- Set on both legs of a transfer between the user's own accounts so they
  -- stay linked; null for ordinary transactions.
  transfer_id text,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

create table if not exists budgets (
  id bigint generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  category text not null,
  budget_amount numeric not null,
  created_at timestamptz default now(),
  primary key (id),
  unique (user_id, month, category)
);

create table if not exists recurring (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  amount numeric not null,
  frequency text not null default 'monthly',
  day_of_month int not null default 1,
  is_active boolean default true,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

create table if not exists custom_categories (
  id bigint generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('expense', 'income')),
  color text default '#6B7280',
  icon text default 'Tag',
  subcategories text[] default '{}',
  -- Set when this row overrides a built-in default category, holding the
  -- default's original (stable) name so renames don't lose the link to it.
  overrides_default text,
  created_at timestamptz default now(),
  primary key (id),
  unique (user_id, name)
);

create table if not exists savings_goals (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline date,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

create table if not exists wishlist (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price numeric not null,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz default now(),
  primary key (id, user_id)
);

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

create table if not exists app_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  active_month text,
  updated_at timestamptz default now(),
  primary key (user_id)
);

-- Row Level Security: each user can only see/modify their own rows
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table recurring enable row level security;
alter table custom_categories enable row level security;
alter table savings_goals enable row level security;
alter table wishlist enable row level security;
alter table challenges enable row level security;
alter table app_settings enable row level security;

create policy "Users manage their own accounts" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own budgets" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own recurring" on recurring
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own custom_categories" on custom_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own savings_goals" on savings_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own wishlist" on wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own challenges" on challenges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own app_settings" on app_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table public.users (
  username text not null primary key,
  passcode text not null,
  created_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- 2. Todos Table
create table public.todos (
  id uuid default uuid_generate_v4() primary key,
  username text not null references public.users(username) on delete cascade,
  text text not null,
  completed boolean default false,
  created_at bigint not null,
  due_date bigint,
  completed_at bigint,
  priority text,
  category text
);

-- 3. Budgets Table
create table public.budgets (
  id uuid default uuid_generate_v4() primary key,
  username text not null references public.users(username) on delete cascade,
  category text not null,
  limit_amount numeric not null default 0,
  spent numeric not null default 0,
  period text default 'monthly',
  created_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- 4. Wallets Table
create table public.wallets (
  id uuid default uuid_generate_v4() primary key,
  username text not null references public.users(username) on delete cascade,
  name text not null,
  type text not null,
  balance numeric not null default 0,
  color text,
  created_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- 5. Transactions Table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  username text not null references public.users(username) on delete cascade,
  type text not null, -- 'income' or 'expense'
  amount numeric not null,
  category text not null,
  description text,
  date text not null, -- ISO string
  wallet_id uuid references public.wallets(id) on delete set null,
  tags text[],
  receipt_url text,
  recurring_id text,
  created_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- 6. Goals Table
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  username text not null references public.users(username) on delete cascade,
  name text not null,
  target_amount numeric not null,
  saved_amount numeric default 0,
  deadline text, -- ISO string
  color text,
  created_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.todos enable row level security;
alter table public.budgets enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

-- Create Policies (Allow public access for now as per current implementation)
-- Note: In a production app with proper auth, you would restrict this.
create policy "Public users access" on public.users for all using (true);
create policy "Public todos access" on public.todos for all using (true);
create policy "Public budgets access" on public.budgets for all using (true);
create policy "Public wallets access" on public.wallets for all using (true);
create policy "Public transactions access" on public.transactions for all using (true);
create policy "Public goals access" on public.goals for all using (true);

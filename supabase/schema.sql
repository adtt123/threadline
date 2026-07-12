-- Threadline database schema
-- Run this once in Supabase SQL Editor (Step 3 in the README)

create extension if not exists "pgcrypto";

create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  company text,
  role text,
  tags text[] default '{}',
  how_they_help text,
  phone text,
  email text,
  linkedin_url text,
  met_context text,
  last_contact_date date default current_date,
  created_at timestamptz default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  content text not null,
  created_at timestamptz default now()
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  due_date date,
  related_contact_id uuid references contacts(id) on delete set null,
  done boolean default false,
  created_at timestamptz default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  amount numeric not null,
  category text,
  description text,
  expense_date date default current_date,
  receipt_url text,
  created_at timestamptz default now()
);

alter table contacts enable row level security;
alter table notes enable row level security;
alter table reminders enable row level security;
alter table expenses enable row level security;

create policy "Users can manage their own contacts"
  on contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own notes"
  on notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own reminders"
  on reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own expenses"
  on expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index contacts_last_contact_idx on contacts(last_contact_date);
create index reminders_due_date_idx on reminders(due_date);

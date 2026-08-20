-- Run this in Supabase → SQL Editor

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  role text not null,
  company text not null,
  email text not null,
  intent text not null check (intent in ('diagnosis', 'session')),
  submitted_at timestamptz not null default now()
);

-- Lock the table down: no public read/write access.
-- The Next.js API route will use the service role key (server-side only)
-- to insert rows, bypassing RLS. This keeps leads inaccessible from
-- the browser / anon key entirely.
alter table leads enable row level security;

-- (No policies added on purpose — table is only reachable via service_role.)

-- Optional: index for querying by intent or date in a future admin view
create index if not exists leads_intent_idx on leads (intent);
create index if not exists leads_submitted_at_idx on leads (submitted_at desc);

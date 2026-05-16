-- Enable RLS on all tables

create table rackets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);
alter table rackets enable row level security;
create policy "users own rackets" on rackets for all using (auth.uid() = user_id);

create table string_jobs (
  id uuid primary key default gen_random_uuid(),
  racket_id uuid not null references rackets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  brand text not null,
  model text not null,
  gauge text not null,
  tension_mains integer not null,
  tension_crosses integer,
  date_strung date not null,
  hour_threshold numeric(5,1) not null default 10,
  is_active boolean not null default true,
  notes text,
  retirement_reason text check (retirement_reason in ('broke', 'cut')),
  retirement_date date,
  cost numeric(8,2),
  created_at timestamptz default now()
);
alter table string_jobs enable row level security;
create policy "users own string_jobs" on string_jobs for all using (auth.uid() = user_id);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz default now()
);
alter table sessions enable row level security;
create policy "users own sessions" on sessions for all using (auth.uid() = user_id);

create table session_racket_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  string_job_id uuid not null references string_jobs(id) on delete cascade,
  racket_id uuid not null references rackets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  hours_played numeric(4,1) not null,
  created_at timestamptz default now()
);
alter table session_racket_entries enable row level security;
create policy "users own entries" on session_racket_entries for all using (auth.uid() = user_id);

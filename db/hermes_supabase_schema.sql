create table if not exists projects (
  id bigserial primary key,
  name text not null,
  budget integer,
  timeline_weeks integer,
  stack text,
  created_at timestamptz default now()
);

create table if not exists students (
  id bigserial primary key,
  full_name text not null,
  primary_skill text,
  availability text,
  level text,
  created_at timestamptz default now()
);

create table if not exists teams (
  id bigserial primary key,
  project_name text not null,
  lead_engineer text,
  backend text,
  frontend text,
  ml_engineer text,
  devops text,
  eta_weeks integer,
  confidence_score integer,
  created_at timestamptz default now()
);

create table if not exists execution_logs (
  id bigserial primary key,
  project_name text not null,
  message text not null,
  state text default 'ok',
  created_at timestamptz default now()
);

alter publication supabase_realtime add table execution_logs;

-- ============================================================
-- Power Learn – Complemento: tabelas e colunas adicionais
-- Execute no SQL Editor do Supabase caso ainda não existam:
-- Dashboard → SQL Editor → New query → Cole e execute
-- ============================================================

-- ─── Coluna user_role na tabela users ────────────────────────
-- (adicionada se ainda não existir)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'user_role'
  ) then
    alter table public.users
      add column user_role text not null default 'usuario'
        check (user_role in ('admin', 'gerente', 'usuario'));
  end if;
end $$;

-- ─── Coluna status na tabela courses (necessária para filtros) ─
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'courses' and column_name = 'status'
  ) then
    alter table public.courses
      add column status text not null default 'published'
        check (status in ('published', 'draft'));
  end if;
end $$;

-- ─── Tabela departments ──────────────────────────────────────
create table if not exists public.departments (
  id         text        primary key,
  name       text        not null unique,
  created_at timestamptz not null default now()
);

-- ─── Tabela course_departments ───────────────────────────────
create table if not exists public.course_departments (
  course_id     text not null references public.courses(id)     on delete cascade,
  department_id text not null references public.departments(id) on delete cascade,
  primary key (course_id, department_id)
);

-- ─── Tabela track_departments ────────────────────────────────
create table if not exists public.track_departments (
  track_id      text not null references public.tracks(id)      on delete cascade,
  department_id text not null references public.departments(id) on delete cascade,
  primary key (track_id, department_id)
);

-- ─── RLS para novas tabelas ──────────────────────────────────
alter table public.departments       enable row level security;
alter table public.course_departments enable row level security;
alter table public.track_departments  enable row level security;

-- departments: leitura pública para autenticados; escrita para admins
create policy if not exists "departments_select" on public.departments
  for select to authenticated using (true);
create policy if not exists "departments_admin_write" on public.departments
  for all to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and is_admin));

-- course_departments: mesma lógica de courses
create policy if not exists "course_depts_select" on public.course_departments
  for select to authenticated using (true);
create policy if not exists "course_depts_admin_write" on public.course_departments
  for all to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and is_admin));

-- track_departments: mesma lógica de tracks
create policy if not exists "track_depts_select" on public.track_departments
  for select to authenticated using (true);
create policy if not exists "track_depts_admin_write" on public.track_departments
  for all to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and is_admin));

-- ─── Garantir que enrollments tem policy de INSERT ───────────
-- (a policy "for all" cobre insert, mas recriamos explicitamente por segurança)
drop policy if exists "enrollments_write_self" on public.enrollments;
create policy "enrollments_write_self" on public.enrollments
  for all to authenticated
  using    (auth.uid() = user_id)
  with check (auth.uid() = user_id);

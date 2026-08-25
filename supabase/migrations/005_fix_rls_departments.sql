-- ============================================================
-- Power Learn – Fix: Habilitar RLS nas tabelas de departments
-- Corrige o alerta: "Table is public, but RLS has not been enabled"
-- Execute no SQL Editor do Supabase:
-- Dashboard → SQL Editor → New query → Cole e execute
-- ============================================================

-- ─── Habilitar RLS ───────────────────────────────────────────
alter table public.departments        enable row level security;
alter table public.course_departments enable row level security;
alter table public.track_departments  enable row level security;

-- ─── Policies para departments ───────────────────────────────
-- Leitura: todos os usuários autenticados
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'departments' and policyname = 'departments_select'
  ) then
    execute 'create policy "departments_select" on public.departments
      for select to authenticated using (true)';
  end if;
end $$;

-- Escrita: somente admins (is_admin = true)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'departments' and policyname = 'departments_admin_write'
  ) then
    execute 'create policy "departments_admin_write" on public.departments
      for all to authenticated
      using (exists (select 1 from public.users where id = auth.uid() and is_admin))
      with check (exists (select 1 from public.users where id = auth.uid() and is_admin))';
  end if;
end $$;

-- ─── Policies para course_departments ────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'course_departments' and policyname = 'course_depts_select'
  ) then
    execute 'create policy "course_depts_select" on public.course_departments
      for select to authenticated using (true)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'course_departments' and policyname = 'course_depts_admin_write'
  ) then
    execute 'create policy "course_depts_admin_write" on public.course_departments
      for all to authenticated
      using (exists (select 1 from public.users where id = auth.uid() and is_admin))
      with check (exists (select 1 from public.users where id = auth.uid() and is_admin))';
  end if;
end $$;

-- ─── Policies para track_departments ─────────────────────────
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'track_departments' and policyname = 'track_depts_select'
  ) then
    execute 'create policy "track_depts_select" on public.track_departments
      for select to authenticated using (true)';
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'track_departments' and policyname = 'track_depts_admin_write'
  ) then
    execute 'create policy "track_depts_admin_write" on public.track_departments
      for all to authenticated
      using (exists (select 1 from public.users where id = auth.uid() and is_admin))
      with check (exists (select 1 from public.users where id = auth.uid() and is_admin))';
  end if;
end $$;

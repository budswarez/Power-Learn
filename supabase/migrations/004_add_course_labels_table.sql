-- ============================================================
-- Power Learn – Tabela de etiquetas de conteúdo (course_labels)
-- Execute no SQL Editor do Supabase:
-- Dashboard → SQL Editor → New query → Cole e execute
-- ============================================================

create table if not exists public.course_labels (
  id         text        primary key,
  name       text        not null,
  icon       text        not null default 'play_circle',
  color      text        not null default '#7C3AED',
  created_at timestamptz not null default now()
);

alter table public.course_labels enable row level security;

-- Leitura para todos os usuários autenticados
create policy if not exists "labels_select" on public.course_labels
  for select to authenticated using (true);

-- Escrita apenas para admins
create policy if not exists "labels_admin_write" on public.course_labels
  for all to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and is_admin));

-- ============================================================
-- Power Learn – Adiciona coluna label (jsonb) na tabela courses
-- Execute no SQL Editor do Supabase:
-- Dashboard → SQL Editor → New query → Cole e execute
-- ============================================================

alter table public.courses
  add column if not exists label jsonb;

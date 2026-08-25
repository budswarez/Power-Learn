-- ============================================================
-- Power Learn – Schema Inicial
-- Execute no SQL Editor do Supabase:
-- Dashboard → SQL Editor → New query → Cole e execute
-- ============================================================

-- ─── Tabelas ────────────────────────────────────────────────

create table if not exists public.users (
  id         uuid        references auth.users(id) on delete cascade primary key,
  name       text,
  email      text        unique,
  department text,
  role       text,
  status     text        not null default 'ativo' check (status in ('ativo', 'suspenso')),
  is_admin   boolean     not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id          text        primary key,
  title       text        not null,
  description text,
  category    text        not null check (category in ('hardware', 'software')),
  duration    text,
  thumbnail   text,
  created_at  timestamptz not null default now()
);

create table if not exists public.course_steps (
  id        text    not null,
  course_id text    not null references public.courses(id) on delete cascade,
  title     text    not null,
  content   text,
  position  integer not null,
  primary key (course_id, id)
);

create table if not exists public.tracks (
  id          text        primary key,
  title       text        not null,
  goal        text,
  badge_icon  text,
  visibility  text        not null default 'public' check (visibility in ('public', 'private')),
  created_at  timestamptz not null default now()
);

create table if not exists public.track_courses (
  track_id  text    not null references public.tracks(id)  on delete cascade,
  course_id text    not null references public.courses(id) on delete cascade,
  position  integer not null default 0,
  primary key (track_id, course_id)
);

create table if not exists public.enrollments (
  user_id    uuid    not null references public.users(id)   on delete cascade,
  course_id  text    not null references public.courses(id) on delete cascade,
  progress   integer not null default 0 check (progress between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- ─── Trigger: popula public.users ao registrar ──────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── RLS ────────────────────────────────────────────────────

alter table public.users       enable row level security;
alter table public.courses     enable row level security;
alter table public.course_steps enable row level security;
alter table public.tracks      enable row level security;
alter table public.track_courses enable row level security;
alter table public.enrollments enable row level security;

-- users: autenticados podem ler todos; cada um atualiza o próprio
create policy "users_select" on public.users
  for select to authenticated using (true);
create policy "users_update_self" on public.users
  for update to authenticated using (auth.uid() = id);

-- courses: leitura para autenticados; escrita para admins
create policy "courses_select" on public.courses
  for select to authenticated using (true);
create policy "courses_admin_write" on public.courses
  for all to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and is_admin));

-- course_steps: segue courses
create policy "steps_select" on public.course_steps
  for select to authenticated using (true);
create policy "steps_admin_write" on public.course_steps
  for all to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and is_admin));

-- tracks
create policy "tracks_select" on public.tracks
  for select to authenticated using (true);
create policy "tracks_admin_write" on public.tracks
  for all to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and is_admin));

-- track_courses
create policy "track_courses_select" on public.track_courses
  for select to authenticated using (true);
create policy "track_courses_admin_write" on public.track_courses
  for all to authenticated
  using (exists (select 1 from public.users where id = auth.uid() and is_admin));

-- enrollments: cada usuário gerencia o próprio
create policy "enrollments_select_self" on public.enrollments
  for select to authenticated using (auth.uid() = user_id);
create policy "enrollments_write_self" on public.enrollments
  for all to authenticated using (auth.uid() = user_id);

-- ─── Seed Data ───────────────────────────────────────────────

insert into public.courses (id, title, description, category, duration, thumbnail) values
  ('curso-001', 'Montagem de PC Gamer',          'Do zero ao setup completo: escolha de peças, montagem e configuração.',         'hardware', '4h 30min', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=640&q=80'),
  ('curso-002', 'Overclocking Avançado',          'Técnicas seguras de OC para CPU, GPU e memória RAM.',                           'hardware', '2h 15min', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=640&q=80'),
  ('curso-003', 'Windows 11 — Setup Corporativo', 'Configuração, políticas de grupo e otimização para ambiente empresarial.',      'software', '3h 00min', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=640&q=80'),
  ('curso-004', 'Diagnóstico e Manutenção',       'Identificação de falhas, benchmarks e substituição de componentes.',            'hardware', '5h 00min', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=80'),
  ('curso-005', 'Redes e Conectividade',           'Configuração de redes LAN, Wi-Fi 6E e troubleshooting.',                       'software', '3h 45min', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=640&q=80'),
  ('curso-006', 'Periféricos Gamer',               'Monitor, teclado mecânico, mouse e headset — análise técnica completa.',       'hardware', '2h 00min', 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=640&q=80')
on conflict (id) do nothing;

insert into public.course_steps (id, course_id, title, position) values
  ('s1', 'curso-001', 'Escolha de Componentes',    1),
  ('s2', 'curso-001', 'Instalação da CPU',          2),
  ('s3', 'curso-001', 'Montagem da Placa-mãe',     3),
  ('s4', 'curso-001', 'Gestão de Cabos',            4),
  ('s1', 'curso-002', 'Fundamentos de OC',          1),
  ('s2', 'curso-002', 'OC de CPU',                  2),
  ('s3', 'curso-002', 'OC de Memória',              3),
  ('s1', 'curso-003', 'Instalação limpa',           1),
  ('s2', 'curso-003', 'Políticas de Grupo',         2),
  ('s3', 'curso-003', 'Drivers e Updates',          3),
  ('s1', 'curso-004', 'Ferramentas de Diagnóstico', 1),
  ('s2', 'curso-004', 'Análise de Falhas',          2),
  ('s3', 'curso-004', 'Troca de Componentes',       3),
  ('s1', 'curso-005', 'Fundamentos de Rede',        1),
  ('s2', 'curso-005', 'Wi-Fi 6E',                   2),
  ('s1', 'curso-006', 'Monitores — Painel e Taxa',  1),
  ('s2', 'curso-006', 'Teclados Mecânicos',         2),
  ('s3', 'curso-006', 'Mouses e DPI',               3)
on conflict (course_id, id) do nothing;

insert into public.tracks (id, title, goal, badge_icon, visibility) values
  ('trilha-001', 'Especialista em Hardware',  'Dominar montagem, diagnóstico e overclocking de PCs de alto desempenho.', 'workspace_premium', 'public'),
  ('trilha-002', 'Suporte Técnico Nível 1',   'Atender e resolver chamados de hardware e software com eficiência.',       'verified',          'public')
on conflict (id) do nothing;

insert into public.track_courses (track_id, course_id, position) values
  ('trilha-001', 'curso-001', 1),
  ('trilha-001', 'curso-002', 2),
  ('trilha-001', 'curso-004', 3),
  ('trilha-002', 'curso-003', 1),
  ('trilha-002', 'curso-004', 2),
  ('trilha-002', 'curso-005', 3)
on conflict (track_id, course_id) do nothing;

-- ─── Tornar admin o primeiro usuário (substitua o email) ────
-- update public.users set is_admin = true where email = 'seu@email.com';

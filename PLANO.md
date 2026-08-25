# Power Learn — Plano de Desenvolvimento

> Plataforma LMS corporativa da Sua Empresa, baseada nos designs do Stitch (projeto `14804266225880767741`).
> Stack: React + Vite + TypeScript + Tailwind CSS + Supabase + Vercel.

---

## 1. Visão Geral do Produto

**Power Learn** é um LMS (Learning Management System) interno com estética gamer-editorial ("The Kinetic Archive"): fundo escuro, vermelho vibrante como cor de ação, tipografia técnica (Space Grotesk + Inter) e ausência de bordas de divisão — separação feita por camadas de cor.

### Páginas mapeadas (via Stitch)

| Arquivo HTML | Rota | Proteção |
|---|---|---|
| `login-corporativo.html` | `/login` | Pública |
| `dashboard.html` | `/dashboard` | Auth |
| `cursos-e-trilhas.html` | `/biblioteca` | Auth |
| `leitura-documentacao.html` | `/leitura/:id` | Auth |
| `painel-administracao.html` | `/admin/usuarios` | Auth + Admin |
| `criar-novo-curso.html` | `/admin/cursos/novo` | Auth + Admin |
| `criar-nova-trilha.html` | `/admin/trilhas/nova` | Auth + Admin |

---

## 2. Stack Tecnológico

### Core
- **React 19** com **Vite 8** — build rápido, HMR instantâneo
- **TypeScript** — tipagem estrita em todo o projeto
- **React Router v7** — roteamento declarativo com rotas protegidas

### Estilização
- **Tailwind CSS v3** — utility-first, alinhado ao design do Stitch
- **tailwind-merge** + **clsx** — composição condicional de classes
- **@tailwindcss/typography** — plugin `prose` para página de leitura

Extensão da paleta no `tailwind.config.ts`:
```ts
colors: {
  primary: {
    DEFAULT: '#E60014',
    hover:   '#C0000F',
    dim:     '#FFB4AA',
  },
  surface: {
    DEFAULT:   '#131313',
    low:       '#1C1B1B',
    container: '#201F1F',
    high:      '#2A2A2A',
    highest:   '#353534',
    lowest:    '#0E0E0E',
  },
  'on-surface': '#E5E2E1',
}
```

### Autenticação
- **Supabase Auth** (OAuth Google provider — SSO corporativo)
- Contexto React global `AuthContext` com `useAuth()` hook
- `ProtectedRoute` e `AdminRoute` como wrappers de rota
- Sessão persistida via `@supabase/ssr` (cookie-based, compatível com Vercel)

### Dados
- **Supabase (PostgreSQL)** — banco relacional gerenciado, com Row Level Security (RLS)
- **`/src/data/*.json`** — fallback mockado para desenvolvimento offline
- Hook genérico `useQuery<T>()` para leitura reativa via Supabase Realtime
- Tabelas: `users`, `courses`, `tracks`, `enrollments`

### Deploy
- **Vercel** — deploy automático via Git push (branch `main` → produção)
- Variáveis de ambiente gerenciadas no painel Vercel
- `vercel.json` com rewrites para SPA (React Router)

### Ícones
- **Material Symbols** (fonte Google) — igual ao design do Stitch

---

## 3. Estrutura de Pastas

```
src/
├── assets/               # logos, imagens estáticas
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # Menu lateral colapsável
│   │   ├── Topbar.tsx        # Navegação superior fixa
│   │   └── AppLayout.tsx     # Wrapper sidebar + conteúdo
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx         # CURSO / TRILHA
│   │   ├── ProgressBar.tsx   # Barra vermelha com glow
│   │   ├── CourseCard.tsx    # Card da biblioteca
│   │   ├── VideoPlayer.tsx   # Placeholder 16:9
│   │   └── DataTable.tsx     # Tabela admin
│   └── auth/
│       ├── ProtectedRoute.tsx
│       └── AdminRoute.tsx
├── contexts/
│   └── AuthContext.tsx
├── data/                 # JSONs mockados (fallback offline)
│   ├── courses.json
│   ├── tracks.json
│   └── users.json
├── hooks/
│   ├── useAuth.ts
│   ├── useQuery.ts       # Wrapper Supabase select + realtime
│   └── useProgress.ts
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Biblioteca.tsx
│   ├── Leitura.tsx
│   ├── admin/
│   │   ├── Usuarios.tsx
│   │   ├── NovoCurso.tsx
│   │   └── NovaTrilha.tsx
│   └── NotFound.tsx
├── router/
│   └── index.tsx
├── services/
│   ├── supabase.ts       # Inicialização Supabase client
│   ├── auth.service.ts
│   └── db.service.ts     # Helpers de query por tabela
├── types/
│   ├── index.ts          # Course, Track, User, Enrollment
│   └── supabase.ts       # Tipos gerados pelo Supabase CLI (database.types.ts)
├── App.tsx
└── main.tsx
```

---

## 4. Roteiro de Implementação

### Etapa A — Setup e Estrutura Base

**Objetivo:** Projeto rodando com navegação e layout global funcionais.

#### A1 — Inicialização do projeto
- [ ] `npm create vite@latest power-learn -- --template react-ts`
- [ ] Instalar dependências: `tailwindcss`, `postcss`, `autoprefixer`, `react-router-dom`, `@supabase/supabase-js`, `@supabase/ssr`, `clsx`, `tailwind-merge`, `@tailwindcss/typography`
- [ ] Configurar `tailwind.config.ts` com paleta customizada (cores acima)
- [ ] Adicionar font imports no `index.html`: **Space Grotesk**, **Inter**, **Material Symbols**
- [ ] Criar `src/services/supabase.ts` com variáveis de ambiente (`.env.local`):
  ```ts
  import { createClient } from '@supabase/supabase-js'
  export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
  ```
- [ ] Criar `vercel.json` na raiz para rewrites do SPA:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- [ ] Gerar tipos do banco com Supabase CLI:
  `npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts`

#### A2 — Sistema de Rotas
```tsx
// router/index.tsx
<Routes>
  <Route path="/login"          element={<Login />} />
  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/dashboard"       element={<Dashboard />} />
      <Route path="/biblioteca"      element={<Biblioteca />} />
      <Route path="/leitura/:id"     element={<Leitura />} />
      <Route element={<AdminRoute />}>
        <Route path="/admin/usuarios"       element={<Usuarios />} />
        <Route path="/admin/cursos/novo"    element={<NovoCurso />} />
        <Route path="/admin/trilhas/nova"   element={<NovaTrilha />} />
      </Route>
    </Route>
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```

#### A3 — Componente Sidebar
Baseado em `dashboard.html` e `cursos-e-trilhas.html`:
- Largura fixa: **256px** (expandida) / **64px** (recolhida)
- Transição CSS `transition-all duration-300`
- Items de navegação com hover: `hover:bg-surface-high hover:text-primary`
- Ícone ativo com `text-primary` e borda esquerda vermelha `border-l-2 border-primary`
- Toggle via estado React `isExpanded`

#### A4 — Componente Topbar
- Posição: `fixed top-0 left-0 right-0 z-50`
- Background: `bg-surface/80 backdrop-blur-md`
- Busca, notificações e avatar do usuário

---

### Etapa B — Autenticação e Dashboard

**Objetivo:** Fluxo de login funcional e dashboard com dados mockados.

#### B1 — Página de Login (`/login`)
Baseado em `login-corporativo.html`:
- Layout: card centralizado, fundo com gradiente radial sutil
- Botão SSO Google: ícone + "Entrar com Conta Corporativa"
- Decoração geométrica nas bordas (pseudo-elementos CSS ou divs absolutas)
- Footer com info de segurança (AES-256)
- Ao autenticar → redirecionar para `/dashboard`

```tsx
const handleSSO = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
};
```

#### B2 — AuthContext
```tsx
interface AuthContextType {
  user: User | null;   // Supabase User
  isAdmin: boolean;    // lido de public.users.is_admin
  loading: boolean;
  signOut: () => Promise<void>;
}

// Listener de sessão
supabase.auth.onAuthStateChange((_event, session) => {
  setUser(session?.user ?? null);
});
```

#### B3 — Dashboard (`/dashboard`)
Baseado em `dashboard.html`:
- **Hero:** VideoPlayer 16:9 (iframe YouTube placeholder) com título sobreposto
- **Stats:** Card "Progresso Geral" com `ProgressBar` (68% mockado)
- **Próximas Etapas:** Grid 2x2 com cards de documentos recomendados
- **Continue Lendo:** Grid 4 colunas com `CourseCard` — dados de `courses.json`

**Componente VideoPlayer:**
```tsx
// Placeholder responsivo 16:9
<div className="relative w-full aspect-video bg-surface-lowest rounded-lg overflow-hidden">
  <iframe src="https://www.youtube.com/embed/..." className="absolute inset-0 w-full h-full" />
</div>
```

---

### Etapa C — Biblioteca e Página de Leitura

**Objetivo:** Navegação de conteúdo com UX de alto nível.

#### C1 — Biblioteca (`/biblioteca`)
Baseado em `cursos-e-trilhas.html`:
- Filtros: `Todos | Hardware | Software` — botões com estado ativo vermelho
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

**CourseCard:**
```tsx
<div className="
  bg-surface-container rounded-lg overflow-hidden
  hover:shadow-xl hover:-translate-y-1
  transition-all duration-200 cursor-pointer
">
  <img className="w-full aspect-video object-cover" />
  <div className="p-4">
    <Badge type="curso" | "trilha" />
    <h3 className="font-space-grotesk text-on-surface mt-2">{title}</h3>
    <ProgressBar value={progress} className="mt-3" />
  </div>
</div>
```

**ProgressBar** com glow:
```tsx
<div className="w-full bg-surface-highest rounded-full h-1.5">
  <div
    className="bg-primary h-1.5 rounded-full shadow-[0_0_8px_#E60014]"
    style={{ width: `${value}%` }}
  />
</div>
```

#### C2 — Página de Leitura (`/leitura/:id`)
Baseado em `leitura-documentacao.html`:
- Layout **3 colunas**:
  - Esquerda (25%): Sumário sticky com passos clicáveis
  - Centro (75%): Conteúdo principal
  - (Sidebar da app fica recolhida automaticamente)
- Sumário: passo ativo com `border-l-2 border-primary text-primary`
- Conteúdo: `prose prose-invert max-w-none leading-relaxed`
- Navegação inferior: `← Anterior` / `Próximo →`
- Scroll tracking para atualizar passo ativo no sumário

```tsx
// Scroll observer para sumário ativo
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
    { threshold: 0.5 }
  );
  headings.forEach(h => observer.observe(document.getElementById(h.id)!));
  return () => observer.disconnect();
}, []);
```

---

### Etapa D — Painéis Administrativos

**Objetivo:** CRUD básico para gestão de usuários e conteúdo.

#### D1 — Admin Usuários (`/admin/usuarios`)
Baseado em `painel-administracao.html`:
- Header: título "Usuários" + botão `+ Adicionar Usuário` (vermelho)
- Filtros: busca por nome/email, dropdown Departamento, dropdown Status
- Tabela: `min-w-full`, colunas Nome / E-mail / Departamento / Cargo / Status
- Status badge: `Ativo` (verde-escuro bg, verde texto) / `Suspenso` (cinza)
- Ações por linha: ícone `more_vert` com dropdown Editar/Excluir (mockado)
- Paginação: `< 1 2 3 ... >`

#### D2 — Admin Novo Curso (`/admin/cursos/novo`)
Baseado em `criar-novo-curso.html`:
- Layout assimétrico: formulário (col-span-7) + preview ao vivo (col-span-5)
- Campos: Título, Descrição, Formato (dropdown), Duração, Upload de arquivo
- Upload zone: `border-2 border-dashed border-surface-highest`, ícone de upload
- Preview card: atualiza em tempo real com `watch()` do formulário
- Botões: "Descartar Rascunho" (ghost) | "Salvar Curso" (vermelho)

#### D3 — Admin Nova Trilha (`/admin/trilhas/nova`)
Baseado em `criar-nova-trilha.html`:
- Metadados (col-span-5): Título, Objetivo, seleção de badge (4 ícones), visibilidade
- Sequenciador (col-span-7): Timeline numerada (01, 02, 03...) com cards de cursos
- Busca para adicionar cursos à trilha
- Botão deletar em cada card da sequência
- Botões: "Salvar Rascunho" | "Publicar Trilha" (vermelho)

---

## 5. Modelo de Dados

### Schema Supabase (PostgreSQL)

```sql
-- Perfil de usuário (espelha auth.users)
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  department  text,
  role        text,
  status      text default 'ativo' check (status in ('ativo', 'suspenso')),
  is_admin    boolean default false,
  created_at  timestamptz default now()
);

-- Cursos
create table public.courses (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  category    text,              -- 'hardware' | 'software'
  duration    text,
  thumbnail   text,              -- URL (Supabase Storage)
  created_at  timestamptz default now()
);

-- Passos de um curso (conteúdo de leitura)
create table public.course_steps (
  id        uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title     text not null,
  content   text,
  position  integer not null
);

-- Trilhas
create table public.tracks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  goal        text,
  badge_icon  text default 'workspace_premium',
  visibility  text default 'public' check (visibility in ('public', 'private')),
  created_at  timestamptz default now()
);

-- Cursos dentro de uma trilha (ordenados)
create table public.track_courses (
  track_id  uuid references public.tracks(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  position  integer not null,
  primary key (track_id, course_id)
);

-- Progresso do usuário por curso
create table public.enrollments (
  user_id    uuid references public.users(id) on delete cascade,
  course_id  uuid references public.courses(id) on delete cascade,
  progress   integer default 0 check (progress between 0 and 100),
  updated_at timestamptz default now(),
  primary key (user_id, course_id)
);
```

### Row Level Security (RLS)

```sql
-- users: cada usuário vê só o próprio perfil; admins veem tudo
alter table public.users enable row level security;
create policy "self or admin" on public.users
  using (id = auth.uid() or exists (
    select 1 from public.users where id = auth.uid() and is_admin = true
  ));

-- courses/tracks: leitura pública (autenticado); escrita apenas admin
alter table public.courses enable row level security;
create policy "read authenticated" on public.courses for select using (auth.role() = 'authenticated');
create policy "write admin" on public.courses for all using (
  exists (select 1 from public.users where id = auth.uid() and is_admin = true)
);
```

### JSON mockado (fallback offline)

#### `courses.json`
```json
[
  {
    "id": "curso-001",
    "title": "Montagem de PC Gamer",
    "category": "hardware",
    "duration": "4h 30min",
    "progress": 68,
    "thumbnail": "/assets/courses/montagem-pc.jpg",
    "steps": [
      { "id": "step-1", "title": "Escolha de Componentes", "content": "..." },
      { "id": "step-2", "title": "Instalação da CPU", "content": "..." }
    ]
  }
]
```

#### `tracks.json`
```json
[
  {
    "id": "trilha-001",
    "title": "Especialista em Hardware",
    "badge_icon": "workspace_premium",
    "courseIds": ["curso-001", "curso-002"],
    "progress": 40
  }
]
```

#### `users.json`
```json
[
  {
    "id": "user-001",
    "name": "Ana Souza",
    "email": "ana.souza@suaempresa.com.br",
    "department": "Vendas",
    "role": "Consultor",
    "status": "ativo",
    "is_admin": false
  }
]
```

---

## 6. Componentes de UI — Especificações

| Componente | Variantes | Notas |
|---|---|---|
| `Button` | `primary` \| `ghost` \| `danger` | primary: `bg-primary hover:bg-primary-hover` |
| `Badge` | `curso` \| `trilha` | curso: `bg-primary text-white` / trilha: `bg-surface-highest text-on-surface` |
| `ProgressBar` | `sm` \| `md` | glow vermelho via `box-shadow` |
| `CourseCard` | — | hover: `shadow-xl -translate-y-1` |
| `Sidebar` | `expanded` \| `collapsed` | transição 300ms |
| `DataTable` | — | scroll horizontal em mobile |
| `VideoPlayer` | — | aspect-ratio 16:9, iframe ou placeholder |

---

## 7. Validação e Critérios de Aceite

### Fluxo de teste obrigatório
1. **Login** → acessar `/login`, clicar "Entrar com Conta Corporativa", ser redirecionado
2. **Dashboard** → verificar vídeo, progresso e cards de cursos recentes
3. **Biblioteca** → aplicar filtro "Hardware", clicar em um curso
4. **Leitura** → navegar pelo sumário lateral, verificar scroll tracking e destaque ativo
5. **Admin** → acessar `/admin/usuarios`, verificar tabela e botões

### Checklist visual (design fidelidade)
- [ ] Fundo principal `#131313` em todas as páginas
- [ ] Cor primária `#E60014` em botões, badges e barras de progresso
- [ ] Hover nos cards com `shadow-xl` e `translateY(-4px)`
- [ ] Sumário lateral na leitura com destaque vermelho no passo ativo
- [ ] Sidebar colapsável com transição suave
- [ ] Topbar com `backdrop-blur` e fundo semi-transparente
- [ ] Sem bordas de divisão 1px — separação apenas por camadas de cor
- [ ] Tipografia Space Grotesk nos títulos, Inter no corpo

---

## 8. Configuração de Ambiente

### Variáveis de ambiente (`.env.local`)
```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### Variáveis no Vercel
Adicionar no painel **Vercel → Settings → Environment Variables**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Supabase Auth — configurar provider Google
1. Painel Supabase → **Authentication → Providers → Google**
2. Adicionar Client ID e Secret do Google Cloud Console
3. Authorized redirect URI: `https://<projeto>.supabase.co/auth/v1/callback`
4. Adicionar domínio Vercel em **Authentication → URL Configuration → Redirect URLs**:
   `https://<seu-projeto>.vercel.app/**`

### Vercel — deploy
```bash
# Conectar repo GitHub ao Vercel (via UI) ou via CLI:
npx vercel --prod
```
- Branch `main` → produção automática
- PRs → preview deployments automáticos

---

## 9. Ordem de Execução Recomendada para os Agentes

```
Etapa A (Setup)
  └─ A1: vite + tailwind + supabase client + vercel.json
  └─ A2: react-router + rotas protegidas
  └─ A3: Sidebar + Topbar + AppLayout

Etapa B (Auth + Dashboard)
  └─ B1: AuthContext + Supabase Auth (Google OAuth)
  └─ B2: Página Login
  └─ B3: Dashboard com dados mockados (JSON)

Etapa C (Conteúdo)
  └─ C1: Biblioteca + CourseCard + filtros
  └─ C2: Página de Leitura + sumário + scroll tracking

Etapa D (Admin)
  └─ D1: Admin Usuários (tabela + filtros)
  └─ D2: Formulário Novo Curso (com preview)
  └─ D3: Formulário Nova Trilha (com sequenciador)

Etapa E (Integração Supabase)
  └─ E1: Criar schema SQL no Supabase + RLS
  └─ E2: Gerar tipos com Supabase CLI
  └─ E3: Substituir JSONs mockados por queries reais
  └─ E4: Deploy no Vercel + validar variáveis de ambiente

Validação
  └─ Fluxo completo + checklist visual
```

---

*Gerado em 2026-03-20 com base nos designs do Google Stitch (projeto Power Learn) e no prompt de especificação técnica.*

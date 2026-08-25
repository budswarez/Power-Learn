import { useState, useMemo } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { useDepartments } from '@/hooks/useDepartments'
import { supabaseAdmin } from '@/services/supabaseAdmin'
import type { AppUser, UserRole } from '@/types'

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin',   label: 'Admin',   description: 'Acesso completo ao sistema' },
  { value: 'gerente', label: 'Gerente', description: 'Cria cursos e trilhas' },
  { value: 'usuario', label: 'Usuário', description: 'Acesso a dashboard e biblioteca' },
]

const ROLE_BADGE: Record<UserRole, string> = {
  admin:   'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
  gerente: 'bg-blue-500/20 text-blue-400',
  usuario: 'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)]',
}

type ModalMode = 'add' | 'edit' | null

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function Usuarios() {
  const { users: dbUsers, setUsers: setLocalUsers, loading } = useUsers()
  const { departments } = useDepartments()
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('Todos')
  const [page, setPage] = useState(1)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<AppUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null)

  const localUsers = dbUsers
  const PAGE_SIZE = 5

  const filtered = useMemo(() => localUsers.filter(u => {
    const matchDept = dept === 'Todos' || u.department === dept
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchSearch
  }), [localUsers, search, dept])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openAdd() {
    setEditTarget(null)
    setModalMode('add')
  }

  function openEdit(u: AppUser) {
    setEditTarget(u)
    setModalMode('edit')
  }

  async function handleSave(data: Partial<AppUser>, password: string): Promise<string | null> {
    const is_admin = data.user_role === 'admin'

    if (modalMode === 'add') {
      if (!supabaseAdmin) {
        return 'Chave de serviço não configurada. Adicione VITE_SUPABASE_SERVICE_KEY ao .env.local.'
      }
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: data.email!,
        password,
        email_confirm: true,
      })
      if (authErr) return authErr.message

      const { error: profileErr } = await supabaseAdmin.from('users').upsert({
        id: authData.user.id,
        name: data.name,
        email: data.email,
        department: data.department ?? '',
        role: data.role ?? '',
        user_role: data.user_role ?? 'usuario',
        is_admin,
        status: 'ativo',
      })
      if (profileErr) return profileErr.message

      setLocalUsers(prev => [...prev, {
        ...data,
        id: authData.user.id,
        status: 'ativo',
        is_admin,
        user_role: data.user_role ?? 'usuario',
      } as AppUser])
    } else if (modalMode === 'edit' && editTarget) {
      if (!supabaseAdmin) {
        return 'Chave de serviço não configurada. Adicione VITE_SUPABASE_SERVICE_KEY ao .env.local.'
      }
      const { error: updateErr } = await supabaseAdmin.from('users').update({
        name: data.name,
        email: data.email,
        department: data.department ?? '',
        role: data.role ?? '',
        user_role: data.user_role,
        is_admin,
      }).eq('id', editTarget.id)

      if (updateErr) return updateErr.message

      if (password.trim()) {
        const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(
          editTarget.id, { password }
        )
        if (pwErr) return pwErr.message
      }

      setLocalUsers(prev => prev.map(u =>
        u.id === editTarget.id ? { ...u, ...data, is_admin } : u
      ))
    }

    setModalMode(null)
    return null
  }

  function handleDelete() {
    if (!deleteTarget) return
    setLocalUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  function toggleStatus(u: AppUser) {
    setLocalUsers(prev => prev.map(x => x.id === u.id
      ? { ...x, status: x.status === 'ativo' ? 'suspenso' : 'ativo' }
      : x
    ))
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--color-on-surface)]">Usuários</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">{filtered.length} {filtered.length === 1 ? 'usuário' : 'usuários'} encontrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_16px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]"
        >
          <span className="material-symbols-rounded text-base">person_add</span>
          Adicionar Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] text-lg pointer-events-none">search</span>
          <input
            type="text" placeholder="Buscar por nome ou e-mail..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 pr-4 py-2 w-full rounded-lg text-sm bg-[var(--color-surface-container)] text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Todos', ...departments.map(d => d.name)].map(d => (
            <button key={d} onClick={() => { setDept(d); setPage(1) }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                dept === d
                  ? 'bg-[var(--color-primary)] text-white shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)]'
                  : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)]'
              }`}>{d}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-surface-container)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-surface-highest)]">
                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold">Usuário</th>
                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold hidden md:table-cell">Departamento</th>
                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold hidden lg:table-cell">Cargo</th>
                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold">Status</th>
                <th className="text-right px-5 py-3.5 text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <span className="material-symbols-rounded animate-spin text-[var(--color-primary)] text-3xl block mx-auto">progress_activity</span>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-[var(--color-on-surface-variant)]">
                    <span className="material-symbols-rounded text-4xl block mb-2 text-[var(--color-surface-highest)]">person_search</span>
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : paginated.map((u, i) => (
                <tr key={u.id}
                  className={`transition-colors hover:bg-[var(--color-surface-high)] ${i < paginated.length - 1 ? 'border-b border-[var(--color-surface-highest)]' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--color-on-surface)]">{u.name}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGE[u.user_role ?? (u.is_admin ? 'admin' : 'usuario')]}`}>
                            {ROLE_OPTIONS.find(r => r.value === (u.user_role ?? (u.is_admin ? 'admin' : 'usuario')))?.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-on-surface-variant)]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[var(--color-on-surface-variant)] hidden md:table-cell">{u.department}</td>
                  <td className="px-5 py-4 text-[var(--color-on-surface-variant)] hidden lg:table-cell">{u.role}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleStatus(u)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        u.status === 'ativo'
                          ? 'bg-green-700/20 text-green-400 hover:bg-green-700/30'
                          : 'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)]'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ativo' ? 'bg-green-400' : 'bg-[var(--color-on-surface-variant)]'}`} />
                      {u.status === 'ativo' ? 'Ativo' : 'Suspenso'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)}
                        className="p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-highest)] transition-colors"
                        title="Editar">
                        <span className="material-symbols-rounded text-base">edit</span>
                      </button>
                      <button onClick={() => setDeleteTarget(u)}
                        className="p-2 rounded-lg text-[var(--color-on-surface-variant)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Excluir">
                        <span className="material-symbols-rounded text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-surface-highest)]">
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-highest)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <span className="material-symbols-rounded text-base">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    n === page
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-highest)]'
                  }`}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-highest)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <span className="material-symbols-rounded text-base">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalMode && (
        <UserModal
          mode={modalMode}
          initial={editTarget}
          departments={departments}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface-container)] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <span className="material-symbols-rounded text-red-400">warning</span>
              </div>
              <div>
                <p className="font-['Space_Grotesk'] font-semibold text-[var(--color-on-surface)]">Excluir usuário?</p>
                <p className="text-xs text-[var(--color-on-surface-variant)]">{deleteTarget.name}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              Esta ação não pode ser desfeita. O usuário perderá todo o progresso registrado.
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-sm font-medium hover:bg-[var(--color-surface-high)] transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserModal({ mode, initial, departments, onSave, onClose }: {
  mode: ModalMode
  initial: AppUser | null
  departments: { id: string; name: string }[]
  onSave: (data: Partial<AppUser>, password: string) => Promise<string | null>
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [department, setDepartment] = useState(initial?.department ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [userRole, setUserRole] = useState<UserRole>(initial?.user_role ?? (initial?.is_admin ? 'admin' : 'usuario'))
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    if (mode === 'add' && !password.trim()) return
    setSaving(true)
    setSaveError(null)
    const err = await onSave({ name, email, department, role, user_role: userRole }, password)
    setSaving(false)
    if (err) setSaveError(err)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface-container)] rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-['Space_Grotesk'] font-bold text-[var(--color-on-surface)]">
            {mode === 'add' ? 'Adicionar Usuário' : 'Editar Usuário'}
          </h2>
          <button onClick={onClose} disabled={saving} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] transition-colors disabled:opacity-50">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        {saveError && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
            <span className="material-symbols-rounded text-sm flex-shrink-0 mt-0.5">error</span>
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nome completo" required>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva"
              className="input-field" required />
          </Field>

          <Field label="E-mail" required>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@empresa.com.br"
              className="input-field" required />
          </Field>

          <Field label={mode === 'add' ? 'Senha' : 'Nova senha'} required={mode === 'add'}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'add' ? 'Mínimo 6 caracteres' : 'Deixe em branco para manter a atual'}
                className="input-field pr-10"
                required={mode === 'add'}
                minLength={mode === 'add' ? 6 : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
              >
                <span className="material-symbols-rounded text-base">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Departamento">
              <select value={department} onChange={e => setDepartment(e.target.value)} className="input-field">
                <option value="">Sem departamento</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Cargo">
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="Ex: Analista"
                className="input-field" />
            </Field>
          </div>

          <Field label="Nível de acesso">
            <div className="space-y-2">
              {ROLE_OPTIONS.map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${
                    userRole === opt.value
                      ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40'
                      : 'bg-[var(--color-surface-highest)] border-transparent hover:bg-[var(--color-surface-high)]'
                  }`}>
                  <input type="radio" name="user_role" value={opt.value} checked={userRole === opt.value}
                    onChange={() => setUserRole(opt.value)}
                    className="accent-[var(--color-primary)] w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-on-surface)]">{opt.label}</p>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">{opt.description}</p>
                  </div>
                  <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${ROLE_BADGE[opt.value]}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-sm font-medium hover:bg-[var(--color-surface-high)] transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <span className="material-symbols-rounded text-base animate-spin">progress_activity</span>}
              {saving ? 'Salvando...' : mode === 'add' ? 'Adicionar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
        {label}{required && <span className="text-[var(--color-primary)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

import { useState } from 'react'
import { useDepartments } from '@/hooks/useDepartments'
import type { Department } from '@/types'

export function Departamentos() {
  const { departments, loading, create, rename, remove } = useDepartments()
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setCreateError(null)
    const result = await create(newName)
    if (!result.department) setCreateError(result.error)
    else setNewName('')
    setCreating(false)
  }

  async function handleRename(dept: Department) {
    if (!editName.trim() || editName.trim() === dept.name) { setEditingId(null); return }
    setSaving(true)
    await rename(dept.id, editName)
    setSaving(false)
    setEditingId(null)
  }

  function startEdit(dept: Department) {
    setEditingId(dept.id)
    setEditName(dept.name)
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-[var(--color-on-surface)]">
          Departamentos
        </h1>
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
          Gerencie os departamentos da empresa para organizar usuários e conteúdo.
        </p>
      </div>

      {/* Create form */}
      <div className="bg-[var(--color-surface-container)] rounded-xl p-5">
        <h2 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2 mb-4">
          <span className="material-symbols-rounded text-[var(--color-primary)] text-base">add_circle</span>
          Novo Departamento
        </h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            value={newName}
            onChange={e => { setNewName(e.target.value); setCreateError(null) }}
            placeholder="Ex: Financeiro, Logística, RMA..."
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-5 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating
              ? <span className="material-symbols-rounded text-base animate-spin">progress_activity</span>
              : <span className="material-symbols-rounded text-base">add</span>
            }
            Criar
          </button>
        </form>
        {createError && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
            <span className="material-symbols-rounded text-sm">error</span>
            {createError}
          </p>
        )}
      </div>

      {/* List */}
      <div className="bg-[var(--color-surface-container)] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-surface-highest)] flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] flex items-center gap-2">
            <span className="material-symbols-rounded text-[var(--color-primary)] text-base">corporate_fare</span>
            Departamentos cadastrados
          </h2>
          <span className="text-xs text-[var(--color-on-surface-variant)] bg-[var(--color-surface-highest)] px-2 py-0.5 rounded-full">
            {departments.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-rounded text-2xl text-[var(--color-primary)] animate-spin">progress_activity</span>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-rounded text-5xl text-[var(--color-surface-highest)] mb-3">corporate_fare</span>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Nenhum departamento cadastrado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-surface-highest)]">
            {departments.map(dept => (
              <div key={dept.id} className="flex items-center gap-3 px-5 py-3.5 group">

                <span className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/15 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-rounded text-[var(--color-primary)] text-base">corporate_fare</span>
                </span>

                {editingId === dept.id ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename(dept)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="input-field flex-1 py-1.5"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-[var(--color-on-surface)]">{dept.name}</span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === dept.id ? (
                    <>
                      <button
                        onClick={() => handleRename(dept)}
                        disabled={saving}
                        className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                        title="Salvar"
                      >
                        {saving
                          ? <span className="material-symbols-rounded text-base animate-spin">progress_activity</span>
                          : <span className="material-symbols-rounded text-base">check</span>
                        }
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-highest)] transition-colors"
                        title="Cancelar"
                      >
                        <span className="material-symbols-rounded text-base">close</span>
                      </button>
                    </>
                  ) : confirmDeleteId === dept.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--color-on-surface-variant)]">Remover?</span>
                      <button
                        onClick={() => { remove(dept.id); setConfirmDeleteId(null) }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-colors"
                      >
                        <span className="material-symbols-rounded text-sm">delete_forever</span>
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)] text-xs font-medium hover:bg-[var(--color-surface-high)] transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(dept)}
                        className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                        title="Renomear"
                      >
                        <span className="material-symbols-rounded text-base">edit</span>
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(dept.id)}
                        className="p-1.5 rounded-lg text-[var(--color-on-surface-variant)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remover"
                      >
                        <span className="material-symbols-rounded text-base">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

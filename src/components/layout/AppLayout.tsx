import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { clsx } from 'clsx'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        expanded={expanded}
        onToggleExpanded={() => setExpanded(e => !e)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />

      {/* Conteúdo deslocado para não ficar sob sidebar/topbar */}
      <main
        className={clsx(
          'pt-20 transition-all duration-300 min-h-screen',
          expanded ? 'lg:pl-64' : 'lg:pl-16',
        )}
      >
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

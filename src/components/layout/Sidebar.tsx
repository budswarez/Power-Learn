import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/AuthContext'

interface NavItemData {
  icon: string
  label: string
  to: string
}

interface SidebarProps {
  expanded: boolean
  onToggleExpanded: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

const USER_ITEMS: NavItemData[] = [
  { icon: 'dashboard',     label: 'Dashboard',  to: '/dashboard' },
  { icon: 'local_library', label: 'Biblioteca', to: '/biblioteca' },
]

const GERENTE_ITEMS: NavItemData[] = [
  { icon: 'menu_book',    label: 'Base de Conhecimento', to: '/admin/base-conhecimento' },
  { icon: 'account_tree', label: 'Trilhas',              to: '/admin/trilhas' },
]

const ADMIN_ITEMS: NavItemData[] = [
  { icon: 'people',         label: 'Usuários',      to: '/admin/usuarios' },
  { icon: 'corporate_fare', label: 'Departamentos', to: '/admin/departamentos' },
  { icon: 'settings',       label: 'Configurações', to: '/admin/configuracoes' },
]

const ROLE_LABELS: Record<string, string> = {
  admin:    'Admin',
  gerente:  'Gerente',
  usuario:  'Usuário',
}

export function Sidebar({ expanded, onToggleExpanded, mobileOpen, onCloseMobile }: SidebarProps) {
  const { userRole, signOut } = useAuth()
  const navigate = useNavigate()

  const showGerente = userRole === 'admin' || userRole === 'gerente'
  const showAdmin   = userRole === 'admin'

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-full z-40 flex flex-col',
        'bg-[var(--color-surface-low)] transition-all duration-300',
        // Mobile: always full sidebar width, translates off-screen when closed
        'w-64',
        // Desktop: width based on expanded state
        expanded ? 'lg:w-64' : 'lg:w-16',
        // Mobile: slide in/out; desktop: always visible
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4 gap-3 border-b border-[var(--color-surface-highest)]">
        <span className="material-symbols-rounded text-[var(--color-primary)] text-2xl flex-shrink-0">
          bolt
        </span>
        {expanded && (
          <span className="font-['Space_Grotesk'] font-bold text-[var(--color-on-surface)] truncate">
            Power Learn
          </span>
        )}
        <button
          onClick={onToggleExpanded}
          className={clsx(
            'ml-auto p-1 rounded text-[var(--color-on-surface-variant)]',
            'hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-highest)]',
            'transition-colors hidden lg:flex',
          )}
        >
          <span className="material-symbols-rounded text-xl">
            {expanded ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">

        {/* User section */}
        {expanded && (
          <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]/50">
            Principal
          </p>
        )}
        {USER_ITEMS.map(item => (
          <NavItem key={item.to} item={item} expanded={expanded} onNavigate={onCloseMobile} />
        ))}

        {/* Gerente / Admin section */}
        {showGerente && (
          <>
            <div className={clsx('my-3', expanded ? 'mx-3' : 'mx-2')}>
              <div className="border-t border-[var(--color-surface-highest)]" />
            </div>
            {expanded && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]/50">
                Gestão de Conteúdo
              </p>
            )}
            {GERENTE_ITEMS.map(item => (
              <NavItem key={item.to} item={item} expanded={expanded} onNavigate={onCloseMobile} />
            ))}
          </>
        )}

        {showAdmin && (
          <>
            <div className={clsx('my-3', expanded ? 'mx-3' : 'mx-2')}>
              <div className="border-t border-[var(--color-surface-highest)]" />
            </div>
            {expanded && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]/50">
                Administração
              </p>
            )}
            {ADMIN_ITEMS.map(item => (
              <NavItem key={item.to} item={item} expanded={expanded} onNavigate={onCloseMobile} />
            ))}
          </>
        )}
      </nav>

      {/* Role badge + sign out */}
      <div className="p-2 border-t border-[var(--color-surface-highest)] space-y-1">
        {expanded && (
          <div className="px-3 py-2 flex items-center gap-2">
            <span className={clsx(
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
              userRole === 'admin'   && 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
              userRole === 'gerente' && 'bg-blue-500/20 text-blue-400',
              userRole === 'usuario' && 'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)]',
            )}>
              {ROLE_LABELS[userRole]}
            </span>
          </div>
        )}
        <button
          onClick={async () => { await signOut(); navigate('/login') }}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors',
            'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)] hover:text-[var(--color-primary)]',
          )}
        >
          <span className="material-symbols-rounded flex-shrink-0">logout</span>
          {expanded && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  )
}

function NavItem({
  item,
  expanded,
  onNavigate,
}: {
  item: NavItemData
  expanded: boolean
  onNavigate: () => void
}) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
          'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-high)] hover:text-[var(--color-on-surface)]',
          isActive && 'bg-[var(--color-surface-high)] text-[var(--color-primary)] border-l-2 border-[var(--color-primary)] !pl-[calc(0.75rem-2px)]',
        )
      }
    >
      <span className="material-symbols-rounded flex-shrink-0">{item.icon}</span>
      {expanded && <span className="text-sm font-medium truncate">{item.label}</span>}
    </NavLink>
  )
}

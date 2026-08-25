import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { GerenteRoute } from '@/components/auth/GerenteRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Biblioteca } from '@/pages/Biblioteca'
import { Leitura } from '@/pages/Leitura'
import { Usuarios } from '@/pages/admin/Usuarios'
import { Departamentos } from '@/pages/admin/Departamentos'
import { BaseConhecimento } from '@/pages/admin/BaseConhecimento'
import { EditarConhecimento } from '@/pages/admin/EditarConhecimento'
import { NovoCurso } from '@/pages/admin/NovoCurso'
import { NovaTrilha } from '@/pages/admin/NovaTrilha'
import { GestaoTrilhas } from '@/pages/admin/GestaoTrilhas'
import { EditarTrilha } from '@/pages/admin/EditarTrilha'
import { Configuracoes } from '@/pages/admin/Configuracoes'
import { Trilha } from '@/pages/Trilha'
import { NotFound } from '@/pages/NotFound'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/leitura/:id" element={<Leitura />} />
          <Route path="/trilha/:id" element={<Trilha />} />

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/usuarios" element={<Usuarios />} />
            <Route path="/admin/departamentos" element={<Departamentos />} />
            <Route path="/admin/configuracoes" element={<Configuracoes />} />
          </Route>

          {/* Admin + Gerente: content creation */}
          <Route element={<GerenteRoute />}>
            <Route path="/admin/base-conhecimento" element={<BaseConhecimento />} />
            <Route path="/admin/cursos/novo" element={<NovoCurso />} />
            <Route path="/admin/cursos/:id/editar" element={<EditarConhecimento />} />
            <Route path="/admin/trilhas" element={<GestaoTrilhas />} />
            <Route path="/admin/trilhas/nova" element={<NovaTrilha />} />
            <Route path="/admin/trilhas/:id/editar" element={<EditarTrilha />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

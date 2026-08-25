export type CourseStatus = 'published' | 'draft'

export interface CourseLabel {
  name: string
  icon: string
  color: string
}

export interface StoredLabel extends CourseLabel {
  id: string
  created_at: string
}

export interface Department {
  id: string
  name: string
  created_at?: string
}

export interface Course {
  id: string
  title: string
  description?: string
  category: 'hardware' | 'software'
  duration?: string
  thumbnail?: string
  status?: CourseStatus
  created_at?: string
  steps?: CourseStep[]
  progress?: number
  departmentIds?: string[]
  label?: CourseLabel
}

export interface CourseStep {
  id: string
  course_id?: string
  title: string
  content?: string
  position: number
}

export interface Track {
  id: string
  title: string
  goal?: string
  badge_icon?: string
  visibility?: 'public' | 'private'
  created_at?: string
  courseIds?: string[]
  progress?: number
  departmentIds?: string[]
}

export type UserRole = 'admin' | 'gerente' | 'usuario'

export interface AppUser {
  id: string
  name: string
  email: string
  department?: string
  role?: string
  user_role: UserRole
  status: 'ativo' | 'suspenso'
  is_admin: boolean
  created_at?: string
}

export interface Enrollment {
  user_id: string
  course_id: string
  progress: number
  updated_at?: string
}

export type ContentItem = (Course & { type: 'curso' }) | (Track & { type: 'trilha' })

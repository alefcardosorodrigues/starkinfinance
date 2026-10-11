export type UserRole = 'admin' | 'user'

export interface AdminUser {
  id: string
  email: string
  display_name: string | null
  role: UserRole
  created_at: string
  last_sign_in_at: string | null
}

export interface SystemFeature {
  id: string
  name: string
  description?: string | null
  path: string
  icon?: string | null
  is_active_for_users: boolean
  is_core: boolean
  created_at: string
  updated_at: string
}

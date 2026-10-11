import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AdminUser, UserRole } from '../types'

export function useAdminUsers() {
  const queryClient = useQueryClient()

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_users')
      if (error) {
        throw new Error(error.message || 'Erro ao carregar lista de usuários')
      }
      return (data as AdminUser[]) || []
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string
      newRole: UserRole
    }) => {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: newRole,
      })
      if (error) {
        throw new Error(error.message || 'Erro ao alterar permissão do usuário')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  return {
    users,
    isLoading,
    isError,
    error,
    refetch,
    updateRole: updateRoleMutation,
  }
}

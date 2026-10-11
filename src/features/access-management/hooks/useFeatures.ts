import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SystemFeature } from '../types'

// Telas base padrão que todos os usuários devem ter acesso
export const CORE_FEATURE_PATHS = [
  '/dashboard',
  '/income',
  '/variables',
  '/fixed-expenses',
  '/installments',
  '/categories',
]

export function useFeatures() {
  const queryClient = useQueryClient()

  const {
    data: features = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SystemFeature[]>({
    queryKey: ['system-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_features')
        .select('*')
        .order('is_core', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(error.message || 'Erro ao carregar funcionalidades do sistema')
      }
      return (data as SystemFeature[]) || []
    },
    staleTime: 60 * 1000, // 1 minuto
  })

  // Alterna o status de liberação da funcionalidade para usuários comuns
  const toggleFeatureMutation = useMutation({
    mutationFn: async ({
      id,
      isActiveForUsers,
    }: {
      id: string
      isActiveForUsers: boolean
    }) => {
      const { error } = await supabase
        .from('system_features')
        .update({
          is_active_for_users: isActiveForUsers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        throw new Error(error.message || 'Erro ao alterar visibilidade da funcionalidade')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-features'] })
    },
  })

  // Cria uma nova funcionalidade (por padrão, restrita a administradores até ser liberada)
  const addFeatureMutation = useMutation({
    mutationFn: async (newFeature: {
      id: string
      name: string
      path: string
      icon?: string
      description?: string
    }) => {
      const { error } = await supabase.from('system_features').insert([
        {
          id: newFeature.id,
          name: newFeature.name,
          path: newFeature.path,
          icon: newFeature.icon || 'Sparkles',
          description: newFeature.description || null,
          is_active_for_users: false, // Sempre nasce restrito ao admin!
          is_core: false,
        },
      ])

      if (error) {
        throw new Error(error.message || 'Erro ao cadastrar nova funcionalidade')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-features'] })
    },
  })

  // Exclui uma funcionalidade customizada (não permite excluir as telas core)
  const deleteFeatureMutation = useMutation({
    mutationFn: async (id: string) => {
      const featureToDelete = features.find((f) => f.id === id)
      if (featureToDelete?.is_core) {
        throw new Error('Telas base do sistema não podem ser removidas.')
      }

      const { error } = await supabase
        .from('system_features')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message || 'Erro ao remover funcionalidade')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-features'] })
    },
  })

  // Validador de permissão de acesso para uma rota
  const isRouteAllowed = (pathname: string, isAdmin: boolean): boolean => {
    // Administrador tem acesso irrestrito a todas as rotas
    if (isAdmin) return true

    // Telas padrão do sistema sempre permitidas para todos
    if (CORE_FEATURE_PATHS.includes(pathname)) return true

    // Gestão de acessos é exclusiva de admin
    if (pathname === '/access-management') return false

    // Procura na tabela de funcionalidades
    const feature = features.find((f) => f.path === pathname)
    if (!feature) {
      // Se não for uma feature cadastrada ou controlada, permite (ex: rotas auxiliares)
      return true
    }

    // Só permite usuário comum se estiver liberada pelo admin
    return feature.is_active_for_users
  }

  return {
    features,
    isLoading,
    isError,
    error,
    refetch,
    toggleFeature: toggleFeatureMutation,
    addFeature: addFeatureMutation,
    deleteFeature: deleteFeatureMutation,
    isRouteAllowed,
  }
}

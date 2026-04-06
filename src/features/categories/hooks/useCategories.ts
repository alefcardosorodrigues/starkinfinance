import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Category } from '../types'

export function useCategories() {
  const queryClient = useQueryClient()

  // Fetch Categories
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data as Category[]
    },
  })

  // Add Category
  const addCategory = useMutation({
    mutationFn: async (newCategory: Partial<Category>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          ...newCategory, 
          user_id: user.id,
          icon: 'Tags' // Default icon for user-created categories
        }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  // Update Category
  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Category> }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  // Delete Category
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  return {
    categories: categoriesQuery.data,
    isLoading: categoriesQuery.isLoading,
    addCategory,
    updateCategory,
    deleteCategory
  }
}

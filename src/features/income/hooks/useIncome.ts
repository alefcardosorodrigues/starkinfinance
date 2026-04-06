import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Entry } from '../types'

export function useIncome(selectedMonth: number, selectedYear: number) {
  const queryClient = useQueryClient()

  const entriesQuery = useQuery({
    queryKey: ['entries', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
      const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
      if (error) throw error
      return data as Entry[]
    },
  })

  const addEntry = useMutation({
    mutationFn: async (newEntry: Partial<Entry>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data, error } = await supabase
        .from('entries')
        .insert([{ ...newEntry, user_id: user.id }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })

  const updateEntry = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Entry> }) => {
      const { error } = await supabase
        .from('entries')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })

  return {
    entries: entriesQuery.data || [],
    isLoading: entriesQuery.isLoading,
    addEntry,
    updateEntry,
    deleteEntry
  }
}

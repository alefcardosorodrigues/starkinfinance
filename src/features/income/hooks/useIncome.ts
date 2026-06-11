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

      if (data && data.length > 0) {
        return data as Entry[]
      }

      // If empty, fetch previous month's entries
      const prevMonthDate = new Date(selectedYear, selectedMonth, 1)
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1)
      const prevMonth = prevMonthDate.getMonth()
      const prevYear = prevMonthDate.getFullYear()

      const prevStartDate = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01`
      const prevLastDay = new Date(prevYear, prevMonth + 1, 0).getDate()
      const prevEndDate = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`

      const { data: prevData, error: prevError } = await supabase
        .from('entries')
        .select('*')
        .gte('date', prevStartDate)
        .lte('date', prevEndDate)
        .order('date', { ascending: false })

      if (prevError) throw prevError

      return (prevData || []).map(entry => {
        const entryDate = new Date(entry.date)
        entryDate.setMonth(selectedMonth)
        entryDate.setFullYear(selectedYear)
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`

        return {
          ...entry,
          date: dateStr,
          isFallback: true
        }
      }) as Entry[]
    },
  })

  const addEntry = useMutation({
    mutationFn: async (newEntry: Partial<Entry>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const currentEntries = entriesQuery.data || []
      const fallbackEntries = currentEntries.filter(e => e.isFallback)

      if (fallbackEntries.length > 0) {
        const toInsert = [
          ...fallbackEntries.map(e => ({
            user_id: user.id,
            description: e.description,
            amount: e.amount,
            type: e.type,
            date: e.date
          })),
          { ...newEntry, user_id: user.id }
        ]
        const { data, error } = await supabase
          .from('entries')
          .insert(toInsert)
          .select()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('entries')
          .insert([{ ...newEntry, user_id: user.id }])
          .select()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })

  const updateEntry = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Entry> }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const currentEntries = entriesQuery.data || []
      const fallbackEntries = currentEntries.filter(e => e.isFallback)

      if (fallbackEntries.length > 0) {
        const toInsert = fallbackEntries.map(e => {
          if (e.id === id) {
            return {
              user_id: user.id,
              description: updates.description ?? e.description,
              amount: updates.amount ?? e.amount,
              type: updates.type ?? e.type,
              date: updates.date ?? e.date
            }
          }
          return {
            user_id: user.id,
            description: e.description,
            amount: e.amount,
            type: e.type,
            date: e.date
          }
        })
        const { error } = await supabase
          .from('entries')
          .insert(toInsert)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('entries')
          .update(updates)
          .eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const currentEntries = entriesQuery.data || []
      const fallbackEntries = currentEntries.filter(e => e.isFallback)

      if (fallbackEntries.length > 0) {
        const toInsert = fallbackEntries
          .filter(e => e.id !== id)
          .map(e => ({
            user_id: user.id,
            description: e.description,
            amount: e.amount,
            type: e.type,
            date: e.date
          }))

        if (toInsert.length > 0) {
          const { error } = await supabase
            .from('entries')
            .insert(toInsert)
          if (error) throw error
        }
      } else {
        const { error } = await supabase
          .from('entries')
          .delete()
          .eq('id', id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
    },
  })


  return {
    entries: entriesQuery.data || [],
    isLoading: entriesQuery.isLoading || entriesQuery.isFetching,
    addEntry,
    updateEntry,
    deleteEntry
  }
}

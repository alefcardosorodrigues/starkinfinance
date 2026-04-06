import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { FixedExpense, Category } from '../types'

export function useFixedExpenses(selectedMonth: number, selectedYear: number) {
  const queryClient = useQueryClient()

  // Fetch Categories
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color_hex')
        .order('name')
      if (error) throw error
      return data as Category[]
    }
  })

  // Fetch Fixed Expenses for current month/year
  const expensesQuery = useQuery({
    queryKey: ['fixed-expenses', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*, categories(id, name, color_hex)')
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .order('due_day', { ascending: true })
      if (error) throw error
      return data as FixedExpense[]
    },
  })

  // Add Fixed Expense (with replication for 12 months)
  const addExpense = useMutation({
    mutationFn: async (newExpense: Partial<FixedExpense>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      
      const groupId = crypto.randomUUID()
      const inserts = []
      
      let currMonth = selectedMonth
      let currYear = selectedYear

      for (let i = 0; i < 12; i++) {
        inserts.push({
          ...newExpense,
          user_id: user.id,
          month: currMonth,
          year: currYear,
          recurring_id: groupId
        })
        
        currMonth++
        if (currMonth > 11) {
          currMonth = 0
          currYear++
        }
      }

      const { data, error } = await supabase
        .from('fixed_expenses')
        .insert(inserts)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] })
    },
  })

  // Update Fixed Expense (recursively updates future months)
  const updateExpense = useMutation({
    mutationFn: async ({ recurring_id, updates }: { recurring_id: string, updates: Partial<FixedExpense> }) => {
      const { error } = await supabase
        .from('fixed_expenses')
        .update({
          name: updates.name,
          amount: updates.amount,
          due_day: updates.due_day,
          category_id: updates.category_id
        })
        .eq('recurring_id', recurring_id)
        .or(`year.gt.${selectedYear},and(year.eq.${selectedYear},month.gte.${selectedMonth})`)
        
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] })
    },
  })

  // Toggle Paid (only for specific month)
  const togglePaid = useMutation({
    mutationFn: async ({ id, is_paid }: { id: string, is_paid: boolean }) => {
      const { error } = await supabase
        .from('fixed_expenses')
        .update({ is_paid })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] })
    },
  })

  // Delete Fixed Expense (deletes current and future months)
  const deleteExpense = useMutation({
    mutationFn: async (recurring_id: string) => {
      const { error } = await supabase
        .from('fixed_expenses')
        .delete()
        .eq('recurring_id', recurring_id)
        .or(`year.gt.${selectedYear},and(year.eq.${selectedYear},month.gte.${selectedMonth})`)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] })
    },
  })

  return {
    expenses: expensesQuery.data || [],
    isLoading: expensesQuery.isLoading,
    categories: categoriesQuery.data || [],
    addExpense,
    updateExpense,
    togglePaid,
    deleteExpense
  }
}

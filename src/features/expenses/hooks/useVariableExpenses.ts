import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { VariableExpense, Category } from '../types'

export function useVariableExpenses(selectedMonth: number, selectedYear: number) {
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

  // Fetch Variable Expenses for current month/year
  const expensesQuery = useQuery({
    queryKey: ['variable-expenses', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
      const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`

      const { data, error } = await supabase
        .from('variable_expenses')
        .select('*, categories(id, name, color_hex)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        
      if (error) throw error
      return data as VariableExpense[]
    },
  })

  // Add Variable Expense
  const addExpense = useMutation({
    mutationFn: async (newExpense: Partial<VariableExpense>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      
      const { data, error } = await supabase
        .from('variable_expenses')
        .insert([{ ...newExpense, user_id: user.id }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] })
    },
  })

  // Update Variable Expense
  const updateExpense = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<VariableExpense> }) => {
      const { error } = await supabase
        .from('variable_expenses')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] })
    },
  })

  // Delete Variable Expense
  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('variable_expenses')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] })
    },
  })

  // Add Multiple Variable Expenses
  const addMultipleExpenses = useMutation({
    mutationFn: async (newExpenses: Partial<VariableExpense>[]) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      
      const payload = newExpenses.map(expense => ({ ...expense, user_id: user.id }))
      
      const { data, error } = await supabase
        .from('variable_expenses')
        .insert(payload)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] })
    },
  })

  return {
    expenses: expensesQuery.data || [],
    isLoading: expensesQuery.isLoading || expensesQuery.isFetching,
    categories: categoriesQuery.data || [],
    addExpense,
    addMultipleExpenses,
    updateExpense,
    deleteExpense
  }
}

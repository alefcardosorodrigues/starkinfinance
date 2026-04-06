import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Installment, Category } from '../types'

export function useInstallments(selectedMonth: number, selectedYear: number) {
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

  // Fetch Installments for current month/year
  const installmentsQuery = useQuery({
    queryKey: ['installments', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installments')
        .select(`
          id,
          name,
          amount,
          total_installments,
          current_installment,
          is_paid,
          category_id,
          month,
          year,
          group_id,
          categories:category_id (
            id,
            name,
            color_hex
          )
        `)
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .order('name', { ascending: true })
      if (error) throw error
      return data as Installment[]
    },
  })

  // Add Installment (replicates for X months)
  const addInstallment = useMutation({
    mutationFn: async ({ name, amount, total_installments, current_installment, category_id, isPaid }: Partial<Installment> & { isPaid: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      
      const groupId = crypto.randomUUID()
      const inserts = []
      
      const remaining = (total_installments || 1) - (current_installment || 1) + 1
      
      let currMonth = selectedMonth
      let currYear = selectedYear
      let currInst = current_installment || 1

      for (let i = 0; i < remaining; i++) {
        inserts.push({
          name,
          amount,
          total_installments,
          current_installment: currInst,
          category_id,
          user_id: user.id,
          month: currMonth,
          year: currYear,
          group_id: groupId,
          is_paid: i === 0 ? isPaid : false
        })
        
        currInst++
        currMonth++
        if (currMonth > 11) {
          currMonth = 0
          currYear++
        }
      }

      const { error } = await supabase
        .from('installments')
        .insert(inserts)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] })
    },
  })

  // Delete Installment (from current month forward)
  const deleteInstallment = useMutation({
    mutationFn: async (installment: Installment) => {
      const { error } = await supabase
        .from('installments')
        .delete()
        .eq('group_id', installment.group_id)
        .or(`year.gt.${selectedYear},and(year.eq.${selectedYear},month.gte.${selectedMonth})`)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] })
    },
  })

  // Toggle Paid (only for this installment)
  const togglePaid = useMutation({
    mutationFn: async ({ id, is_paid }: { id: string, is_paid: boolean }) => {
      const { error } = await supabase
        .from('installments')
        .update({ is_paid })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] })
    },
  })

  return {
    installments: installmentsQuery.data || [],
    isLoading: installmentsQuery.isLoading,
    categories: categoriesQuery.data || [],
    addInstallment,
    deleteInstallment,
    togglePaid
  }
}

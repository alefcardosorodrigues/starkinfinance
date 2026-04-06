export interface Category {
  id: string
  name: string
  color_hex: string
}

export interface Installment {
  id: string
  name: string
  amount: number
  total_installments: number
  current_installment: number
  is_paid: boolean
  category_id: string | null
  month: number
  year: number
  group_id: string
  categories?: Category
}

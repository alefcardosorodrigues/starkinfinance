export interface Category {
  id: string
  name: string
  color_hex: string
}

export interface FixedExpense {
  id: string
  name: string
  amount: number
  due_day: number
  is_paid: boolean
  category_id: string | null
  month: number
  year: number
  recurring_id: string
  categories?: Category
}

export interface VariableExpense {
  id: string
  date: string
  name: string
  value: number
  category_id: string
  obs: string | null
  categories?: Category
}

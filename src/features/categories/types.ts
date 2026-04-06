export type CategoryType = 'Essencial' | 'Desejo'

export interface Category {
  id: string
  name: string
  type: CategoryType
  icon: string
  color_hex: string
}

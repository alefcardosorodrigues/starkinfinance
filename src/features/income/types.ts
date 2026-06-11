export type EntryType = 'Salário' | 'Renda Extra' | 'Vale Refeição'

export interface Entry {
  id: string
  description: string
  amount: number
  date: string
  type: EntryType
  isFallback?: boolean
}


export interface Bonus {
  type: string
  value: number
  duration?: number
  [key: string]: number | string | undefined
} 
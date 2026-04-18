export const CalendarSelectionMode = {
  Single: 'single',
  Range: 'range',
  DateTime: 'datetime',
} as const

export type CalendarSelectionMode = (typeof CalendarSelectionMode)[keyof typeof CalendarSelectionMode]

export interface CalendarProps {
  modelValue?: string | null
  modelEndValue?: string | null
  selectionMode?: CalendarSelectionMode
  minDate?: string | null
  label?: string
  placeholder?: string
  error?: string
  showTime?: boolean
}

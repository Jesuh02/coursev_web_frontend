<template>
  <div class="calendar-field" :class="{ 'has-error': !!error }">
    <label v-if="label" class="calendar-label">{{ label }}</label>

    <!-- Trigger button -->
    <button type="button" class="calendar-trigger" @click="open = !open">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span :class="{ placeholder: !displayText }">{{ displayText || placeholder || 'Seleccionar fecha' }}</span>
      <button v-if="displayText" type="button" class="trigger-clear" @click.stop="clearSelection">✕</button>
    </button>

    <!-- Dropdown calendar -->
    <Teleport to="body">
      <div v-if="open" class="calendar-overlay" @click.self="open = false">
        <div class="calendar-dropdown" ref="dropdownRef">
          <!-- Header -->
          <div class="cal-header">
            <button type="button" class="cal-nav" @click="changeMonth(-1)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span class="cal-month-label">{{ monthLabel }}</span>
            <button type="button" class="cal-nav" @click="changeMonth(1)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <!-- Weekday headers -->
          <div class="cal-weekdays">
            <span v-for="d in weekdays" :key="d">{{ d }}</span>
          </div>

          <!-- Days grid -->
          <div class="cal-grid">
            <button
              v-for="(cell, i) in calendarCells"
              :key="i"
              type="button"
              class="cal-day"
              :class="{
                'other-month': !cell.currentMonth,
                'today': cell.isToday,
                'selected': cell.isSelected,
                'range-start': cell.isRangeStart,
                'range-end': cell.isRangeEnd,
                'in-range': cell.inRange,
                'disabled': cell.disabled,
              }"
              :disabled="cell.disabled"
              @click="selectDay(cell)"
            >
              {{ cell.day }}
            </button>
          </div>

          <!-- Time picker (for DateTime / Single with showTime) -->
          <div v-if="effectiveShowTime" class="cal-time">
            <label class="cal-time-label">Hora</label>
            <div class="cal-time-inputs">
              <select v-model="selectedHour" class="cal-time-select">
                <option v-for="h in hours" :key="h" :value="h">{{ String(h).padStart(2, '0') }}</option>
              </select>
              <span class="cal-time-sep">:</span>
              <select v-model="selectedMinute" class="cal-time-select">
                <option v-for="m in minutes" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
              </select>
            </div>
          </div>

          <!-- Footer -->
          <div class="cal-footer">
            <button type="button" class="cal-btn cal-btn-secondary" @click="goToday">Hoy</button>
            <button type="button" class="cal-btn cal-btn-primary" @click="confirmSelection">Aceptar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <span v-if="error" class="calendar-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarSelectionMode } from './types'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  modelEndValue?: string | null
  selectionMode?: CalendarSelectionMode
  minDate?: string | null
  label?: string
  placeholder?: string
  error?: string
  showTime?: boolean
}>(), {
  modelValue: null,
  modelEndValue: null,
  selectionMode: CalendarSelectionMode.Single,
  minDate: null,
  label: undefined,
  placeholder: undefined,
  error: undefined,
  showTime: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:modelEndValue': [value: string | null]
}>()

const open = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Current view month/year
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth()) // 0-based

// Internal selection state
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const selectedHour = ref(23)
const selectedMinute = ref(59)

const weekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)

const effectiveShowTime = computed(() =>
  props.showTime || props.selectionMode === CalendarSelectionMode.DateTime
)

const monthLabel = computed(() => `${months[viewMonth.value]} ${viewYear.value}`)

const minDateObj = computed(() => props.minDate ? new Date(props.minDate) : null)

// Initialize from modelValue
watch(() => props.modelValue, (val) => {
  if (val) {
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      startDate.value = d
      viewYear.value = d.getFullYear()
      viewMonth.value = d.getMonth()
      if (effectiveShowTime.value) {
        selectedHour.value = d.getHours()
        selectedMinute.value = d.getMinutes()
      }
    }
  } else {
    startDate.value = null
  }
}, { immediate: true })

watch(() => props.modelEndValue, (val) => {
  if (val) {
    const d = new Date(val)
    if (!isNaN(d.getTime())) endDate.value = d
  } else {
    endDate.value = null
  }
}, { immediate: true })

interface CalendarCell {
  day: number
  date: Date
  currentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  inRange: boolean
  disabled: boolean
}

const calendarCells = computed<CalendarCell[]>(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1)
  // Monday=0 ... Sunday=6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells: CalendarCell[] = []

  // Previous month fill
  for (let i = startDow - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const date = new Date(year, month - 1, day)
    cells.push(buildCell(date, day, false, today))
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push(buildCell(date, d, true, today))
  }

  // Next month fill (complete 6 rows)
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    cells.push(buildCell(date, d, false, today))
  }

  return cells
})

function sameDay(a: Date | null, b: Date): boolean {
  if (!a) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function buildCell(date: Date, day: number, currentMonth: boolean, today: Date): CalendarCell {
  const dateNorm = new Date(date)
  dateNorm.setHours(0, 0, 0, 0)

  let disabled = false
  if (minDateObj.value) {
    const minNorm = new Date(minDateObj.value)
    minNorm.setHours(0, 0, 0, 0)
    disabled = dateNorm < minNorm
  }

  const isSelected = sameDay(startDate.value, date) ||
    (props.selectionMode === CalendarSelectionMode.Range && sameDay(endDate.value, date))

  const isRangeStart = props.selectionMode === CalendarSelectionMode.Range && sameDay(startDate.value, date)
  const isRangeEnd = props.selectionMode === CalendarSelectionMode.Range && sameDay(endDate.value, date)

  let inRange = false
  if (props.selectionMode === CalendarSelectionMode.Range && startDate.value && endDate.value) {
    const s = new Date(startDate.value); s.setHours(0, 0, 0, 0)
    const e = new Date(endDate.value); e.setHours(0, 0, 0, 0)
    inRange = dateNorm > s && dateNorm < e
  }

  return {
    day,
    date,
    currentMonth,
    isToday: dateNorm.getTime() === today.getTime(),
    isSelected,
    isRangeStart,
    isRangeEnd,
    inRange,
    disabled,
  }
}

function changeMonth(delta: number) {
  viewMonth.value += delta
  if (viewMonth.value > 11) { viewMonth.value = 0; viewYear.value++ }
  if (viewMonth.value < 0) { viewMonth.value = 11; viewYear.value-- }
}

function goToday() {
  const now = new Date()
  viewYear.value = now.getFullYear()
  viewMonth.value = now.getMonth()
}

function selectDay(cell: CalendarCell) {
  if (cell.disabled) return

  if (props.selectionMode === CalendarSelectionMode.Range) {
    if (!startDate.value || endDate.value || cell.date < startDate.value) {
      startDate.value = cell.date
      endDate.value = null
    } else {
      endDate.value = cell.date
    }
  } else {
    startDate.value = cell.date
  }
}

function confirmSelection() {
  if (!startDate.value) { open.value = false; return }

  if (effectiveShowTime.value) {
    const d = new Date(startDate.value)
    d.setHours(selectedHour.value, selectedMinute.value, 0, 0)
    emit('update:modelValue', d.toISOString())
  } else {
    const d = new Date(startDate.value)
    d.setHours(0, 0, 0, 0)
    // Emit as YYYY-MM-DD for date-only modes
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    emit('update:modelValue', `${yyyy}-${mm}-${dd}`)
  }

  if (props.selectionMode === CalendarSelectionMode.Range && endDate.value) {
    const e = new Date(endDate.value)
    e.setHours(23, 59, 59, 0)
    emit('update:modelEndValue', e.toISOString())
  }

  open.value = false
}

function clearSelection() {
  startDate.value = null
  endDate.value = null
  selectedHour.value = 23
  selectedMinute.value = 59
  emit('update:modelValue', null)
  emit('update:modelEndValue', null)
}

const displayText = computed(() => {
  if (!startDate.value && !props.modelValue) return ''

  const d = startDate.value ?? (props.modelValue ? new Date(props.modelValue) : null)
  if (!d) return ''

  const fmt = (dt: Date) => {
    const day = String(dt.getDate()).padStart(2, '0')
    const mon = months[dt.getMonth()].substring(0, 3)
    const yr = dt.getFullYear()
    if (effectiveShowTime.value) {
      const hh = String(dt.getHours()).padStart(2, '0')
      const mm = String(dt.getMinutes()).padStart(2, '0')
      return `${day} ${mon} ${yr} · ${hh}:${mm}`
    }
    return `${day} ${mon} ${yr}`
  }

  if (props.selectionMode === CalendarSelectionMode.Range && endDate.value) {
    return `${fmt(d)} — ${fmt(endDate.value)}`
  }
  return fmt(d)
})
</script>

<style scoped>
.calendar-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.calendar-label {
  font-size: 13px;
  color: var(--text-secondary, #ccc);
  font-weight: 500;
}

.calendar-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-input, #1C1C1E);
  border: 1px solid var(--border-color, rgba(255,255,255,0.12));
  border-radius: var(--radius-md, 12px);
  color: var(--text-primary, #fff);
  font-size: 15px;
  cursor: pointer;
  transition: border-color 0.2s;
  text-align: left;
}

.calendar-trigger:focus {
  outline: none;
  border-color: var(--purple-primary, #6200EE);
}

.calendar-trigger .placeholder {
  color: var(--text-hint, #757575);
}

.trigger-clear {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--text-muted, #888);
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}
.trigger-clear:hover { color: #FF453A; }

.calendar-error {
  font-size: 12px;
  color: #FF453A;
}

.has-error .calendar-trigger {
  border-color: #FF453A;
}

/* ── Overlay ── */
.calendar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.calendar-dropdown {
  background: #1C1C1E;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  max-width: 360px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  animation: cal-slide-up 0.2s ease-out;
}

@keyframes cal-slide-up {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Header ── */
.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cal-month-label {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
}

.cal-nav {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: var(--purple-light, #8B5CF6);
  cursor: pointer;
  transition: background 0.15s;
}
.cal-nav:active { background: rgba(255, 255, 255, 0.08); }

/* ── Weekdays ── */
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.cal-weekdays span {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted, #888);
  text-transform: uppercase;
  padding: 4px 0;
}

/* ── Day grid ── */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  position: relative;
}

.cal-day:hover:not(.disabled):not(.selected) {
  background: rgba(255, 255, 255, 0.06);
}

.cal-day.other-month {
  color: rgba(255, 255, 255, 0.2);
}

.cal-day.today {
  color: var(--purple-light, #8B5CF6);
  font-weight: 700;
}

.cal-day.today::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--purple-light, #8B5CF6);
}

.cal-day.selected {
  background: var(--purple-primary, #6200EE);
  color: #fff;
  font-weight: 700;
}

.cal-day.range-start {
  border-radius: 10px 4px 4px 10px;
}

.cal-day.range-end {
  border-radius: 4px 10px 10px 4px;
}

.cal-day.in-range {
  background: rgba(139, 92, 246, 0.15);
  border-radius: 2px;
  color: var(--purple-light, #8B5CF6);
}

.cal-day.disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* ── Time picker ── */
.cal-time {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cal-time-label {
  font-size: 14px;
  color: var(--text-secondary, #ccc);
  font-weight: 500;
  white-space: nowrap;
}

.cal-time-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.cal-time-select {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 6px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  width: 60px;
  appearance: none;
  cursor: pointer;
}

.cal-time-select:focus {
  outline: none;
  border-color: var(--purple-primary, #6200EE);
}

.cal-time-sep {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-muted, #888);
}

/* ── Footer ── */
.cal-footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cal-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.cal-btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}
.cal-btn-secondary:active { background: rgba(255, 255, 255, 0.1); }

.cal-btn-primary {
  background: var(--purple-primary, #6200EE);
  color: #fff;
}
.cal-btn-primary:active { background: var(--purple-dark, #4A148C); }
</style>

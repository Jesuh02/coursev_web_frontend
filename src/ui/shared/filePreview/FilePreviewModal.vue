<template>
  <Teleport to="body">
    <div v-if="file" class="fp-overlay" @click.self="$emit('close')">
      <section class="fp-modal" role="dialog" aria-modal="true" :aria-label="`Vista previa de ${file.name}`">
        <header class="fp-header">
          <div class="fp-title-wrap">
            <p class="fp-title">{{ file.name }}</p>
            <p v-if="typeLabel" class="fp-meta">{{ typeLabel }}</p>
          </div>
          <div class="fp-actions">
            <button v-if="showHeaderDownload" class="fp-icon-btn" type="button" title="Descargar" :disabled="downloading" @click="downloadFile">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button class="fp-icon-btn" type="button" title="Cerrar" @click="$emit('close')">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </header>

        <main class="fp-body">
          <div v-if="loading" class="fp-state">
            <span class="fp-spinner" />
            <p>Cargando vista previa...</p>
          </div>

          <template v-else-if="error">
            <div class="fp-state fp-error">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1"/></svg>
              <p>{{ error }}</p>
              <button class="fp-primary-btn" type="button" :disabled="downloading" @click="downloadFile">Descargar archivo</button>
            </div>
          </template>

          <img v-else-if="file.kind === 'image' && objectUrl" class="fp-image" :src="objectUrl" :alt="file.name" />
          <iframe v-else-if="(file.kind === 'pdf' || file.kind === 'office') && objectUrl" class="fp-frame" :src="objectUrl" title="Vista previa del documento" />
          <section v-else-if="file.kind === 'spreadsheet'" class="fp-sheet">
            <div v-if="spreadsheet.sheets.length > 1" class="fp-sheet-tabs">
              <button
                v-for="(sheet, index) in spreadsheet.sheets"
                :key="sheet.name"
                type="button"
                class="fp-sheet-tab"
                :class="{ active: activeSheetIndex === index }"
                @click="activeSheetIndex = index"
              >
                {{ sheet.name }}
              </button>
            </div>
            <div class="fp-sheet-grid-wrap">
              <table class="fp-sheet-grid">
                <thead>
                  <tr>
                    <th class="fp-sheet-corner" />
                    <th v-for="col in activeSheet?.columns ?? []" :key="col" class="fp-sheet-col">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in activeSheet?.rows ?? []" :key="row.index">
                    <th class="fp-sheet-row">{{ row.index }}</th>
                    <td v-for="(cell, index) in row.cells" :key="index">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <pre v-else-if="file.kind === 'text'" class="fp-text">{{ textContent }}</pre>

          <div v-else class="fp-state">
            <p>Este formato todavia no tiene vista previa disponible.</p>
            <button class="fp-primary-btn" type="button" :disabled="downloading" @click="downloadFile">Descargar archivo</button>
          </div>
        </main>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { filePreviewAdapter } from '@/infrastructure/api'
import type { PreviewFile } from './filePreview'
import { downloadPreviewFile, fetchPreviewBlob, resolvePreviewFileUrl } from './filePreview'

const props = defineProps<{
  file: PreviewFile | null
}>()

defineEmits<{
  close: []
}>()

const loading = ref(false)
const downloading = ref(false)
const error = ref('')
const objectUrl = ref('')
const textContent = ref('')
const activeSheetIndex = ref(0)

const SHEET_ROW_LIMIT = 250
const SHEET_COLUMN_LIMIT = 40

interface SpreadsheetPreviewSheet {
  name: string
  columns: string[]
  rows: Array<{ index: number; cells: string[] }>
  truncated: boolean
}

const spreadsheet = ref<{ sheets: SpreadsheetPreviewSheet[] }>({ sheets: [] })

const activeSheet = computed(() => spreadsheet.value.sheets[activeSheetIndex.value] ?? null)

const showHeaderDownload = computed(() => {
  if (!props.file) return false
  return !['pdf', 'office'].includes(props.file.kind)
})

const typeLabel = computed(() => {
  if (!props.file) return ''
  if (props.file.kind === 'spreadsheet') return props.file.extension ? props.file.extension.toUpperCase() : 'Excel'
  if (props.file.kind === 'office') return ''
  return props.file.extension ? props.file.extension.toUpperCase() : ''
})

function clearObjectUrl() {
  if (objectUrl.value.startsWith('blob:')) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = ''
}

function columnName(index: number): string {
  let name = ''
  let current = index
  while (current > 0) {
    const remainder = (current - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    current = Math.floor((current - 1) / 26)
  }
  return name
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toLocaleDateString('es')
  if (typeof value === 'object') {
    const maybe = value as { text?: unknown; result?: unknown; richText?: Array<{ text?: string }> }
    if (maybe.text !== undefined) return String(maybe.text)
    if (maybe.result !== undefined) return String(maybe.result ?? '')
    if (Array.isArray(maybe.richText)) return maybe.richText.map(part => part.text ?? '').join('')
  }
  return String(value)
}

async function loadSpreadsheetPreview(file: PreviewFile) {
  const blob = await fetchPreviewBlob(file, { auth: false })
  const arrayBuffer = await blob.arrayBuffer()
  const ExcelJSModule = await import('exceljs')
  const ExcelJS = ExcelJSModule.default ?? ExcelJSModule
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)

  spreadsheet.value = {
    sheets: workbook.worksheets.map((worksheet) => {
      const rowCount = Math.min(worksheet.rowCount || 0, SHEET_ROW_LIMIT)
      const columnCount = Math.min(worksheet.columnCount || 0, SHEET_COLUMN_LIMIT)
      const rows = []

      for (let rowNumber = 1; rowNumber <= rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber)
        const cells = []
        for (let colNumber = 1; colNumber <= columnCount; colNumber++) {
          cells.push(formatCellValue(row.getCell(colNumber).value))
        }
        rows.push({ index: rowNumber, cells })
      }

      return {
        name: worksheet.name,
        columns: Array.from({ length: columnCount }, (_, index) => columnName(index + 1)),
        rows,
        truncated: (worksheet.rowCount || 0) > SHEET_ROW_LIMIT || (worksheet.columnCount || 0) > SHEET_COLUMN_LIMIT,
      }
    }),
  }
  activeSheetIndex.value = 0
}

async function loadPreview(file: PreviewFile) {
  clearObjectUrl()
  error.value = ''
  textContent.value = ''
  spreadsheet.value = { sheets: [] }
  activeSheetIndex.value = 0

  if (file.kind === 'video') {
    error.value = 'La vista previa de videos se implementara en una fase posterior.'
    return
  }

  if (file.kind === 'unsupported') {
    error.value = 'Este formato no se puede previsualizar todavia.'
    return
  }

  loading.value = true
  try {
    let source = file
    if (file.kind === 'office') {
      const preview = await filePreviewAdapter.getPdfPreview({
        fileUri: file.originalUri,
        fileName: file.name,
        targetFormat: 'pdf',
      })
      if (!preview.previewUrl) throw new Error('Preview not ready')
      const previewUrl = resolvePreviewFileUrl(preview.previewUrl)
      if (!previewUrl) throw new Error('Invalid preview URL')
      source = { ...file, url: previewUrl, originalUri: preview.previewUrl, kind: 'pdf', extension: 'pdf' }
    }

    if (source.kind === 'pdf') {
      objectUrl.value = source.url
      return
    }

    if (source.kind === 'image') {
      objectUrl.value = source.url
      return
    }

    if (source.kind === 'spreadsheet') {
      await loadSpreadsheetPreview(source)
      return
    }

    const blob = await fetchPreviewBlob(source, { auth: source.kind !== 'text' })
    if (source.kind === 'text') {
      textContent.value = await blob.text()
    } else {
      objectUrl.value = URL.createObjectURL(blob)
    }
  } catch {
    error.value = file.kind === 'office'
      ? 'No se pudo generar la vista previa PDF para este archivo. Puedes descargarlo mientras se habilita la conversion en el backend.'
      : 'No se pudo cargar la vista previa de este archivo.'
  } finally {
    loading.value = false
  }
}

async function downloadFile() {
  if (!props.file) return
  downloading.value = true
  try {
    if (objectUrl.value && !objectUrl.value.startsWith('blob:') && (props.file.kind === 'pdf' || props.file.kind === 'office' || props.file.kind === 'image')) {
      window.open(objectUrl.value, '_blank', 'noopener')
      return
    }
    await downloadPreviewFile(props.file)
  } catch {
    window.open(props.file.url, '_blank', 'noopener')
  } finally {
    downloading.value = false
  }
}

watch(() => props.file, (file) => {
  if (file) void loadPreview(file)
  else {
    clearObjectUrl()
    error.value = ''
    textContent.value = ''
  }
}, { immediate: true })

onBeforeUnmount(clearObjectUrl)
</script>

<style scoped>
.fp-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(10px);
}

.fp-modal {
  width: min(1120px, 100%);
  height: min(860px, 92vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: #0b0d12;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
}

.fp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 10px 12px 10px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: #11151d;
}

.fp-title-wrap {
  min-width: 0;
  flex: 1;
}

.fp-title {
  margin: 0;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fp-meta {
  margin: 2px 0 0;
  color: #8e8e93;
  font-size: 12px;
}

.fp-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fp-icon-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #f5f5f7;
  cursor: pointer;
}

.fp-icon-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.fp-body {
  min-height: 0;
  flex: 1;
  display: flex;
  background: #07090d;
}

.fp-frame,
.fp-image,
.fp-text,
.fp-sheet {
  width: 100%;
  height: 100%;
  border: 0;
}

.fp-image {
  object-fit: contain;
  padding: 14px;
  box-sizing: border-box;
}

.fp-text {
  margin: 0;
  padding: 20px;
  overflow: auto;
  color: #f5f5f7;
  font: 14px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.fp-sheet {
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f5f5f7;
}

.fp-sheet-tabs {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  overflow-x: auto;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: #11151d;
}

.fp-sheet-tab {
  max-width: 220px;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #d1d1d6;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fp-sheet-tab.active {
  border-color: rgba(0, 212, 255, 0.5);
  background: rgba(0, 212, 255, 0.15);
  color: #fff;
}

.fp-sheet-grid-wrap {
  position: relative;
  flex: 1;
  overflow: auto;
  background: #f5f5f7;
  scrollbar-color: #8e8e93 #e5e5ea;
  scrollbar-width: thin;
}

.fp-sheet-grid-wrap::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.fp-sheet-grid-wrap::-webkit-scrollbar-track {
  background: #e5e5ea;
}

.fp-sheet-grid-wrap::-webkit-scrollbar-thumb {
  background: #8e8e93;
  border-radius: 999px;
  border: 2px solid #e5e5ea;
}

.fp-sheet-grid {
  border-collapse: separate;
  border-spacing: 0;
  min-width: 100%;
  color: #1d1d1f;
  font-size: 13px;
  line-height: 1.35;
}

.fp-sheet-grid th,
.fp-sheet-grid td {
  min-width: 96px;
  max-width: 260px;
  padding: 7px 9px;
  border-right: 1px solid #d7d7dc;
  border-bottom: 1px solid #d7d7dc;
  background: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fp-sheet-grid thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #e9edf5;
  color: #2c2c2e;
  font-weight: 700;
  text-align: center;
}

.fp-sheet-row,
.fp-sheet-corner {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 48px !important;
  max-width: 48px !important;
  background: #e9edf5 !important;
  color: #48484a;
  text-align: center;
}

.fp-sheet-corner {
  z-index: 3 !important;
}

.fp-sheet-grid tbody tr:nth-child(even) td {
  background: #fafafa;
}

.fp-state {
  width: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  color: #d1d1d6;
  text-align: center;
}

.fp-error {
  color: #ffb4ad;
}

.fp-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.16);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: fp-spin 0.8s linear infinite;
}

.fp-primary-btn {
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  background: #00d4ff;
  color: #071018;
  font-weight: 700;
  cursor: pointer;
}

.fp-primary-btn:disabled {
  opacity: 0.55;
  cursor: default;
}

@keyframes fp-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 720px) {
  .fp-overlay {
    padding: 0;
    align-items: stretch;
  }

  .fp-modal {
    width: 100%;
    height: 100dvh;
    border: 0;
    border-radius: 0;
  }
}
</style>

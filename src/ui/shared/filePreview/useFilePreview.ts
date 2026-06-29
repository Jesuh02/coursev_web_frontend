import { ref } from 'vue'
import type { PreviewFile } from './filePreview'

export function useFilePreview() {
  const previewFile = ref<PreviewFile | null>(null)

  function openPreview(file: PreviewFile | null) {
    if (!file) return
    previewFile.value = file
  }

  function closePreview() {
    previewFile.value = null
  }

  return {
    previewFile,
    openPreview,
    closePreview,
  }
}

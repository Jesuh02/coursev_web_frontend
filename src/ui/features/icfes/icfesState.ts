/**
 * Pequeño store en memoria para pasar los resultados
 * del examen ICFES a la vista de resultados sin necesidad
 * de persistencia ni backend.
 */
import { ref } from 'vue'
import type { IcfesResult } from '@/infrastructure/api/icfesAdapter'

export const lastIcfesResult = ref<IcfesResult | null>(null)

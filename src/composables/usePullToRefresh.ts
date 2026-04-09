import { ref, onMounted, onUnmounted } from 'vue'

const THRESHOLD = 80   // px mínimos para disparar la recarga
const MAX_PULL  = 120  // px máximos de arrastre visual

export function usePullToRefresh() {
  const pullDistance = ref(0)
  const isPulling    = ref(false)
  const isRefreshing = ref(false)

  let startY = 0

  function onTouchStart(e: TouchEvent) {
    // Solo activar cuando el scroll del documento esté en el tope
    const scrollEl = document.scrollingElement ?? document.documentElement
    if (scrollEl.scrollTop > 0) return
    startY = e.touches[0].clientY
    isPulling.value = true
  }

  function onTouchMove(e: TouchEvent) {
    if (!isPulling.value || isRefreshing.value) return

    const scrollEl = document.scrollingElement ?? document.documentElement
    if (scrollEl.scrollTop > 0) {
      isPulling.value = false
      pullDistance.value = 0
      return
    }

    const delta = e.touches[0].clientY - startY
    if (delta <= 0) {
      pullDistance.value = 0
      return
    }

    // Resistencia progresiva
    pullDistance.value = Math.min(delta * 0.5, MAX_PULL)
    // Evitar el scroll nativo mientras se arrastra hacia abajo desde el tope
    if (delta > 0) e.preventDefault()
  }

  function onTouchEnd() {
    if (!isPulling.value) return
    isPulling.value = false

    if (pullDistance.value >= THRESHOLD) {
      isRefreshing.value = true
      pullDistance.value = THRESHOLD // fijar indicador mientras recarga
      // Pequeño delay para que el usuario vea el spinner un instante
      setTimeout(() => window.location.reload(), 300)
    } else {
      pullDistance.value = 0
    }
  }

  onMounted(() => {
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove',  onTouchMove,  { passive: false })
    document.addEventListener('touchend',   onTouchEnd,   { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchmove',  onTouchMove)
    document.removeEventListener('touchend',   onTouchEnd)
  })

  return { pullDistance, isPulling, isRefreshing, THRESHOLD }
}

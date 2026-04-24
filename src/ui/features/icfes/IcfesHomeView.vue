<template>
  <div class="icfes-root">
    <!-- Partículas de fondo -->
    <div class="particles" aria-hidden="true">
      <span v-for="p in particles" :key="p.id" class="particle" :style="p.style" />
    </div>

    <TopBar title="Simulacro ICFES" @back="$router.back()" />

    <div class="icfes-body">
      <!-- Hero -->
      <header class="hero">
        <div class="hero-badge">
          <span class="hero-badge-dot" />
          Saber 11 · Adaptativo
        </div>
        <h1 class="hero-title">Prepárate para el <span class="hl">ICFES</span></h1>
        <p class="hero-sub">
          20 preguntas por sesión · selección inteligente según tu nivel
        </p>

        <div class="hero-metrics">
          <div class="hm-card">
            <span class="hm-num">{{ totalSessions }}</span>
            <span class="hm-lbl">Simulacros</span>
          </div>
          <div class="hm-divider" />
          <div class="hm-card">
            <span class="hm-num">{{ avgGrade }}</span>
            <span class="hm-lbl">Promedio /10</span>
          </div>
          <div class="hm-divider" />
          <div class="hm-card">
            <span class="hm-num">{{ accuracyPct }}%</span>
            <span class="hm-lbl">Precisión</span>
          </div>
        </div>
      </header>

      <!-- Selector de áreas -->
      <section class="areas-section">
        <div class="section-header">
          <h2 class="section-title">Elige un área</h2>
          <span class="section-hint">Toca para comenzar</span>
        </div>

        <div class="areas-grid">
          <button
            v-for="(a, i) in areas"
            :key="a.code"
            class="area-card"
            :style="{
              '--g1': a.gradient[0],
              '--g2': a.gradient[1],
              '--glow': a.glow,
              animationDelay: `${i * 70}ms`,
            }"
            @click="onPickArea(a.code)"
          >
            <span class="ac-glow" />
            <span class="ac-icon" aria-hidden="true">{{ a.icon }}</span>
            <span class="ac-texts">
              <span class="ac-name">{{ a.name }}</span>
              <span class="ac-desc">{{ a.description }}</span>
            </span>
            <span class="ac-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>
        </div>
      </section>

      <!-- Tips -->
      <section class="tips">
        <div class="tip">
          <span class="tip-ic">⏱</span>
          <div>
            <p class="tip-t">Tiempo sugerido</p>
            <p class="tip-d">~35 s por pregunta · 12 min totales</p>
          </div>
        </div>
        <div class="tip">
          <span class="tip-ic">🎯</span>
          <div>
            <p class="tip-t">Diagnóstico fino</p>
            <p class="tip-d">Detectamos tus falencias por subtema</p>
          </div>
        </div>
        <div class="tip">
          <span class="tip-ic">🔁</span>
          <div>
            <p class="tip-t">Sin repetir</p>
            <p class="tip-d">Nunca verás dos veces la misma pregunta</p>
          </div>
        </div>
      </section>

      <!-- Historial -->
      <section class="history">
        <div class="section-header">
          <h2 class="section-title">Historial</h2>
          <span v-if="history.length" class="section-badge">{{ history.length }}</span>
        </div>

        <div v-if="history.length" class="history-list">
          <div
            v-for="(r, i) in history"
            :key="r.id"
            class="hist-card"
            :style="{ animationDelay: `${i * 40}ms` }"
          >
            <span class="hist-ic">{{ areaInfo(r.area)?.icon ?? '📘' }}</span>
            <div class="hist-body">
              <p class="hist-title">{{ areaInfo(r.area)?.name ?? r.area }}</p>
              <p class="hist-sub">
                {{ r.correct }}/{{ r.total }} · {{ formatDate(r.createdAt) }}
              </p>
            </div>
            <span
              class="hist-grade"
              :class="r.grade >= 6 ? 'g-pass' : 'g-fail'"
            >{{ r.grade.toFixed(1) }}</span>
          </div>
        </div>
        <div v-else class="empty">
          <span class="empty-ic">🏁</span>
          <p class="empty-t">Aún no has hecho simulacros</p>
          <p class="empty-d">Elige un área para comenzar</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { icfesAdapter, findArea, type IcfesArea, type IcfesResult } from '@/infrastructure/api/icfesAdapter'

const router = useRouter()
const areas = icfesAdapter.listAreas()
const history = ref<IcfesResult[]>([])

const totalSessions = computed(() => history.value.length)
const avgGrade = computed(() => {
  if (!history.value.length) return '0.0'
  const s = history.value.reduce((a, b) => a + b.grade, 0)
  return (s / history.value.length).toFixed(1)
})
const accuracyPct = computed(() => {
  const tot = history.value.reduce((a, b) => a + b.total, 0)
  const ok = history.value.reduce((a, b) => a + b.correct, 0)
  return tot ? Math.round((ok / tot) * 100) : 0
})

function areaInfo(code: string) { return findArea(code) }

function onPickArea(code: IcfesArea) {
  router.push({ name: 'icfesExam', params: { area: code } })
}

function formatDate(v: string) {
  const t = Date.parse(v)
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  if (diff < 60_000) return 'Ahora'
  if (diff < 3_600_000) return `hace ${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `hace ${Math.floor(diff / 3_600_000)}h`
  if (diff < 604_800_000) return `hace ${Math.floor(diff / 86_400_000)}d`
  return new Date(t).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })
}

onMounted(async () => {
  try {
    history.value = await icfesAdapter.getHistory()
  } catch { history.value = [] }
})

const particles = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  style: {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${(Math.random() * 6).toFixed(1)}s`,
    animationDuration: `${(4 + Math.random() * 5).toFixed(1)}s`,
    width: `${Math.round(4 + Math.random() * 7)}px`,
    height: `${Math.round(4 + Math.random() * 7)}px`,
    opacity: `${(0.1 + Math.random() * 0.3).toFixed(2)}`,
  },
}))
</script>

<style scoped>
.icfes-root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 25% 0%, rgba(98,0,238,.22) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 60%, rgba(0,212,255,.10) 0%, transparent 55%),
    #0A0A0F;
  position: relative;
  overflow-x: hidden;
  color: #fff;
}
.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  border-radius: 50%;
  background: #8B5CF6;
  animation: floatP linear infinite;
}

.icfes-body {
  position: relative;
  z-index: 1;
  padding: 12px 16px 90px;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* Hero */
.hero {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 4px 4px;
}
.hero-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  padding: 6px 12px;
  border-radius: 999px;
  color: #C084FC;
  background: rgba(192,132,252,.12);
  border: 1px solid rgba(192,132,252,.28);
}
.hero-badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #C084FC;
  box-shadow: 0 0 8px #C084FC;
  animation: pulse 1.8s ease-in-out infinite;
}
.hero-title {
  font-size: 30px; font-weight: 900; letter-spacing: -.6px;
  margin: 2px 0 0; line-height: 1.1; color: #fff;
}
.hero-title .hl {
  background: linear-gradient(135deg, #C084FC, #00D4FF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-sub { font-size: 13px; color: #9CA3AF; margin: 0; }

.hero-metrics {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 6px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 18px;
  backdrop-filter: blur(8px);
}
.hm-card { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
.hm-num  { font-size: 20px; font-weight: 900; color: #fff; }
.hm-lbl  { font-size: 10px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: .5px; }
.hm-divider { width: 1px; height: 28px; background: rgba(255,255,255,.08); }

/* Section headers */
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.section-title { font-size: 16px; font-weight: 800; margin: 0; color: #fff; }
.section-hint  { font-size: 11px; color: #6B7280; }
.section-badge {
  font-size: 11px; font-weight: 700; color: #8B5CF6;
  background: rgba(139,92,246,.15); border: 1px solid rgba(139,92,246,.3);
  padding: 2px 8px; border-radius: 20px;
}

/* Areas */
.areas-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.area-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 16px;
  border-radius: 18px;
  background: linear-gradient(135deg,
    rgba(255,255,255,.04),
    rgba(255,255,255,.02));
  border: 1px solid rgba(255,255,255,.08);
  color: #fff;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s, border-color .22s;
  animation: cardIn .45s cubic-bezier(.34,1.2,.64,1) both;
}
.area-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--g1), var(--g2));
  opacity: 0;
  transition: opacity .25s;
  z-index: -1;
}
.area-card:hover {
  transform: translateY(-2px);
  border-color: transparent;
  box-shadow: 0 12px 30px var(--glow);
}
.area-card:hover::before { opacity: .18; }
.area-card:active { transform: scale(.98); }

.ac-glow {
  position: absolute;
  inset: -40% -40% auto auto;
  width: 160px; height: 160px;
  background: radial-gradient(circle, var(--glow) 0%, transparent 70%);
  opacity: .6;
  filter: blur(14px);
  pointer-events: none;
  z-index: -1;
}
.ac-icon {
  font-size: 32px;
  line-height: 1;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--g1), var(--g2));
  box-shadow: 0 6px 18px var(--glow);
}
.ac-texts { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.ac-name  { font-size: 15px; font-weight: 800; color: #fff; }
.ac-desc  { font-size: 12px; color: #9CA3AF; }
.ac-arrow {
  display: grid; place-items: center;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,.07);
  color: #fff;
  flex-shrink: 0;
  transition: transform .22s, background .22s;
}
.area-card:hover .ac-arrow {
  background: rgba(255,255,255,.18);
  transform: translateX(3px);
}

/* Tips */
.tips {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.tip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 14px;
}
.tip-ic {
  font-size: 20px;
  width: 36px; height: 36px;
  display: grid; place-items: center;
  background: rgba(139,92,246,.12);
  border-radius: 10px;
}
.tip-t { font-size: 13px; font-weight: 700; color: #fff; margin: 0; }
.tip-d { font-size: 11px; color: #9CA3AF; margin: 0; }

/* History */
.history-list { display: flex; flex-direction: column; gap: 8px; }
.hist-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  animation: cardIn .4s cubic-bezier(.34,1.2,.64,1) both;
}
.hist-ic { font-size: 22px; }
.hist-body { flex: 1; min-width: 0; }
.hist-title { font-size: 13px; font-weight: 700; color: #fff; margin: 0; }
.hist-sub   { font-size: 11px; color: #6B7280; margin: 0; }
.hist-grade { font-size: 17px; font-weight: 900; }
.g-pass { color: #30D158; }
.g-fail { color: #FF453A; }

.empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: 20px 0;
}
.empty-ic { font-size: 40px; opacity: .6; animation: pulse 2.4s ease-in-out infinite; }
.empty-t { font-size: 14px; font-weight: 700; color: #9CA3AF; margin: 0; }
.empty-d { font-size: 12px; color: #555; margin: 0; }

/* Keyframes */
@keyframes floatP {
  0%   { transform: translateY(0) rotate(0); }
  50%  { transform: translateY(-30px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px) scale(.96); }
  to   { opacity: 1; transform: none; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .55; transform: scale(.85); }
}

/* Responsive > 600px */
@media (min-width: 640px) {
  .hero-title { font-size: 36px; }
  .tips { grid-template-columns: 1fr 1fr 1fr; }
}
</style>

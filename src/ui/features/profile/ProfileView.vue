<template>
  <div class="profile-view">
    <div class="profile-header">
      <button class="edit-btn" @click="$router.push('/profile/edit')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
      </button>

      <div class="avatar-container">
        <div class="avatar-glow" />
        <div class="avatar">
          <img v-if="user?.avatar" :src="user.avatar" alt="" />
          <span v-else class="avatar-letter">{{ user?.username?.[0]?.toUpperCase() ?? '?' }}</span>
        </div>
      </div>

      <h2 class="username">{{ user?.username ?? 'Usuario' }}</h2>
      <div class="status-row">
        <span class="subscribers">{{ subscriberCountLabel }}</span>
      </div>
    </div>

    <!-- Recommendations Section -->
    <section
      v-if="recommendations.length > 0"
      class="recommendations-section"
      :class="{ 'is-collapsed': !recommendationsExpanded }"
      aria-labelledby="profile-recommendations-title"
    >
      <button
        class="rec-header"
        type="button"
        :aria-expanded="recommendationsExpanded"
        aria-controls="profile-recommendations-panel"
        @click="recommendationsExpanded = !recommendationsExpanded"
      >
        <div class="rec-heading-copy">
          <span class="rec-eyebrow">Plan personalizado</span>
          <span id="profile-recommendations-title" class="rec-title">Recomendaciones</span>
        </div>
        <div class="rec-header-actions">
          <span class="rec-badge">
            {{ recommendations.length }} {{ recommendations.length === 1 ? 'activa' : 'activas' }}
          </span>
          <span class="rec-toggle-label">{{ recommendationsExpanded ? 'Ocultar' : 'Desplegar' }}</span>
          <svg
            class="rec-chevron"
            :class="{ 'is-open': recommendationsExpanded }"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      <TransitionGroup
        v-show="recommendationsExpanded"
        id="profile-recommendations-panel"
        name="rec-list"
        tag="div"
        class="rec-list"
      >
        <article
          v-for="rec in recommendations"
          :key="rec.id"
          class="rec-card"
          :class="[`priority-${rec.priority}`, { 'rec-completed': rec.status === 'completed' }]"
        >
          <div class="rec-main">
            <div class="rec-card-heading">
              <div class="rec-priority">
                <span class="rec-priority-dot" aria-hidden="true" />
                <span>{{ getPriorityLabel(rec.priority) }}</span>
              </div>
              <span v-if="rec.status === 'completed'" class="rec-status">Completada</span>
            </div>

            <div class="rec-problem-content">
              <p class="rec-description">{{ rec.problem.description }}</p>
              <div class="rec-tags">
                <span class="rec-tag course">{{ rec.problem.courseName }}</span>
                <span class="rec-tag topic">{{ rec.problem.topicName }}</span>
                <span v-if="rec.problem.taskName" class="rec-tag task">{{ rec.problem.taskName }}</span>
              </div>
            </div>
          </div>

          <div class="rec-metrics">
            <div class="rec-metric">
              <span class="metric-value" :class="getAccuracyClass(rec.before.accuracy)">{{ rec.before.accuracy }}%</span>
              <span class="metric-label">Dominio actual</span>
            </div>
            <div class="rec-metric">
              <span class="metric-value">{{ rec.before.avgGrade.toFixed(1) }}</span>
              <span class="metric-label">Nota promedio</span>
            </div>
            <div class="rec-metric">
              <span class="metric-value trend" :class="`trend-${rec.before.trend}`">
                <svg v-if="rec.before.trend === 'improving'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                <svg v-else-if="rec.before.trend === 'declining'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                <span v-else>Estable</span>
              </span>
              <span class="metric-label">Tendencia</span>
            </div>
          </div>

          <div class="rec-intervention">
            <span class="rec-label">Intervención sugerida</span>
            <p class="rec-intervention-text">{{ rec.intervention.description }}</p>
          </div>

          <!-- Completed results -->
          <Transition name="results-fade">
            <div v-if="rec.status === 'completed' && rec.after" class="rec-results">
              <div class="results-comparison">
                <div class="result-col before">
                  <span class="result-header">Antes</span>
                  <span class="result-value low">{{ rec.before.accuracy }}%</span>
                </div>
                <div class="result-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
                <div class="result-col after">
                  <span class="result-header">Después</span>
                  <span class="result-value high">{{ rec.after.accuracy }}%</span>
                </div>
              </div>
              <div class="improvement-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                +{{ rec.after.accuracy - rec.before.accuracy }}% de mejora
              </div>
            </div>
          </Transition>

          <!-- Action buttons -->
          <div v-if="rec.status !== 'completed'" class="rec-actions">
            <button class="rec-btn rec-btn-primary" @click="goToReinforcement(rec)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              Reforzar tema
            </button>
            <button class="rec-btn rec-btn-secondary" @click="goToLearning(rec)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Aprender
            </button>
          </div>
        </article>
      </TransitionGroup>

      <!-- Empty state when loading -->
      <div v-if="loadingRecommendations && recommendationsExpanded" class="rec-loading">
        <div class="rec-skeleton" v-for="i in 2" :key="i">
          <div class="skeleton-line w-60" />
          <div class="skeleton-line w-full" />
          <div class="skeleton-line w-40" />
        </div>
      </div>
    </section>

    <!-- Empty state for recommendations -->
    <section v-else-if="!loadingRecommendations && hasCheckedRecommendations" class="recommendations-empty">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <p class="empty-title">Todo en orden</p>
      <p class="empty-sub">No hay recomendaciones pendientes. Sigue practicando para mantener tu nivel.</p>
    </section>

    <div class="menu-section">
      <ProfileMenuCard>
        <ProfileMenuItem icon="book" label="Mis cursos" color="#007AFF" @click="$router.push('/explore')" />
        <ProfileMenuItem icon="bar-chart" label="Panel de creador" color="#FF9500" @click="$router.push('/admin')" />
      </ProfileMenuCard>

      <ProfileMenuCard>
        <ProfileMenuItem icon="star" label="Suscripciones" color="#5E5CE6" @click="$router.push('/subscriptions')" />
        <ProfileMenuItem
          icon="message-circle"
          label="Quejas y dudas"
          color="#25D366"
          subtitle="WhatsApp 3053048316"
          @click="handleSupportWhatsApp"
        />
        <ProfileMenuItem
          icon="message-circle"
          :label="waLabel"
          :color="waIconColor"
          :badge="waBadge"
          :badge-color="waBadgeColor"
          :subtitle="waSubtitle"
          @click="handleWhatsAppClick"
        />
      </ProfileMenuCard>

      <ProfileMenuCard>
        <ProfileMenuItem icon="log-out" label="Cerrar sesión" color="#FF453A" @click="logout" />
      </ProfileMenuCard>
    </div>

    <!-- ═══ WhatsApp Dialogs ═══ -->
    <Teleport to="body">

    <!-- Link phone number dialog -->
    <Transition name="dialog-fade">
      <div v-if="showLinkDialog" class="wa-overlay" @click.self="closeLinkDialog">
        <div class="wa-card">
          <div class="wa-icon-circle wa-green">
            <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#fff" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42 1.55 1.56 2.41 3.63 2.41 5.83 0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32C4.24 15 3.8 13.47 3.8 11.91c.01-4.54 3.7-8.24 8.24-8.24zm-3.51 5.66c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07s.89 2.27 1.02 2.44c.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.29-.25-.12-1.47-.72-1.69-.8-.23-.08-.37-.12-.56.13-.09.12-.41.55-.58.74-.15.19-.29.21-.54.09-.24-.12-1-.36-1.92-1.19-.72-.64-1.19-1.45-1.34-1.7-.15-.25-.02-.39.1-.51.12-.12.25-.31.38-.46.12-.15.16-.26.24-.43.08-.16.04-.31-.02-.44-.06-.12-.53-1.35-.74-1.82-.2-.47-.41-.4-.58-.41-.15-.01-.31-.01-.5-.01z"/>
            </svg>
          </div>
          <h3 class="wa-dialog-title">Vincular WhatsApp</h3>
          <p class="wa-dialog-sub">Ingresa tu número con código de país</p>
          <input
            v-model="phoneInput"
            type="tel"
            class="wa-input"
            placeholder="+57 300 000 0000"
            autocomplete="tel"
            @keyup.enter="doLink"
          />
          <p class="wa-hint">Recibirás un código de verificación por WhatsApp</p>
          <p v-if="dialogError" class="wa-error">{{ dialogError }}</p>
          <div class="wa-buttons">
            <button class="wa-btn-outline" @click="closeLinkDialog">Cancelar</button>
            <button class="wa-btn-green" :disabled="dialogLoading" @click="doLink">
              {{ dialogLoading ? 'Enviando…' : 'Enviar código' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Verify OTP dialog -->
    <Transition name="dialog-fade">
      <div v-if="showVerifyDialog" class="wa-overlay" @click.self="closeVerifyDialog">
        <div class="wa-card">
          <div class="wa-icon-circle wa-orange">
            <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#fff" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42 1.55 1.56 2.41 3.63 2.41 5.83 0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32C4.24 15 3.8 13.47 3.8 11.91c.01-4.54 3.7-8.24 8.24-8.24zm-3.51 5.66c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07s.89 2.27 1.02 2.44c.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.29-.25-.12-1.47-.72-1.69-.8-.23-.08-.37-.12-.56.13-.09.12-.41.55-.58.74-.15.19-.29.21-.54.09-.24-.12-1-.36-1.92-1.19-.72-.64-1.19-1.45-1.34-1.7-.15-.25-.02-.39.1-.51.12-.12.25-.31.38-.46.12-.15.16-.26.24-.43.08-.16.04-.31-.02-.44-.06-.12-.53-1.35-.74-1.82-.2-.47-.41-.4-.58-.41-.15-.01-.31-.01-.5-.01z"/>
            </svg>
          </div>
          <h3 class="wa-dialog-title">Verificar código</h3>
          <p class="wa-dialog-sub">Código enviado a <strong>{{ waPhone }}</strong></p>
          <input
            v-model="otpInput"
            type="text"
            inputmode="numeric"
            class="wa-input wa-otp-input"
            placeholder="• • • • • •"
            maxlength="6"
            @keyup.enter="doVerify"
          />
          <p v-if="dialogError" class="wa-error">{{ dialogError }}</p>
          <div class="wa-buttons">
            <button class="wa-btn-outline" @click="closeVerifyDialog">Cancelar</button>
            <button class="wa-btn-green" :disabled="dialogLoading" @click="doVerify">
              {{ dialogLoading ? 'Verificando…' : 'Verificar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Unlink dialog (matches dialog_whatsapp_unlink.xml design) -->
    <Transition name="dialog-fade">
      <div v-if="showUnlinkDialog" class="wa-overlay" @click.self="closeUnlinkDialog">
        <div class="wa-card unlink-card">
          <div class="unlink-icon-frame">
            <div class="unlink-icon-bg" />
            <div class="unlink-icon-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fff" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42 1.55 1.56 2.41 3.63 2.41 5.83 0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32C4.24 15 3.8 13.47 3.8 11.91c.01-4.54 3.7-8.24 8.24-8.24zm-3.51 5.66c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07s.89 2.27 1.02 2.44c.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.29-.25-.12-1.47-.72-1.69-.8-.23-.08-.37-.12-.56.13-.09.12-.41.55-.58.74-.15.19-.29.21-.54.09-.24-.12-1-.36-1.92-1.19-.72-.64-1.19-1.45-1.34-1.7-.15-.25-.02-.39.1-.51.12-.12.25-.31.38-.46.12-.15.16-.26.24-.43.08-.16.04-.31-.02-.44-.06-.12-.53-1.35-.74-1.82-.2-.47-.41-.4-.58-.41-.15-.01-.31-.01-.5-.01z"/>
              </svg>
            </div>
          </div>
          <h3 class="wa-dialog-title">Desvincular WhatsApp</h3>
          <div v-if="waPhone" class="phone-chip">{{ waPhone }}</div>
          <p class="unlink-message">Ya no recibirás notificaciones ni podrás usar el asistente por WhatsApp desde esta cuenta.</p>
          <hr class="unlink-divider" />
          <div class="wa-buttons">
            <button class="wa-btn-outline" @click="closeUnlinkDialog">Cancelar</button>
            <button class="wa-btn-red" :disabled="dialogLoading" @click="doUnlink">
              {{ dialogLoading ? 'Desvinculando…' : 'Desvincular' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { whatsappAdapter, HttpError } from '@/infrastructure/api'
import { reinforcementAdapter } from '@/infrastructure/api/reinforcementAdapter'
import type { Recommendation } from '@/domain/ports'
import { getConversationRecommendations, type ConversationRecommendation } from '@/ui/features/reinforcement/conversationRecommendation'
import ProfileMenuCard from './components/ProfileMenuCard.vue'
import ProfileMenuItem from './components/ProfileMenuItem.vue'

const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const user = computed(() => authStore.user)
const subscriberCount = ref(0)

// ═══════════════════════════════════════
// Recommendations state
// ═══════════════════════════════════════
type ProfileRecommendation = (Recommendation | ConversationRecommendation) & {
  problem: Recommendation['problem'] & {
    taskId?: number | null
    taskName?: string | null
  }
}

const backendRecommendations = ref<ProfileRecommendation[]>([])
const conversationRecommendations = ref<ConversationRecommendation[]>([])
const loadingRecommendations = ref(false)
const hasCheckedRecommendations = ref(false)
const recommendationsExpanded = ref(false)

const recommendations = computed<ProfileRecommendation[]>(() => {
  const byId = new Map<string, ProfileRecommendation>()
  for (const rec of conversationRecommendations.value) byId.set(rec.id, rec)
  for (const rec of backendRecommendations.value) {
    if (!byId.has(rec.id)) byId.set(rec.id, rec)
  }
  return Array.from(byId.values())
})

const subscriberCountLabel = computed(() => {
  const count = subscriberCount.value
  return count === 1 ? '1 suscriptor' : `${count} suscriptores`
})

// ═══════════════════════════════════════
// WhatsApp state
// ═══════════════════════════════════════
type WaState = 'loading' | 'linked' | 'pending' | 'unlinked' | 'unavailable'
const waState = ref<WaState>('loading')
const waPhone = ref('')
const waProviderInfo = ref('')
const SUPPORT_WHATSAPP_NUMBER = '573053048316'
const SUPPORT_WHATSAPP_MESSAGE = 'Hola, tengo una duda o queja sobre CourseV.'

// Dialog visibility
const showLinkDialog = ref(false)
const showVerifyDialog = ref(false)
const showUnlinkDialog = ref(false)

// Inputs
const phoneInput = ref('')
const otpInput = ref('')

// Dialog feedback
const dialogError = ref('')
const dialogLoading = ref(false)

// Computed WhatsApp UI
const waLabel = computed(() => {
  switch (waState.value) {
    case 'linked': return 'Desvincular WhatsApp'
    case 'pending': return 'Verificar WhatsApp'
    case 'unavailable': return 'WhatsApp no disponible'
    default: return 'Vincular WhatsApp'
  }
})

const waIconColor = computed(() => {
  switch (waState.value) {
    case 'linked': return '#FF3B30'
    case 'pending': return '#FF9500'
    case 'unavailable': return '#555555'
    default: return '#25D366'
  }
})

const waBadge = computed<string | undefined>(() => {
  if (waState.value === 'loading') return undefined
  switch (waState.value) {
    case 'linked': return 'VINCULADO'
    case 'pending': return 'PENDIENTE'
    case 'unavailable': return 'NO DISPONIBLE'
    default: return 'NO VINCULADO'
  }
})

const waBadgeColor = computed(() => {
  switch (waState.value) {
    case 'linked': return '#25D366'
    case 'pending': return '#FF9500'
    default: return '#AAAAAA'
  }
})

const waSubtitle = computed(() => {
  switch (waState.value) {
    case 'linked':
      return waPhone.value
        ? waPhone.value + (waProviderInfo.value ? ` · via ${waProviderInfo.value}` : '')
        : 'Cuenta vinculada'
    case 'pending':
      return `Código enviado a ${waPhone.value} — toca para verificar`
    case 'unavailable':
      return 'El servicio no está disponible ahora'
    case 'loading':
      return 'Cargando…'
    default:
      return 'Conecta tu cuenta para recibir notificaciones'
  }
})

// ═══════════════════════════════════════
// WhatsApp API functions
// ═══════════════════════════════════════
async function fetchWhatsAppStatus() {
  try {
    const data = await whatsappAdapter.getStatus()
    const isLinked = data?.isLinked ?? false
    const phone = data?.phoneNumber ?? ''
    const otpPending = data?.otpPending ?? false
    const channelAvailable = data?.channelAvailable ?? true
    const provider = data?.provider
    const providerName = provider?.name ?? provider?.provider ?? ''

    waPhone.value = phone
    waProviderInfo.value = providerName

    if (isLinked) {
      waState.value = 'linked'
    } else if (!channelAvailable) {
      waState.value = 'unavailable'
    } else if (otpPending && phone) {
      waState.value = 'pending'
    } else {
      waState.value = 'unlinked'
    }
  } catch {
    waState.value = 'unlinked'
  }
}

async function handleWhatsAppClick() {
  if (waState.value === 'loading') return

  if (waState.value === 'linked') {
    showUnlinkDialog.value = true
    return
  }

  if (waState.value === 'pending') {
    otpInput.value = ''
    dialogError.value = ''
    showVerifyDialog.value = true
    return
  }

  if (waState.value === 'unavailable') {
    // Re-check status before showing link dialog
    await fetchWhatsAppStatus()
    if (waState.value === 'unavailable') {
      // Channel still down — open link dialog anyway; backend will return error if truly blocked
    }
  }

  phoneInput.value = ''
  dialogError.value = ''
  showLinkDialog.value = true
}

function normalizePhoneE164(raw: string): string | null {
  let normalized = raw.trim().replace(/[^0-9+]/g, '')
  if (!normalized.startsWith('+') && normalized.length === 10 && normalized.startsWith('3')) {
    normalized = '+57' + normalized
  }
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.slice(2)
  }
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized
  }
  return /^\+[1-9]\d{6,14}$/.test(normalized) ? normalized : null
}

async function doLink() {
  dialogError.value = ''
  const normalized = normalizePhoneE164(phoneInput.value)
  if (!normalized) {
    dialogError.value = 'Número inválido. Usa formato internacional, ej: +57 300 000 0000'
    return
  }
  dialogLoading.value = true
  try {
    await whatsappAdapter.link(normalized)
    waPhone.value = normalized
    waState.value = 'pending'
    showLinkDialog.value = false
    otpInput.value = ''
    dialogError.value = ''
    showVerifyDialog.value = true
  } catch (e) {
    dialogError.value = e instanceof HttpError ? e.message : 'Error al enviar código. Intenta de nuevo.'
  } finally {
    dialogLoading.value = false
  }
}

async function doVerify() {
  dialogError.value = ''
  const code = otpInput.value.trim()
  if (!/^\d{6}$/.test(code)) {
    dialogError.value = 'Ingresa el código de 6 dígitos'
    return
  }
  dialogLoading.value = true
  try {
    await whatsappAdapter.verify(code)
    showVerifyDialog.value = false
    waState.value = 'linked'
  } catch (e) {
    dialogError.value = e instanceof HttpError ? e.message : 'Código incorrecto. Intenta de nuevo.'
  } finally {
    dialogLoading.value = false
  }
}

async function doUnlink() {
  dialogLoading.value = true
  try {
    await whatsappAdapter.unlink()
    showUnlinkDialog.value = false
    waPhone.value = ''
    waProviderInfo.value = ''
    waState.value = 'unlinked'
  } catch (e) {
    showUnlinkDialog.value = false
    console.error('Error unlinking WhatsApp:', e)
  } finally {
    dialogLoading.value = false
  }
}

function closeLinkDialog() { showLinkDialog.value = false; dialogError.value = '' }
function closeVerifyDialog() { showVerifyDialog.value = false; dialogError.value = '' }
function closeUnlinkDialog() { showUnlinkDialog.value = false }

function handleSupportWhatsApp() {
  const url = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(SUPPORT_WHATSAPP_MESSAGE)}`
  window.open(url, '_blank', 'noopener')
}

// ═══════════════════════════════════════
// Profile / subscriber count
// ═══════════════════════════════════════
async function ensureProfileLoaded() {
  if (!user.value && authStore.isAuthenticated) {
    await authStore.fetchProfile()
  }
}

async function loadSubscriberCount(userId?: number | null) {
  if (!userId) {
    subscriberCount.value = 0
    return
  }

  try {
    subscriberCount.value = await subscriptionStore.getSubscriberCount(userId)
  } catch {
    subscriberCount.value = 0
  }
}

onMounted(() => {
  void ensureProfileLoaded()
  void fetchWhatsAppStatus()
})

watch(
  () => user.value?.id,
  (userId) => {
    recommendationsExpanded.value = false
    loadConversationRecommendations()
    void loadSubscriberCount(userId)
  },
  { immediate: true },
)

function logout() {
  // authStore.logout() ya llama router.push('/login') internamente
  authStore.logout()
}

// ═══════════════════════════════════════
// Recommendations functions
// ═══════════════════════════════════════
async function loadRecommendations() {
  if (!authStore.isAuthenticated) return

  recommendationsExpanded.value = false
  loadingRecommendations.value = true
  try {
    const response = await reinforcementAdapter.getRecommendations(5)
    if (response && response.recommendations) {
      backendRecommendations.value = response.recommendations as ProfileRecommendation[]
    }
  } catch (error) {
    console.error('Error loading recommendations:', error)
  } finally {
    loadingRecommendations.value = false
    hasCheckedRecommendations.value = true
  }
}

function loadConversationRecommendations() {
  conversationRecommendations.value = getConversationRecommendations(user.value?.id ?? null)
}

function getAccuracyClass(accuracy: number): string {
  if (accuracy >= 70) return 'accuracy-good'
  if (accuracy >= 50) return 'accuracy-medium'
  return 'accuracy-low'
}

function getPriorityLabel(priority: Recommendation['priority']): string {
  switch (priority) {
    case 'high': return 'Alta prioridad'
    case 'medium': return 'Prioridad media'
    default: return 'Prioridad baja'
  }
}

function goToReinforcement(rec: ProfileRecommendation) {
  const query: Record<string, string> = {
    topicId: String(rec.problem.topicId),
    topicName: rec.problem.topicName,
    difficulty: rec.intervention.difficulty,
    autoStart: 'true',
    fromRecommendation: 'true',
  }
  if (rec.problem.taskId) query.taskId = String(rec.problem.taskId)
  if (rec.problem.taskName) query.taskName = rec.problem.taskName
  router.push({
    path: `/reinforcement/${rec.problem.courseId}`,
    query,
  })
}

function goToLearning(rec: ProfileRecommendation) {
  const query: Record<string, string> = {
    courseId: String(rec.problem.courseId),
    topicId: String(rec.problem.topicId),
    topicName: rec.problem.topicName,
    fromRecommendation: 'true',
  }
  if (rec.problem.taskId) query.taskId = String(rec.problem.taskId)
  if (rec.problem.taskName) query.taskName = rec.problem.taskName
  if (rec.problem.subjectId) {
    query.subjectId = String(rec.problem.subjectId)
  }
  router.push({
    path: '/learning',
    query,
  })
}

// Load recommendations on mount
onMounted(() => {
  loadConversationRecommendations()
  void loadRecommendations()
})
</script>

<style scoped>
.profile-view {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: linear-gradient(180deg, rgba(98,0,238,0.08) 0%, var(--bg-primary) 40%);
  padding-bottom: max(80px, env(safe-area-inset-bottom, 0px) + 64px);
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 32px;
  position: relative;
}

.edit-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.avatar-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(191,90,242,0.4) 0%, transparent 70%);
  animation: pulse-glow 3s infinite;
}

.avatar {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--bg-secondary);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #BF5AF2;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter {
  font-size: 36px;
  font-weight: 700;
  color: #BF5AF2;
}

.username {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.status-indicator.online {
  background: #30D158;
}

.status-text,
.subscribers {
  font-size: 14px;
  color: #aaa;
}

.separator {
  color: #666;
}

.menu-section {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ═══ WhatsApp Dialog Styles ═══ */
.wa-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.wa-card {
  background: #1c1c1e;
  border-radius: 20px;
  padding: 28px 24px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.wa-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.wa-green { background: rgba(37, 211, 102, 0.2); }
.wa-orange { background: rgba(255, 149, 0, 0.2); }

.wa-dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin: 0 0 8px;
}

.wa-dialog-sub {
  font-size: 14px;
  color: #aaa;
  text-align: center;
  margin: 0 0 20px;
}

.wa-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 12px 14px;
  color: #fff;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 10px;
  transition: border-color 0.2s;
}

.wa-input:focus { border-color: #25D366; }

.wa-otp-input {
  text-align: center;
  letter-spacing: 0.3em;
  font-size: 22px;
  font-weight: 600;
}

.wa-hint {
  font-size: 12px;
  color: #666;
  text-align: center;
  margin: 0 0 16px;
}

.wa-error {
  font-size: 13px;
  color: #FF453A;
  text-align: center;
  margin: 0 0 12px;
}

.wa-buttons {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
}

.wa-btn-outline,
.wa-btn-green,
.wa-btn-red {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}

.wa-btn-outline:active,
.wa-btn-green:active,
.wa-btn-red:active { transform: scale(0.97); }

.wa-btn-outline:disabled,
.wa-btn-green:disabled,
.wa-btn-red:disabled { opacity: 0.5; cursor: not-allowed; }

.wa-btn-outline {
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  color: #ccc;
}

.wa-btn-green {
  background: #25D366;
  border: none;
  color: #fff;
}

.wa-btn-red {
  background: #FF3B30;
  border: none;
  color: #fff;
}

/* Unlink card specifics */
.unlink-card { text-align: center; }

.unlink-icon-frame {
  position: relative;
  width: 64px;
  height: 64px;
  margin-bottom: 20px;
}

.unlink-icon-bg {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.2);
}

.unlink-icon-inner {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #FF3B30;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
}

.phone-chip {
  font-size: 14px;
  font-weight: 700;
  color: #25D366;
  background: rgba(37, 211, 102, 0.1);
  border-radius: 20px;
  padding: 6px 14px;
  margin-bottom: 20px;
}

.unlink-message {
  font-size: 13px;
  color: #aaa;
  line-height: 1.5;
  margin: 0 0 24px;
  text-align: center;
}

.unlink-divider {
  width: 100%;
  border: none;
  border-top: 0.5px solid #333;
  margin: 0 0 16px;
}

/* Dialog transition */
.dialog-fade-enter-active,
.dialog-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.dialog-fade-enter-from,
.dialog-fade-leave-to { opacity: 0; }
.dialog-fade-enter-from .wa-card,
.dialog-fade-leave-to .wa-card { transform: scale(0.93); }

/* Recommendations Section */
.recommendations-section {
  padding: 0 16px 22px;
}

.rec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  min-height: 62px;
  padding: 12px 14px;
  margin-bottom: 12px;
  appearance: none;
  color: inherit;
  font: inherit;
  text-align: left;
  background: rgba(28, 28, 30, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.rec-header:hover {
  background: rgba(34, 34, 38, 0.9);
  border-color: rgba(255, 255, 255, 0.14);
}

.rec-header:focus-visible {
  outline: 2px solid rgba(245, 245, 247, 0.75);
  outline-offset: 2px;
}

.recommendations-section.is-collapsed .rec-header {
  margin-bottom: 0;
}

.rec-heading-copy {
  min-width: 0;
}

.rec-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.rec-toggle-label {
  color: #f5f5f7;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.rec-chevron {
  color: #d1d1d6;
  transition: transform 0.18s ease;
}

.rec-chevron.is-open {
  transform: rotate(180deg);
}

.rec-title {
  display: block;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
  color: #f5f5f7;
  margin: 0;
}

.rec-eyebrow {
  display: block;
  margin-bottom: 3px;
  color: #8e8e93;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.rec-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #d1d1d6;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rec-card {
  position: relative;
  background: rgba(28, 28, 30, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.rec-card:hover {
  background: rgba(34, 34, 38, 0.9);
  border-color: rgba(255, 255, 255, 0.14);
  transform: translateY(-1px);
}

.rec-card.rec-completed {
  opacity: 0.86;
  border-color: rgba(48, 209, 88, 0.22);
}

.rec-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.rec-card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.rec-priority,
.rec-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  color: #b8b8bf;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  white-space: nowrap;
}

.rec-priority {
  gap: 7px;
}

.rec-priority-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.04);
}

.priority-high .rec-priority {
  color: #ff6961;
}

.priority-medium .rec-priority {
  color: #ffb340;
}

.priority-low .rec-priority {
  color: #32d583;
}

.rec-status {
  padding: 0 8px;
  border-radius: 8px;
  background: rgba(48, 209, 88, 0.1);
  color: #32d583;
}

.rec-problem-content {
  min-width: 0;
}

.rec-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #7d7d85;
  margin-bottom: 7px;
}

.rec-description {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: #f5f5f7;
  margin: 0 0 12px;
  overflow-wrap: anywhere;
}

.rec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.rec-tag {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rec-tag.course {
  background: rgba(255, 255, 255, 0.06);
  color: #d7d7dc;
}

.rec-tag.topic {
  background: rgba(255, 255, 255, 0.04);
  color: #a9a9b1;
}

.rec-tag.task {
  background: rgba(48, 209, 88, 0.12);
  color: #30d158;
}

.rec-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  margin-bottom: 14px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}

.rec-metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  min-height: 64px;
  padding: 10px 8px;
  gap: 5px;
}

.rec-metric:not(:last-child) {
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.metric-value {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
  color: #f5f5f7;
  line-height: 1;
  text-align: center;
}

.metric-value.accuracy-low { color: #ff6961; }
.metric-value.accuracy-medium { color: #ffb340; }
.metric-value.accuracy-good { color: #32d583; }

.metric-value.trend {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 20px;
  color: #a9a9b1;
  font-size: 13px;
  font-weight: 700;
}

.metric-value.trend svg {
  width: 17px;
  height: 17px;
}

.metric-value.trend-improving { color: #32d583; }
.metric-value.trend-declining { color: #ff6961; }
.metric-value.trend-stable { color: #a9a9b1; }

.metric-label {
  font-size: 11px;
  font-weight: 600;
  color: #8e8e93;
  text-align: center;
  line-height: 1.15;
}

.rec-intervention {
  margin-bottom: 14px;
}

.rec-intervention-text {
  font-size: 14px;
  line-height: 1.45;
  color: #c7c7cc;
  margin: 0;
  overflow-wrap: anywhere;
}

.rec-results {
  border: 1px solid rgba(48, 209, 88, 0.18);
  background: rgba(48, 209, 88, 0.06);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 14px;
}

.results-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 10px;
}

.result-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.result-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0;
  color: #8e8e93;
}

.result-value {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0;
}

.result-value.low { color: #ff6961; }
.result-value.high { color: #32d583; }

.result-arrow {
  color: #32d583;
}

.improvement-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  background: rgba(48, 209, 88, 0.1);
  color: #32d583;
  font-size: 13px;
  font-weight: 700;
}

.rec-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.rec-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 0;
  height: 42px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.12s ease;
}

.rec-btn svg {
  flex: 0 0 auto;
}

.rec-btn:active {
  transform: scale(0.98);
}

.rec-btn-primary {
  background: #f5f5f7;
  border: none;
  color: #111114;
}

.rec-btn-primary:hover {
  background: #ffffff;
}

.rec-btn-secondary {
  background: rgba(255, 255, 255, 0.04);
  color: #e5e5ea;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.rec-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.16);
}

/* Loading skeleton */
.rec-loading {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rec-skeleton {
  background: rgba(28, 28, 30, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-line.w-60 { width: 60%; }
.skeleton-line.w-full { width: 100%; }
.skeleton-line.w-40 { width: 40%; }

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty state */
.recommendations-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 16px 22px;
  padding: 24px 18px;
  text-align: center;
  background: rgba(28, 28, 30, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.empty-icon {
  width: 46px;
  height: 46px;
  border-radius: 8px;
  background: rgba(48, 209, 88, 0.09);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #32d583;
  margin-bottom: 14px;
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-title {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #f5f5f7;
  margin: 0 0 6px;
}

.empty-sub {
  font-size: 14px;
  color: #a1a1a6;
  line-height: 1.45;
  margin: 0;
  max-width: 300px;
}

@media (max-width: 380px) {
  .rec-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .rec-header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .rec-actions {
    grid-template-columns: 1fr;
  }
}

/* List transitions */
.rec-list-enter-active,
.rec-list-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.rec-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.rec-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.rec-list-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Results fade transition */
.results-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.results-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

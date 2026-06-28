<template>
  <main class="session-link-page">
    <section class="session-link-panel" aria-live="polite">
      <div v-if="loading" class="spinner" aria-hidden="true"></div>
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <button v-if="error" type="button" @click="goToLogin">Ir al login</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { resolveSessionLink } from '@/infrastructure/api/tenantResolver'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')

const title = computed(() => error.value ? 'No se pudo iniciar sesion' : 'Iniciando sesion')
const message = computed(() => error.value || 'Estamos preparando tu acceso a CourseV.')

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] || '').trim()
  return String(value || '').trim()
}

function getSessionCode(): string {
  return firstQueryValue(route.query.k) ||
    firstQueryValue(route.query.code) ||
    firstQueryValue(route.params.code)
}

async function activateSession() {
  const code = getSessionCode()
  if (!code) {
    error.value = 'El link no tiene un codigo de sesion valido.'
    loading.value = false
    return
  }

  try {
    const result = await resolveSessionLink(code)
    await authStore.commitAuth(result)
    router.replace('/video')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'El link de sesion no es valido.'
    loading.value = false
  }
}

function goToLogin() {
  router.replace('/login')
}

onMounted(() => {
  void activateSession()
})
</script>

<style scoped>
.session-link-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f7f8fb;
  color: #111827;
}

.session-link-panel {
  width: min(100%, 360px);
  text-align: center;
}

.spinner {
  width: 34px;
  height: 34px;
  margin: 0 auto 18px;
  border-radius: 999px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #4f46e5;
  animation: spin 0.8s linear infinite;
}

h1 {
  margin: 0 0 8px;
  font-size: 22px;
  line-height: 1.2;
}

p {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
}

button {
  margin-top: 20px;
  border: 0;
  border-radius: 8px;
  padding: 12px 18px;
  color: #ffffff;
  background: #4f46e5;
  font-weight: 700;
  cursor: pointer;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

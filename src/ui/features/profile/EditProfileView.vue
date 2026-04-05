<template>
  <div class="edit-profile">
    <TopBar title="Editar Perfil" @back="$router.back()" />

    <div class="avatar-section">
      <div class="avatar-wrapper">
        <div class="avatar">
          <img v-if="form.avatar" :src="form.avatar" alt="" />
          <span v-else class="avatar-letter">{{ form.username[0]?.toUpperCase() ?? '?' }}</span>
        </div>
        <button class="camera-btn" @click="openFilePicker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
        </button>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileSelect" />
      </div>
    </div>

    <form class="form-sections" @submit.prevent="save">
      <section class="form-section">
        <h3 class="section-title">Información Personal</h3>
        <div class="form-grid">
          <AppInput v-model="form.nombre" label="Nombre" />
          <AppInput v-model="form.apellido" label="Apellido" />
        </div>
        <AppInput v-model="form.username" label="Nombre de usuario" />
      </section>

      <section class="form-section">
        <h3 class="section-title">Contacto</h3>
        <AppInput v-model="form.email" label="Correo electrónico" type="email" />
        <AppInput v-model="form.telefono" label="Teléfono" type="tel" />
      </section>

      <AppButton type="submit" :loading="saving" full>Guardar Cambios</AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { userAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const authStore = useAuthStore()
const fileInput = ref<HTMLInputElement>()
const saving = ref(false)

const form = reactive({
  nombre: '',
  apellido: '',
  username: '',
  email: '',
  telefono: '',
  avatar: ''
})

function openFilePicker() {
  fileInput.value?.click()
}

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    form.avatar = URL.createObjectURL(file)
  }
}

async function save() {
  saving.value = true
  try {
    await userAdapter.updateMyProfile({ username: form.username, email: form.email })
    await authStore.fetchProfile()
  } catch { /* empty */ }
  saving.value = false
}

onMounted(() => {
  const u = authStore.user
  if (u) {
    form.nombre = u.persona?.nombres ?? ''
    form.apellido = u.persona?.apellidos ?? ''
    form.username = u.username
    form.email = u.email ?? ''
    form.telefono = u.persona?.telefono ?? ''
    form.avatar = u.avatar ?? ''
  }
})
</script>

<style scoped>
.edit-profile {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--bg-primary);
  padding-bottom: max(40px, env(safe-area-inset-bottom, 0px) + 16px);
}

.avatar-section {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
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

.camera-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--purple-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-primary);
}

.form-sections {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>

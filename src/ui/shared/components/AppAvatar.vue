<template>
  <div class="avatar" :style="{ width: `${size}px`, height: `${size}px` }" :class="{ glow }">
    <img v-if="resolvedSrc && !hasError" :src="resolvedSrc" :alt="alt" @error="hasError = true" />
    <span v-else class="avatar-fallback">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { resolveImageUrl } from '@/infrastructure/api'

const props = defineProps<{
  src?: string | null
  alt?: string
  size?: number
  glow?: boolean
}>()

const hasError = ref(false)

// Reset error state when src changes
watch(() => props.src, () => { hasError.value = false })

const resolvedSrc = computed(() => resolveImageUrl(props.src ?? null))

const initials = computed(() => {
  if (!props.alt) return '?'
  return props.alt.slice(0, 2).toUpperCase()
})
</script>

<style scoped>
.avatar {
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar.glow {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  color: var(--purple-light);
  font-weight: 700;
  font-size: 40%;
}
</style>

<style scoped>
.avatar {
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar.glow {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  color: var(--purple-light);
  font-weight: 700;
  font-size: 40%;
}
</style>

<template>
  <div class="avatar" :style="{ width: `${size}px`, height: `${size}px` }" :class="{ glow }">
    <img v-if="src" :src="src" :alt="alt" @error="onError" />
    <span v-else class="avatar-fallback">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src?: string | null
  alt?: string
  size?: number
  glow?: boolean
}>()

const initials = computed(() => {
  if (!props.alt) return '?'
  return props.alt.slice(0, 2).toUpperCase()
})

function onError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}
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

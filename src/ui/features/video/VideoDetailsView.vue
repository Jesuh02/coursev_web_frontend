<template>
  <div class="video-details">
    <div class="video-player">
      <div class="player-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3" /></svg>
      </div>
    </div>

    <div class="details-content">
      <h1 class="video-title">{{ video?.title ?? 'Cargando...' }}</h1>
      <div class="video-meta">
        <span>{{ timeAgo(video?.created_at ?? '') }}</span>
      </div>

      <div class="actions-row">
        <button class="action-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
          <span>Me gusta</span>
        </button>
        <button class="action-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
          <span>Compartir</span>
        </button>
        <button class="action-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          <span>Guardar</span>
        </button>
      </div>

      <div class="creator-section">
        <div class="creator-avatar">
          <span class="avatar-letter">C</span>
        </div>
        <div class="creator-info">
          <p class="creator-name">Creador</p>
          <p class="creator-subs">0 suscriptores</p>
        </div>
        <button class="subscribe-btn">Suscribirse</button>
      </div>

      <div class="description-section">
        <p class="description-text">{{ video?.description ?? 'Sin descripción' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Video } from '@/domain/models'
import { videoAdapter } from '@/infrastructure/api'

const route = useRoute()
const video = ref<Video | null>(null)

function timeAgo(date: string) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Hoy'
  if (days < 7) return `hace ${days} días`
  return `hace ${Math.floor(days / 7)} semanas`
}

onMounted(async () => {
  const id = Number(route.params.videoId)
  try { video.value = await videoAdapter.getVideoById(id) } catch { /* empty */ }
})
</script>

<style scoped>
.video-details { min-height: 100vh; background: var(--bg-primary); }

.video-player {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #111;
}

.player-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

.details-content { padding: 16px; }

.video-title { font-size: 18px; font-weight: 700; color: #fff; line-height: 1.3; }

.video-meta {
  display: flex;
  gap: 6px;
  font-size: 13px;
  color: #8E8E93;
  margin-top: 6px;
}

.actions-row {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin: 12px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 12px;
}

.creator-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.creator-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-letter { font-size: 16px; font-weight: 600; color: #8E8E93; }
.creator-info { flex: 1; }
.creator-name { font-size: 15px; font-weight: 600; color: #fff; }
.creator-subs { font-size: 12px; color: #8E8E93; }

.subscribe-btn {
  padding: 8px 20px;
  border-radius: 20px;
  background: var(--purple-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.description-section { padding: 16px 0; }
.description-text { font-size: 14px; color: #ccc; line-height: 1.5; }
</style>

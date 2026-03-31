<template>
  <div class="upv-root">
    <!-- Back button -->
    <button class="upv-back" @click="$router.back()" aria-label="Volver">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>

    <!-- Scrollable content wrapper -->
    <div class="upv-scroll">

      <!-- ── Profile header (scrolls away) ── -->
      <div class="upv-profile-section">
        <div class="upv-profile-card">
          <!-- Avatar -->
          <div class="upv-avatar-ring">
            <img v-if="avatarUrl" :src="avatarUrl" class="upv-avatar" alt="" />
            <span v-else class="upv-avatar-letter">{{ user?.username?.[0]?.toUpperCase() ?? '?' }}</span>
          </div>
          <!-- Username -->
          <h2 class="upv-username">{{ user?.username ?? 'Usuario' }}</h2>
          <!-- Stats -->
          <div class="upv-stats-row">
            <div class="upv-stat-card">
              <span class="upv-stat-count">{{ allCourses.length }}</span>
              <span class="upv-stat-label">Cursos</span>
            </div>
            <div class="upv-stat-divider" />
            <div class="upv-stat-card">
              <span class="upv-stat-count">{{ allVideos.length }}</span>
              <span class="upv-stat-label">Videos</span>
            </div>
            <div class="upv-stat-divider" />
            <div class="upv-stat-card">
              <span class="upv-stat-count">{{ subscribersCount }}</span>
              <span class="upv-stat-label">Suscriptores</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Sticky: search bar + filter tabs ── -->
      <div class="upv-sticky-bar">
        <!-- Search bar -->
        <div class="upv-search-bar">
          <svg class="upv-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            class="upv-search-input"
            placeholder="Buscar en el contenido del usuario..."
            autocomplete="off"
          />
          <button v-if="searchQuery" class="upv-clear-btn" @click="searchQuery = ''" aria-label="Limpiar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Filter tabs -->
        <div class="upv-filter-tabs">
          <button
            :class="['upv-filter-tab', { 'active': currentFilter === 'courses' }]"
            @click="setFilter('courses')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="currentFilter === 'courses' ? '#1A1A1A' : '#fff'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Cursos</span>
            <span :class="['upv-tab-badge', { 'active': currentFilter === 'courses' }]">{{ allCourses.length }}</span>
          </button>
          <button
            :class="['upv-filter-tab', { 'active': currentFilter === 'videos' }]"
            @click="setFilter('videos')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="currentFilter === 'videos' ? '#1A1A1A' : '#fff'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span>Videos</span>
            <span :class="['upv-tab-badge', { 'active': currentFilter === 'videos' }]">{{ allVideos.length }}</span>
          </button>
        </div>
      </div>

      <!-- ── Content list ── -->
      <div class="upv-content-list">
        <!-- Loading -->
        <div v-if="loading" class="upv-loading">
          <div class="upv-spinner" />
        </div>

        <!-- Courses -->
        <template v-else-if="currentFilter === 'courses'">
          <template v-if="filteredCourses.length > 0">
            <div
              v-for="course in filteredCourses"
              :key="course.id"
              class="upv-course-card"
              @click="navigateToCourse(course)"
            >
              <div class="upv-course-thumb">
                <img v-if="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)" :src="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri) ?? ''" alt="" />
                <div v-else class="upv-thumb-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                </div>
                <span v-if="course.price > 0" class="upv-premium-badge">Premium</span>
                <span v-else class="upv-free-badge">Gratis</span>
              </div>
              <div class="upv-course-info">
                <h3 class="upv-course-title">{{ course.title }}</h3>
                <p v-if="course.description" class="upv-course-desc">{{ course.description }}</p>
                <div class="upv-course-meta">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>{{ course.studentCount ?? 0 }} estudiante{{ (course.studentCount ?? 0) !== 1 ? 's' : '' }}</span>
                  <span class="upv-dot">·</span>
                  <span class="upv-category">{{ course.category ?? 'General' }}</span>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="upv-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <p>No hay cursos disponibles</p>
          </div>
        </template>

        <!-- Videos -->
        <template v-else>
          <template v-if="filteredVideos.length > 0">
            <div
              v-for="video in filteredVideos"
              :key="video.id"
              class="upv-video-card"
              @click="navigateToVideo(video)"
            >
              <div class="upv-video-thumb">
                <img v-if="resolveImageUrl(video.thumbnail_uri ?? video.thumbnailUri)" :src="resolveImageUrl(video.thumbnail_uri ?? video.thumbnailUri) ?? ''" alt="" />
                <div v-else class="upv-thumb-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                </div>
                <div class="upv-play-overlay">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
              <div class="upv-video-info">
                <h3 class="upv-video-title">{{ video.title }}</h3>
                <p v-if="video.description" class="upv-video-desc">{{ video.description }}</p>
                <div class="upv-video-meta">
                  <span v-if="video.is_paid" class="upv-premium-tag">Premium</span>
                  <span v-else class="upv-free-tag">Gratis</span>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="upv-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            <p>No hay videos disponibles</p>
          </div>
        </template>
      </div>

      <!-- Spacer for bottom nav -->
      <div class="upv-bottom-spacer" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Course, Video, User } from '@/domain/models'
import { userAdapter, courseAdapter, videoAdapter, subscriptionAdapter, resolveImageUrl } from '@/infrastructure/api'

const route = useRoute()
const router = useRouter()

const user = ref<User | null>(null)
const allCourses = ref<Course[]>([])
const allVideos = ref<Video[]>([])
const subscribersCount = ref(0)
const loading = ref(true)
const searchQuery = ref('')
const currentFilter = ref<'courses' | 'videos'>('courses')

const avatarUrl = computed(() => resolveImageUrl(user.value?.avatar ?? null))

const filteredCourses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allCourses.value
  return allCourses.value.filter(c =>
    c.title.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
  )
})

const filteredVideos = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allVideos.value
  return allVideos.value.filter(v =>
    v.title.toLowerCase().includes(q) || (v.description ?? '').toLowerCase().includes(q)
  )
})

function setFilter(f: 'courses' | 'videos') {
  currentFilter.value = f
}

function navigateToCourse(course: Course) {
  router.push(`/courses/${course.id}`)
}

function navigateToVideo(video: Video) {
  router.push({
    name: 'videoHome',
    query: { videoId: String(video.id) },
  })
}

onMounted(async () => {
  const userId = Number(route.params.userId)
  if (!userId) return
  loading.value = true
  try {
    const [fetchedUser, fetchedSubscribers] = await Promise.all([
      userAdapter.getUserById(userId),
      subscriptionAdapter.getSubscriberCount(userId).catch(() => 0),
    ])
    user.value = fetchedUser
    subscribersCount.value = fetchedSubscribers

    const [fetchedCourses, fetchedVideos] = await Promise.all([
      courseAdapter.getCoursesByCreatorId(userId).catch(() => [] as Course[]),
      videoAdapter.getVideosByCreator(fetchedUser.username).catch(() => [] as Video[]),
    ])
    allCourses.value = fetchedCourses
    allVideos.value = fetchedVideos
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ── Root ── */
.upv-root {
  position: relative;
  min-height: 100vh;
  background: #000;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── Back button ── */
.upv-back {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 50;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.upv-back:hover { background: rgba(255,255,255,0.12); }

/* ── Scroll container ── */
.upv-scroll {
  overflow-y: auto;
  height: 100vh;
  padding-top: 0;
}

/* ── Profile section ── */
.upv-profile-section {
  padding: 72px 16px 0;
}

.upv-profile-card {
  background: #111;
  border-radius: 24px;
  padding: 32px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

/* Avatar */
.upv-avatar-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #A259FF;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #222;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.upv-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upv-avatar-letter {
  font-size: 42px;
  font-weight: 700;
  color: #A259FF;
  line-height: 1;
}

/* Username */
.upv-username {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 20px;
  text-align: center;
  letter-spacing: -0.3px;
}

/* Stats */
.upv-stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
}

.upv-stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: #1C1C1E;
  border-radius: 16px;
  margin: 0 4px;
}

.upv-stat-divider {
  display: none;
}

.upv-stat-count {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.upv-stat-label {
  font-size: 11px;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

/* ── Sticky bar (search + filter tabs) ── */
.upv-sticky-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #000;
  padding: 12px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Search bar */
.upv-search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  height: 48px;
  padding: 0 12px;
  gap: 10px;
}

.upv-search-icon {
  flex-shrink: 0;
}

.upv-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
}

.upv-search-input::placeholder {
  color: rgba(255, 255, 255, 0.38);
}

.upv-clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  flex-shrink: 0;
}

/* Filter tabs */
.upv-filter-tabs {
  display: flex;
  gap: 8px;
}

.upv-filter-tab {
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.75);
}

.upv-filter-tab.active {
  background: #fff;
  color: #1A1A1A;
}

.upv-tab-badge {
  min-width: 20px;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}

.upv-tab-badge.active {
  background: #1A1A1A;
  color: #fff;
}

/* ── Content list ── */
.upv-content-list {
  padding: 8px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Loading */
.upv-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.upv-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #A259FF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Empty state */
.upv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: #555;
  font-size: 15px;
}

/* ── Course card ── */
.upv-course-card {
  display: flex;
  gap: 14px;
  background: #111;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: background 0.18s;
  padding: 0;
}

.upv-course-card:hover { background: #181818; }

.upv-course-thumb {
  position: relative;
  width: 118px;
  min-width: 118px;
  aspect-ratio: 16 / 9;
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  align-self: center;
  margin: 10px 0 10px 10px;
}

.upv-course-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upv-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upv-premium-badge,
.upv-free-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 7px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.upv-premium-badge {
  background: rgba(162, 89, 255, 0.9);
  color: #fff;
}

.upv-free-badge {
  background: rgba(48, 209, 88, 0.85);
  color: #fff;
}

.upv-course-info {
  flex: 1;
  padding: 12px 14px 12px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  min-width: 0;
}

.upv-course-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.upv-course-desc {
  font-size: 12px;
  color: #8E8E93;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.upv-course-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #8E8E93;
}

.upv-dot { color: #555; }

.upv-category {
  background: rgba(255,255,255,0.08);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  color: #ccc;
}

/* ── Video card ── */
.upv-video-card {
  display: flex;
  gap: 14px;
  background: #111;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: background 0.18s;
}

.upv-video-card:hover { background: #181818; }

.upv-video-thumb {
  position: relative;
  width: 118px;
  min-width: 118px;
  aspect-ratio: 16 / 9;
  background: #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  align-self: center;
  margin: 10px 0 10px 10px;
}

.upv-video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upv-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.18s;
}

.upv-video-card:hover .upv-play-overlay {
  background: rgba(0, 0, 0, 0.2);
}

.upv-video-info {
  flex: 1;
  padding: 12px 14px 12px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  min-width: 0;
}

.upv-video-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.upv-video-desc {
  font-size: 12px;
  color: #8E8E93;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.upv-video-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.upv-premium-tag {
  font-size: 11px;
  font-weight: 700;
  color: #A259FF;
  background: rgba(162, 89, 255, 0.12);
  padding: 2px 8px;
  border-radius: 8px;
}

.upv-free-tag {
  font-size: 11px;
  font-weight: 700;
  color: #30D158;
  background: rgba(48, 209, 88, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

/* Bottom spacer for nav */
.upv-bottom-spacer {
  height: 90px;
}
</style>

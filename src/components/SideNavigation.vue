<template>
  <nav class="side-nav">
    <div class="nav-header">
      <img src="/icon-192.png" alt="CourseV Logo" class="nav-logo" />
    </div>

    <ul class="nav-list">
      <li v-for="(item, i) in navItems" :key="item.route" class="nav-list-item">
        <button
          :class="['nav-link', { active: isActive(item.route) }]"
          :title="item.label"
          @click="navigate(item.route)"
        >
          <span class="nav-icon">
            <component :is="item.icon" :size="24" />
            <span v-if="item.badge && item.badge > 0" class="badge">
              {{ item.badge }}
            </span>
          </span>
          <span class="nav-text">{{ item.label }}</span>
        </button>

        <button
          v-if="i === 1 && canCreateContent"
          class="nav-link create-btn"
          title="Crear contenido"
          @click="navigate('/upload')"
        >
          <span class="nav-icon">
            <span class="create-icon">+</span>
          </span>
          <span class="nav-text">Crear</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation'

const { navItems, isActive, navigate, canCreateContent } = useNavigation()
</script>

<style scoped>
.side-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100px;
  display: flex;
  flex-direction: column;
  background: #000;
  border-right: 1px solid var(--border-color);
  padding-top: 16px;
  z-index: 100;
  overflow: hidden;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  margin-bottom: 16px;
}

.nav-logo {
  width: 65px;
  height: 65px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-list-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 12px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
  position: relative;
}

.nav-link:hover {
  background: rgba(139, 92, 246, 0.1);
}

.nav-link.active {
  background: rgba(139, 92, 246, 0.15);
}

.nav-link.active .nav-text {
  color: #fff;
}

.nav-link.active :deep(svg) {
  color: #fff;
}

.nav-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.nav-text {
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  color: var(--text-muted);
  transition: color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

:deep(svg) {
  color: var(--text-muted);
  transition: color 0.2s;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  height: 18px;
  background: var(--red-netflix);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

.create-btn {
  margin-top: 4px;
}

.create-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-primary), #00D4FF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 300;
  color: #fff;
  line-height: 1;
}

/* Responsividad: Mostrar solo en pantallas grandes */
@media (max-width: 768px) {
  .side-nav {
    display: none;
  }
}
</style>

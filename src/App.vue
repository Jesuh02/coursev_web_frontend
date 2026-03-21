<template>
  <div class="app-shell">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <BottomNavigation v-if="showNav" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import BottomNavigation from '@/components/BottomNavigation.vue'

const route = useRoute()
const authStore = useAuthStore()
const showNav = computed(() => !route.meta.hideNav)

onMounted(() => {
  authStore.fetchProfile()
})
</script>

<style scoped>
.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}
</style>

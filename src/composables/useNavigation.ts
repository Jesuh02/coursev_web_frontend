import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { useAuthStore } from '@/stores/authStore'
import IconHome from '@/ui/shared/icons/IconHome.vue'
import IconExplore from '@/ui/shared/icons/IconExplore.vue'
import IconActivity from '@/ui/shared/icons/IconActivity.vue'
import IconProfile from '@/ui/shared/icons/IconProfile.vue'

export interface NavItem {
  route: string
  label: string
  icon: any
  badge?: number
}

/**
 * Composable que centraliza la lógica de navegación.
 * Sigue el principio de Single Responsibility.
 */
export function useNavigation() {
  const router = useRouter()
  const route = useRoute()
  const notificationStore = useNotificationStore()
  const authStore = useAuthStore()

  const navItems = computed<NavItem[]>(() => [
    { route: '/video', label: 'Inicio', icon: IconHome, badge: 0 },
    { route: '/explore', label: 'Explorar', icon: IconExplore, badge: 0 },
    {
      route: '/notifications',
      label: 'Actividad',
      icon: IconActivity,
      badge: notificationStore.unreadCount,
    },
    { route: '/profile', label: 'Perfil', icon: IconProfile, badge: 0 },
  ])

  const isActive = (path: string): boolean => route.path === path

  const navigate = (path: string): void => {
    router.push(path)
  }

  const canCreateContent = computed(() => authStore.isCreator)

  return {
    navItems,
    isActive,
    navigate,
    canCreateContent,
  }
}

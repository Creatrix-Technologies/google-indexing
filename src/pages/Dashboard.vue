<!--
  Dashboard router shell.
  ─────────────────────────────────────────────────────────────
  Renders the appropriate dashboard for the current user:
    • AdminDashboard   — when admin-only menus are present
                         (Users / plans / StripeKeys / GoogleKeys)
    • TenantDashboard  — default for regular tenants

  TODO (long-term): replace this client-side detection with a
  backend menu change — give the admin dashboard menu item
  `component: "AdminDashboard"` so this shell can be removed.
-->
<template>
  <component :is="dashboardComponent" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useMenuStore, type Menu } from '../Store/menu'

const ADMIN_COMPONENTS = ['Users', 'plans', 'StripeKeys', 'GoogleKeys']

const TenantDashboard = defineAsyncComponent(() => import('./TenantDashboard.vue'))
const AdminDashboard  = defineAsyncComponent(() => import('./AdminDashboard.vue'))

const menuStore = useMenuStore()

const flatMenus = computed<Menu[]>(() => {
  const flat: Menu[] = []
  const walk = (items?: Menu[]) => {
    for (const item of items || []) {
      flat.push(item)
      if (item.children?.length) walk(item.children)
    }
  }
  walk(menuStore.menus)
  return flat
})

const isAdmin = computed(() =>
  flatMenus.value.some(m => m.component && ADMIN_COMPONENTS.includes(m.component))
)

const dashboardComponent = computed(() =>
  isAdmin.value ? AdminDashboard : TenantDashboard
)
</script>

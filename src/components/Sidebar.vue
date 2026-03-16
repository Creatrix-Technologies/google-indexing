<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
        </svg>
      </div>
      <span v-if="!collapsed" class="logo-text">Site Booster</span>
    </div>

    <!-- Menu -->
    <nav class="menu">
      <template v-for="menu in menus" :key="menu.id">
        <!-- Only show menu if showInMenu is true -->
        <div v-if="menu.showInMenu">
          
          <!-- Menu with children -->
          <div
            v-if="menu.children && menu.children.length > 0 && !collapsed"
            class="menu-group"
          >
            <div class="menu-item" @click="toggleSubmenu(menu.id)">
              <span class="menu-icon">
                <i :class="menu.icon"></i>
              </span>
              <span class="menu-label">{{ menu.title }}</span>
              <span class="arrow" :class="{ open: openMenus.includes(menu.id) }">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </div>
            <div v-if="openMenus.includes(menu.id)" class="submenu">
              <router-link
                v-for="child in menu.children"
                :key="child.id"
                :to="child.path"
                class="submenu-item"
                active-class="active-sub"
              >
                <span class="menu-icon">
                  <i :class="child.icon"></i>
                </span>
                <span class="menu-label">{{ child.title }}</span>
              </router-link>
            </div>
          </div>

          <!-- Menu without children -->
          <router-link
            v-else
            :to="menu.path"
            class="menu-item"
            active-class="active"
          >
            <span class="menu-icon">
              <i :class="menu.icon"></i>
            </span>
            <span v-if="!collapsed" class="menu-label">{{ menu.title }}</span>
          </router-link>

        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps({
  collapsed: Boolean,
  isMobile: Boolean
});

const emit = defineEmits(["update:collapsed"]);

const menus = ref<any[]>([]);
const openMenus = ref<number[]>([]);

// Toggle submenu open/close
const toggleSubmenu = (id: number) => {
  if (openMenus.value.includes(id)) {
    openMenus.value = openMenus.value.filter(mid => mid !== id);
  } else {
    openMenus.value.push(id);
  }
};

// Load menu from localStorage (or API later)
onMounted(() => {
  const menuData = localStorage.getItem("menu");
  if (menuData) {
    const parsed = JSON.parse(menuData);
    menus.value = parsed.menus || [];
  }
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
  padding: 16px 12px;
  transition: width 0.3s ease, transform 0.3s ease;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 72px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.logo-text {
  color: var(--color-text);
  font-weight: 600;
  font-size: 18px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 22px;
  height: 22px;
}

.menu-icon {
  width: 20px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon i {
  font-size: 1rem;
  line-height: 1;
  color: inherit;
}

.menu-label {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--color-sidebar-text-muted);
  text-decoration: none;
  cursor: pointer;
  transition: background var(--transition-base), color var(--transition-base);
  position: relative;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  border-radius: 0 2px 2px 0;
  background: var(--color-primary);
  transition: height var(--transition-base);
}

.menu-item.active {
  background: var(--color-sidebar-active-bg);
  color: var(--color-sidebar-active-text);
}

.menu-item.active::before {
  height: 20px;
}

.menu-item:hover {
  background: var(--color-sidebar-hover);
  color: var(--color-sidebar-text);
}

.submenu {
  margin-left: 20px;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: submenuSlide 0.2s ease;
}

@keyframes submenuSlide {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  color: var(--color-sidebar-text-muted);
  text-decoration: none;
  transition: background var(--transition-base), color var(--transition-base);
}

.submenu-item:hover {
  background: var(--color-sidebar-hover);
  color: var(--color-sidebar-text);
}

.submenu-item.active-sub {
  font-weight: 600;
  color: var(--color-primary);
}

.arrow {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: transform 0.2s;
}

.arrow svg {
  flex-shrink: 0;
}

.arrow.open {
  transform: rotate(180deg);
}

/* Mobile overlay */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 260px;
    transition: transform 0.3s ease;
  }
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>

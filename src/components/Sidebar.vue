<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-icon">SB</div>
      <span v-if="!collapsed" class="logo-text">Site Booster</span>
    </div>

    <!-- Menu -->
    <nav class="menu">
      <template v-for="menu in menus" :key="menu.id">
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
              <span class="arrow" :class="{ open: openMenus.includes(menu.id) }">▾</span>
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

const toggleSubmenu = (id: number) => {
  if (openMenus.value.includes(id)) {
    openMenus.value = openMenus.value.filter(mid => mid !== id);
  } else {
    openMenus.value.push(id);
  }
};

onMounted(() => {
  const menuData = localStorage.getItem("menu");
  if (menuData) {
    const parsed = JSON.parse(menuData);
    menus.value = parsed.menus || [];
  }
});
</script>

<style scoped>
/* Sidebar panel */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: fit-content;
  min-width: 220px;
  max-width: 400px;
  height: 100vh;
  background: #0d524c; /* Dark teal green */
  border-right: 1px solid #12756b;
  padding: 16px;
  transition: width 0.3s ease, transform 0.3s ease;
  overflow-y: auto;
  overflow-x: auto;
  z-index: 2000;
}

.sidebar.collapsed {
  width: 60px;
  overflow-x: hidden;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo-text {
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  color: #e0f7f4; /* light teal text */
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  font-size: 12px;
  background: #08403a; /* darker teal */
  color: #fff;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

/* Menu */
.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  color: #b2e0dc; /* light teal text */
  text-decoration: none;
  cursor: pointer;
  font-size: 13px;
  gap: 8px;
  white-space: nowrap;
}

.menu-item.active {
  background: #08403a; /* active dark teal */
  color: #fff;
}

.menu-item:hover:not(.active) {
  background: #0b3b36; /* hover dark teal */
  color: #fff;
}

.menu-icon {
  flex-shrink: 0;
  width: 1.25rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.menu-label {
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
}

/* Submenu */
.submenu {
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.submenu-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  color: #a0d9d5;
  text-decoration: none;
  font-size: 12px;
  gap: 8px;
  white-space: nowrap;
}

.submenu-item.active-sub {
  font-weight: 600;
  color: #ffffff;
  background: #08403a;
}

/* Arrow */
.arrow {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 11px;
  opacity: 0.75;
  transition: transform 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: fit-content;
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>
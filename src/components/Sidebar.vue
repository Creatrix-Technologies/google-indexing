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
  width: fit-content;              /* 🔥 auto expand */
  min-width: 220px;                /* base width */
  max-width: 400px;                /* prevent too wide */
  height: 100vh;
  background: var(--color-card-bg);
  border-right: 1px solid var(--color-border);
  padding: var(--space-2);
  transition: width 0.3s ease, transform 0.3s ease;
  overflow-y: auto;
  overflow-x: auto;                /* 🔥 allow horizontal growth */
  z-index: 1000;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
  overflow-x: hidden;              /* keep collapsed clean */
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.logo-text {
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  font-size: 12px;
  background: var(--color-accent);
  color: #fff;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-sm);
}

/* Menu */
.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  text-decoration: none;
  cursor: pointer;
  font-size: 13px;
  gap: 8px;
  white-space: nowrap;             /* 🔥 prevent wrapping */
}

.menu-item.active {
  background: var(--color-accent);
  color: #fff;
}

.menu-item:hover:not(.active) {
  background: var(--color-placeholder);
  color: var(--color-text);
}

.menu-icon {
  flex-shrink: 0;
  width: 1.25rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.menu-label {
  white-space: nowrap;             /* 🔥 single line */
  overflow: visible;               /* 🔥 no hiding */
  text-overflow: unset;            /* 🔥 no ellipsis */
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
  padding: 6px var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  text-decoration: none;
  font-size: 12px;
  gap: 8px;
  white-space: nowrap;             /* 🔥 no wrap */
}

.submenu-item .menu-icon {
  margin-right: 0;
}

.submenu-item.active-sub {
  font-weight: 600;
  color: var(--color-accent);
  background: var(--color-accent-muted);
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

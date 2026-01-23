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
                <span class="menu-icon" style="margin-right:10px;">
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
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 20px;
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
  margin-bottom: 30px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: #22c55e;
  color: #fff;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  color: #666;
  text-decoration: none;
  cursor: pointer;
}

.menu-item.active {
  background: #22c55e;
  color: #fff;
}

.menu-item:hover {
  background: #f5f5f5;
}

.submenu {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.submenu-item {
  padding: 8px 12px;
  border-radius: 6px;
  color: #666;
  text-decoration: none;
}

.submenu-item.active-sub {
  font-weight: 600;
  color: #16a34a;
}

.arrow {
  margin-left: auto;
  transition: transform 0.2s;
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

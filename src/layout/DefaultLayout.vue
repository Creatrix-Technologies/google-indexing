<template>
  <div
    class="app-container"
    :class="{ 'layout-sidebar-desktop-collapsed': isCollapsed && !isMobile }"
  >
    <!-- Sidebar -->
    <Sidebar v-model:collapsed="isCollapsed" />

    <!-- Overlay for mobile -->
    <div
      v-if="isMobile && !isCollapsed"
      class="overlay"
      @click="toggleSidebar"
    ></div>

    <!-- Main content -->
    <div class="main-content">
      <Header
        :is-open="!isCollapsed"
        :is-mobile="isMobile"
        @toggle-sidebar="toggleSidebar"
      />
      <div class="page-wrapper">
        <router-view />
      </div>
    </div>
    <FrontendAssistant />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Sidebar from "../components/Sidebar.vue";
import Header from "../components/Header.vue";
import FrontendAssistant from "../components/FrontendAssistant.vue";

/** Sidebar overlay drawer below this width (split-screen half desktops ~960–1024px). Keep CSS media queries in sync. */
const DRAWER_BREAKPOINT_PX = 1024;

const isCollapsed = ref(false);
const isMobile = ref(window.innerWidth <= DRAWER_BREAKPOINT_PX);

const handleResize = () => {
  isMobile.value = window.innerWidth <= DRAWER_BREAKPOINT_PX;
  if (!isMobile.value) isCollapsed.value = false; // desktop: expanded
  else isCollapsed.value = true; // drawer: hidden by default
};

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

.main-content {
  flex: 1;
  min-width: 0;
  margin-left: var(--sidebar-width, 240px);
  transition: margin-left 240ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.layout-sidebar-desktop-collapsed .main-content {
  margin-left: var(--sidebar-collapsed, 64px);
}

.main-content .page-wrapper {
  /* Fluid full-width content with responsive horizontal padding.
     Grows from 16px on small screens to 40px on ultra-wide displays. */
  padding: var(--space-6) clamp(16px, 2.4vw, 40px) var(--space-7);
  min-height: calc(100vh - var(--header-height));
  box-sizing: border-box;
  width: 100%;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
  }

  .main-content .page-wrapper {
    padding: var(--space-4) var(--space-3) var(--space-5);
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.50);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    z-index: 150;
    animation: overlay-in 160ms ease-out;
  }
}

@keyframes overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>

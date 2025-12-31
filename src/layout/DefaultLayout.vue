<template>
  <div class="app-container">
    <!-- Sidebar -->
    <Sidebar
      v-model:collapsed="isCollapsed"
      :is-mobile="isMobile"
    />

    <!-- Overlay for mobile -->
    <div
      v-if="isMobile && !isCollapsed"
      class="overlay"
      @click="toggleSidebar"
    ></div>

    <!-- Main content -->
    <div class="main-content">
      <Header :isOpen="!isCollapsed" @toggle-sidebar="toggleSidebar" />
      <div class="page-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Sidebar from "../components/Sidebar.vue";
import Header from "../components/Header.vue";

const isCollapsed = ref(false);
const isMobile = ref(window.innerWidth <= 768);

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) isCollapsed.value = false; // desktop: expanded
  else isCollapsed.value = true; // mobile: hidden by default
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
}

/* Main content margin according to sidebar */
.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}

.sidebar.collapsed + .main-content {
  margin-left: 72px;
}

.main-content .page-wrapper {
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    z-index: 999;
  }
}
</style>

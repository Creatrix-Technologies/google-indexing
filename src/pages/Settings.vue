<template>
  <div class="settings-container">
    <!-- Fixed Header -->
    <div class="settings-header">
      <h1>Settings</h1>

      <div class="settings-menu">
        <router-link
          to="/settings/google-configuration"
          class="menu-item"
          active-class="active"
        >
          🔑 Google Configuration
        </router-link>

        <router-link
          to="/settings/schedule-configuration"
          class="menu-item"
          active-class="active"
        >
          ⏰ Schedule Configuration
        </router-link>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="settings-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.settings-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

/* Header (Fixed) */
.settings-header {
  padding: 14px 16px 0;
  flex-shrink: 0;
}

.settings-header h1 {
  margin-bottom: 10px;
  font-size: 22px;
  font-weight: 700;
}

/* Menu */
.settings-menu {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.menu-item {
  padding: 8px 12px;
  font-size: 13px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  border-bottom: 2px solid transparent;
}

.menu-item.active {
  color: #2563eb;
  border-color: #2563eb;
}

/* ===== Scroll Area ===== */
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* Optional: smooth scrolling */
.settings-content {
  scroll-behavior: smooth;
}

/* Responsive */
@media (max-width: 640px) {
  .settings-header h1 {
    font-size: 22px;
  }

  .settings-content {
    padding: 16px;
  }
}
</style>

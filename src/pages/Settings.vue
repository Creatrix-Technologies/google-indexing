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
  background: var(--color-bg);
}

/* Header (Fixed) */
.settings-header {
  padding: 24px;
  padding-bottom: 0;
  flex-shrink: 0;
}

.settings-header h1 {
  margin-bottom: 16px;
  font-size: 28px;
  font-weight: 700;
}

/* Menu */
.settings-menu {
  display: flex;
  gap: 16px;
  border-bottom: 1px solid var(--color-border);
}

.menu-item {
  padding: 12px 14px;
  text-decoration: none;
  color: var(--color-text-muted);
  font-weight: 500;
  border-bottom: 2px solid transparent;
}

.menu-item.active {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

/* ===== Scroll Area ===== */
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
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

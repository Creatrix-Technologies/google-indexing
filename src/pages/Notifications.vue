<template>
  <div class="notifications page-container">
    <div class="notifications-card">
      <h3>Notifications</h3>
      <p class="subtitle">Display notification alerts in your application</p>
      
      <div class="notifications-list">
        <div class="notification info">
          <span class="notification-icon">ℹ️</span>
          <div class="notification-content">
            <h5>Info Notification</h5>
            <p>This is an informational notification message</p>
          </div>
          <button class="close-btn">✕</button>
        </div>

        <div class="notification success">
          <span class="notification-icon">✓</span>
          <div class="notification-content">
            <h5>Success Notification</h5>
            <p>Your action has been completed successfully</p>
          </div>
          <button class="close-btn">✕</button>
        </div>

        <div class="notification warning">
          <span class="notification-icon">⚠️</span>
          <div class="notification-content">
            <h5>Warning Notification</h5>
            <p>Please be careful with this action</p>
          </div>
          <button class="close-btn">✕</button>
        </div>

        <div class="notification danger">
          <span class="notification-icon">✕</span>
          <div class="notification-content">
            <h5>Danger Notification</h5>
            <p>An error has occurred, please try again</p>
          </div>
          <button class="close-btn">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page-container {
  padding: 0;
  overflow-y: auto;
  font-family: var(--font-family);
}

.notifications-card {
  background: var(--color-card-bg);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
}

.notifications-card h3 {
  margin: 0 0 4px 0;
  font-size: var(--fs-lg);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tight);
  color: var(--color-text);
}

.subtitle {
  margin: 0 0 var(--space-5) 0;
  color: var(--color-text-secondary);
  font-size: var(--fs-base);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-card-bg);
  position: relative;
}

.notification::before {
  content: "";
  position: absolute;
  left: 0;
  top: var(--space-3);
  bottom: var(--space-3);
  width: 2px;
  border-radius: 2px;
}

.notification.info::before    { background: var(--info-500); }
.notification.success::before { background: var(--success-500); }
.notification.warning::before { background: var(--warning-500); }
.notification.danger::before  { background: var(--danger-500); }

.notification.info    { background: var(--info-50);    border-color: var(--info-100); }
.notification.success { background: var(--success-50); border-color: var(--success-100); }
.notification.warning { background: var(--warning-50); border-color: var(--warning-100); }
.notification.danger  { background: var(--danger-50);  border-color: var(--danger-100); }

.notification-icon {
  font-size: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h5 {
  margin: 0 0 3px 0;
  font-size: var(--fs-base);
  font-weight: var(--fw-semi);
  letter-spacing: -0.005em;
}

.notification.info h5    { color: var(--info-700); }
.notification.success h5 { color: var(--success-700); }
.notification.warning h5 { color: var(--warning-700); }
.notification.danger h5  { color: var(--danger-700); }

.notification-content p {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.close-btn {
  background: transparent;
  border: 1px solid transparent;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 140ms ease, color 140ms ease;
}

.close-btn:hover {
  color: var(--color-text);
  background: rgba(17, 24, 39, 0.05);
}
</style>

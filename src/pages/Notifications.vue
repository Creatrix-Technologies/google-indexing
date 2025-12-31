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
  padding: 20px 30px;
  overflow-y: auto;
}

.notifications-card {
  background: white;
  padding: 30px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.notifications-card h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.subtitle {
  margin: 0 0 30px 0;
  color: #999;
  font-size: 14px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid;
}

.notification.info {
  background: #e3f2fd;
  border-left-color: #2196f3;
}

.notification.success {
  background: #e8f5e9;
  border-left-color: #4caf50;
}

.notification.warning {
  background: #fff3e0;
  border-left-color: #ff9800;
}

.notification.danger {
  background: #ffebee;
  border-left-color: #f44336;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.notification-content {
  flex: 1;
}

.notification-content h5 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
}

.notification.info h5 {
  color: #1976d2;
}

.notification.success h5 {
  color: #388e3c;
}

.notification.warning h5 {
  color: #f57c00;
}

.notification.danger h5 {
  color: #d32f2f;
}

.notification-content p {
  margin: 0;
  font-size: 13px;
  color: #555;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 0;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #666;
}
</style>

<template>
  <header class="header">
    <div class="header-left"></div>

    <div class="header-right">
      <div class="profile-actions">
        <span class="user-avatar" :title="authStore.userEmail">
  {{ authStore.userName.charAt(0).toUpperCase() }}
</span>{{ authStore.userName }}
        <!-- Logout Icon next to Account -->
        <button class="logout-btn" @click="handleLogout" title="Logout">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-logout" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { logout,useAuthStore } from '../Store/auth'; // use alias for cleaner path

const authStore = useAuthStore();

const handleLogout = () => {
  logout(); // calls auth.ts logout function
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  height: 70px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 8px; /* space between avatar, name, and icon */
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.icon-logout {
  width: 18px;
  height: 18px;
  stroke: #333;
  stroke-width: 2;
  display: block;
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
}
</style>

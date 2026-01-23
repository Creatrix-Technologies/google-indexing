<template>

  <!-- Header -->
  <header class="header">
    <div class="header-left"></div>

    <div class="header-right">
      <div class="profile-actions">
       <!-- Subscription Status Icon -->
<span
  v-if="!subscriptionStore.isChecking"
  class="subscription-wrapper"
  :title="subscriptionStore.isValid
    ? `Subscription Active (Expire Date: ${formatDate(subscriptionStore.expiresAt)})`
    : 'Subscription Expired'"
>
  <!-- ACTIVE -->
  <svg
    v-if="subscriptionStore.isValid"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="subscription-icon valid"
    fill="currentColor"
  >
    <path
      fill-rule="evenodd"
      d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4zm3.53 7.47a.75.75 0 00-1.06-1.06L11 11.88 9.53 10.4a.75.75 0 10-1.06 1.06l2 2a.75.75 0 001.06 0l4-4z"
      clip-rule="evenodd"
    />
  </svg>

  <!-- INACTIVE -->
  <svg
    v-else
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="subscription-icon invalid"
    fill="currentColor"
  >
    <path
      fill-rule="evenodd"
      d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4zm3 7.5a.75.75 0 00-1.06-1.06L12 10.38l-1.94-1.94a.75.75 0 10-1.06 1.06L10.94 11.5l-1.94 1.94a.75.75 0 101.06 1.06L12 12.62l1.94 1.94a.75.75 0 101.06-1.06L13.06 11.5l1.94-1.94z"
      clip-rule="evenodd"
    />
  </svg>
</span>

        <!-- User Avatar -->
        <span class="user-avatar" :title="authStore.userEmail">
          {{ authStore.userName.charAt(0).toUpperCase() }}
        </span>

        <!-- User Name -->
        <span class="user-name">
          {{ authStore.userName }}
        </span>

        <!-- Logout -->
        <button class="logout-btn" @click="handleLogout" title="Logout">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon-logout"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>

    <!-- Google Config Warning -->
    <div
    v-if="!googleConfigStore.isValid && !googleConfigStore.isChecking"
    class="google-config-bar"
  >
    <span>
      ⚠️ Google configuration is missing or invalid, which may result in missing
      or incomplete data. Please update your Google configuration to access all
      features.
    </span>
    <router-link to="/settings/google-configuration" class="config-link">
      Connect Now
    </router-link>
  </div>

</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { logout, useAuthStore } from '../Store/auth'
import { useGoogleConfigStore } from '../Shared/googleConfig'
import { useSubscriptionStore } from '../Shared/subscription'

const authStore = useAuthStore()
const googleConfigStore = useGoogleConfigStore()
const subscriptionStore = useSubscriptionStore()

onMounted(() => {
  googleConfigStore.check()
  subscriptionStore.checkSubscription()
})

const handleLogout = () => {
  logout()
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

</script>

<style scoped>
/* Google Config Warning Bar */
.google-config-bar {
  position: sticky;
  top: 0;
  z-index: 3000;
  background: #fef3c7;
  color: #92400e;
  padding: 10px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid #fde68a;
}

.config-link {
  background: #f59e0b;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
}

.config-link:hover {
  background: #d97706;
}

/* Header Styles */
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
  gap: 10px;
}

/* Subscription Wrapper (Large Icon) */
.subscription-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Subscription Icon (Large SVG) */
.subscription-icon {
  width: 26px;
  height: 26px;
}

.subscription-icon.valid {
  color: #22c55e;
}

.subscription-icon.invalid {
  color: #ef4444;
}

/* User Avatar */
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

/* User Name */
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* Logout */
.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.icon-logout {
  width: 18px;
  height: 18px;
  stroke: #333;
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
}
</style>

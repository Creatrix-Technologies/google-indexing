<template>

  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <span class="breadcrumb-item">{{ breadcrumbTitle }}</span>
      </nav>
    </div>

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
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { logout, useAuthStore } from '../Store/auth'
import { useGoogleConfigStore } from '../Shared/googleConfig'
import { useSubscriptionStore } from '../Shared/subscription'

const route = useRoute()
const authStore = useAuthStore()

const breadcrumbTitle = computed(() => {
  const meta = route.meta as { title?: string }
  return meta?.title || (typeof route.name === 'string' ? route.name : 'Dashboard')
})
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
  top: 70px;
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-slate-800);
  padding: 10px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid var(--color-warning);
}

.config-link {
  background: var(--color-warning);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
}

.config-link:hover {
  background: var(--color-warning-hover);
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: var(--color-card);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  height: 70px;
}

.breadcrumbs {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.breadcrumb-item {
  font-weight: 500;
  color: var(--color-text);
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
  background: var(--color-slate-50);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);
}

.subscription-wrapper:hover {
  transform: scale(1.08);
}

/* Subscription Icon (Large SVG) */
.subscription-icon {
  width: 26px;
  height: 26px;
}

.subscription-icon.valid {
  color: var(--color-success);
}

.subscription-icon.invalid {
  color: var(--color-error);
}

/* User Avatar */
.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  border: 2px solid var(--color-slate-200);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(30, 64, 175, 0.3);
}

/* User Name */
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

/* Logout */
.logout-btn {
  background: var(--color-slate-50);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.logout-btn:hover {
  background: var(--color-slate-200);
}

.icon-logout {
  width: 18px;
  height: 18px;
  stroke: var(--color-text);
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
}
</style>

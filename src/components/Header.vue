<template>

  <!-- Header -->
  <header class="header">
    <div v-if="isMobile" class="header-left">
      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="isOpen"
        aria-controls="app-sidebar-nav"
        aria-label="Toggle navigation menu"
        @click="emit('toggle-sidebar')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
    </div>

    <div class="header-right">
      <div class="profile-actions">
        <div class="account-card" :title="authStore.userEmail">
          <span class="user-avatar">
            {{ authStore.userName.charAt(0).toUpperCase() }}
          </span>
          <div class="account-meta">
            <span class="user-name">{{ authStore.userName }}</span>
            <span class="user-email">{{ authStore.userEmail }}</span>
          </div>
          <span class="account-status" :class="accountStatusClass">
            <span class="status-dot" aria-hidden="true"></span>
            {{ accountStatusLabel }}
          </span>
        </div>

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
          <span class="logout-text">Logout</span>
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
      or incomplete data.
    </span>
    <router-link to="/settings/google-configuration" class="config-link">
      Connect Now
    </router-link>
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const props = defineProps<{
  isOpen?: boolean
  isMobile?: boolean
}>()

const emit = defineEmits<{
  'toggle-sidebar': []
}>()
import { logout, useAuthStore } from '../Store/auth'
import { useGoogleConfigStore } from '../Shared/googleConfig'
import { useSubscriptionStore } from '../Shared/subscription'
import { useUserLimitStore } from '../Shared/userLimit'

const authStore = useAuthStore()
const googleConfigStore = useGoogleConfigStore()
const subscriptionStore = useSubscriptionStore()
const userLimitStore = useUserLimitStore()

onMounted(() => {
  googleConfigStore.check()
  subscriptionStore.checkSubscription()
  userLimitStore.checkLimit()
})

const handleLogout = () => {
  logout()
}

const accountStatusLabel = computed(() => {
  if (userLimitStore.isChecking || subscriptionStore.isChecking) return 'Checking'
  if (userLimitStore.hasLimit) return 'Trial'
  return subscriptionStore.isValid ? 'Subscribed' : 'Expired'
})

const accountStatusClass = computed(() => {
  if (userLimitStore.isChecking || subscriptionStore.isChecking) return 'is-checking'
  if (userLimitStore.hasLimit) return 'is-trial'
  return subscriptionStore.isValid ? 'is-active' : 'is-expired'
})

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* ----------------- Mobile menu toggle ----------------- */
.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: -6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--color-text);
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}

.menu-toggle:hover {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}

.menu-toggle:focus-visible {
  outline: none;
  box-shadow: var(--ring-accent);
}

.menu-toggle svg {
  width: 20px;
  height: 20px;
}

/* ----------------- Header shell ----------------- */
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-header, 100);

  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 var(--space-5);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(8px);
  -webkit-backdrop-filter: saturate(180%) blur(8px);
  border-bottom: 1px solid var(--color-border);
  min-height: var(--header-height);
  box-sizing: border-box;
  font-family: var(--font-family);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-left: auto;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* ----------------- Google Config Warning ----------------- */
.google-config-bar {
  position: sticky;
  top: var(--header-height, 56px);
  z-index: var(--z-config-bar, 99);
  background: var(--warning-50);
  color: var(--warning-700);
  padding: 8px var(--space-5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  border-bottom: 1px solid var(--warning-100);
  gap: var(--space-3);
}

.config-link {
  background: var(--neutral-900);
  color: #ffffff;
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  font-weight: var(--fw-medium);
  font-size: var(--fs-sm);
  text-decoration: none;
  flex-shrink: 0;
  transition: background 140ms ease;
}
.config-link:hover {
  background: var(--neutral-800);
}

.account-card {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  max-width: min(52vw, 560px);
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: var(--neutral-900);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: var(--fw-semi);
  font-size: var(--fs-xs);
  letter-spacing: 0;
}

.account-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.user-email {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.account-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  font-size: 11px;
  font-weight: var(--fw-medium);
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.account-status.is-trial {
  color: var(--warning-700);
  background: var(--warning-50);
  border-color: var(--warning-100);
}

.account-status.is-active {
  color: var(--success-700);
  background: var(--success-50);
  border-color: var(--success-100);
}

.account-status.is-expired {
  color: var(--danger-700);
  background: var(--danger-50);
  border-color: var(--danger-100);
}

.account-status.is-checking {
  color: var(--neutral-600);
  background: var(--neutral-100);
}

.logout-btn {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  cursor: pointer;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--color-text-secondary);
  transition: background 140ms ease, color 140ms ease,
              border-color 140ms ease;
}
.logout-btn:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.icon-logout {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

.logout-text {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
}

@media (max-width: 768px) {
  .header {
    padding: 0 var(--space-4);
  }
  .account-card {
    padding: 4px 8px;
    gap: 8px;
    max-width: calc(100vw - 180px);
  }
  .user-name {
    display: none;
  }
  .user-email {
    display: none;
  }
  .account-status {
    display: none;
  }
  .logout-text {
    display: none;
  }
}
</style>
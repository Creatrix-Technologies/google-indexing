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

        <!-- Trial Badge -->
        <span
          v-if="userLimitStore.hasLimit && !userLimitStore.isChecking"
          class="trial-badge"
          title="Trial Account"
        >
          Trial
        </span>

        <!-- Subscription Status Icon -->
        <span
          v-if="!subscriptionStore.isChecking && !userLimitStore.hasLimit"
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
      or incomplete data.
    </span>
    <router-link to="/settings/google-configuration" class="config-link">
      Connect Now
    </router-link>
  </div>

</template>

<script setup lang="ts">
import { onMounted } from 'vue'

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
  justify-content: space-between;
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
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* ----------------- Trial Badge ----------------- */
.trial-badge {
  display: inline-flex;
  align-items: center;
  background: var(--neutral-100);
  color: var(--neutral-700);
  padding: 3px 9px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  letter-spacing: 0.02em;
  line-height: 1.4;
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

/* ----------------- Subscription ----------------- */
.subscription-wrapper {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
}

.subscription-icon {
  width: 18px;
  height: 18px;
}

.subscription-icon.valid {
  color: var(--color-success);
}

.subscription-icon.invalid {
  color: var(--color-danger);
}

/* ----------------- User ----------------- */
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

.user-name {
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  color: var(--color-text);
  letter-spacing: -0.005em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.logout-btn {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

@media (max-width: 768px) {
  .header {
    padding: 0 var(--space-4);
  }
  .user-name {
    display: none;
  }
}
</style>
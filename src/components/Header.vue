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

  <!-- Google connection: compact action bar shown when not connected -->
  <div
    v-if="!googleConfigStore.isValid && !googleConfigStore.isChecking && !noticeDismissed"
    class="google-notice-bar"
    role="alert"
  >
    <div class="gnb-inner">
      <span class="gnb-dot" aria-hidden="true"></span>
      <p class="gnb-text">
        <template v-if="googleConfigStore.hasCredentials">
          Your API key is saved, but Search Console returned no sites —
          add the service account email in Search Console → Users and permissions (Full access).
        </template>
        <template v-else>
          Google Search Console is not connected —
          <router-link to="/settings/google-configuration" class="gnb-inline-link">complete setup</router-link>
          to enable indexing and populate your dashboard.
        </template>
        <span v-if="googleNoticeIssues.length" class="gnb-issue">{{ googleNoticeIssues[0] }}</span>
      </p>
      <router-link to="/settings/google-configuration" class="gnb-cta">
        Connect Google
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="10" height="10">
          <line x1="2" y1="6" x2="10" y2="6"/><polyline points="6 2 10 6 6 10"/>
        </svg>
      </router-link>
      <button class="gnb-dismiss" @click="noticeDismissed = true" aria-label="Dismiss Google setup notice">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="11" height="11">
          <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
        </svg>
      </button>
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

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

const noticeDismissed = ref(false)
const authStore = useAuthStore()
const googleConfigStore = useGoogleConfigStore()
const googleNoticeIssues = computed(() =>
  googleConfigStore.errors.map((e) => e.trim()).filter(Boolean)
)
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

</script>

<style scoped>
/* ----------------- Mobile menu toggle ----------------- */
.header-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
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
  gap: var(--space-3);
  padding: 0 var(--space-5);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(8px);
  -webkit-backdrop-filter: saturate(180%) blur(8px);
  border-bottom: 1px solid var(--color-border);
  min-height: var(--header-height);
  box-sizing: border-box;
  font-family: var(--font-family);
}

@media (max-width: 1024px) {
  .header {
    justify-content: space-between;
    gap: var(--space-2);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-left: auto;
  min-width: 0;
}

@media (max-width: 1024px) {
  .header-right {
    margin-left: 0;
    flex: 1;
    justify-content: flex-end;
  }
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* ----------------- Google connection: compact notice bar ----------------- */
.google-notice-bar {
  position: sticky;
  top: var(--header-height, 56px);
  z-index: var(--z-config-bar, 99);
  background: var(--warning-50);
  border-bottom: 1px solid var(--warning-100);
  padding: 9px var(--space-5);
}

.gnb-inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  max-width: 100%;
}

.gnb-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--warning-500);
  flex-shrink: 0;
  animation: gnb-pulse 2.4s ease-in-out infinite;
}

@keyframes gnb-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

.gnb-text {
  flex: 1;
  font-size: var(--fs-sm);
  color: var(--warning-700);
  margin: 0;
  line-height: 1.4;
  min-width: 0;
}

.gnb-inline-link {
  color: var(--warning-700);
  font-weight: var(--fw-medium);
  text-underline-offset: 2px;
}
.gnb-inline-link:hover {
  text-decoration: underline;
}

.gnb-issue {
  display: block;
  margin-top: 2px;
  font-size: var(--fs-xs);
  color: var(--warning-600);
  opacity: 0.85;
}

.gnb-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 5px 11px;
  border-radius: var(--radius-md);
  background: var(--neutral-900);
  color: #fff;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  text-decoration: none;
  white-space: nowrap;
  transition: background 140ms ease;
}
.gnb-cta:hover {
  background: var(--neutral-800);
}

.gnb-dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--warning-600);
  cursor: pointer;
  transition: background 140ms, border-color 140ms;
}
.gnb-dismiss:hover {
  background: var(--warning-100);
  border-color: var(--warning-200);
}

@media (max-width: 1024px) {
  .google-notice-bar {
    padding: 8px var(--space-4);
  }
  .gnb-cta {
    display: none;
  }
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

@media (max-width: 1024px) {
  .header {
    padding: 0 var(--space-4);
  }
  .account-card {
    padding: 4px 8px;
    gap: 8px;
    max-width: min(200px, calc(100vw - 148px));
  }
  .user-name {
    display: none;
  }
  .user-email {
    display: none;
  }
  /* Keep subscription/trial badge visible on small screens (was hidden — users lost status context). */
  .account-status {
    font-size: 10px;
    padding: 2px 6px;
    max-width: 72px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .logout-text {
    display: none;
  }
}
</style>
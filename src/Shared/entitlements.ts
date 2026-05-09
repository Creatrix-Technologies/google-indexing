import { defineStore } from 'pinia'
import api from '../api'

function subscriptionExpired(state: {
  subscriptionActive: boolean
  trialAvailable: boolean
  expiresAt: string | null
}) {
  if (state.subscriptionActive || state.trialAvailable) return false
  if (!state.expiresAt) return false
  const t = Date.parse(state.expiresAt)
  if (Number.isNaN(t)) return false
  return t < Date.now()
}

export const useEntitlementsStore = defineStore('entitlements', {
  state: () => ({
    subscriptionActive: false,
    trialAvailable: false,
    expiresAt: null as string | null,
    isChecking: false
  }),

  getters: {
    canUsePaidFeatures: (state) => state.subscriptionActive || state.trialAvailable,
    statusLabel: (state) => {
      if (state.subscriptionActive) return 'Subscribed'
      if (state.trialAvailable) return 'Trial'
      return 'Subscription required'
    },
    blockingReason: (state) => {
      if (state.subscriptionActive || state.trialAvailable) return ''
      if (subscriptionExpired(state)) {
        return 'Your subscription has expired. Renew your plan to continue crawling, scheduling, and indexing.'
      }
      return 'An active subscription or remaining trial quota (100 free indexing requests) is required for crawling, schedules, and the indexing queue. Upgrade or complete signup if you have not started a trial.'
    }
  },

  actions: {
    async refresh() {
      this.isChecking = true
      try {
        const [subscriptionRes, limitRes] = await Promise.allSettled([
          api.get('/payments/check-subscription-status'),
          api.get('/manage-users/has-limit')
        ])

        if (subscriptionRes.status === 'fulfilled') {
          const data = subscriptionRes.value.data?.data
          this.subscriptionActive = data?.isValid === true
          this.expiresAt = data?.expiresAt || null
        } else {
          this.subscriptionActive = false
          this.expiresAt = null
        }

        this.trialAvailable =
          limitRes.status === 'fulfilled' && limitRes.value.data?.data === true
      } finally {
        this.isChecking = false
      }
    }
  }
})

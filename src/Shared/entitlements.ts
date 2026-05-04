import { defineStore } from 'pinia'
import api from '../api'

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
      return 'Choose a plan to use indexing, crawling, schedules, and site sync.'
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

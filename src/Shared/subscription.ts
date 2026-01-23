import { defineStore } from 'pinia'
import api from '../api'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    isValid: false,
    isChecking: false,
    expiresAt: null as string | null // store expiration date as string
  }),

  actions: {
    async checkSubscription() {
      try {
        this.isChecking = true

        const res = await api.get('/payments/check-subscription-status')

        // Assuming API returns { data: { isValid: boolean, expiresAt: string } }
        const data = res.data.data

        this.isValid = data?.isValid === true
        this.expiresAt = data?.expiresAt || null
      } catch (err) {
        this.isValid = false
        this.expiresAt = null
      } finally {
        this.isChecking = false
      }
    }
  }
})

import { defineStore } from 'pinia'
import api from '../api'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    isValid: false,
    isChecking: false
  }),

  actions: {
    async checkSubscription() {
      try {
        this.isChecking = true
        const res = await api.get('/payments/check-subscription-status')
        this.isValid = res.data.data === true   
       } catch (err) {
        this.isValid = false
      } finally {
        this.isChecking = false
      }
    }
  }
})

import { defineStore } from 'pinia'

import api from '../api'
import { useEntitlementsStore } from '../Shared/entitlements'

export const useUserLimitStore = defineStore('userLimit', {
  state: () => ({
    hasLimit: false,
    isChecking: false,
  }),

  actions: {
    async checkLimit() {
      this.isChecking = true
      try {
        const res = await api.get('/manage-users/has-limit')
        this.hasLimit = res.data?.data === true
        useEntitlementsStore().trialAvailable = this.hasLimit
      } catch (err) {
        this.hasLimit = false
        useEntitlementsStore().trialAvailable = false
      } finally {
        this.isChecking = false
      }
    }
  }
})

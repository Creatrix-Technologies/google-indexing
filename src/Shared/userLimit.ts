import { defineStore } from 'pinia'
import { useEntitlementsStore } from '../Shared/entitlements'

/** Thin wrapper kept for existing call sites; the entitlement store is the source of truth. */
export const useUserLimitStore = defineStore('userLimit', {
  state: () => ({
    hasLimit: false,
    isChecking: false,
  }),

  actions: {
    async checkLimit(force = false) {
      this.isChecking = true
      try {
        const entitlements = useEntitlementsStore()
        await entitlements.refresh(force)
        this.hasLimit = entitlements.data.trialActive
      } finally {
        this.isChecking = false
      }
    }
  }
})

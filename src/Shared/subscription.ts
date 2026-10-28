import { defineStore } from 'pinia'
import { useUserLimitStore } from '../Shared/userLimit'
import { useEntitlementsStore } from '../Shared/entitlements'

/** Thin wrapper kept for existing call sites; the entitlement store is the source of truth. */
export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    isValid: false,
    isChecking: false,
    expiresAt: null as string | null,
  }),

  actions: {
    async checkSubscription(force = true) {
      this.isChecking = true
      try {
        const entitlements = useEntitlementsStore()
        await entitlements.refresh(force)
        this.isValid = entitlements.data.hasActiveSubscription
        this.expiresAt = entitlements.data.subscriptionEndsAt
        const limit = useUserLimitStore()
        limit.hasLimit = entitlements.data.trialActive
      } finally {
        this.isChecking = false
      }
    }
  }
})

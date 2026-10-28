import { defineStore } from 'pinia'
import api from '../api'

/** Mirror of GET /manage-users/entitlement (the one source of truth for what the user may do). */
export interface EntitlementData {
  isTrial: boolean
  trialActive: boolean
  trialEndsAt: string | null
  trialUrlsUsed: number
  trialUrlLimit: number
  trialUrlsLeft: number
  hasActiveSubscription: boolean
  subscriptionStatus: string | null
  planName: string | null
  subscriptionEndsAt: string | null
  cancelAt: string | null
  maxSites: number | null
  maxUrlsPerDay: number | null
  maxUrlsPerMonth: number | null
  sitesUsed: number
  urlsSubmittedThisMonth: number
  urlsLeftThisMonth: number | null
  canSubmit: boolean
  canAddSite: boolean
}

const EMPTY: EntitlementData = {
  isTrial: false, trialActive: false, trialEndsAt: null, trialUrlsUsed: 0, trialUrlLimit: 100, trialUrlsLeft: 0,
  hasActiveSubscription: false, subscriptionStatus: null, planName: null, subscriptionEndsAt: null, cancelAt: null,
  maxSites: null, maxUrlsPerDay: null, maxUrlsPerMonth: null, sitesUsed: 0, urlsSubmittedThisMonth: 0, urlsLeftThisMonth: null,
  canSubmit: false, canAddSite: false,
}

const STALE_MS = 30_000

export const useEntitlementsStore = defineStore('entitlements', {
  state: () => ({
    data: { ...EMPTY } as EntitlementData,
    loaded: false,
    loadedAt: 0,
    isChecking: false,
  }),

  getters: {
    // Legacy field names kept for existing call sites.
    subscriptionActive: (s) => s.data.hasActiveSubscription,
    trialAvailable: (s) => s.data.trialActive,
    expiresAt: (s) => s.data.subscriptionEndsAt,
    canUsePaidFeatures: (s) => s.data.canSubmit,
    statusLabel: (s) => {
      if (s.data.hasActiveSubscription) return s.data.cancelAt ? 'Ends soon' : 'Subscribed'
      if (s.data.trialActive) return 'Trial'
      if (s.data.isTrial) return 'Trial ended'
      return s.data.subscriptionStatus ? 'Expired' : 'No plan'
    },
    /** Short usage line for the header/billing page, e.g. "Trial: 97 URLs left · 12 days". */
    usageSummary: (s) => {
      const d = s.data
      if (d.hasActiveSubscription) {
        const month = d.urlsLeftThisMonth != null ? `${d.urlsLeftThisMonth} of ${d.maxUrlsPerMonth} URLs left this month` : 'unlimited URLs'
        const sites = d.maxSites != null ? ` · ${d.sitesUsed}/${d.maxSites} sites` : ''
        return `${d.planName ?? 'Plan'}: ${month}${sites}`
      }
      if (d.trialActive) {
        const days = d.trialEndsAt ? Math.max(0, Math.ceil((Date.parse(d.trialEndsAt) - Date.now()) / 86_400_000)) : null
        return `Trial: ${d.trialUrlsLeft} of ${d.trialUrlLimit} URLs left${days != null ? ` · ${days} day${days === 1 ? '' : 's'}` : ''}`
      }
      return ''
    },
    blockingReason: (s) => {
      const d = s.data
      if (d.canSubmit) return ''
      if (d.isTrial && !d.trialActive && d.trialUrlsLeft <= 0) return `Your free trial allowance of ${d.trialUrlLimit} URLs is used up. Choose a plan to keep submitting URLs.`
      if (d.isTrial && !d.trialActive) return 'Your free trial has ended. Choose a plan to keep submitting URLs.'
      if (d.subscriptionStatus) return 'Your subscription has ended. Choose a plan to continue crawling, scheduling and submitting URLs.'
      return 'A plan or an active trial is needed to submit URLs to Google.'
    },
  },

  actions: {
    async refresh(force = false) {
      if (!force && this.loaded && Date.now() - this.loadedAt < STALE_MS) return
      this.isChecking = true
      try {
        const res = await api.get('/manage-users/entitlement')
        this.data = { ...EMPTY, ...(res.data?.data ?? {}) }
        this.loaded = true
        this.loadedAt = Date.now()
      } catch {
        this.data = { ...EMPTY }
      } finally {
        this.isChecking = false
      }
    },
  },
})

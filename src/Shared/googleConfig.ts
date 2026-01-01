import { defineStore } from 'pinia'
import api from '../api'

export const useGoogleConfigStore = defineStore('googleConfig', {
  state: () => ({
    isValid: true as boolean,
    isChecking: false as boolean,
    errors: [] as string[],
  }),

  actions: {
    async check() {
      try {
        this.isChecking = true
        const res = await api.get('/site/google-sites')

        // API returns string[]
        this.errors = Array.isArray(res.data) ? res.data : []
        this.isValid = this.errors.length === 0
      } catch {
        this.isValid = false
        this.errors = ['Failed to validate Google configuration']
      } finally {
        this.isChecking = false
      }
    },
  },
})

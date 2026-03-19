import { defineStore } from 'pinia'

import api from '../api'

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
       console.log(res)
        this.hasLimit = res.data?.data === true
      } catch (err) {
        this.hasLimit = false
      } finally {
        this.isChecking = false
      }
    }
  }
})
import { defineStore } from 'pinia'
import api from '../api'

/** Axios body for `/site/google-sites`: Result<List<string>> (camelCase JSON). Legacy raw string[] tolerated. */
function parseGoogleSitesResponse(resData: unknown): { ok: boolean; errors: string[] } {
  if (resData == null || typeof resData !== 'object') {
    return { ok: false, errors: ['No response from server.'] }
  }

  const body = resData as {
    isSuccess?: boolean
    data?: unknown
    error?: { description?: string }
    message?: string
  }

  if ('isSuccess' in body && typeof body.isSuccess === 'boolean') {
    if (!body.isSuccess) {
      const msg =
        body.error?.description ||
        body.message ||
        'Google configuration needs attention. Open Settings → Google configuration.'
      return { ok: false, errors: [msg] }
    }

    const sites = body.data
    if (Array.isArray(sites)) {
      if (sites.length > 0) {
        return { ok: true, errors: [] }
      }
      return {
        ok: false,
        errors: [
          'No Search Console sites were returned. Finish Google setup and ensure this Google account owns at least one verified property.'
        ]
      }
    }

    return {
      ok: false,
      errors: [
        'We could not read your Search Console site list. Reconnect under Settings → Google configuration.'
      ]
    }
  }

  if (Array.isArray(resData)) {
    if (resData.length > 0) return { ok: true, errors: [] }
    return { ok: false, errors: ['No Google Console sites linked yet.'] }
  }

  return { ok: false, errors: ['Unexpected response while checking Google setup.'] }
}

export const useGoogleConfigStore = defineStore('googleConfig', {
  state: () => ({
    isValid: true as boolean,
    isChecking: false as boolean,
    errors: [] as string[]
  }),

  actions: {
    async check() {
      try {
        this.isChecking = true
        const res = await api.get('/site/google-sites')
        const { ok, errors } = parseGoogleSitesResponse(res.data)
        this.errors = errors
        this.isValid = ok
      } catch (e: unknown) {
        const ax = e as { response?: { data?: unknown } }
        const parsed = parseGoogleSitesResponse(ax.response?.data)
        this.isValid = parsed.ok
        this.errors = parsed.ok ? [] : parsed.errors.length ? parsed.errors : ['Google configuration check failed.']
      } finally {
        this.isChecking = false
      }
    }
  }
})

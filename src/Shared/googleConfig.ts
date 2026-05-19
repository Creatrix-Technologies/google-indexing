import { defineStore } from 'pinia'
import api from '../api'

const EMPTY_SITES_MSG =
  'No Search Console properties were returned. Add your service account email as a user in Search Console (Settings → Users and permissions, Full access), then use Sync sites on Site management.'

/** Axios body for `/site/google-sites`: Result<List<string>> (camelCase JSON). Legacy raw string[] tolerated. */
function parseGoogleSitesResponse(
  resData: unknown,
  options?: { hasCredentials?: boolean }
): { ok: boolean; errors: string[] } {
  const hasCredentials = options?.hasCredentials ?? false
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
    if (sites == null) {
      return {
        ok: false,
        errors: [hasCredentials ? EMPTY_SITES_MSG : 'We could not read your Search Console site list. Reconnect under Settings → Google configuration.']
      }
    }

    if (Array.isArray(sites)) {
      if (sites.length > 0) {
        return { ok: true, errors: [] }
      }
      return { ok: false, errors: [EMPTY_SITES_MSG] }
    }

    return {
      ok: false,
      errors: [
        hasCredentials
          ? EMPTY_SITES_MSG
          : 'We could not read your Search Console site list. Reconnect under Settings → Google configuration.'
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
    hasCredentials: false as boolean,
    errors: [] as string[]
  }),

  actions: {
    async check() {
      try {
        this.isChecking = true

        let hasCredentials = false
        try {
          const credRes = await api.get('/google-config/get')
          const cred = credRes.data?.data as { clientEmail?: string } | undefined
          hasCredentials = !!(credRes.data?.isSuccess && cred?.clientEmail)
        } catch {
          hasCredentials = false
        }

        this.hasCredentials = hasCredentials

        const res = await api.get('/site/google-sites')
        const { ok, errors } = parseGoogleSitesResponse(res.data, { hasCredentials })
        this.errors = errors
        this.isValid = ok
      } catch (e: unknown) {
        const ax = e as { response?: { data?: unknown } }
        let hasCredentials = false
        try {
          const credRes = await api.get('/google-config/get')
          const cred = credRes.data?.data as { clientEmail?: string } | undefined
          hasCredentials = !!(credRes.data?.isSuccess && cred?.clientEmail)
        } catch {
          hasCredentials = false
        }
        this.hasCredentials = hasCredentials
        const parsed = parseGoogleSitesResponse(ax.response?.data, { hasCredentials })
        this.isValid = parsed.ok
        this.errors = parsed.ok ? [] : parsed.errors.length ? parsed.errors : ['Google configuration check failed.']
      } finally {
        this.isChecking = false
      }
    }
  }
})

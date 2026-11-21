import posthog from 'posthog-js'

/**
 * Product analytics (PostHog). Funnel: $pageview → checker_run → signup_view → signup_success.
 * Keys come from VITE_POSTHOG_PROJECT_TOKEN / VITE_POSTHOG_HOST. Without a token every call is a no-op.
 * Never put PII (email, password, names) in event properties.
 */

export type FunnelEvent =
  | 'home_cta_click'
  | 'checker_run'
  | 'checker_cta_click'
  | 'signup_view'
  | 'signup_submit'
  | 'signup_success'
  | 'signup_error'

type Props = Record<string, string | number | boolean | null | undefined>

const TOKEN = (import.meta.env.VITE_POSTHOG_PROJECT_TOKEN as string | undefined)?.trim()
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined)?.trim()

let enabled = false

// Query params that can carry personal data (e.g. /verify-required?email=...). Removed from every URL property.
const SENSITIVE_PARAMS = ['email', 'token', 'code']
const URL_PROPS = ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer', '$pathname']

const scrubUrl = (value: unknown): unknown => {
  if (typeof value !== 'string' || !value.includes('?')) return value
  try {
    const u = new URL(value, window.location.origin)
    let changed = false
    for (const p of SENSITIVE_PARAMS) {
      if (u.searchParams.has(p)) { u.searchParams.delete(p); changed = true }
    }
    return changed ? (value.startsWith('/') ? u.pathname + u.search + u.hash : u.toString()) : value
  } catch {
    return value
  }
}

export function initAnalytics(): void {
  if (!TOKEN || !HOST) {
    const missing = !TOKEN ? 'VITE_POSTHOG_PROJECT_TOKEN' : 'VITE_POSTHOG_HOST'
    if (import.meta.env.DEV) {
      // Loud in development without stopping the app from booting; production stays a silent no-op.
      queueMicrotask(() => {
        throw new Error(
          `${missing} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missing} is configured`
        )
      })
    }
    return
  }
  try {
    posthog.init(TOKEN, {
      api_host: HOST,
      defaults: '2026-08-30',
      person_profiles: 'identified_only',
      before_send: (event) => {
        if (!event) return event
        for (const key of URL_PROPS) {
          if (key in event.properties) event.properties[key] = scrubUrl(event.properties[key])
        }
        if (event.$set) for (const key of URL_PROPS) if (key in event.$set) event.$set[key] = scrubUrl(event.$set[key])
        if (event.$set_once) for (const key of URL_PROPS) if (key in event.$set_once) event.$set_once[key] = scrubUrl(event.$set_once[key])
        return event
      },
    })
    enabled = true
  } catch {
    /* analytics must never break the app */
  }
}

export function track(event: FunnelEvent, props: Props = {}): void {
  if (!enabled) return
  try {
    posthog.capture(event, props)
  } catch {
    /* non-fatal */
  }
}

export function trackException(err: unknown): void {
  if (!enabled) return
  try {
    posthog.captureException(err)
  } catch {
    /* non-fatal */
  }
}

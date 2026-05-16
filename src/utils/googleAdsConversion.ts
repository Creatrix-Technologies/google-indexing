/**
 * Google Ads sign-up conversion (AW-18143687355 / o3-1CPn7yqwcELvlystD).
 * Queues like gtag; fires once per browser session to limit duplicate hits on retry/navigation.
 */
const SESSION_KEY = 'google_ads_signup_conversion_fired'

export function trackGoogleAdsSignupConversion(): void {
  if (typeof window === 'undefined') return
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
    if (typeof gtag !== 'function') return
    gtag('event', 'conversion', {
      send_to: 'AW-18143687355/o3-1CPn7yqwcELvlystD',
    })
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* non-fatal */
  }
}

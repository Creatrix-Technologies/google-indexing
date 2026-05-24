<template>
  <div class="pricing-page">
    <div class="mesh-gradient"></div>
    <div class="grain-overlay"></div>

    <div class="container">
      <header class="site-header fade-in-motion">
        <router-link to="/" class="logo">GoogleIndexing</router-link>
        <nav class="header-links">
          <router-link :to="{ path: '/', hash: '#features' }" class="hide-below-tablet">Features</router-link>
          <router-link :to="{ path: '/', hash: '#how-it-works' }" class="hide-below-tablet">How it works</router-link>
          <router-link :to="{ path: '/', hash: '#faq' }" class="hide-below-tablet">FAQ</router-link>
          <router-link :to="{ path: '/', hash: '#contact' }" class="hide-below-tablet">Contact</router-link>
          <router-link to="/pricing">Pricing</router-link>
          <router-link to="/login" class="cta-pill">Sign In</router-link>
        </nav>
      </header>

      <main>
        <section class="pricing-hero">
          <h1>Simple, transparent <span class="accent">pricing</span></h1>
          <p class="pricing-subtext">
            Choose the plan that fits your indexing needs. Works with <strong>any website</strong> — WordPress, Shopify, nopCommerce, Next.js, corporate sites, or fully custom-built. All plans use Google's official Indexing API.
          </p>
        </section>

        <div class="api-limit-note fade-in-motion delay-1">
          <span class="api-limit-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </span>
          <span>
            Google's Indexing API allows <strong>200 requests/day per Google Cloud project (i.e. per service account/API key)</strong> — this is a hard Google-enforced limit, not ours. All paid plans give you the full quota.
          </span>
        </div>

        <div class="pricing-grid fade-in-motion delay-1">
          <article
            v-if="showDefaultTrial"
            class="pricing-card glass-card"
          >
            <div class="card-glow"></div>
            <div class="pricing-card-header">
              <h3>Trial</h3>
              <div class="price">
                <span class="amount">Free</span>
              </div>
              <p class="price-note">One-time trial</p>
            </div>
            <ul class="pricing-features">
              <li>100 indexing requests</li>
              <li>1 site</li>
              <li>Web dashboard</li>
              <li>No API access</li>
            </ul>
            <router-link to="/login?plan=trial" class="pricing-cta pricing-cta-outline">Start trial</router-link>
          </article>

          <article
            v-for="plan in displayPlans"
            :key="plan.id"
            class="pricing-card glass-card"
            :class="{
              'main-card pricing-popular': isPopularPlan(plan),
            }"
          >
            <div class="card-glow"></div>
            <div v-if="isPopularPlan(plan)" class="popular-badge">Most popular</div>
            <div class="pricing-card-header">
              <h3>{{ plan.name }}</h3>
              <div class="price">
                <template v-if="isTrialPlan(plan)">
                  <span class="amount">Free</span>
                </template>
                <template v-else>
                  <span class="currency">{{ currencySymbol(plan.currency) }}</span>
                  <span class="amount">{{ formatAmount(plan.amount) }}</span>
                  <span v-if="formatPeriod(plan.duration)" class="period">/{{ formatPeriod(plan.duration) }}</span>
                </template>
              </div>
            </div>
            <div
              v-if="plan.description"
              class="pricing-card__desc"
              v-html="plan.description"
            ></div>
            <div v-if="!isTrialPlan(plan)" class="verify-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Verify email, then pay securely
            </div>
            <router-link
              :to="planCtaPath(plan)"
              class="pricing-cta"
              :class="planCtaClass(plan)"
            >
              {{ planCtaLabel(plan) }}
            </router-link>
          </article>

          <p v-if="plansError" class="pricing-load-error">{{ plansError }}</p>
        </div>

        <div class="compat-strip fade-in-motion delay-2">
          <span class="compat-label">Works with any website</span>
          <span class="compat-divider" aria-hidden="true"></span>
          <span class="compat-item">WordPress</span>
          <span class="compat-item">Shopify</span>
          <span class="compat-item">nopCommerce</span>
          <span class="compat-item">Next.js</span>
          <span class="compat-item">Corporate sites</span>
          <span class="compat-item">Custom builds</span>
          <span class="compat-item">Any public URL</span>
        </div>

        <p class="pricing-annual fade-in-motion delay-2">
          Save 2 months with annual billing —
          <a href="#pricing-contact">contact us</a> for annual plans.
        </p>

        <section id="pricing-contact" class="pricing-contact fade-in-motion delay-2">
          <div class="pricing-contact__intro">
            <span class="pricing-contact__eyebrow">Talk to sales</span>
            <h2>Questions, custom quotes, or enterprise needs?</h2>
            <p>
              Volume discounts, annual billing, and onboarding support — tell us about your sites and we'll come back with a tailored next step within one business day.
            </p>
            <ul class="pricing-contact__list">
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Volume / annual pricing
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Multi-site / agency setup
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Enterprise SSO &amp; invoicing
              </li>
              <li>
                <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Migration from existing tools
              </li>
            </ul>
            <p class="pricing-contact__direct">
              Or email <a href="mailto:sales@nopbooster.com">sales@nopbooster.com</a> directly.
            </p>
          </div>

          <div class="pricing-contact__form glass-card">
            <div class="card-glow"></div>
            <ContactForm default-subject="Pricing inquiry" />
          </div>
        </section>
      </main>

      <MarketingSiteFooter class="fade-in-motion delay-3" />
    </div>

    <button
      v-if="showScrollTop"
      class="scroll-top-btn"
      type="button"
      aria-label="Go to top"
      @click="scrollToTop"
    >
      ↑
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ContactForm from '../components/ContactForm.vue'
import MarketingSiteFooter from '../components/MarketingSiteFooter.vue'
import { refreshApi } from '../api'
import type { PublicPlan } from '../Shared/publicPlans'
import { fallbackPublicSubscriptionPlans, fetchPublicSubscriptionPlans, isTrialPlan } from '../Shared/publicPlans'

const showScrollTop = ref(false)
const plans = ref<PublicPlan[]>([])
const plansError = ref('')

type PlanSlugKey = 'trial' | 'solo' | 'pro' | 'team'

const planSlugAliases: Record<PlanSlugKey, string[]> = {
  trial: ['trial', 'free'],
  solo: ['solo', 'basic'],
  pro: ['pro', 'professional'],
  team: ['team', 'enterprise', 'business'],
}

const displayPlans = computed(() =>
  [...plans.value].sort((a, b) => {
    if (isTrialPlan(a) !== isTrialPlan(b)) return isTrialPlan(a) ? -1 : 1
    return a.amount - b.amount
  })
)

const showDefaultTrial = computed(() => !displayPlans.value.some((plan) => isTrialPlan(plan)))

const isPopularPlan = (plan: PublicPlan) => plan.name.toLowerCase().includes('pro')

const currencySymbol = (currency?: string) => {
  const normalized = (currency || 'USD').toUpperCase()
  return normalized === 'USD' ? '$' : `${normalized} `
}

const formatAmount = (amount: number) => {
  const value = Number(amount)
  if (Number.isNaN(value)) return '0'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

const formatPeriod = (duration?: string) => {
  const normalized = (duration || '').toLowerCase()
  if (normalized.includes('year')) return 'yr'
  if (normalized.includes('month')) return 'mo'
  if (normalized.includes('week')) return 'wk'
  if (normalized.includes('day')) return 'day'
  return ''
}

const resolvePlanSlug = (name: string) => {
  const lower = name.toLowerCase()
  for (const [slug, aliases] of Object.entries(planSlugAliases)) {
    if (aliases.some((alias) => lower.includes(alias))) return slug
  }
  return lower.trim().replace(/\s+/g, '-')
}

const planCtaPath = (plan: PublicPlan) => {
  const slug = resolvePlanSlug(plan.name)
  return isTrialPlan(plan) ? `/login?plan=${slug}` : `/signup?plan=${slug}`
}

const planCtaLabel = (plan: PublicPlan) => (isTrialPlan(plan) ? 'Start trial' : `Get ${plan.name}`)

const planCtaClass = (plan: PublicPlan) => {
  if (isTrialPlan(plan)) return 'pricing-cta-outline'
  if (isPopularPlan(plan)) return 'pricing-cta-primary'
  return ''
}

const fetchPlans = async () => {
  plansError.value = ''
  try {
    plans.value = await fetchPublicSubscriptionPlans(refreshApi)
  } catch {
    plansError.value = 'Unable to load current pricing. Please refresh or contact sales.'
    plans.value = fallbackPublicSubscriptionPlans()
  }
}

const onScroll = () => {
  showScrollTop.value = window.scrollY > 320
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  void fetchPlans()
  const mesh = document.querySelector('.pricing-page .mesh-gradient') as HTMLElement | null
  if (mesh) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      mesh.style.setProperty('--mouse-x', `${x}%`)
      mesh.style.setProperty('--mouse-y', `${y}%`)
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.pricing-page {
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  background-color: #fdfdfb;
  color: #0a0a0c;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  position: relative;
}

.mesh-gradient {
  position: fixed;
  top: -10%;
  left: -10%;
  width: 120vw;
  height: 120vh;
  z-index: 0;
  background:
    radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(66, 133, 244, 0.15) 0%, transparent 40%),
    radial-gradient(at 10% 10%, rgba(66, 133, 244, 0.1) 0px, transparent 50%),
    radial-gradient(at 90% 10%, rgba(52, 168, 83, 0.1) 0px, transparent 50%),
    radial-gradient(at 50% 50%, rgba(251, 188, 5, 0.05) 0px, transparent 50%);
  filter: blur(80px);
  pointer-events: none;
}

.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.site-header {
  min-height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  text-decoration: none;
  background: linear-gradient(45deg, #1a1a1a, #4a4a4a);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  flex-shrink: 0;
}

.header-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1 1 auto;
  min-width: 0;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.header-links > a {
  white-space: nowrap;
  text-decoration: none;
  color: #0a0a0c;
  font-weight: 500;
  font-size: 0.9rem;
  transition: opacity 0.3s ease;
}

.header-links > a:not(.cta-pill):hover {
  opacity: 0.65;
}

.cta-pill {
  padding: 0.6rem 1.4rem;
  background: #0a0a0c !important;
  color: white !important;
  border-radius: 100px;
  transition: transform 0.3s ease, opacity 0.3s ease !important;
}

.cta-pill:hover {
  transform: translateY(-2px);
  opacity: 1 !important;
}

main {
  padding: 2rem 0 3rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.pricing-hero {
  text-align: center;
  margin-bottom: 2.5rem;
  max-width: 620px;
  margin-left: auto;
  margin-right: auto;
}

.pricing-hero h1 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: -2px;
  line-height: 1.1;
  margin-bottom: 1rem;
}

.pricing-hero .accent {
  opacity: 0.38;
  font-weight: 400;
}

.pricing-subtext {
  color: #5f6368;
  font-size: 1.1rem;
  line-height: 1.5;
}

.api-limit-note {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  max-width: 680px;
  margin: 0 auto 2rem;
  padding: 0.85rem 1.2rem;
  background: rgba(66, 133, 244, 0.06);
  border: 1px solid rgba(66, 133, 244, 0.18);
  border-radius: 12px;
  font-size: 0.88rem;
  color: #3c4043;
  line-height: 1.5;
}

.api-limit-icon {
  color: #4285f4;
  flex-shrink: 0;
  margin-top: 1px;
}

.api-limit-note strong {
  color: #0a0a0c;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.glass-card {
  position: relative;
  padding: 2rem 1.75rem;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  text-align: left;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.45s ease;
}

.glass-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px -12px rgba(50, 50, 93, 0.12);
}

.main-card {
  background: rgba(255, 255, 255, 0.68);
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(66, 133, 244, 0.06), transparent 70%);
  pointer-events: none;
  border-radius: 32px;
}

.pricing-card {
  display: flex;
  flex-direction: column;
}

.pricing-popular {
  border-color: rgba(66, 133, 244, 0.4);
  transform: scale(1.02);
}

.pricing-popular:hover {
  transform: translateY(-10px) scale(1.04);
}

.popular-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 0.35rem 1rem;
  border-radius: 100px;
  z-index: 2;
}

.pricing-card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.pricing-card-header h3 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.35rem;
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
}

.price {
  font-family: 'Syne', 'Inter', sans-serif;
  font-weight: 800;
  font-size: 2.5rem;
  letter-spacing: -2px;
  color: #0a0a0c;
}

.price .currency {
  font-size: 1.25rem;
  opacity: 0.7;
}

.price .period {
  font-size: 1rem;
  font-weight: 600;
  color: #5f6368;
}

.price-note {
  font-size: 0.8rem;
  color: #5f6368;
  margin-top: 0.5rem;
}

.pricing-features {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.pricing-features li {
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: #5f6368;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pricing-features li::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #4285f4;
  border-radius: 50%;
  opacity: 0.6;
  flex-shrink: 0;
}

.pricing-card__desc {
  flex: 1;
  color: #5f6368;
  font-size: 0.95rem;
  line-height: 1.5;
}

.pricing-card__desc :deep(p) {
  margin: 0 0 0.5rem;
}

.pricing-card__desc :deep(ul) {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pricing-card__desc :deep(li) {
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pricing-card__desc :deep(li::before) {
  content: '';
  width: 6px;
  height: 6px;
  background: #4285f4;
  border-radius: 50%;
  opacity: 0.6;
  flex-shrink: 0;
}

.pricing-load-error {
  grid-column: 1 / -1;
  text-align: center;
  color: #b3261e;
  margin: 0;
}

.verify-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #5f6368;
  margin: -0.5rem 0 1rem;
  padding: 8px 12px;
  background: rgba(66, 133, 244, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(66, 133, 244, 0.15);
}

.verify-hint svg {
  width: 14px;
  height: 14px;
  color: #4285f4;
  flex-shrink: 0;
}

.pricing-cta {
  display: block;
  text-align: center;
  padding: 1rem 1.5rem;
  border-radius: 100px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
}

.pricing-cta-outline {
  background: transparent;
  color: #0a0a0c;
  border: 2px solid rgba(0, 0, 0, 0.15);
}

.pricing-cta-outline:hover {
  border-color: #4285f4;
  color: #4285f4;
}

.pricing-cta:not(.pricing-cta-outline):not(.pricing-cta-primary) {
  background: #0a0a0c;
  color: white;
}

.pricing-cta:not(.pricing-cta-outline):hover {
  background: #2a2a2a;
  transform: translateY(-2px);
}

.pricing-cta-primary {
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
}

.pricing-cta-primary:hover {
  box-shadow: 0 10px 30px rgba(66, 133, 244, 0.35);
  transform: translateY(-2px);
}

.compat-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem 1rem;
  max-width: 860px;
  margin: 0 auto 2rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  font-size: 0.85rem;
}

.compat-label {
  font-weight: 600;
  color: #0a0a0c;
  font-size: 0.82rem;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.compat-divider {
  width: 1px;
  height: 16px;
  background: rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.compat-item {
  padding: 3px 10px;
  border-radius: 100px;
  background: rgba(66, 133, 244, 0.07);
  border: 1px solid rgba(66, 133, 244, 0.15);
  color: #3c4043;
  white-space: nowrap;
  font-size: 0.8rem;
}

.pricing-annual {
  text-align: center;
  color: #5f6368;
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
}

.pricing-annual a {
  color: #4285f4;
  text-decoration: underline;
  pointer-events: auto;
  position: relative;
  z-index: 2;
}

.pricing-contact {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.45fr);
  gap: 1.75rem;
  align-items: start;
  max-width: 1200px;
  margin: 0 auto 3rem;
  scroll-margin-top: 90px;
}

.pricing-contact__intro {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-top: 0.5rem;
  position: relative;
  z-index: 2;
}

.pricing-contact__eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4285f4;
}

.pricing-contact__intro h2 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(1.5rem, 3.2vw, 1.95rem);
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.2;
  color: #0a0a0c;
  margin: 0;
}

.pricing-contact__intro > p {
  color: #5f6368;
  font-size: 0.98rem;
  line-height: 1.6;
  margin: 0;
  max-width: 46ch;
}

.pricing-contact__list {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
}

.pricing-contact__list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #3c4043;
}

.pricing-contact__list svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  fill: none;
  stroke: #34a853;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.pricing-contact__direct {
  margin: 0.5rem 0 0;
  font-size: 0.88rem;
  color: #6b7280;
}

.pricing-contact__direct a {
  color: #0a0a0c;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid rgba(10, 10, 12, 0.18);
  transition: color 150ms ease, border-color 150ms ease;
}

.pricing-contact__direct a:hover {
  color: #4285f4;
  border-bottom-color: #4285f4;
}

.pricing-contact__form {
  padding: 2rem 1.85rem 1.75rem;
  position: relative;
  z-index: 1;
}

@media (max-width: 900px) {
  .pricing-contact {
    grid-template-columns: 1fr;
  }
  .pricing-contact__list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .pricing-contact__form {
    padding: 1.5rem 1.25rem 1.25rem;
  }
}

@keyframes slideUpSoft {
  from {
    transform: translateY(16px);
  }
  to {
    transform: translateY(0);
  }
}

.fade-in-motion {
  opacity: 1;
  animation: slideUpSoft 0.55s cubic-bezier(0.23, 1, 0.32, 1) both;
}

.delay-1 {
  animation-delay: 0.08s;
}
.delay-2 {
  animation-delay: 0.14s;
}
.delay-3 {
  animation-delay: 0.2s;
}

@media (prefers-reduced-motion: reduce) {
  .fade-in-motion {
    animation: none !important;
  }
}

.scroll-top-btn {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #0a0a0c;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  z-index: 20;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.scroll-top-btn:hover {
  background: #ffffff;
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .site-header {
    min-height: auto;
    padding-top: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.65rem;
  }
  .header-links {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 2px 0 6px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .header-links::-webkit-scrollbar {
    display: none;
  }

  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .pricing-popular {
    transform: none;
  }

  .pricing-popular:hover {
    transform: translateY(-10px) scale(1.02);
  }
}

@media (max-width: 600px) {
  .container {
    padding: 0 1.25rem;
  }

  .site-header {
    min-height: auto;
    padding-top: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }

  .logo {
    font-size: 1.2rem;
  }

  .header-links {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 2px 0 6px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 0.85rem;
  }
  .header-links::-webkit-scrollbar {
    display: none;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .cta-pill {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>

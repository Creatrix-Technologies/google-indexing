<template>
  <div class="pricing-page">
    <div class="mesh-gradient"></div>
    <div class="grain-overlay"></div>

    <div class="container">
      <header class="site-header fade-in">
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
        <section class="pricing-hero fade-in">
          <h1>Simple, transparent <span class="accent">pricing</span></h1>
          <p class="pricing-subtext">
            Choose the plan that fits your indexing needs. Works with <strong>any website</strong> — WordPress, Shopify, nopCommerce, Next.js, corporate sites, or fully custom-built. All plans use Google's official Indexing API.
          </p>
        </section>

        <div class="api-limit-note fade-in delay-1">
          <span class="api-limit-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </span>
          <span>
            Google's Indexing API allows <strong>200 requests/day per Google Cloud project (i.e. per service account/API key)</strong> — this is a hard Google-enforced limit, not ours. All paid plans give you the full quota.
          </span>
        </div>

        <div class="pricing-grid fade-in delay-1">
          <article class="pricing-card glass-card">
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

          <article class="pricing-card glass-card">
            <div class="card-glow"></div>
            <div class="pricing-card-header">
              <h3>Solo</h3>
              <div class="price">
                <span class="currency">$</span><span class="amount">17</span><span class="period">/mo</span>
              </div>
              <p class="price-note">~$0.003 per request</p>
            </div>
            <ul class="pricing-features">
              <li>6,000 indexings/month</li>
              <li>3 sites</li>
              <li>API access</li>
              <li>WordPress, Shopify, nopCommerce &amp; more</li>
            </ul>
            <div class="verify-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Verify email, then pay securely
            </div>
            <router-link to="/signup?plan=solo" class="pricing-cta">Get Solo</router-link>
          </article>

          <article class="pricing-card glass-card main-card pricing-popular">
            <div class="card-glow"></div>
            <div class="popular-badge">Most popular</div>
            <div class="pricing-card-header">
              <h3>Pro</h3>
              <div class="price">
                <span class="currency">$</span><span class="amount">47</span><span class="period">/mo</span>
              </div>
              <p class="price-note">Full Google quota · 10 sites</p>
            </div>
            <ul class="pricing-features">
              <li>6,000 indexings/month</li>
              <li>10 sites</li>
              <li>API + integrations</li>
              <li>Email alerts</li>
              <li>Priority support</li>
            </ul>
            <div class="verify-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Verify email, then pay securely
            </div>
            <router-link to="/signup?plan=pro" class="pricing-cta pricing-cta-primary">Get Pro</router-link>
          </article>

          <article class="pricing-card glass-card">
            <div class="card-glow"></div>
            <div class="pricing-card-header">
              <h3>Team</h3>
              <div class="price">
                <span class="currency">$</span><span class="amount">88</span><span class="period">/mo</span>
              </div>
              <p class="price-note">Full Google quota · 30 sites</p>
            </div>
            <ul class="pricing-features">
              <li>6,000 indexings/month</li>
              <li>30 sites</li>
              <li>Up to 8 team seats</li>
              <li>API + all integrations</li>
              <li>Priority support</li>
              <li>Custom onboarding</li>
            </ul>
            <div class="verify-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Verify email, then pay securely
            </div>
            <router-link to="/signup?plan=team" class="pricing-cta">Get Team</router-link>
          </article>
        </div>

        <div class="compat-strip fade-in delay-2">
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

        <p class="pricing-annual fade-in delay-2">
          Save 2 months with annual billing —
          <a href="#pricing-contact">contact us</a> for annual plans.
        </p>

        <section id="pricing-contact" class="pricing-contact fade-in delay-2">
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

      <footer class="site-footer fade-in delay-3">
        <div class="footer-inner">
          <p>
            &copy; 2026 GoogleIndexing.com —
            <router-link to="/">Home</router-link>
          </p>
          <p class="footer-note">
            Powered by <a href="https://nopbooster.com" target="_blank" rel="noopener">Nopbooster</a>.
            Not affiliated with Google Inc.
          </p>
        </div>
        <PaymentTrustBadges variant="footer-bar" />
      </footer>
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
import { onMounted, onUnmounted, ref } from 'vue'
import PaymentTrustBadges from '../components/PaymentTrustBadges.vue'
import ContactForm from '../components/ContactForm.vue'

const showScrollTop = ref(false)

const onScroll = () => {
  showScrollTop.value = window.scrollY > 320
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
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
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.header-links {
  display: flex;
  align-items: center;
  gap: 2rem;
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
  grid-template-columns: repeat(4, 1fr);
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

.site-footer {
  padding: 2.5rem 0 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #5f6368;
  font-size: 0.88rem;
  text-align: center;
}

.footer-inner a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.footer-note {
  opacity: 0.85;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(36px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  opacity: 0;
  animation: fadeInUp 1.1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.delay-1 {
  animation-delay: 0.2s;
}
.delay-2 {
  animation-delay: 0.45s;
}
.delay-3 {
  animation-delay: 0.65s;
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

  .header-links {
    gap: 0.85rem;
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

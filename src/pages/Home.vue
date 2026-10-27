<template>
  <div class="home-page">
    <div class="mesh-gradient"></div>
    <div class="grain-overlay"></div>

    <div class="container">
      <!-- Header -->
      <MarketingHeader class="fade-in-motion" />

      <main>
        <!-- Hero -->
        <!-- Hero: no opacity-hiding — fixes Lighthouse NO_LCP / LCP on SPA -->
        <section class="hero">
          <div class="hero-grid">
            <div class="hero-copy">
              <div class="badge">INDEXING API AUTOMATION</div>
              <h1>Google <span class="accent">SEO Indexing</span><br>you can watch succeed</h1>
              <p class="hero-subtext fade-in-motion delay-1">
                Crawl your URLs, submit them through Google's official Indexing API, and follow every
                page from queued to indexed — live, with Google's own status to confirm it.
              </p>
              <div class="hero-actions fade-in-motion delay-2">
                <router-link to="/login" class="btn-hero-primary">Get Started Free</router-link>
                <a href="#how-it-works" class="btn-hero-secondary">See how it works</a>
              </div>
              <ul class="hero-proof fade-in-motion delay-3" aria-label="Highlights">
                <li>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
                  Live progress on every run
                </li>
                <li>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
                  Status verified with Google's URL Inspection
                </li>
                <li>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
                  Auto-retries and a quota-aware queue
                </li>
              </ul>
              <p class="pricing-teaser fade-in-motion delay-3">
                <router-link to="/pricing">Pricing</router-link>
                —
                free trial with 100 requests;
                <template v-if="paidFromMonthly != null">
                  paid from ${{ formatPublicPlanAmount(paidFromMonthly) }}/mo.
                </template>
                <template v-else>
                  paid plans — see
                  <router-link to="/pricing">pricing</router-link>.
                </template>
              </p>
            </div>

            <div class="hero-visual fade-in-motion delay-2">
              <IndexingPipelineDemo />
            </div>
          </div>
        </section>

        <!-- Trust bar -->
        <div class="trust-section fade-in-motion delay-3">
          <p>Works with any platform</p>
          <div class="trust-logos">
            <span>WordPress</span>
            <span>Shopify</span>
            <span>Next.js</span>
            <span>WooCommerce</span>
            <span>Custom Sites</span>
          </div>
        </div>

        <div class="hero-divider fade-in-motion delay-3"></div>

        <!-- Features -->
        <section id="features" class="features-section fade-in-motion delay-4">
          <div class="section-header">
            <h2>Everything you need to rank faster</h2>
            <p>A complete toolset built on Google's official Indexing API.</p>
          </div>
          <div class="features-grid">
            <div class="glass-card reveal-hidden">
              <div class="card-glow"></div>
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="13 2 13 9 20 9"/><path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2z"/>
                </svg>
              </div>
              <h3>Automatic<br>Indexing</h3>
              <p>Publish a page and our system instantly notifies Google. No manual sitemap submissions ever again.</p>
            </div>
            <div class="glass-card main-card reveal-hidden">
              <div class="card-glow"></div>
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <h3>Real-time<br>Monitoring</h3>
              <p>Track indexing status, crawl health, and SEO coverage across all your URLs from a single dashboard.</p>
            </div>
            <div class="glass-card reveal-hidden">
              <div class="card-glow"></div>
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>Scheduled<br>Recrawls</h3>
              <p>Set up automatic recrawl schedules so updated content is always fresh in Google's index.</p>
            </div>
          </div>
        </section>

        <div class="hero-divider fade-in-motion delay-5"></div>

        <!-- Progress: time to index -->
        <section id="results" class="impact-section reveal-hidden">
          <div class="impact-header">
            <span class="section-eyebrow">Progress you can measure</span>
            <h2>From published to indexed, faster</h2>
            <p>
              Indexing API submissions are usually picked up by Google within 1–3 days.
              Sitemap-only discovery typically takes 3–14. Hover the chart to compare any day.
            </p>
          </div>
          <div class="chart-container glass-card">
            <CoverageChart />
            <div class="impact-metrics">
              <div class="metric">
                <span class="metric-number">1–3 days</span>
                <span class="metric-label">API Indexing Time</span>
              </div>
              <div class="metric">
                <span class="metric-number">3–14 days</span>
                <span class="metric-label">Standard Method</span>
              </div>
              <div class="metric">
                <span class="metric-number">87%</span>
                <span class="metric-label">Success Rate</span>
              </div>
              <div class="metric">
                <span class="metric-number">3–5×</span>
                <span class="metric-label">Faster on Average</span>
              </div>
            </div>
          </div>
        </section>

        <div class="hero-divider"></div>

        <!-- How it works -->
        <section id="how-it-works" class="process-section reveal-hidden">
          <div class="section-header">
            <h2>How it works</h2>
            <p>Three steps to get your content indexed faster.</p>
          </div>
          <div class="process-grid">
            <div class="process-step">
              <div class="step-num">01</div>
              <h4>Connect your site</h4>
              <p>Sign in with Google and link your Search Console. Takes under 2 minutes.</p>
            </div>
            <div class="process-arrow">
              <svg viewBox="0 0 50 20"><path d="M0 10 L45 10 M35 5 L45 10 L35 15" fill="none" stroke="currentColor"/></svg>
            </div>
            <div class="process-step active">
              <div class="step-num">02</div>
              <h4>Submit URLs</h4>
              <p>Paste URLs, import a sitemap, or let our scheduler crawl automatically on your schedule.</p>
            </div>
            <div class="process-arrow">
              <svg viewBox="0 0 50 20"><path d="M0 10 L45 10 M35 5 L45 10 L35 15" fill="none" stroke="currentColor"/></svg>
            </div>
            <div class="process-step">
              <div class="step-num">03</div>
              <h4>Watch it index</h4>
              <p>Google receives the signal and prioritises crawling. Track status in real-time from your dashboard.</p>
            </div>
          </div>
        </section>

        <div class="hero-divider"></div>

        <!-- Reliability -->
        <ReliabilitySection class="reveal-hidden" />

        <div class="hero-divider"></div>

        <!-- FAQ -->
        <section id="faq" class="faq-section reveal-hidden">
          <div class="section-header">
            <h2>Frequently asked questions</h2>
            <p>Everything you need to know about the Indexing API and GoogleIndexing.com.</p>
          </div>
          <div class="faq-grid">
            <div class="faq-item glass-card">
              <h3>How does this work?</h3>
              <p>We use Google's official Indexing API to notify Google when pages are created or updated. This triggers a Googlebot visit much faster than standard sitemap discovery.</p>
            </div>
            <div class="faq-item glass-card">
              <h3>Is this affiliated with Google?</h3>
              <p>No. GoogleIndexing.com is an independent service that automates Google's publicly documented Indexing API. We are not affiliated with or endorsed by Google Inc.</p>
            </div>
            <div class="faq-item glass-card">
              <h3>Does it work for existing pages?</h3>
              <p>Yes. You can submit both new pages and updated existing pages. Triggering a re-index ensures Google sees your latest content and optimisations.</p>
            </div>
            <div class="faq-item glass-card">
              <h3>What platforms are supported?</h3>
              <p>Any website with publicly accessible URLs — WordPress, Shopify, Next.js, WooCommerce, nopCommerce, or fully custom-built sites.</p>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="cta-section reveal-hidden">
          <div class="cta-card glass-card">
            <div class="card-glow"></div>
            <h2>Ready to get indexed faster?</h2>
            <p>Start with 100 free indexing requests and watch your first URLs move from queued to indexed.</p>
            <router-link to="/login" class="btn-hero-primary">Start for Free</router-link>
          </div>
        </section>

        <div class="hero-divider"></div>

        <!-- Contact -->
        <section id="contact" class="contact-section reveal-hidden">
          <div class="section-header">
            <h2>Get in touch</h2>
            <p>We're a globally distributed team — reach us in the timezone that suits you.</p>
          </div>

          <div class="contact-form-block reveal-hidden">
            <div class="contact-form-card glass-card">
              <div class="card-glow"></div>
              <div class="contact-form-card__head">
                <span class="contact-form-card__eyebrow">Talk to our team</span>
                <h3>Send us a message</h3>
                <p>Tell us about your sites and goals. We'll come back with a tailored next step within one business day.</p>
              </div>
              <ContactForm />
            </div>

            <aside class="contact-side glass-card">
              <div class="card-glow"></div>
              <h4>What to expect</h4>
              <ul class="contact-side__list">
                <li>
                  <span class="contact-side__num">1</span>
                  <div>
                    <strong>Quick response</strong>
                    <p>Most messages are answered within one business day, often the same day.</p>
                  </div>
                </li>
                <li>
                  <span class="contact-side__num">2</span>
                  <div>
                    <strong>Real human reply</strong>
                    <p>A product specialist reviews your message — no auto-routed bot responses.</p>
                  </div>
                </li>
                <li>
                  <span class="contact-side__num">3</span>
                  <div>
                    <strong>Concrete next step</strong>
                    <p>Recommended plan, setup walkthrough, or a tailored quote — whatever fits your goal.</p>
                  </div>
                </li>
              </ul>
              <div class="contact-side__direct">
                <p>Prefer email?</p>
                <a href="mailto:sales@nopbooster.com">sales@nopbooster.com</a>
              </div>
            </aside>
          </div>

          <div class="contact-grid">
            <!-- Nepal -->
            <div class="contact-card glass-card">
              <div class="card-glow"></div>
              <img src="https://flagcdn.com/40x30/np.png" width="40" height="30" alt="Nepal" class="contact-card__flag" />
              <h3>Kathmandu</h3>
              <p class="contact-card__region">Nepal</p>
              <ul class="contact-card__details">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.57 3.4 2 2 0 0 1 3.54 1.26h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.9-.9a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.71A2 2 0 0 1 22 16.92z"/></svg>
                  <a href="tel:+9779851357889">+977 9851357889</a>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <a href="https://maps.google.com/?q=Lalitpur,Kathmandu,Nepal" target="_blank" rel="noopener">Lalitpur, Kathmandu, Nepal</a>
                </li>
              </ul>
            </div>

            <!-- Minneapolis -->
            <div class="contact-card glass-card">
              <div class="card-glow"></div>
              <img src="https://flagcdn.com/40x30/us.png" width="40" height="30" alt="United States" class="contact-card__flag" />
              <h3>Minneapolis, MN</h3>
              <p class="contact-card__region">United States</p>
              <ul class="contact-card__details">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.57 3.4 2 2 0 0 1 3.54 1.26h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.9-.9a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.71A2 2 0 0 1 22 16.92z"/></svg>
                  <a href="tel:+16125827037">612-582-7037</a>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <a href="https://maps.google.com/?q=Minneapolis,MN,USA" target="_blank" rel="noopener">Minneapolis, MN, USA</a>
                </li>
              </ul>
            </div>

            <!-- Dubai -->
            <div class="contact-card glass-card main-card">
              <div class="card-glow"></div>
              <img src="https://flagcdn.com/40x30/ae.png" width="40" height="30" alt="United Arab Emirates" class="contact-card__flag" />
              <h3>Dubai</h3>
              <p class="contact-card__region">United Arab Emirates</p>
              <ul class="contact-card__details">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.57 3.4 2 2 0 0 1 3.54 1.26h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.9-.9a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.71A2 2 0 0 1 22 16.92z"/></svg>
                  <a href="tel:+971526223988">+971 52 622 3988</a>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <a href="https://maps.google.com/?q=Dubai,UAE" target="_blank" rel="noopener">Dubai, UAE</a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Email + Social row -->
          <div class="contact-bottom reveal-hidden">
            <a href="mailto:sales@nopbooster.com" class="contact-email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2 4 12 13 22 4"/></svg>
              sales@nopbooster.com
            </a>
            <div class="contact-socials">
              <a href="https://facebook.com/creatrixVentures/" target="_blank" rel="noopener" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com/creatrixtechnologies" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://linkedin.com/company/creatrix-media-and-solutions/" target="_blank" rel="noopener" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </section>
      </main>

      <MarketingSiteFooter class="fade-in-motion delay-5" />
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
import ContactForm from '../components/ContactForm.vue'
import MarketingSiteFooter from '../components/MarketingSiteFooter.vue'
import MarketingHeader from '../components/marketing/MarketingHeader.vue'
import IndexingPipelineDemo from '../components/marketing/IndexingPipelineDemo.vue'
import CoverageChart from '../components/marketing/CoverageChart.vue'
import ReliabilitySection from '../components/marketing/ReliabilitySection.vue'
import { refreshApi } from '../api'
import {
  fetchPublicSubscriptionPlans,
  formatPublicPlanAmount,
  lowestPaidMonthlyAmount,
} from '../Shared/publicPlans'

const showScrollTop = ref(false)
const paidFromMonthly = ref<number | null>(null)

const onScroll = () => {
  showScrollTop.value = window.scrollY > 420
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  void (async () => {
    try {
      const plans = await fetchPublicSubscriptionPlans(refreshApi)
      paidFromMonthly.value = lowestPaidMonthlyAmount(plans)
    } catch {
      paidFromMonthly.value = null
    }
  })()

  document.querySelector('.home-page')?.classList.add('is-enhanced')
  // Scroll-reveal observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          // Animate chart line on first reveal
          const line = entry.target.querySelector('.api-line') as SVGPathElement | null;
          if (line) line.style.strokeDashoffset = '0';
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal-hidden').forEach((el) => observer.observe(el));

  // Mouse parallax on mesh gradient
  const mesh = document.querySelector('.mesh-gradient') as HTMLElement | null;
  if (mesh) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      mesh.style.setProperty('--mouse-x', `${x}%`);
      mesh.style.setProperty('--mouse-y', `${y}%`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
/* ===== CSS Variables ===== */
:root {
  --font-heading: 'Syne', 'Inter', sans-serif;
  --font-body: 'Outfit', 'Inter', sans-serif;
  --bg-light: #fdfdfb;
  --text-main: #0a0a0c;
  --text-muted: #5f6368;
  --accent-blue: #4285F4;
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-border: rgba(255, 255, 255, 0.8);
  --shadow-soft: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  --shadow-artistic:
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 20px 50px -12px rgba(50, 50, 93, 0.12),
    0 12px 24px -18px rgba(0, 0, 0, 0.1);
  --radius-lg: 32px;
  --radius-md: 20px;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ===== Reset & base ===== */
.home-page {
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  background-color: #fdfdfb;
  color: #0a0a0c;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  position: relative;
}

/* ===== Mesh gradient background ===== */
.mesh-gradient {
  position: fixed;
  top: -10%;
  left: -10%;
  width: 120vw;
  height: 120vh;
  z-index: 0;
  background:
    radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(66, 133, 244, 0.15) 0%, transparent 40%),
    radial-gradient(at 10% 10%, rgba(66, 133, 244, 0.10) 0px, transparent 50%),
    radial-gradient(at 90% 10%, rgba(52, 168, 83, 0.10) 0px, transparent 50%),
    radial-gradient(at 50% 50%, rgba(251, 188, 5, 0.05) 0px, transparent 50%),
    radial-gradient(at 10% 90%, rgba(234, 67, 53, 0.10) 0px, transparent 50%),
    radial-gradient(at 90% 90%, rgba(66, 133, 244, 0.10) 0px, transparent 50%);
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

/* ===== Header ===== */
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
  background: linear-gradient(45deg, #1a1a1a, #4a4a4a);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
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

.header-links a {
  white-space: nowrap;
  text-decoration: none;
  color: #0a0a0c;
  font-weight: 500;
  font-size: 0.9rem;
  transition: opacity 0.3s ease;
}

.header-links a:hover {
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

/* ===== Hero ===== */
main {
  padding: 3rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero {
  width: 100%;
  margin-bottom: 3rem;
  text-align: left;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
  gap: 3rem;
  align-items: center;
}

.hero-copy {
  min-width: 0;
}

.hero-visual {
  min-width: 0;
  position: relative;
}

.hero-visual::before {
  content: '';
  position: absolute;
  inset: 10% -6% -8% -6%;
  background: radial-gradient(60% 60% at 50% 40%, rgba(66, 133, 244, 0.18), transparent 70%);
  filter: blur(30px);
  z-index: -1;
  pointer-events: none;
}

.hero-proof {
  list-style: none;
  padding: 0;
  margin: 1.75rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
}

.hero-proof li {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #3c4043;
}

.hero-proof svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: #1e8e3e;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}

.section-eyebrow {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4285F4;
  margin-bottom: 0.75rem;
}

.badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: rgba(66, 133, 244, 0.10);
  color: #4285F4;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 2rem;
  border: 1px solid rgba(66, 133, 244, 0.20);
}

.hero h1 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(2.3rem, 3.7vw, 3.3rem);
  line-height: 1.02;
  letter-spacing: -2px;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #0a0a0c;
}

.hero h1 .accent {
  opacity: 0.5;
  font-weight: 400;
}

.hero-subtext {
  font-size: 1.2rem;
  color: #5f6368;
  margin-bottom: 2.5rem;
  font-weight: 300;
  letter-spacing: -0.4px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.9rem 2rem;
  background: #0a0a0c;
  color: white;
  border-radius: 100px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

.btn-hero-primary:hover {
  background: #2a2a2a;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
}

.btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.9rem 2rem;
  background: transparent;
  color: #0a0a0c;
  border-radius: 100px;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  border: 1.5px solid rgba(0, 0, 0, 0.14);
  transition: border-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
}

.btn-hero-secondary:hover {
  border-color: #4285F4;
  color: #4285F4;
  transform: translateY(-2px);
}

.pricing-teaser {
  max-width: 34rem;
  margin: 1.25rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: #5f6368;
  font-weight: 400;
}

.pricing-teaser :deep(a) {
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.pricing-teaser :deep(a:hover) {
  color: #0a0a0c;
}

/* ===== Trust bar ===== */
.trust-section {
  margin: 3rem 0 2rem;
  color: #5f6368;
}

.trust-section p {
  font-size: 0.82rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
}

.trust-logos {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 3rem;
}

.trust-logos span {
  font-family: 'Syne', 'Inter', sans-serif;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 1px;
  opacity: 0.35;
}

/* ===== Divider ===== */
.hero-divider {
  width: 60%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.05), transparent);
  margin: 3rem 0;
}

/* ===== Section headers ===== */
.section-header {
  margin-bottom: 3rem;
  text-align: center;
}

.section-header h2 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  letter-spacing: -2px;
  margin-bottom: 0.6rem;
  font-weight: 800;
  color: #0a0a0c;
}

.section-header p {
  color: #5f6368;
  font-size: 1.1rem;
}

/* ===== Features ===== */
.features-section {
  width: 100%;
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

/* ===== Glass card ===== */
.glass-card {
  position: relative;
  padding: 2.5rem 2rem;
  background: var(--glass-bg, rgba(255, 255, 255, 0.55));
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  text-align: left;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
}

.glass-card:hover {
  transform: translateY(-10px) scale(1.015);
  box-shadow: 0 20px 50px -12px rgba(50, 50, 93, 0.14);
  border-color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.72);
}

.main-card {
  background: rgba(255, 255, 255, 0.68);
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(66, 133, 244, 0.06), transparent 70%);
  pointer-events: none;
}

.card-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 1.5rem;
  color: #4285F4;
}

.card-icon svg {
  width: 100%;
  height: 100%;
}

.glass-card h3 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 0.85rem;
  line-height: 1.1;
  letter-spacing: -1px;
  color: #0a0a0c;
}

.glass-card p {
  color: #5f6368;
  font-size: 1rem;
  line-height: 1.65;
}

/* ===== Impact ===== */
.impact-section {
  width: 100%;
  margin-bottom: 2rem;
  text-align: left;
}

.impact-header {
  margin-bottom: 2.5rem;
}

.impact-header h2 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  letter-spacing: -2px;
  margin-bottom: 0.5rem;
  font-weight: 800;
}

.impact-header p {
  color: #5f6368;
  font-size: 1.05rem;
  max-width: 64ch;
  line-height: 1.6;
}

.chart-container {
  padding: 2rem 2.25rem 2.25rem !important;
}

.chart-container:hover {
  transform: none;
}

.impact-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.metric {
  display: flex;
  flex-direction: column;
}

.metric-number {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(1.6rem, 2.5vw, 2rem);
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #0a0a0c, #4285F4);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.4rem;
}

.metric-label {
  color: #5f6368;
  font-size: 0.8rem;
  font-weight: 500;
}

/* ===== Process ===== */
.process-section {
  width: 100%;
  margin-bottom: 2rem;
  text-align: left;
}

.process-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.process-step {
  flex: 1;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.process-step.active {
  background: white;
  box-shadow: 0 20px 50px -12px rgba(50, 50, 93, 0.12);
  border-color: rgba(66, 133, 244, 0.4);
  transform: scale(1.05);
  z-index: 2;
}

.step-num {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  opacity: 0.4;
  margin-bottom: 1.25rem;
}

.process-step h4 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.65rem;
  letter-spacing: -0.5px;
  color: #0a0a0c;
}

.process-step p {
  font-size: 0.9rem;
  color: #5f6368;
  line-height: 1.6;
}

.process-arrow {
  width: 32px;
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.12);
}

/* ===== FAQ ===== */
.faq-section {
  width: 100%;
  margin-bottom: 3rem;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.75rem;
  margin-top: 0;
}

.faq-item h3 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.15rem;
  margin-bottom: 0.75rem;
  letter-spacing: -0.4px;
  color: #0a0a0c;
  font-weight: 700;
}

/* ===== CTA section ===== */
.cta-section {
  width: 100%;
  margin-bottom: 2rem;
}

.cta-card {
  text-align: center;
  padding: 4rem 2rem !important;
}

.cta-card h2 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  letter-spacing: -2px;
  font-weight: 800;
  color: #0a0a0c;
  margin-bottom: 0.75rem;
}

.cta-card p {
  color: #5f6368;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* ===== Contact section ===== */
.contact-section {
  width: 100%;
  margin-bottom: 2rem;
}

.contact-form-block {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  align-items: stretch;
}

.contact-form-card {
  padding: 2rem 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  z-index: 1;
}

.contact-form-card__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-form-card__eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4285F4;
}

.contact-form-card h3 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #0a0a0c;
  margin: 0;
}

.contact-form-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: #5f6368;
  max-width: 52ch;
}

.contact-side {
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.contact-side h4 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: #0a0a0c;
  margin: 0;
}

.contact-side__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.contact-side__list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.contact-side__num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #0a0a0c;
  color: #fff;
  font: 700 12px/24px 'Outfit', 'Inter', sans-serif;
  text-align: center;
}

.contact-side__list strong {
  display: block;
  font-size: 0.92rem;
  color: #0a0a0c;
  font-weight: 600;
  margin-bottom: 2px;
}

.contact-side__list p {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.5;
  color: #5f6368;
}

.contact-side__direct {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.contact-side__direct p {
  margin: 0 0 4px;
  font-size: 0.78rem;
  color: #6b7280;
  font-weight: 500;
}

.contact-side__direct a {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0a0a0c;
  text-decoration: none;
  transition: color 150ms ease;
}

.contact-side__direct a:hover {
  color: #4285F4;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 900px) {
  .contact-form-block {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .contact-form-card {
    padding: 1.5rem 1.25rem 1.25rem;
  }
  .contact-side {
    padding: 1.5rem 1.25rem;
  }
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.contact-card {
  padding: 2rem 1.75rem;
}

.contact-card__flag {
  display: block;
  width: 40px;
  height: 30px;
  margin-bottom: 1rem;
  border-radius: 4px;
  object-fit: cover;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}

.contact-card h3 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #0a0a0c;
  margin: 0 0 2px;
}

.contact-card__region {
  font-size: 0.82rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #9aa0a6;
  margin: 0 0 1.25rem;
}

.contact-card__details {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.contact-card__details li {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.92rem;
  color: #5f6368;
}

.contact-card__details li svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: #4285F4;
}

.contact-card__details a {
  color: #5f6368;
  text-decoration: none;
  transition: color 150ms ease;
}

.contact-card__details a:hover {
  color: #4285F4;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Email + social row */
.contact-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

.contact-email {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 1rem;
  font-weight: 500;
  color: #0a0a0c;
  text-decoration: none;
  transition: color 150ms ease;
  pointer-events: auto;
  position: relative;
  z-index: 2;
}
.contact-email svg { width: 18px; height: 18px; color: #4285F4; flex-shrink: 0; }
.contact-email:hover { color: #4285F4; }

.contact-socials {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.contact-socials a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #5f6368;
  text-decoration: none;
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease, transform 80ms ease;
}
.contact-socials a svg { width: 16px; height: 16px; }
.contact-socials a:hover {
  background: rgba(66, 133, 244, 0.08);
  border-color: rgba(66, 133, 244, 0.25);
  color: #4285F4;
  transform: translateY(-2px);
}

/* ===== Animations (opacity never 0 — avoids Lighthouse NO_LCP on hero) ===== */
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

.delay-1 { animation-delay: 0.08s; }
.delay-2 { animation-delay: 0.14s; }
.delay-3 { animation-delay: 0.2s; }
.delay-4 { animation-delay: 0.26s; }
.delay-5 { animation-delay: 0.32s; }

@media (prefers-reduced-motion: reduce) {
  .fade-in-motion {
    animation: none !important;
  }
  .home-page.is-enhanced .reveal-hidden {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
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

.home-page.is-enhanced .reveal-hidden {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* ===== Responsive ===== */
@media (max-width: 1100px) {
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
  .header-links::-webkit-scrollbar { display: none; }
}

@media (max-width: 1024px) {
  .hero { text-align: center; }
  .hero-grid { grid-template-columns: 1fr; gap: 2.25rem; }
  .hero-actions, .hero-proof { justify-content: center; }
  .pricing-teaser { margin-left: auto; margin-right: auto; }
  .hero-visual { width: 100%; max-width: 560px; margin: 0 auto; }
  .features-grid { grid-template-columns: 1fr; gap: 1.5rem; }
  .impact-metrics { grid-template-columns: repeat(2, 1fr); }
  .contact-grid { grid-template-columns: 1fr; gap: 1.25rem; }
}

@media (max-width: 768px) {
  .process-grid { flex-direction: column; }
  .process-arrow { transform: rotate(90deg); margin: 0.5rem 0; }
  .process-step.active { transform: scale(1); }
  .impact-metrics { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 600px) {
  .container { padding: 0 1.25rem; }
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
  }
  .header-links::-webkit-scrollbar { display: none; }
  .hero h1 { font-size: 2.3rem; letter-spacing: -1.5px; }
  .hero-subtext { font-size: 1.05rem; }
  .hero-proof { flex-direction: column; align-items: center; gap: 0.5rem; }
  .chart-container { padding: 1.25rem 1rem 1.5rem !important; }
  .header-links { gap: 0.85rem; }
  .trust-logos { gap: 1.5rem; }
  .contact-bottom { flex-direction: column; align-items: flex-start; }
  .contact-grid { grid-template-columns: 1fr; }
  .impact-metrics { grid-template-columns: 1fr 1fr; }
  .cta-pill { padding: 0.5rem 1rem; font-size: 0.85rem; }
}
</style>

<template>
  <div class="checker-page">
    <div class="mesh-gradient"></div>
    <div class="grain-overlay"></div>

    <div class="container">
      <MarketingHeader />

      <main>
        <section class="checker-hero">
          <span class="eyebrow">Free tool · no sign-up</span>
          <h1>Free Google <span class="accent">indexability</span> checker</h1>
          <p class="subtext">Find out in seconds whether Google can index a page, and exactly what to fix if it can't.</p>

          <form class="check-form glass-card" @submit.prevent="runCheck()">
            <label for="check-url" class="sr-only">Page address</label>
            <input
              id="check-url"
              v-model="url"
              type="text"
              inputmode="url"
              autocomplete="url"
              spellcheck="false"
              placeholder="https://example.com/your-page"
              :disabled="loading"
            />
            <button type="submit" :disabled="loading || !url.trim()">
              {{ loading ? 'Checking…' : 'Check page' }}
            </button>
          </form>
          <p v-if="loading" class="hint">Fetching the page and its robots.txt. This takes a few seconds.</p>
          <p v-if="error" class="error" role="alert">{{ error }}</p>
        </section>

        <section v-if="report" class="result" aria-live="polite">
          <div class="verdict glass-card" :class="`verdict--${report.verdict}`">
            <span class="verdict__icon" aria-hidden="true">{{ verdictIcon }}</span>
            <div>
              <h2>{{ report.headline }}</h2>
              <p class="verdict__meta">
                <span class="mono">{{ report.finalUrl }}</span>
                <template v-if="report.httpStatus"> · HTTP {{ report.httpStatus }}</template>
                <template v-if="report.responseMs"> · {{ report.responseMs }} ms</template>
              </p>
            </div>
          </div>

          <ul class="checks">
            <li v-for="c in sortedChecks" :key="c.key" class="check glass-card" :class="`check--${statusName(c.status)}`">
              <span class="check__badge">{{ statusLabel(c.status) }}</span>
              <div class="check__body">
                <h3>{{ c.label }}</h3>
                <p>{{ c.detail }}</p>
                <p v-if="c.fix" class="check__fix"><strong>How to fix:</strong> {{ c.fix }}</p>
              </div>
            </li>
          </ul>

          <div class="cta glass-card">
            <div>
              <h2>Is it actually in Google?</h2>
              <p>
                This checks what your server tells Google. Whether Google has really indexed the page is only visible in
                Search Console. GoogleIndexing.com connects to it, checks every URL with Google's URL Inspection, and
                submits new pages for you on a schedule.
              </p>
              <p class="cta__small">Free plan: a 14-day trial with 100 URL submissions, then 50 a month. No card needed.</p>
            </div>
            <div class="cta__actions">
              <router-link to="/signup?plan=trial" class="btn btn--primary">Start free</router-link>
              <router-link to="/pricing" class="btn btn--ghost">See pricing</router-link>
            </div>
          </div>
        </section>

        <section class="explainer">
          <h2>What the checker tests</h2>
          <div class="tests">
            <div v-for="t in tests" :key="t.title" class="test glass-card">
              <h3>{{ t.title }}</h3>
              <p>{{ t.text }}</p>
            </div>
          </div>

          <h2>Questions</h2>
          <div class="faq">
            <details v-for="q in faq" :key="q.q" class="glass-card">
              <summary>{{ q.q }}</summary>
              <p>{{ q.a }}</p>
            </details>
          </div>
        </section>
      </main>

      <MarketingSiteFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarketingHeader from '../components/marketing/MarketingHeader.vue'
import MarketingSiteFooter from '../components/MarketingSiteFooter.vue'
import { refreshApi } from '../api'

type Status = 'pass' | 'info' | 'warn' | 'fail'
interface CheckItem { key: string; label: string; status: number | string; detail: string; fix?: string | null }
interface Report {
  url: string
  finalUrl: string
  verdict: 'indexable' | 'issues' | 'blocked'
  headline: string
  httpStatus: number | null
  responseMs: number
  checks: CheckItem[]
}

const route = useRoute()
const router = useRouter()
const url = ref('')
const loading = ref(false)
const error = ref('')
const report = ref<Report | null>(null)

const STATUS_ORDER: Status[] = ['pass', 'info', 'warn', 'fail']
const statusName = (s: number | string): Status =>
  typeof s === 'number' ? STATUS_ORDER[s] ?? 'info' : ((s.toLowerCase() as Status) || 'info')
const statusLabel = (s: number | string) => ({ pass: 'OK', info: 'Note', warn: 'Issue', fail: 'Blocks indexing' })[statusName(s)]

const sortedChecks = computed(() =>
  [...(report.value?.checks ?? [])].sort((a, b) => STATUS_ORDER.indexOf(statusName(b.status)) - STATUS_ORDER.indexOf(statusName(a.status)))
)
const verdictIcon = computed(() => ({ indexable: '✓', issues: '!', blocked: '✕' })[report.value?.verdict ?? 'issues'])

async function runCheck(fromQuery = false) {
  const value = url.value.trim()
  if (!value || loading.value) return
  loading.value = true
  error.value = ''
  report.value = null
  if (!fromQuery) router.replace({ query: { url: value } }).catch(() => {})
  try {
    const res = await refreshApi.post('/tools/indexability-check', { url: value })
    report.value = res.data?.data ?? null
  } catch (e: any) {
    error.value = e?.response?.data?.error?.description || 'The check could not be completed. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const q = route.query.url
  if (typeof q === 'string' && q.trim()) {
    url.value = q
    void runCheck(true)
  }
})

const tests = [
  { title: 'Status and redirects', text: 'Does the page answer 200 OK? Redirect chains, temporary redirects, 404s, 403s and server errors all stop or delay indexing.' },
  { title: 'robots.txt', text: "Evaluated the way Googlebot does it: the Googlebot group first, Allow and Disallow with wildcards, the longest rule wins. We show the exact line that blocks the page." },
  { title: 'Noindex', text: 'Both places Google reads it: the meta robots or googlebot tag in the HTML and the X-Robots-Tag HTTP header.' },
  { title: 'Canonical', text: 'If the canonical tag points somewhere else, Google usually indexes that URL instead of this one.' },
  { title: 'Content', text: 'Pages with very little text, or whose text only appears after JavaScript runs, are often left out of the index.' },
  { title: 'HTTPS', text: 'Google prefers the HTTPS version of a page; plain HTTP pages are flagged.' },
]

const faq = [
  {
    q: "The checker says Google can index my page. Why isn't it in Google?",
    a: "Being indexable means nothing stops Google; it doesn't mean Google chose to index it. Search Console reports such pages as 'Discovered, currently not indexed' or 'Crawled, currently not indexed'. Usually the fix is more unique content, internal links to the page, and asking Google to crawl it, which GoogleIndexing.com does for you through the Indexing API.",
  },
  {
    q: 'Does this tell me whether my page is in Google right now?',
    a: "No. Only Search Console knows for sure; a site: search is often wrong. Connect your site to GoogleIndexing.com (free plan available) and every URL is checked with Google's URL Inspection, including the date Google last crawled it.",
  },
  {
    q: 'Does the checker run JavaScript?',
    a: "No. It reads the HTML your server sends, which is what Google sees first. Google renders JavaScript later, so a noindex or canonical added by JavaScript is not detected here, and content that only appears after rendering is flagged.",
  },
  {
    q: 'Is it free?',
    a: 'Yes, with no sign-up. There is a limit of 20 checks per 10 minutes per visitor to keep it fast for everyone.',
  },
]
</script>

<style scoped>
.checker-page {
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  background-color: #fdfdfb;
  color: #0a0a0c;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  position: relative;
}
.mesh-gradient {
  position: fixed; top: -10%; left: -10%; width: 120vw; height: 120vh; z-index: 0; pointer-events: none; filter: blur(80px);
  background:
    radial-gradient(at 10% 10%, rgba(66, 133, 244, 0.1) 0px, transparent 50%),
    radial-gradient(at 90% 10%, rgba(52, 168, 83, 0.1) 0px, transparent 50%),
    radial-gradient(at 50% 50%, rgba(251, 188, 5, 0.05) 0px, transparent 50%);
}
.grain-overlay {
  position: fixed; inset: 0; z-index: 0; opacity: 0.03; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 1; }
main { padding: 2rem 0 3rem; }

.glass-card {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(10, 10, 12, 0.08);
  border-radius: 18px;
  backdrop-filter: blur(12px);
}

.checker-hero { text-align: center; max-width: 760px; margin: 0 auto 2.5rem; }
.eyebrow {
  display: inline-block; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: #1a73e8; background: rgba(66, 133, 244, 0.08); border-radius: 100px; padding: 0.35rem 0.9rem; margin-bottom: 1rem;
}
.checker-hero h1 {
  font-family: 'Syne', 'Inter', sans-serif; font-size: clamp(2rem, 5vw, 3rem); font-weight: 800;
  letter-spacing: -2px; line-height: 1.1; margin: 0 0 1rem;
}
.accent { opacity: 0.38; font-weight: 400; }
.subtext { color: #5f6368; font-size: 1.1rem; line-height: 1.5; margin: 0 0 1.75rem; }

.check-form { display: flex; gap: 0.5rem; padding: 0.5rem; }
.check-form input {
  flex: 1; min-width: 0; border: none; background: transparent; font: inherit; font-size: 1rem; padding: 0.8rem 1rem; outline: none; color: inherit;
}
.check-form button {
  border: none; border-radius: 12px; background: #0a0a0c; color: #fff; font: inherit; font-weight: 600; padding: 0.8rem 1.4rem; cursor: pointer;
  transition: opacity 0.2s ease;
}
.check-form button:disabled { opacity: 0.45; cursor: default; }
.check-form:focus-within { border-color: rgba(26, 115, 232, 0.5); box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.08); }
.hint { color: #5f6368; font-size: 0.9rem; margin-top: 0.75rem; }
.error { color: #c5221f; font-size: 0.95rem; margin-top: 0.75rem; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.result { max-width: 860px; margin: 0 auto 3rem; display: flex; flex-direction: column; gap: 0.75rem; }
.verdict { display: flex; gap: 1rem; align-items: center; padding: 1.25rem 1.5rem; }
.verdict h2 { margin: 0 0 0.25rem; font-size: 1.3rem; }
.verdict__icon {
  flex: 0 0 auto; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 1.2rem; color: #fff;
}
.verdict--indexable .verdict__icon { background: #188038; }
.verdict--issues .verdict__icon { background: #e37400; }
.verdict--blocked .verdict__icon { background: #c5221f; }
.verdict--indexable { border-color: rgba(24, 128, 56, 0.3); }
.verdict--issues { border-color: rgba(227, 116, 0, 0.35); }
.verdict--blocked { border-color: rgba(197, 34, 31, 0.35); }
.verdict__meta { margin: 0; color: #5f6368; font-size: 0.88rem; overflow-wrap: anywhere; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85rem; }

.checks { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.check { display: flex; gap: 1rem; padding: 1rem 1.25rem; align-items: flex-start; }
.check__badge {
  flex: 0 0 auto; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  border-radius: 100px; padding: 0.3rem 0.65rem; white-space: nowrap; margin-top: 0.1rem;
}
.check--pass .check__badge { background: rgba(24, 128, 56, 0.1); color: #137333; }
.check--info .check__badge { background: rgba(95, 99, 104, 0.1); color: #3c4043; }
.check--warn .check__badge { background: rgba(227, 116, 0, 0.12); color: #b06000; }
.check--fail .check__badge { background: rgba(197, 34, 31, 0.1); color: #a50e0e; }
.check__body h3 { margin: 0 0 0.25rem; font-size: 1rem; }
.check__body p { margin: 0; color: #3c4043; line-height: 1.5; font-size: 0.95rem; overflow-wrap: anywhere; }
.check__fix { margin-top: 0.4rem !important; }

.cta { display: flex; gap: 1.5rem; align-items: center; justify-content: space-between; padding: 1.5rem; margin-top: 0.75rem; }
.cta h2 { margin: 0 0 0.4rem; font-size: 1.2rem; }
.cta p { margin: 0 0 0.4rem; color: #3c4043; line-height: 1.5; }
.cta__small { color: #5f6368 !important; font-size: 0.9rem; }
.cta__actions { display: flex; flex-direction: column; gap: 0.5rem; flex: 0 0 auto; }
.btn { text-decoration: none; text-align: center; font-weight: 600; border-radius: 100px; padding: 0.7rem 1.4rem; white-space: nowrap; }
.btn--primary { background: #0a0a0c; color: #fff; }
.btn--ghost { border: 1px solid rgba(10, 10, 12, 0.15); color: #0a0a0c; }

.explainer { max-width: 960px; margin: 0 auto; }
.explainer h2 { font-family: 'Syne', 'Inter', sans-serif; font-size: 1.6rem; letter-spacing: -0.5px; margin: 2.5rem 0 1rem; }
.tests { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.75rem; }
.test { padding: 1.1rem 1.25rem; }
.test h3 { margin: 0 0 0.35rem; font-size: 1rem; }
.test p { margin: 0; color: #3c4043; line-height: 1.5; font-size: 0.95rem; }
.faq { display: flex; flex-direction: column; gap: 0.6rem; }
.faq details { padding: 1rem 1.25rem; }
.faq summary { cursor: pointer; font-weight: 600; }
.faq p { margin: 0.6rem 0 0; color: #3c4043; line-height: 1.55; }

@media (max-width: 640px) {
  .container { padding: 0 1rem; }
  .check-form { flex-direction: column; }
  .cta { flex-direction: column; align-items: stretch; }
  .check { flex-direction: column; gap: 0.5rem; }
}
</style>

<template>
  <div class="dashboard">
    <!-- ============ HEADER ============ -->
    <div class="page-header">
      <div class="page-header-text">
        <h1>Dashboard</h1>
        <p class="subtitle">{{ greeting }}</p>
      </div>

      <div class="header-meta">
        <span class="meta-pill">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {{ todayLabel }}
        </span>
      </div>
    </div>

    <!-- ============ GOOGLE NOT CONNECTED: Setup Guide ============ -->
    <div v-if="!googleConfig.isValid && !googleConfig.isChecking" class="google-onboarding">

      <!-- Hero card -->
      <div class="og-hero">
        <div class="og-hero__icon-wrap" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
            <circle cx="24" cy="24" r="21" stroke="#e5e7eb" stroke-width="2"/>
            <path d="M24 5.5 A18.5 18.5 0 0 1 42.5 24" stroke="#4285F4" stroke-width="4" stroke-linecap="round" fill="none"/>
            <path d="M42.5 24 A18.5 18.5 0 0 1 24 42.5" stroke="#EA4335" stroke-width="4" stroke-linecap="round" fill="none"/>
            <path d="M24 42.5 A18.5 18.5 0 0 1 5.5 24" stroke="#FBBC05" stroke-width="4" stroke-linecap="round" fill="none"/>
            <path d="M5.5 24 A18.5 18.5 0 0 1 24 5.5" stroke="#34A853" stroke-width="4" stroke-linecap="round" fill="none"/>
            <circle cx="24" cy="24" r="6" stroke="#4285F4" stroke-width="2" fill="none"/>
            <line x1="28.2" y1="28.2" x2="32" y2="32" stroke="#4285F4" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="og-hero__body">
          <span class="og-badge">Setup required</span>
          <h2 class="og-hero__title">Connect Google Search Console</h2>
          <p class="og-hero__desc">
            Upload a Google Cloud service account key to enable URL indexing, sync your Search Console
            properties, and populate this dashboard with live data.
          </p>
          <div v-if="googleConfig.errors.length" class="og-error-note">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="14" height="14">
              <circle cx="8" cy="8" r="7"/><line x1="8" y1="5.5" x2="8" y2="8.5"/><circle cx="8" cy="10.5" r=".5" fill="currentColor"/>
            </svg>
            <span>{{ googleConfig.errors[0] }}</span>
          </div>
        </div>

        <div class="og-hero__aside">
          <router-link to="/settings/google-configuration" class="og-primary-btn">
            Open Google Setup
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13">
              <line x1="3" y1="8" x2="13" y2="8"/><polyline points="8 3 13 8 8 13"/>
            </svg>
          </router-link>
          <p class="og-time-est">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="12" height="12">
              <circle cx="7" cy="7" r="6"/><polyline points="7 4 7 7 9.5 9"/>
            </svg>
            About 5 minutes to complete
          </p>
        </div>
      </div>

      <!-- Setup guide steps -->
      <div class="og-guide">
        <div class="og-guide__header">
          <div>
            <h3 class="og-guide__title">Step-by-step setup guide</h3>
            <p class="og-guide__sub">Follow these steps to get your Google integration fully configured.</p>
          </div>
          <div class="og-guide__steps-count">6 steps</div>
        </div>

        <GoogleSetupSteps :all-expanded="true" />
      </div>
    </div>

    <!-- ============ NORMAL DASHBOARD (connected) ============ -->
    <template v-else>
      <!-- STAT CARDS -->
      <div class="stats-grid" v-if="cards.length">
        <StatCard
          v-for="card in cards"
          :key="card.title"
          :label="card.title"
          :value="formatValue(card.value)"
          meta=""
          :iconType="cardIconFor(card.title)"
          :iconBg="getCardColor(card.title)"
        />
      </div>

      <div v-else class="empty-card stats-empty">
        <div class="empty-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <p class="empty-title">No metrics available</p>
        <p class="empty-desc">Once your account starts processing data, your KPIs will appear here.</p>
      </div>

      <!-- CHART -->
      <div class="chart-card" v-if="charts.length">
        <div class="card-header">
          <div class="card-header__title">
            <h3>Index summary</h3>
            <p class="card-subtitle">
              <span>Last 12 months</span>
              <span v-if="rangeLabel" class="card-subtitle__sep">·</span>
              <span v-if="rangeLabel">{{ rangeLabel }}</span>
            </p>
          </div>

          <div class="series-summary">
            <div class="series-chip series-chip--index">
              <span class="series-chip__dot"></span>
              <span class="series-chip__label">Indexed</span>
              <span class="series-chip__value">{{ formatValue(seriesTotals.index) }}</span>
            </div>
            <div class="series-chip series-chip--deindex">
              <span class="series-chip__dot"></span>
              <span class="series-chip__label">DeIndexed</span>
              <span class="series-chip__value">{{ formatValue(seriesTotals.deIndex) }}</span>
            </div>
            <div class="series-chip series-chip--failed">
              <span class="series-chip__dot"></span>
              <span class="series-chip__label">Failed</span>
              <span class="series-chip__value">{{ formatValue(seriesTotals.failed) }}</span>
            </div>
          </div>
        </div>

        <div class="chart-content">
          <highcharts :constructor-type="'chart'" :options="chartOptions" />
        </div>
      </div>

      <div v-else class="empty-card chart-empty">
        <div class="empty-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
        </div>
        <p class="empty-title">No chart data yet</p>
        <p class="empty-desc">As pages get indexed and de-indexed, your monthly trend will populate here.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import api from "../api"
import StatCard from "../components/StatCard.vue"
import GoogleSetupSteps from "../components/GoogleSetupSteps.vue"
import { useGoogleConfigStore } from "../Shared/googleConfig"
import { useSubscriptionStore } from "../Shared/subscription"

/* =======================
   Google config (reactive)
======================= */
const googleConfig = useGoogleConfigStore()

/* =======================
   Greeting
======================= */
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
})

const todayLabel = computed(() =>
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  })
)

/* =======================
   Types
======================= */
interface DashboardCard {
  title: string
  value: number
  order: number
}

interface DashboardChart {
  date: string
  successIndex: number
  successDeIndex: number
  failedIndex: number
}

/* =======================
   State
======================= */
const cards = ref<DashboardCard[]>([])
const charts = ref<DashboardChart[]>([])

const chartOptions = ref<any>({
  chart: { type: "area", height: 280 },
  title: { text: "" },
  xAxis: { categories: [] },
  yAxis: { title: { text: "Index Count" } },
  tooltip: { shared: true },
  series: []
})

/* =======================
   API Call
======================= */
const fetchDashboard = async () => {
  try {
    const res = await api.get("/dashboard")

    if (res.data?.isSuccess) {
      cards.value = res.data.data.cards.sort(
        (a: any, b: any) => a.order - b.order
      )
      charts.value = res.data.data.charts || []
      buildChart()
    } else {
      cards.value = []
      charts.value = []
    }
  } catch (err) {
    console.error("Dashboard API error", err)
    cards.value = []
    charts.value = []
  }
}

/* =======================
   Chart Builder
======================= */
const buildChart = () => {
  if (!charts.value.length) return

  const sorted = [...charts.value].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const last12 = sorted.slice(-12)

  const categories = last12.map(x =>
    new Date(x.date).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit"
    })
  )

  const success = last12.map(x => x.successIndex || 0)
  const deIndex = last12.map(x => x.successDeIndex || 0)
  const failed = last12.map(x => x.failedIndex || 0)

  chartOptions.value = {
    chart: {
      type: "area",
      height: 320,
      backgroundColor: "transparent",
      style: { fontFamily: 'Inter, system-ui, sans-serif' },
      spacing: [12, 8, 12, 8]
    },
    title: { text: "" },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories,
      lineColor: '#e5e7eb',
      tickColor: '#e5e7eb',
      labels: { style: { color: '#6b7280', fontSize: '11px' } }
    },
    yAxis: {
      title: { text: '' },
      gridLineColor: '#eceef2',
      gridLineDashStyle: 'Dash',
      labels: { style: { color: '#6b7280', fontSize: '11px' } }
    },
    tooltip: {
      shared: true,
      backgroundColor: '#111827',
      borderWidth: 0,
      borderRadius: 8,
      style: { color: '#ffffff', fontSize: '12px' },
      shadow: false
    },
    plotOptions: {
      area: {
        marker: { enabled: false, symbol: 'circle', radius: 3 },
        lineWidth: 2,
        fillOpacity: 0.10
      }
    },
    series: [
      { name: "Indexed",   data: success,  color: "#4f46e5" },
      { name: "DeIndexed", data: deIndex,  color: "#10b981" },
      { name: "Failed",    data: failed,   color: "#ef4444" }
    ]
  }
}

/* =======================
   Display Helpers
======================= */
const getCardColor = (_title: string) => "#f3f4f6"

const cardIconFor = (title: string): 'users' | 'building' | 'trending' | 'default' => {
  const t = (title || "").toLowerCase()
  if (/(user|client|customer|account)/.test(t)) return 'users'
  if (/(site|domain|website|company|organization|property)/.test(t)) return 'building'
  if (/(index|success|growth|increase|crawl)/.test(t)) return 'trending'
  return 'default'
}

const formatValue = (v: string | number) => {
  if (v === null || v === undefined || v === '') return '0'
  const n = typeof v === 'number' ? v : Number(v)
  if (Number.isNaN(n)) return String(v)
  return n.toLocaleString('en-US')
}

const seriesTotals = computed(() => {
  if (!charts.value.length) return { index: 0, deIndex: 0, failed: 0 }
  const sorted = [...charts.value].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const last12 = sorted.slice(-12)
  return {
    index: last12.reduce((acc, x) => acc + (x.successIndex || 0), 0),
    deIndex: last12.reduce((acc, x) => acc + (x.successDeIndex || 0), 0),
    failed: last12.reduce((acc, x) => acc + (x.failedIndex || 0), 0)
  }
})

const rangeLabel = computed(() => {
  if (!charts.value.length) return ''
  const sorted = [...charts.value].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const last12 = sorted.slice(-12)
  if (!last12.length) return ''
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return `${fmt(last12[0]!.date)} → ${fmt(last12[last12.length - 1]!.date)}`
})

/* =======================
   Lifecycle
======================= */
onMounted(() => {
  googleConfig.check()
  useSubscriptionStore().checkSubscription()
  fetchDashboard()
})
</script>

<style scoped>
.dashboard {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background: var(--color-background);
  font-family: var(--font-family);
}

/* ============ Header ============ */
.page-header {
  margin-bottom: var(--space-6);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.page-header-text h1 {
  font-size: var(--fs-2xl);
  color: var(--color-text);
  margin: 0 0 4px 0;
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  line-height: 1.15;
}

.subtitle {
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: var(--fw-regular);
}

.header-meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.meta-pill svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
}

/* ============ Google onboarding wrapper ============ */
.google-onboarding {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* ============ Hero card ============ */
.og-hero {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.og-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4285F4 0%, #EA4335 33%, #FBBC05 67%, #34A853 100%);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.og-hero__icon-wrap {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: var(--neutral-50);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-1);
}

.og-hero__body {
  flex: 1;
  min-width: 0;
}

.og-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--warning-50);
  border: 1px solid var(--warning-100);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--warning-700);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: var(--space-2);
}

.og-hero__title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: var(--letter-tighter);
  margin: 0 0 var(--space-2);
  line-height: 1.2;
}

.og-hero__desc {
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--space-3);
  max-width: 58ch;
}

.og-error-note {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: var(--warning-50);
  border: 1px solid var(--warning-100);
  font-size: var(--fs-sm);
  color: var(--warning-700);
  line-height: 1.45;
  max-width: 54ch;
}
.og-error-note svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.og-hero__aside {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-2);
  min-width: 190px;
}

.og-primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 18px;
  border-radius: var(--radius-md);
  background: var(--neutral-900);
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semi);
  text-decoration: none;
  transition: background 140ms ease;
  white-space: nowrap;
  text-align: center;
  letter-spacing: -0.005em;
}
.og-primary-btn:hover {
  background: var(--neutral-800);
}

.og-time-est {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 0;
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  text-align: center;
}

/* ============ Guide card ============ */
.og-guide {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}

.og-guide__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-divider);
}

.og-guide__title {
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  margin: 0;
  letter-spacing: var(--letter-tight);
}

.og-guide__sub {
  margin: 4px 0 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  line-height: 1.45;
}

.og-guide__steps-count {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ============ Stats grid ============ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

/* ============ Chart card ============ */
.chart-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--space-5) var(--space-5) var(--space-4);
  box-shadow: var(--shadow-xs);
}

.chart-card .card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-divider);
  flex-wrap: wrap;
}

.card-header__title { min-width: 0; }

.chart-card h3 {
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  margin: 0;
  letter-spacing: var(--letter-tight);
}

.card-subtitle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.card-subtitle__sep { opacity: 0.55; }

.series-summary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.series-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
}
.series-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.series-chip__value {
  color: var(--color-text);
  font-weight: var(--fw-semi);
  font-variant-numeric: tabular-nums;
}
.series-chip--index   .series-chip__dot { background: #4f46e5; }
.series-chip--deindex .series-chip__dot { background: #10b981; }
.series-chip--failed  .series-chip__dot { background: #ef4444; }

.chart-content { width: 100%; height: 340px; }

/* ============ Empty state ============ */
.empty-card {
  background: var(--color-card-bg);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-7) var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.stats-empty { margin-bottom: var(--space-6); }

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  margin-bottom: var(--space-3);
  color: var(--neutral-500);
}
.empty-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}
.empty-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: var(--fw-semi);
  color: var(--color-text);
}
.empty-desc {
  margin: 4px 0 0 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  max-width: 44ch;
}

/* ============ Responsive ============ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .og-hero {
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5);
  }
  .og-hero__aside {
    min-width: 0;
    width: 100%;
  }
  .og-primary-btn {
    width: 100%;
  }
  .og-hero__icon-wrap {
    width: 52px;
    height: 52px;
  }

  .og-guide__header {
    flex-direction: column;
    padding: var(--space-4);
    gap: var(--space-2);
  }
  .chart-card .card-header {
    flex-direction: column;
    align-items: stretch;
  }
  .series-summary { width: 100%; }
  .chart-content { height: 280px; }
}
</style>

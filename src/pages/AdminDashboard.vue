<!--
  Admin Dashboard
  ─────────────────────────────────────────────────────────────
  Platform-level overview for administrators. Different from
  the per-tenant Dashboard.vue — surfaces global KPIs, signup
  trend, revenue trend, and a recent activity log.

  TODO (backend): wire up to GET /admin/dashboard returning:
    {
      isSuccess: true,
      data: {
        cards:    [{ title, value, order, kind?: 'currency'|'count' }],
        signups:  [{ date: ISOString, count: number }],
        revenue:  [{ date: ISOString, amount: number }],
        logs:     [{ timestamp, type: 'info'|'warning'|'error',
                     actor, action, target? }]
      }
    }
  Until that endpoint exists, the page renders crisp empty states.
-->
<template>
  <div class="admin-dashboard">
    <!-- ============ HEADER ============ -->
    <div class="page-header">
      <div class="page-header-text">
        <h1>Admin overview</h1>
        <p class="subtitle">
          Platform health and activity across all tenants.
        </p>
      </div>

      <div class="header-meta">
        <span class="meta-pill" v-if="lastUpdatedLabel">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Updated {{ lastUpdatedLabel }}
        </span>
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

    <!-- ============ KPI ROW ============ -->
    <div class="kpi-grid" v-if="kpis.length">
      <div v-for="k in kpis" :key="k.title" class="kpi-card">
        <div class="kpi-card__head">
          <span class="kpi-card__icon" aria-hidden="true" v-html="iconForKpi(k.title)" />
          <span class="kpi-card__label">{{ k.title }}</span>
        </div>
        <div class="kpi-card__value">{{ formatKpiValue(k) }}</div>
        <div class="kpi-card__foot">
          <span class="kpi-card__hint">{{ hintForKpi(k.title) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-card kpi-empty">
      <div class="empty-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <p class="empty-title">No platform metrics yet</p>
      <p class="empty-desc">
        Once the admin metrics endpoint is connected, KPIs for users, sites,
        subscriptions, and revenue will appear here.
      </p>
    </div>

    <!-- ============ SIGNUPS + ACTIVITY ============ -->
    <div class="grid-2">
      <!-- Signups chart -->
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <h3>User signups</h3>
            <p class="panel__subtitle">
              <span>Last 12 months</span>
              <span v-if="signupRangeLabel" class="dot-sep">·</span>
              <span v-if="signupRangeLabel">{{ signupRangeLabel }}</span>
            </p>
          </div>
          <div class="panel__meta" v-if="signupTotal">
            <span class="meta-stat">
              <span class="meta-stat__value">{{ formatNumber(signupTotal) }}</span>
              <span class="meta-stat__label">total</span>
            </span>
          </div>
        </div>

        <div v-if="signups.length" class="panel__body">
          <highcharts :constructor-type="'chart'" :options="signupChartOptions" />
        </div>
        <div v-else class="panel__empty">
          <div class="empty-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <p class="empty-title">No signup data</p>
          <p class="empty-desc">Signup trends will populate once new users join the platform.</p>
        </div>
      </div>

      <!-- Activity log -->
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <h3>Activity</h3>
            <p class="panel__subtitle">Recent events across tenants</p>
          </div>
          <div class="panel__meta" v-if="logs.length">
            <span class="meta-pill meta-pill--soft">{{ logs.length }} events</span>
          </div>
        </div>

        <div v-if="logs.length" class="panel__body activity-list">
          <div
            v-for="(log, idx) in logs.slice(0, 12)"
            :key="`${log.timestamp}-${idx}`"
            class="activity-row"
          >
            <span
              class="activity-dot"
              :class="`activity-dot--${log.type || 'info'}`"
              aria-hidden="true"
            ></span>
            <div class="activity-body">
              <div class="activity-line">
                <strong v-if="log.actor" class="activity-actor">{{ log.actor }}</strong>
                <span class="activity-action">{{ log.action }}</span>
                <span v-if="log.target" class="activity-target">{{ log.target }}</span>
              </div>
              <div class="activity-meta">
                <span :title="absoluteDate(log.timestamp)">
                  {{ relativeDate(log.timestamp) }}
                </span>
                <span class="dot-sep">·</span>
                <span class="activity-type" :class="`activity-type--${log.type || 'info'}`">
                  {{ (log.type || 'info').toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="panel__empty">
          <div class="empty-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p class="empty-title">No activity yet</p>
          <p class="empty-desc">Tenant events, sign-ins, and admin actions will appear here.</p>
        </div>
      </div>
    </div>

    <!-- ============ REVENUE ============ -->
    <div class="panel">
      <div class="panel__head">
        <div class="panel__title">
          <h3>Revenue</h3>
          <p class="panel__subtitle">
            <span>Monthly recurring revenue</span>
            <span v-if="revenueRangeLabel" class="dot-sep">·</span>
            <span v-if="revenueRangeLabel">{{ revenueRangeLabel }}</span>
          </p>
        </div>
        <div class="panel__meta" v-if="revenueTotal">
          <div class="meta-stat-group">
            <span class="meta-stat">
              <span class="meta-stat__value">${{ formatNumber(revenueTotal) }}</span>
              <span class="meta-stat__label">total</span>
            </span>
            <span class="meta-stat" v-if="revenueAverage">
              <span class="meta-stat__value">${{ formatNumber(revenueAverage) }}</span>
              <span class="meta-stat__label">avg / mo</span>
            </span>
          </div>
        </div>
      </div>

      <div v-if="revenue.length" class="panel__body">
        <highcharts :constructor-type="'chart'" :options="revenueChartOptions" />
      </div>
      <div v-else class="panel__empty">
        <div class="empty-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <p class="empty-title">No revenue data</p>
        <p class="empty-desc">Subscription revenue will appear here once billing data is available.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import { useGoogleConfigStore } from '../Shared/googleConfig'
import { useSubscriptionStore } from '../Shared/subscription'

/* =======================
   Types
======================= */
interface KpiCard {
  title: string
  value: number
  order: number
  kind?: 'currency' | 'count'
}

interface SignupPoint {
  date: string
  count: number
}

interface RevenuePoint {
  date: string
  amount: number
}

interface ActivityLog {
  timestamp: string
  type?: 'info' | 'warning' | 'error' | 'success'
  actor?: string
  action: string
  target?: string
}

/* =======================
   State
======================= */
const kpis = ref<KpiCard[]>([])
const signups = ref<SignupPoint[]>([])
const revenue = ref<RevenuePoint[]>([])
const logs = ref<ActivityLog[]>([])
const lastUpdated = ref<Date | null>(null)

/* =======================
   Header time labels
======================= */
const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
)

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  return relativeDate(lastUpdated.value.toISOString())
})

/* =======================
   API
======================= */
const fetchAdminDashboard = async () => {
  try {
    // TODO: backend endpoint — see file header comment for expected schema.
    const res = await api.get('/admin/dashboard')

    if (res.data?.isSuccess) {
      const d = res.data.data || {}
      kpis.value = (d.cards || []).sort((a: KpiCard, b: KpiCard) => a.order - b.order)
      signups.value = d.signups || []
      revenue.value = d.revenue || []
      logs.value = d.logs || []
      lastUpdated.value = new Date()
      buildSignupChart()
      buildRevenueChart()
    } else {
      resetState()
    }
  } catch {
    resetState()
  }
}

const resetState = () => {
  kpis.value = []
  signups.value = []
  revenue.value = []
  logs.value = []
}

/* =======================
   KPI helpers
======================= */
const formatKpiValue = (k: KpiCard) => {
  const n = Number(k.value || 0)
  if (k.kind === 'currency' || /revenue|mrr|spent|earned|paid/i.test(k.title)) {
    if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
    return `$${n.toLocaleString('en-US')}`
  }
  return n.toLocaleString('en-US')
}

const iconForKpi = (title: string) => {
  const t = (title || '').toLowerCase()
  if (/(user|customer|account)/.test(t)) return iconUsers
  if (/(site|domain|website|property)/.test(t)) return iconGlobe
  if (/(subscription|plan|membership)/.test(t)) return iconShield
  if (/(revenue|mrr|earned|paid|spent)/.test(t)) return iconDollar
  return iconActivity
}

const hintForKpi = (title: string) => {
  const t = (title || '').toLowerCase()
  if (/(user|customer|account)/.test(t)) return 'Across all tenants'
  if (/(site|domain|website|property)/.test(t)) return 'Connected properties'
  if (/(subscription|plan|membership)/.test(t)) return 'Currently active'
  if (/(revenue|mrr|earned|paid|spent)/.test(t)) return 'This billing cycle'
  return 'Platform total'
}

/* Inline SVG strings — kept here so CSS can scope sizing */
const iconUsers = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`
const iconGlobe = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3a14 14 0 0 1 0 18"/>
    <path d="M12 3a14 14 0 0 0 0 18"/>
  </svg>`
const iconShield = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>`
const iconDollar = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>`
const iconActivity = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 12h4l3-8 4 16 3-8h4"/>
  </svg>`

/* =======================
   Signups
======================= */
const sortedSignups = computed(() =>
  [...signups.value]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12)
)
const signupTotal = computed(() =>
  sortedSignups.value.reduce((acc, p) => acc + (p.count || 0), 0)
)
const signupRangeLabel = computed(() => formatRange(sortedSignups.value.map(s => s.date)))

const signupChartOptions = ref<any>({})
const buildSignupChart = () => {
  const data = sortedSignups.value
  if (!data.length) return
  const categories = data.map(p =>
    new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  )
  signupChartOptions.value = baseChart('column', categories, [
    { name: 'Signups', data: data.map(p => p.count || 0), color: '#4f46e5' }
  ])
}

/* =======================
   Revenue
======================= */
const sortedRevenue = computed(() =>
  [...revenue.value]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12)
)
const revenueTotal = computed(() =>
  sortedRevenue.value.reduce((acc, p) => acc + (p.amount || 0), 0)
)
const revenueAverage = computed(() => {
  const arr = sortedRevenue.value
  if (!arr.length) return 0
  return Math.round(revenueTotal.value / arr.length)
})
const revenueRangeLabel = computed(() => formatRange(sortedRevenue.value.map(r => r.date)))

const revenueChartOptions = ref<any>({})
const buildRevenueChart = () => {
  const data = sortedRevenue.value
  if (!data.length) return
  const categories = data.map(p =>
    new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  )
  revenueChartOptions.value = baseChart('area', categories, [
    { name: 'Revenue', data: data.map(p => p.amount || 0), color: '#10b981' }
  ], { yPrefix: '$' })
}

/* =======================
   Chart factory (shared style)
======================= */
const baseChart = (
  type: 'area' | 'column',
  categories: string[],
  series: any[],
  opts: { yPrefix?: string } = {}
) => ({
  chart: {
    type,
    height: 300,
    backgroundColor: 'transparent',
    style: { fontFamily: 'Inter, system-ui, sans-serif' },
    spacing: [12, 8, 12, 8]
  },
  title: { text: '' },
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
    labels: {
      style: { color: '#6b7280', fontSize: '11px' },
      formatter: function (this: any) {
        const v = this.value
        const formatted = typeof v === 'number' ? v.toLocaleString('en-US') : v
        return `${opts.yPrefix || ''}${formatted}`
      }
    }
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
      marker: { enabled: false },
      lineWidth: 2,
      fillOpacity: 0.10
    },
    column: {
      borderRadius: 4,
      pointPadding: 0.15,
      groupPadding: 0.1
    }
  },
  series
})

/* =======================
   Date / number helpers
======================= */
const formatNumber = (n: number) => Number(n || 0).toLocaleString('en-US')

const formatRange = (dates: string[]) => {
  if (!dates.length) return ''
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return `${fmt(dates[0])} → ${fmt(dates[dates.length - 1])}`
}

const absoluteDate = (date: string) =>
  new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

function relativeDate(date: string) {
  if (!date) return '—'
  const ts = new Date(date).getTime()
  const diff = Math.max(0, Date.now() - ts)
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} ${hr === 1 ? 'hour' : 'hours'} ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ${day === 1 ? 'day' : 'days'} ago`
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

/* =======================
   Lifecycle
======================= */
onMounted(() => {
  useGoogleConfigStore().check()
  useSubscriptionStore().checkSubscription()
  fetchAdminDashboard()
})
</script>

<style scoped>
.admin-dashboard {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background: var(--color-background);
  font-family: var(--font-family);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* ============ Header ============ */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-1);
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
  max-width: 56ch;
}
.header-meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
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
.meta-pill--soft {
  background: var(--neutral-50);
}

/* ============ KPI grid ============ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}

.kpi-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.kpi-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.kpi-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.kpi-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  color: var(--neutral-600);
}
.kpi-card:hover .kpi-card__icon {
  color: var(--color-text);
  border-color: var(--color-border-strong);
}
.kpi-card__icon :deep(svg) {
  width: 16px;
  height: 16px;
}
.kpi-card__label {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  font-weight: var(--fw-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.kpi-card__value {
  font-size: 30px;
  color: var(--color-text);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
}

.kpi-card__foot {
  margin-top: auto;
}
.kpi-card__hint {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
}

/* ============ 2-column grid ============ */
.grid-2 {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: var(--space-4);
}
@media (max-width: 1100px) {
  .grid-2 { grid-template-columns: 1fr; }
}

/* ============ Panel (chart / activity card) ============ */
.panel {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-divider);
  flex-wrap: wrap;
}
.panel__title h3 {
  margin: 0;
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: var(--letter-tight);
}
.panel__subtitle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0 0 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.dot-sep { opacity: 0.55; }

.panel__meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}
.meta-stat-group {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-4);
}
.meta-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.meta-stat__value {
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: -0.01em;
}
.meta-stat__label {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.panel__body {
  padding: var(--space-4) var(--space-5) var(--space-5);
  min-height: 300px;
}

/* ============ Activity list ============ */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  max-height: 360px;
  overflow-y: auto;
}

.activity-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px var(--space-5);
  border-bottom: 1px solid var(--color-divider);
}
.activity-row:last-child { border-bottom: none; }

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--neutral-400);
  margin-top: 7px;
  flex-shrink: 0;
}
.activity-dot--success { background: var(--color-success); }
.activity-dot--warning { background: var(--color-warning, #f59e0b); }
.activity-dot--error   { background: var(--color-danger); }
.activity-dot--info    { background: var(--color-accent); }

.activity-body { min-width: 0; flex: 1; }

.activity-line {
  font-size: var(--fs-sm);
  color: var(--color-text);
  line-height: 1.4;
  word-break: break-word;
}
.activity-actor {
  font-weight: var(--fw-semi);
  color: var(--color-text);
  margin-right: 4px;
}
.activity-action { color: var(--color-text-secondary); }
.activity-target {
  margin-left: 4px;
  color: var(--color-text);
  font-weight: var(--fw-medium);
}

.activity-meta {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.activity-type {
  font-weight: var(--fw-semi);
  letter-spacing: 0.04em;
}
.activity-type--success { color: var(--success-700); }
.activity-type--warning { color: var(--warning-700, #b45309); }
.activity-type--error   { color: var(--danger-700); }
.activity-type--info    { color: var(--info-700, #1d4ed8); }

/* ============ Empty states ============ */
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
.kpi-empty {}

.panel__empty {
  padding: var(--space-7) var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 300px;
}

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
  }
  .panel__head {
    flex-direction: column;
    align-items: stretch;
  }
  .meta-stat-group { gap: var(--space-3); }
  .panel__body { padding: var(--space-3) var(--space-4) var(--space-4); }
  .activity-row { padding: 10px var(--space-4); }
}
</style>

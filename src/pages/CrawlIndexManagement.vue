<template>
  <div class="page-container">

    <!-- ============ HEADER ============ -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Crawl &amp; Index Management</h1>
        <p class="subtitle">
          Take control of your website crawls and indexing in one place.
        </p>
      </div>
    </div>

    <!-- ============ STATS — grouped panels ============ -->
    <div class="stats-row">
      <section class="stat-panel" aria-label="Crawl statistics">
        <header class="stat-panel__head">
          <span class="stat-panel__icon stat-panel__icon--crawl" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </span>
          <div>
            <h2 class="stat-panel__title">Crawl</h2>
            <p class="stat-panel__hint">Site discovery pipeline</p>
          </div>
        </header>

        <div class="stat-panel__body">
          <div class="stat-cell">
            <span class="stat-cell__label">Queued</span>
            <span class="stat-cell__value">{{ stats.queuedCount }}</span>
            <span class="stat-cell__pill stat-cell__pill--warning">
              <span class="dot"></span> waiting
            </span>
          </div>
          <div class="stat-cell">
            <span class="stat-cell__label">Success</span>
            <span class="stat-cell__value">{{ stats.crawledCount }}</span>
            <span class="stat-cell__pill stat-cell__pill--success">
              <span class="dot"></span> crawled
            </span>
          </div>
          <div class="stat-cell">
            <span class="stat-cell__label">Failed</span>
            <span class="stat-cell__value">{{ stats.failedCount }}</span>
            <span class="stat-cell__pill stat-cell__pill--danger">
              <span class="dot"></span> errors
            </span>
          </div>
        </div>
      </section>

      <section class="stat-panel" aria-label="Indexing statistics">
        <header class="stat-panel__head">
          <span class="stat-panel__icon stat-panel__icon--index" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          <div>
            <h2 class="stat-panel__title">Indexing</h2>
            <p class="stat-panel__hint">Submissions to Google</p>
          </div>
        </header>

        <div class="stat-panel__body stat-panel__body--4">
          <div class="stat-cell">
            <span class="stat-cell__label">Indexed</span>
            <span class="stat-cell__value">{{ stats.indexedSucceed }}</span>
            <span class="stat-cell__pill stat-cell__pill--success">
              <span class="dot"></span> live
            </span>
          </div>
          <div class="stat-cell">
            <span class="stat-cell__label">DeIndexed</span>
            <span class="stat-cell__value">{{ stats.deIndexedSucceed }}</span>
            <span class="stat-cell__pill stat-cell__pill--neutral">
              <span class="dot"></span> removed
            </span>
          </div>
          <div class="stat-cell">
            <span class="stat-cell__label">Queued</span>
            <span class="stat-cell__value">{{ stats.indexedQueued }}</span>
            <span class="stat-cell__pill stat-cell__pill--warning">
              <span class="dot"></span> waiting
            </span>
          </div>
          <div class="stat-cell">
            <span class="stat-cell__label">Failed</span>
            <span class="stat-cell__value">{{ stats.indexedFailed }}</span>
            <span class="stat-cell__pill stat-cell__pill--danger">
              <span class="dot"></span> errors
            </span>
          </div>
        </div>
      </section>
    </div>

    <!-- ============ NOTICE ============ -->
    <div class="notice notice--info" role="status">
      <span class="notice__icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </span>
      <div class="notice__body">
        <p class="notice__title">Crawl runs every minute</p>
        <p class="notice__text">
          Each crawl process is locked while in progress and released upon completion.
        </p>
      </div>
    </div>

    <!-- ============ TABLE ============ -->
    <div class="grid-card">
      <!-- Bulk-action bar (visible only when selection exists) -->
      <div v-if="selectedSites.length > 0" class="bulk-bar" role="region" aria-label="Bulk actions">
        <div class="bulk-bar__info">
          <span class="bulk-bar__count">{{ selectedSites.length }}</span>
          <span class="bulk-bar__label">
            {{ selectedSites.length === 1 ? 'site selected' : 'sites selected' }}
          </span>
        </div>
        <div class="bulk-bar__actions">
          <button class="btn-ghost" @click="clearSelection">Clear</button>
          <button class="btn-primary" @click="queueForCrawl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Queue for crawl
          </button>
        </div>
      </div>

      <!-- Quiet header (no selection) -->
      <div v-else class="grid-toolbar">
        <span class="grid-toolbar__total">
          <strong>{{ activeSites.length }}</strong>
          {{ activeSites.length === 1 ? 'active site' : 'active sites' }}
        </span>
      </div>

      <div class="table-scroll">
        <table class="crawl-table">
          <thead>
            <tr>
              <th class="col-select">
                <label class="checkbox-container" :title="isAllSelected ? 'Deselect all' : 'Select all'">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    :indeterminate.prop="isPartiallySelected"
                    @change="toggleSelectAll"
                    class="checkbox-input"
                    :aria-label="isAllSelected ? 'Deselect all sites' : 'Select all sites'"
                  />
                </label>
              </th>
              <th class="col-url">URL</th>
              <th class="col-type">Type</th>
              <th class="col-status">Status</th>
              <th class="col-date">Last crawl</th>
              <th class="col-actions"></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="site in activeSites"
              :key="site.id"
              :class="{ 'row-selected': selectedSites.includes(site.id) }"
            >
              <td class="col-select">
                <input
                  type="checkbox"
                  class="checkbox-input"
                  :checked="selectedSites.includes(site.id)"
                  @change="toggleSiteSelection(site.id)"
                  :aria-label="`Select ${site.url}`"
                />
              </td>

              <td class="col-url">
                <div class="url-cell">
                  <span class="url-chip" aria-hidden="true">{{ siteInitial(site) }}</span>
                  <a :href="site.url" target="_blank" rel="noopener" :title="site.url" class="url-link">
                    {{ site.url }}
                  </a>
                </div>
              </td>

              <td class="col-type">
                <span class="type-pill">{{ site.type || '—' }}</span>
              </td>

              <!-- STATUS / LOADER -->
              <td class="col-status">
                <div class="status-stack">
                  <!-- Loader -->
                  <div
                    v-if="progressMap[site.id]?.status === 'in_progress'"
                    class="loader-wrapper"
                  >
                    <span class="spinner" aria-hidden="true"></span>
                    <span class="loader-text">Processing…</span>
                  </div>

                  <!-- SSE message -->
                  <span
                    v-if="progressMap[site.id]?.message"
                    class="sse-message"
                  >
                    {{ progressMap[site.id]?.message }}
                  </span>

                  <!-- Status badge -->
                  <template v-else-if="!progressMap[site.id]">
                    <span
                      class="status-badge"
                      :class="getStatusClass(site.crawlStatus)"
                    >
                      <span class="dot"></span>
                      {{ site.crawlStatus || 'Pending' }}
                    </span>
                    <span v-if="site.crawlFailedReason" class="status-reason" :title="site.crawlFailedReason">
                      {{ site.crawlFailedReason }}
                    </span>
                  </template>
                </div>
              </td>

              <td class="col-date">
                <span :title="absoluteDate(site.crawlDate)">
                  {{ relativeDate(site.crawlDate) }}
                </span>
              </td>

              <td class="col-actions">
                <div class="action-cell">
                  <button
                    v-if="site.crawlStatus !== 'In Progress'"
                    class="action-btn"
                    @click="startCrawl(site.id)"
                    :title="`Crawl ${site.url}`"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Crawl
                  </button>

                  <button
                    v-if="site.crawlStatus === 'Success'"
                    class="action-btn action-btn--view"
                    @click="viewDetails(site.id)"
                    :title="`View details for ${site.url}`"
                  >
                    View
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="activeSites.length === 0">
              <td colspan="6" class="empty-cell">
                <div class="empty-state">
                  <div class="empty-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <p class="empty-title">No active sites</p>
                  <p class="empty-desc">Add a site under Site Management to start crawling.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import { useGoogleConfigStore } from '../Shared/googleConfig'
import { useSubscriptionStore } from '../Shared/subscription'

const toast = useToast()
const router = useRouter()
const googleConfigStore = useGoogleConfigStore()
const subscriptionStore = useSubscriptionStore()

interface Site {
  id: number
  name: string
  url: string
  type: string
  status: 'Active' | 'Inactive'
  crawlStatus?: 'Success' | 'Failed' | 'Queue' | 'In Progress'
  crawlDate?: Date
  isIndexable: 'Yes' | 'No'
  crawlFailedReason:string
}

interface StatusProgress {
  status: 'in_progress' | 'completed' | 'failed'
  message?: string
}

const allSites = ref<Site[]>([])
const selectedSites = ref<number[]>([])
const progressMap = ref<Record<number, StatusProgress>>({})
const eventSources = new Map<number, EventSource>()

const stats = ref({
  queuedCount: 0,
  crawledCount: 0,
  failedCount: 0,
  indexedSucceed: 0,
  deIndexedSucceed: 0,
  indexedFailed: 0,
  indexedQueued: 0
})

const activeSites = computed(() =>
  allSites.value.filter(s => s.status === 'Active')
)

const isAllSelected = computed(() =>
  activeSites.value.length > 0 &&
  selectedSites.value.length === activeSites.value.length
)
const isPartiallySelected = computed(() =>
  selectedSites.value.length > 0 &&
  selectedSites.value.length < activeSites.value.length
)

const toggleSelectAll = () => {
  selectedSites.value = isAllSelected.value
    ? []
    : activeSites.value.map(s => s.id)
}

const clearSelection = () => {
  selectedSites.value = []
}

const queueForCrawl = async () => {
  if (!selectedSites.value.length) return

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to crawl ${selectedSites.value.length} selected site(s)?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  })

  if (!result.isConfirmed) return

  const siteIdsToQueue = selectedSites.value.filter(id => {
    const site = allSites.value.find(s => s.id === id)
    return site && site.crawlStatus !== 'In Progress'
  })

  if (!siteIdsToQueue.length) {
    toast.info('Selected sites are already in progress')
    return
  }

  try {
    const res = await api.post('/crawl/edit', {
      webSiteId: siteIdsToQueue
    })

    if (res.data?.isSuccess) {
      siteIdsToQueue.forEach(id => {
        const site = allSites.value.find(s => s.id === id)
        if (site) {
          site.crawlStatus = 'Queue'
        }
      })

      selectedSites.value = []
      fetchStats()
      toast.success(res.data.message || 'Sites queued successfully')
    }
  } catch (err) {
    handleAuthError(err)
  }
}

const toggleSiteSelection = (id: number) => {
  const idx = selectedSites.value.indexOf(id)
  idx > -1
    ? selectedSites.value.splice(idx, 1)
    : selectedSites.value.push(id)
}

const handleAuthError = (err: any) => {
  const status = err?.response?.status
  const data = err?.response?.data

  if (status === 401) {
    toast.error('Session expired. Please login again.')
    router.push({ name: 'Login' })
    return
  }

  if (status === 400) {
    const message =
      data?.error?.description ||
      data?.message ||
      'Something went wrong.'

    toast.warning(message)
    return
  }

  toast.error('Unexpected error. Please try again.')
}


const fetchCrawlSites = async () => {
  try {
    const res = await api.get('/crawl/site-list?PageNo=1&PageSize=10')
    allSites.value = (res.data?.data || []).map((item: any) => {
      const site: Site = {
        id: item.webSiteId,
        name: item.siteName,
        url: item.url,
        type: item.siteType,
        status: 'Active',
        crawlStatus: item.crawlStatus,
        isIndexable: item.isIndexable ? 'Yes' : 'No',
        crawlFailedReason: item.crawlFailedReason || '',
        crawlDate: item.crawlCompletedDate
          ? new Date(item.crawlCompletedDate)
          : undefined
      }

      if (site.crawlStatus === 'In Progress') {
        progressMap.value[site.id] = { status: 'in_progress' }
        listenToCrawlProgress(site.id)
      }

      return site
    })
  } catch (err) {
    handleAuthError(err)
  }
}

const fetchStats = async () => {
  try {
    const res = await api.get('/crawl/site-and-queue-count')
    if (res.data?.isSuccess) stats.value = res.data.data
  } catch (err) {
    handleAuthError(err)
  }
}

const startCrawl = async (id: number) => {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to crawl this site?',
    icon: 'warning',
    showCancelButton: true
  })

  if (!confirm.isConfirmed) return

  try {
    const res = await api.post('/crawl/edit', { webSiteId: [id] })
    if (res.data.isSuccess) {
      const site = allSites.value.find(s => s.id === id)
    if (site) {
      site.crawlStatus = 'Queue'

      listenToCrawlProgress(site.id)
    }
      toast.success(res.data.message)


    }
  } catch (err) {
    handleAuthError(err)
  }
}

const listenToCrawlProgress = (siteId: number) => {
  if (eventSources.has(siteId)) return

  const source = new EventSource(
    `${import.meta.env.VITE_API_BASE_URL}/crawl/listen/${siteId}`
  )
  eventSources.set(siteId, source)

  source.onmessage = async (e) => {
    if (!e.data) return

    const data = JSON.parse(e.data)
    progressMap.value[siteId] = data

    if (data.status !== 'in_progress') {
      source.close()
      eventSources.delete(siteId)
      fetchStats()
    }
    if (data.status === 'completed') {
     await fetchCrawlSites()
    }
  }

  source.onerror = () => {
    source.close()
    eventSources.delete(siteId)
  }
}

const viewDetails = (siteId: number) => {
  router.push({ name: 'CrawlIndexDetails', params: { siteId } })
}

const getStatusClass = (status?: string) =>
  `status-${(status || 'queue').toLowerCase().replace(/\s+/g, '-')}`

/* ---------- display helpers (UI only) ---------- */
const siteInitial = (site: Site) => {
  const source = (site.name && site.name.trim()) || site.url || '?'
  // Strip protocol for URL-derived initial
  const stripped = source.replace(/^https?:\/\//, '').replace(/^www\./, '')
  return stripped.charAt(0).toUpperCase() || '?'
}

const absoluteDate = (date?: Date) => {
  if (!date) return 'Never crawled'
  return date.toLocaleString()
}

const relativeDate = (date?: Date) => {
  if (!date) return 'Never'
  const now = Date.now()
  const diff = Math.max(0, now - date.getTime())
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'Just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} ${hr === 1 ? 'hour' : 'hours'} ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ${day === 1 ? 'day' : 'days'} ago`
  return date.toLocaleDateString()
}

onMounted(async () => {
  await fetchCrawlSites()
  await fetchStats()
  googleConfigStore.check()
  subscriptionStore.checkSubscription()
})
</script>


<style scoped>
.page-container {
  flex: 1;
  padding: 0;
  background: var(--color-background);
  overflow-x: auto;
  font-family: var(--font-family);
}

/* ============ Header ============ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-5);
  gap: var(--space-4);
  flex-wrap: wrap;
}
.page-title {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  color: var(--color-text);
  margin: 0 0 4px 0;
  line-height: 1.15;
}
.subtitle {
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 56ch;
}

/* ============ Stats — grouped panels ============ */
.stats-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.stat-panel {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.stat-panel:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.stat-panel__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-divider);
}
.stat-panel__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  background: var(--neutral-50);
  color: var(--neutral-700);
}
.stat-panel__icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}
.stat-panel__icon--crawl {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.18);
  color: var(--color-accent);
}
.stat-panel__icon--index {
  background: var(--success-50);
  border-color: var(--success-100);
  color: var(--color-success);
}
.stat-panel__title {
  margin: 0;
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: var(--letter-tight);
  line-height: 1.2;
}
.stat-panel__hint {
  margin: 2px 0 0 0;
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
}

.stat-panel__body {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.stat-panel__body--4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-cell {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-right: 1px solid var(--color-divider);
  min-width: 0;
}
.stat-cell:last-child { border-right: none; }

.stat-cell__label {
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.stat-cell__value {
  font-size: 26px;
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.stat-cell__pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: var(--fw-medium);
  letter-spacing: 0.005em;
  border: 1px solid transparent;
  width: fit-content;
}
.stat-cell__pill .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}
.stat-cell__pill--success { background: var(--success-50); color: var(--success-700); border-color: var(--success-100); }
.stat-cell__pill--warning { background: var(--warning-50); color: var(--warning-700); border-color: var(--warning-100); }
.stat-cell__pill--danger  { background: var(--danger-50);  color: var(--danger-700);  border-color: var(--danger-100); }
.stat-cell__pill--neutral { background: var(--neutral-100); color: var(--neutral-600); border-color: var(--color-border); }

/* ============ Notice ============ */
.notice {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: 12px var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-card-bg);
  margin-bottom: var(--space-5);
}
.notice--info {
  background: var(--info-50);
  border-color: var(--info-100);
}
.notice__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: var(--info-700);
}
.notice__icon svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.notice__body { line-height: 1.4; }
.notice__title {
  margin: 0;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semi);
  color: var(--info-700);
  letter-spacing: 0.005em;
}
.notice__text {
  margin: 2px 0 0 0;
  font-size: var(--fs-sm);
  color: var(--info-700);
  opacity: 0.9;
}

/* ============ Card / table shell ============ */
.grid-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}
.table-scroll { overflow-x: auto; }

/* ============ Toolbar / bulk-action bar ============ */
.grid-toolbar {
  padding: 10px var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  background: var(--neutral-50);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.grid-toolbar__total {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.grid-toolbar__total strong {
  color: var(--color-text);
  font-weight: var(--fw-semi);
  margin-right: 4px;
}

.bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 10px var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: rgba(99, 102, 241, 0.06);
}
.bulk-bar__info {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: var(--fs-sm);
  color: var(--color-text);
}
.bulk-bar__count {
  font-weight: var(--fw-semi);
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
}
.bulk-bar__label { color: var(--color-text-secondary); }

.bulk-bar__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

/* ============ Buttons ============ */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: var(--color-accent);
  color: var(--color-accent-fg);
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  font-size: var(--fs-sm);
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 140ms ease;
  font-family: inherit;
  letter-spacing: -0.005em;
}
.btn-primary svg {
  width: 12px;
  height: 12px;
  fill: currentColor;
  stroke: currentColor;
  stroke-width: 1;
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--ring-accent);
}

.btn-ghost {
  padding: 7px 12px;
  background: transparent;
  color: var(--color-text);
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  font-size: var(--fs-sm);
  cursor: pointer;
  border: 1px solid var(--color-border-strong);
  transition: background 140ms ease, border-color 140ms ease;
  font-family: inherit;
}
.btn-ghost:hover {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}

/* ============ Table ============ */
.checkbox-container {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-accent);
}

.crawl-table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
  min-width: 880px;
}
.crawl-table thead {
  background: var(--neutral-50);
}
.crawl-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}
.crawl-table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--fs-base);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-divider);
  vertical-align: middle;
}
.crawl-table tbody tr {
  transition: background 120ms ease;
}
.crawl-table tbody tr:hover {
  background: var(--neutral-50);
}
.crawl-table tbody tr.row-selected {
  background: rgba(99, 102, 241, 0.05);
}
.crawl-table tbody tr.row-selected:hover {
  background: rgba(99, 102, 241, 0.08);
}
.crawl-table tbody tr:last-child td {
  border-bottom: none;
}

.col-select  { width: 40px; padding-right: 0 !important; }
.col-url     { min-width: 280px; }
.col-type    { width: 140px; }
.col-status  { min-width: 200px; }
.col-date    { width: 160px; white-space: nowrap; color: var(--color-text-secondary); font-size: var(--fs-sm); }
.col-actions { width: 180px; }

/* URL cell */
.url-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.url-chip {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: 0.02em;
}
.url-link {
  color: var(--color-text);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420px;
  font-size: var(--fs-sm);
}
.url-link:hover {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Type pill */
.type-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  color: var(--neutral-700);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  letter-spacing: 0.01em;
}

/* Status */
.status-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  background: var(--neutral-100);
  color: var(--neutral-700);
  border: 1px solid var(--color-border);
  width: fit-content;
}
.status-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.status-success     { background: var(--success-50); color: var(--success-700); border-color: var(--success-100); }
.status-failed      { background: var(--danger-50);  color: var(--danger-700);  border-color: var(--danger-100); }
.status-queue       { background: var(--warning-50); color: var(--warning-700); border-color: var(--warning-100); }
.status-in-progress { background: rgba(99, 102, 241, 0.08); color: var(--color-accent); border-color: rgba(99, 102, 241, 0.18); }

.status-reason {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280px;
}

/* Loader */
.loader-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.spinner {
  width: 13px;
  height: 13px;
  border: 2px solid var(--color-border-strong);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}
.loader-text {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-accent);
}
.sse-message {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  line-height: 1.4;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Action buttons */
.action-cell {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: var(--color-card-bg);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
  font-family: inherit;
  white-space: nowrap;
}
.action-btn svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  transition: transform 140ms ease;
}
.action-btn:hover {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}
.action-btn--view {
  color: var(--color-text);
}
.action-btn--view:hover {
  background: var(--neutral-900);
  border-color: var(--neutral-900);
  color: #fff;
}
.action-btn--view:hover svg { transform: translateX(2px); }

/* Empty state */
.empty-cell {
  border-bottom: none !important;
  padding: 0 !important;
  background: transparent;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-7) var(--space-5);
  text-align: center;
  color: var(--color-text-secondary);
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
}

/* ============ Responsive ============ */
@media (max-width: 1080px) {
  .stats-row { grid-template-columns: 1fr; }
  .stat-panel__body--4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stat-cell { border-right: none; border-bottom: 1px solid var(--color-divider); }
  .stat-cell:nth-last-child(-n+2) { border-bottom: none; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: var(--space-3); }
  .stat-panel__body { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .url-link { max-width: 220px; }
  .action-cell { flex-direction: column; align-items: stretch; gap: 4px; }
}
@media (max-width: 540px) {
  .stat-panel__body,
  .stat-panel__body--4 { grid-template-columns: 1fr 1fr; }
  .stat-cell { border-right: 1px solid var(--color-divider); border-bottom: 1px solid var(--color-divider); }
  .stat-cell:nth-child(2n) { border-right: none; }
  .stat-cell:last-child { border-bottom: none; }
  .stat-cell:nth-last-child(2):nth-child(odd) { border-bottom: none; }
}
</style>

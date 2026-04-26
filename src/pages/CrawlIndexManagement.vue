<template>
  <div class="page-container">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Crawl & Index Management</h1>
        <p class="subtitle">Take control of your website crawls and indexing effortlessly.</p>
      </div>

      <button
        class="btn-primary"
        @click="queueForCrawl"
        :disabled="selectedSites.length === 0"
      >
        Queue for Crawl ({{ selectedSites.length }})
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <p class="stat-label">Crawl Queued</p>
        <p class="stat-value queued">{{ stats.queuedCount }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Crawl Success</p>
        <p class="stat-value success">{{ stats.crawledCount }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Crawl Failed</p>
        <p class="stat-value failed">{{ stats.failedCount }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Total Indexed</p>
        <p class="stat-value success">{{ stats.indexedSucceed }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Total DeIndexed</p>
        <p class="stat-value success">{{ stats.deIndexedSucceed }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Total Index Queued</p>
        <p class="stat-value indexed">{{ stats.indexedQueued }}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Total Index Failed</p>
        <p class="stat-value failed">{{ stats.indexedFailed }}</p>
      </div>
    </div>


  <div class="alert-box schedule">
    <div class="alert-title">🕷️ Crawl</div>
    <div class="alert-text">
      Crawl runs on a one-minute queue interval. Each crawl process is locked while in progress and will be released upon completion.
    </div>
  </div>
    <!-- Table -->
    <div class="grid-card">
      <div class="grid-header">
        <label class="checkbox-container">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="checkbox-input"
          />
          Select All
        </label>
      </div>

      <table class="crawl-table">
        <thead>
          <tr>
            <th></th>
            <!-- <th>Site Name</th> -->
            <th>URL</th>
            <th>Type</th>
            <th>Status / Progress</th>
            <th>Crawl Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="site in activeSites"
            :key="site.id"
          >
            <td>
              <input
                type="checkbox"
                class="checkbox-input"
                :checked="selectedSites.includes(site.id)"
                @change="toggleSiteSelection(site.id)"
              />
            </td>

            <!-- <td class="site-name-cell">
              <div class="site-icon">
                {{ site.name.charAt(0).toUpperCase() }}
              </div>
              {{ site.name }}
            </td> -->

            <td>{{ site.url }}</td>
            <td>{{ site.type }}</td>

            <!-- STATUS / LOADER -->
            <td>
              <div style="display:flex; flex-direction:column; gap:4px;">

                <!-- Loader -->
                <div
                  v-if="progressMap[site.id]?.status === 'in_progress'"
                  class="loader-wrapper"
                >
                  <span class="spinner"></span>
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
                <span v-else-if="!progressMap[site.id]">
                  <span
                    class="status-badge"
                    :class="getStatusClass(site.crawlStatus)"
                  >
                    {{ site.crawlStatus }} 
                  </span>
                  {{ site.crawlFailedReason ? `- ${site.crawlFailedReason}` : '' }}
                </span>

              </div>
            </td>

            <td>{{ formatCrawlDate(site.crawlDate) }}</td>

            <td class="action-cell">
              <button
                v-if="site.crawlStatus !== 'In Progress'"
                class="action-btn"
                @click="startCrawl(site.id)"
              >
                Crawl
              </button>

              <button
                v-if="site.crawlStatus === 'Success'"
                class="action-btn view-details"
                @click="viewDetails(site.id)"
              >
                View
              </button>
            </td>
          </tr>

          <tr v-if="activeSites.length === 0">
            <td colspan="8" style="text-align:center; padding:20px">
              No sites found
            </td>
          </tr>
        </tbody>
      </table>
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

const toggleSelectAll = () => {
  selectedSites.value = isAllSelected.value
    ? []
    : activeSites.value.map(s => s.id)
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

  // 401 → auth issue
  if (status === 401) {
    toast.error('Session expired. Please login again.')
    router.push({ name: 'Login' })
    return
  }

  // Business rule errors (400)
  if (status === 400) {
    const message =
      data?.error?.description ||
      data?.message ||
      'Something went wrong.'

    toast.warning(message)
    return
  }

  // Fallback
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
  `status-${(status || 'queue').toLowerCase()}`

const formatCrawlDate = (date?: Date) =>
  date ? date.toLocaleDateString() : 'Never'

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
    padding: 16px;
    background: #f9f9f9;
    overflow-x: auto;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 6px 0;
  }
  
  .subtitle {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
  }
  
  .btn-primary {
    padding: 8px 16px;
    background: #22c55e;
    color: #ffffff;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    border: none;
    transition: 0.3s;
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn-primary:hover:not(:disabled) {
    background: #16a34a;
  }
  
  /* Stats Cards */
  .stats-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  }
  .stat-card {
    flex: 1 1 140px;
    min-width: 140px;
    background: #fff;
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    transition: 0.2s;
  }
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  }
  .stat-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
    margin: 0;
  }
  .stat-value {
    font-size: 18px;
    font-weight: 700;
    margin-top: 2px;
  }
  
  /* Table */
  .grid-card {
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    overflow: hidden;
  }
  .grid-header {
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }
  .checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .checkbox-input {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #22c55e;
  }
  .select-all-label {
    font-weight: 500;
    color: #111827;
    cursor: pointer;
  }
  
  .crawl-table {
    width: 100%;
    border-collapse: collapse;
  }
  .crawl-table thead {
    background: #f3f4f6;
  }
  .crawl-table th, .crawl-table td {
    padding: 10px 12px;
    text-align: left;
    font-size: 13px;
    color: #374151;
  }
  .crawl-table tbody tr:hover {
    background: #f0fdf4;
  }
  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
  }
  .status-success { background: #d1fae5; color: #047857; }
  .status-failed { background: #fee2e2; color: #b91c1c; }
  .status-queue  { background: #fff4e5; color: #f97316; }
  
  .site-name-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .site-icon {
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
  }
  
  .action-cell {
    display: flex;
    gap: 8px;
  }
  .action-btn {
    padding: 6px 12px;
    background: #f3f4f6;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    border: 1px solid #e5e7eb;
    transition: 0.2s;
  }
  .action-btn:hover {
    background: #22c55e;
    color: #ffffff;
    border-color: #22c55e;
  }
  .action-btn.view-details:hover {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #ffffff;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .page-container { padding: 14px; }
    .stats-cards { gap: 10px; }
    .stat-card { padding: 12px 14px; min-width: 100px; }
    .crawl-table th, .crawl-table td { padding: 10px; font-size: 13px; }
    .action-cell { flex-direction: column; gap: 4px; }
  }
  
  .stat-value {
    font-size: 18px;
    font-weight: 700; /* bold */
    margin-top: 2px;
  }
  
  /* Color overrides */
  .stat-value.total {
    color: #111827; /* dark text */
  }
  .stat-value.queued {
    color: #f97316; /* orange */
  }
  .stat-value.indexed {
    color: #047857; /* green */
  }
  .stat-value.failed {
    color: #b91c1c; /* red */
  }

  /* Loader */
.loader-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #22c55e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loader-text {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.sse-message {
  font-size: 12px;
  color: #6b7280;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.alert-box {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Quota - warning style */
.alert-box.quota {
  background: #fff7ed;
  border-color: #f97316;
  color: #ea580c;
}

/* Schedule - info style */
.alert-box.schedule {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.alert-title {
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
}

.alert-text {
  font-size: 13px;
}

  
  </style>

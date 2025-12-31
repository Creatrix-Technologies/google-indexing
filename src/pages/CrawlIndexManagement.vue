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
        <p class="stat-label">Total Crawl Queued</p>
        <p class="stat-value queued">{{ stats.queuedCount }}</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Total Crawl Success</p>
        <p class="stat-value indexed">{{ stats.crawledCount }}</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Total Crawl Failed</p>
        <p class="stat-value failed">{{ stats.failedCount }}</p>
      </div>
    </div>

        <!-- Stats Cards -->
        <div class="stats-cards">

      <div class="stat-card">
        <p class="stat-label">Total Index Success</p>
        <p class="stat-value queued">0</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Total Index Queued</p>
        <p class="stat-value indexed">0</p>
      </div>

      <div class="stat-card">
        <p class="stat-label">Total Index Failed</p>
        <p class="stat-value failed">0</p>
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
            <th>Site Name</th>
            <th>URL</th>
            <th>Type</th>
            <th>Status</th>
            <th>Indexable</th>
            <th>Crawl Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="site in activeSites"
            :key="site.id"
            :class="{ selected: selectedSites.includes(site.id) }"
          >
            <td>
              <input
                type="checkbox"
                class="checkbox-input"
                :checked="selectedSites.includes(site.id)"
                @change="toggleSiteSelection(site.id)"
              />
            </td>

            <td class="site-name-cell">
              <div class="site-icon">
                {{ site.name.charAt(0).toUpperCase() }}
              </div>
              {{ site.name }}
            </td>

            <td>{{ site.url }}</td>
            <td>{{ site.type }}</td>

            <td>
              <span class="status-badge" :class="getStatusClass(site.crawlStatus)">
                {{ site.crawlStatus || 'Queue' }}
              </span>
            </td>

            <td>{{ site.isIndexable }}</td>
            <td>{{ formatCrawlDate(site.crawlDate) }}</td>

            <td class="action-cell">
              <button class="action-btn" @click="startCrawl(site.id)">Crawl</button>
              <button class="action-btn" @click="startIndex(site.id)">Index</button>
              <button class="action-btn view-details" @click="viewDetails(site.id)">
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
import Swal from "sweetalert2";

const toast = useToast()
const router = useRouter()

interface Site {
  id: number
  name: string
  url: string
  type: string
  status: 'Active' | 'Inactive'
  crawlStatus?: 'Success' | 'Failed' | 'Queue'
  crawlDate?: Date
  isIndexable: 'Yes' | 'No'
}

/* ================= STATE ================= */
const allSites = ref<Site[]>([])
const selectedSites = ref<number[]>([])

const stats = ref({
  activeSiteCount: 0,
  queuedCount: 0,
  crawledCount: 0,
  failedCount: 0
})

/* ================= API ================= */
const handleAuthError = (err: any) => {
  if (err?.response?.status === 400 || err?.response?.status === 401) {
    toast.error('Session expired. Please login again.')
    router.push({ name: 'Login' })
  }
}

/* Fetch site list */
const fetchCrawlSites = async () => {
  try {
    const res = await api.get('/crawl/site-list?PageNo=1&PageSize=10')
    const items = res.data?.data || []

    allSites.value = items.map((item: any) => ({
      id: item.webSiteId,
      name: item.siteName,
      url: item.url,
      type: item.siteType,
      status: 'Active',
      crawlStatus: item.crawlStatus || 'Queue',
      isIndexable: item.isIndexable ? 'Yes' : 'No',
      crawlDate: item.crawlCompletedDate
        ? new Date(item.crawlCompletedDate)
        : undefined
    }))
  } catch (err) {
    handleAuthError(err)
  }
}

/* Fetch stats */
const fetchStats = async () => {
  try {
    const res = await api.get('/crawl/site-and-queue-count')
    if (res.data?.isSuccess) {
      stats.value = res.data.data
    }
  } catch (err) {
    handleAuthError(err)
  }
}

onMounted(() => {
  fetchCrawlSites()
  fetchStats()
})

/* ================= COMPUTED ================= */
const activeSites = computed(() =>
  allSites.value.filter(s => s.status === 'Active')
)

const isAllSelected = computed(() =>
  activeSites.value.length > 0 &&
  selectedSites.value.length === activeSites.value.length
)

/* ================= METHODS ================= */
const toggleSelectAll = () => {
  selectedSites.value = isAllSelected.value
    ? []
    : activeSites.value.map(s => s.id)
}

const toggleSiteSelection = (id: number) => {
  const idx = selectedSites.value.indexOf(id)
  idx > -1
    ? selectedSites.value.splice(idx, 1)
    : selectedSites.value.push(id)
}

/* ================= CRAWL ================= */
const queueForCrawl = async () => {
  if (!selectedSites.value.length) return

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to crawl the selected sites(s)?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });

  if (!result.isConfirmed) return

  try {
    const res = await api.post('/crawl/edit', {
      webSiteId: selectedSites.value
    })

    if (res.data.isSuccess) {
      selectedSites.value.forEach(id => {
        const site = allSites.value.find(s => s.id === id)
        if (site) site.crawlStatus = 'Queue'
      })
      selectedSites.value = []
      fetchStats()
      toast.success(res.data.message)
    }
  } catch (err) {
    handleAuthError(err)
  }
}

const startIndex = async (id: number) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Are you sure, you want to index this site?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });

  console.log(id);
  if (!result.isConfirmed) return
}



const startCrawl = async (id: number) => {
  try {
    const result = await Swal.fire({
    title: "Are you sure?",
    text: "Are you sure, you want to crawl this site?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });

  if (!result.isConfirmed) return

    const res = await api.post('/crawl/edit', { webSiteId: [id] })
    if (res.data.isSuccess) {
      const site = allSites.value.find(s => s.id === id)
      if (site) site.crawlStatus = 'Queue'
      fetchStats()
      toast.success(res.data.message)
    }
  } catch (err) {
    handleAuthError(err)
  }
}

/* ================= UTIL ================= */
const viewDetails = (id: number) => {
  router.push({ name: 'CrawlIndexDetails', params: { siteId: id } })
}

const getStatusClass = (status?: string) =>
  `status-${(status || 'queue').toLowerCase()}`

const formatCrawlDate = (date?: Date) =>
  date ? date.toLocaleDateString() : 'Never'
</script>

  
<style scoped>
  .page-container {
    flex: 1;
    padding: 30px;
    background: #f9f9f9;
    overflow-x: auto;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  .subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
  
  .btn-primary {
    padding: 10px 20px;
    background: #22c55e;
    color: #ffffff;
    border-radius: 8px;
    font-weight: 600;
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
    gap: 16px;
    margin-bottom: 24px;
  }
  .stat-card {
    flex: 1 1 150px;
    min-width: 150px;
    background: #fff;
    border-radius: 12px;
    padding: 20px;
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
    font-size: 14px;
    color: #6b7280;
    font-weight: 600;
    margin: 0;
  }
  .stat-value {
    font-size: 20px;
    font-weight: 700;
    margin-top: 4px;
  }
  
  /* Table */
  .grid-card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    overflow: hidden;
  }
  .grid-header {
    padding: 15px;
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
    padding: 14px;
    text-align: left;
    font-size: 14px;
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
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 600;
    font-size: 16px;
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
    .page-container { padding: 20px; }
    .stats-cards { gap: 12px; }
    .stat-card { padding: 16px; min-width: 100px; }
    .crawl-table th, .crawl-table td { padding: 10px; font-size: 13px; }
    .action-cell { flex-direction: column; gap: 4px; }
  }
  
  .stat-value {
    font-size: 20px;
    font-weight: 700; /* bold */
    margin-top: 4px;
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
  
  </style>

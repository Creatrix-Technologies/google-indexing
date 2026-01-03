<template>
  <div class="page-container">
    <div class="page-header">
      <router-link to="/crawl-index-management" class="back-link">
        ← Back to Crawl & Index
      </router-link>

      <h1>Crawl & Index Details</h1>
      <p class="subtitle">URLs with index details</p>
    </div>

    <!-- SUMMARY -->
    <div class="summary-card">
      <div class="summary-item">
        <span class="label">Total URLs</span>
        <span class="value">{{ totalUrlCount }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Valid Urls</span>
        <span class="value success">{{ successCount }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Issues</span>
        <span class="value failed">{{ failedCount }}</span>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-item">
        <span class="label">Indexed</span>
        <span class="value success">{{ indexed }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Index Failed</span>
        <span class="value failed">{{ indexedFailed }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Index Queued</span>
        <span class="value">{{ indexedQueued }}</span>
      </div>
    </div>

    <!-- BULK BUTTON -->
    <div style="margin-bottom: 15px;">
      <button
        class="index-btn"
        :disabled="selectedIds.size === 0"
        @click="indexSelectedUrls"
      >
        Index Selected URLs ({{ selectedIds.size }})
      </button>
    </div>

    <!-- TABLE -->
    <div class="table-card">
      <table class="urls-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" :checked="isAllChecked" @change="toggleSelectAll" />
            </th>
            <th>URL</th>
            <th>Status</th>
            <th>Status Code</th>
            <th>Index Status</th>
            <th>Indexed At</th>
            <th>Index Result</th>
            <th>Crawled At</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in urls"
            :key="item.id"
            :class="item.status.toLowerCase()"
          >
            <td>
              <input
                type="checkbox"
                :checked="isSelected(item.id)"
                @change="toggleRow(item.id)"
              />
            </td>

            <td class="url-cell">
              <a :href="item.url" target="_blank">{{ item.url }}</a>
            </td>

            <td>
              <span class="status-badge" :class="item.status.toLowerCase()">
                {{ item.status }}
              </span>
            </td>

            <td class="status-code">{{ item.statusCode }}</td>
            <td>{{ item.indexedStatus }}</td>
            <td>{{ item.indexedAt }}</td>
            <td>{{ item.indexedResult }}</td>
            <td>{{ item.crawledAt }}</td>

            <td>
              <button class="row-index-btn" @click="indexSingleUrl(item.id)">
                Queue Index
              </button>
            </td>
          </tr>

          <tr v-if="urls.length === 0">
            <td colspan="9" style="text-align:center; padding:20px">
              No crawl data found
            </td>
          </tr>
        </tbody>
      </table>

      <!-- PAGINATION -->
      <div class="pagination">
        <button class="pagination-btn" :disabled="!pageInfo.hasPreviousPage" @click="previousPage">
          Previous
        </button>

        <div class="pagination-info">
          Page {{ pageInfo.page }} of {{ totalPages }}
        </div>

        <button class="pagination-btn" :disabled="!pageInfo.hasNextPage" @click="nextPage">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import api from "../api"
import Swal from "sweetalert2"

interface CrawledUrl {
  id: number
  url: string
  status: "Success" | "Failed"
  statusCode: number
  crawledAt: string
  indexedStatus: string
  indexedAt: string
  indexedResult: string
}

interface PageInfo {
  page: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface CrawlCount {
  totalCount: number
  successCount: number
  failedCount: number
  indexed: number
  indexedFailed: number
  indexedQueued: number
  hasDailyQuotaExceed: boolean
}

const route = useRoute()
const siteId = Number(route.params.siteId)

const urls = ref<CrawledUrl[]>([])
const selectedIds = ref<Set<number>>(new Set())

const pageInfo = ref<PageInfo>({
  page: 1,
  pageSize: 10,
  totalCount: 0,
  hasNextPage: false,
  hasPreviousPage: false
})

const counts = ref<CrawlCount>({
  totalCount: 0,
  successCount: 0,
  failedCount: 0,
  indexed: 0,
  indexedFailed: 0,
  indexedQueued: 0,
  hasDailyQuotaExceed: false
})

/* API */
const fetchCrawlDetails = async () => {
  const res = await api.get(
    `/crawl/${siteId}/details?PageNo=${pageInfo.value.page}&PageSize=${pageInfo.value.pageSize}`
  )
  urls.value = res.data.data
  pageInfo.value = res.data.pageInfo
}

const fetchCrawlCounts = async () => {
  const res = await api.get(`/crawl/${siteId}/details-count`)
  counts.value = res.data.data
}

/* SELECTION */
const isSelected = (id: number) => selectedIds.value.has(id)

const toggleRow = (id: number) => {
  selectedIds.value.has(id)
    ? selectedIds.value.delete(id)
    : selectedIds.value.add(id)
}

const isAllChecked = computed(() =>
  urls.value.length > 0 &&
  urls.value.every(u => selectedIds.value.has(u.id))
)

const toggleSelectAll = () => {
  if (isAllChecked.value) {
    urls.value.forEach(u => selectedIds.value.delete(u.id))
  } else {
    urls.value.forEach(u => selectedIds.value.add(u.id))
  }
}

/* INDEXING */
const indexSelectedUrls = async () => {
  const result = await Swal.fire({
    title: "Confirm",
    text: "Index selected URLs?",
    icon: "warning",
    showCancelButton: true
  })

  if (!result.isConfirmed) return

  await api.post("/crawl/index", {
    websiteId: siteId,
    urlId: Array.from(selectedIds.value)
  })

  Swal.fire("Queued", "URLs sent for indexing", "success")
  selectedIds.value.clear()
  fetchCrawlDetails()
  fetchCrawlCounts()
}

const indexSingleUrl = async (id: number) => {
  const result = await Swal.fire({
    title: "Confirm",
    text: "Index this URL?",
    icon: "warning",
    showCancelButton: true
  })

  if (!result.isConfirmed) return

  await api.post("/crawl/index", {
    websiteId: siteId,
    urlId: [id]
  })

  Swal.fire("Queued", "URL sent for indexing", "success")
  fetchCrawlDetails()
  fetchCrawlCounts()
}

/* COMPUTED */
const totalUrlCount = computed(() => counts.value.totalCount)
const successCount = computed(() => counts.value.successCount)
const failedCount = computed(() => counts.value.failedCount)
const indexed = computed(() => counts.value.indexed)
const indexedFailed = computed(() => counts.value.indexedFailed)
const indexedQueued = computed(() => counts.value.indexedQueued)

const totalPages = computed(() =>
  Math.ceil(counts.value.totalCount / pageInfo.value.pageSize)
)

/* PAGINATION */
const nextPage = () => pageInfo.value.hasNextPage && pageInfo.value.page++
const previousPage = () => pageInfo.value.hasPreviousPage && pageInfo.value.page--

onMounted(() => {
  fetchCrawlDetails()
  fetchCrawlCounts()
})

watch(() => pageInfo.value.page, fetchCrawlDetails)
</script>

  <style scoped>
  .page-container {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
    background: #f9f9f9;
  }
  
  .page-header {
    margin-bottom: 30px;
  }
  
  .back-link {
    display: inline-block;
    margin-bottom: 15px;
    color: #22c55e;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .back-link:hover {
    color: #16a34a;
  }
  
  .page-header h1 {
    font-size: 32px;
    color: #333;
    margin: 0 0 10px 0;
    font-weight: 700;
  }
  
  .subtitle {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
  
  .summary-card {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .summary-item {
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .summary-item .label {
    font-size: 12px;
    color: #999;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .summary-item .value {
    font-size: 24px;
    color: #333;
    font-weight: 700;
  }
  
  .summary-item .value.success {
    color: #22c55e;
  }
  
  .summary-item .value.failed {
    color: #ef4444;
  }
  
  .table-card {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e8e8e8;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .urls-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .urls-table thead {
    background: #f5f5f5;
    border-bottom: 1px solid #e8e8e8;
  }
  
  .urls-table th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .urls-table td {
    padding: 15px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #333;
  }
  
  .urls-table tbody tr.success {
    background: #fafafa;
  }
  
  .urls-table tbody tr.failed {
    background: #fef2f2;
  }
  
  .url-cell a {
    /* color: #22c55e; */
    text-decoration: none;
    word-break: break-word;
  }
  
  .url-cell a:hover {
    text-decoration: underline;
  }
  
  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
  }
  
  .status-badge.success {
    background: #e8f5e9;
    color: #22c55e;
  }
  
  .status-badge.failed {
    background: #fef2f2;
    color: #ef4444;
  }
  
  .status-code {
    font-family: monospace;
    font-weight: 500;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #f9f9f9;
    border-top: 1px solid #e8e8e8;
  }
  
  .pagination-btn {
    padding: 8px 16px;
    background: #f5f5f5;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .pagination-btn:hover:not(:disabled) {
    background: #22c55e;
    border-color: #22c55e;
    color: #ffffff;
  }
  
  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination-info {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .page-container {
      padding: 20px;
    }
  
    .summary-card {
      grid-template-columns: 1fr;
    }
  
    .pagination {
      flex-direction: column;
      gap: 10px;
    }
  }

  /* ===== ADDED ONLY ===== */
.index-btn {
  padding: 8px 14px;
  background: #22c55e;
  color: #fff;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.index-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.row-index-btn {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;
}
  </style>
  
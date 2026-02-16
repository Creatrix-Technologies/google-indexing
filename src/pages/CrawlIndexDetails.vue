<template>
  <Loading :active.sync="isLoading" :is-full-page="true" />

  <div class="page-container">
    <!-- PAGE HEADER -->
    <div class="page-header">
      <router-link to="/crawl-index-management" class="back-link">
        ← Crawl & Index Management
      </router-link>

      <!-- <p class="subtitle">URLs with index details</p> -->

      <!-- SITE INFO -->
      <div v-if="siteInfo" class="site-info">
        <h2 class="site-type-chip">{{ siteInfo.type }}</h2>
        <h2 class="site-name">{{ siteInfo.name }}</h2>
        - 
        <a :href="siteInfo.url" target="_blank" class="site-url">{{ siteInfo.url }}</a>
      </div>
    </div>

    <!-- SCHEDULE ALERT -->
    <div
      v-if="siteInfo && siteInfo.scheduleMessage && siteInfo.scheduleMessage.trim() !== ''"
      class="schedule-alert-orange"
    >
      ⏰ {{ siteInfo.scheduleMessage }} 
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
        Queue Selected URLs ({{ selectedIds.size }})
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
            <th>Status Code</th>
            <th>Indexing State</th>
            <th>Coverage State</th>
            <th>Queue Status</th>
            <th>Result</th>
            <th>API Type</th>
            <th>Index Updated At</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in urls"
            :key="item.id"
            :class="item.statusCode===200?'success':'failed'"
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
              <span class="status-badge" :class="item.statusCode===200?'success':'failed'">
                {{ item.statusCode }}
              </span>
            </td>

            <td>{{ item.indexingState.replace(/_/g, ' ')}}</td>
            <td>{{ item.coverageState}}</td>
            <td>{{ item.indexedStatus}}</td>
            <td>{{ item.indexedResult}}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.indexedAt }}</td>

            <td class="action-cell">
              <button title="Instant Index" class="row-index-btn" @click="indexSingleUrl(item.id)">
                Index
              </button>
              <button title="Queue Index" class="row-index-btn failed" @click="removeIndexSingleUrl(item.id)">
                Remove
              </button>
            </td>
          </tr>

          <tr v-if="urls.length === 0">
            <td colspan="10" style="text-align:center; padding:20px">
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
import Loading from "vue-loading-overlay"
import 'vue-loading-overlay/dist/css/index.css'

interface CrawledUrl {
  id: number
  url: string
  coverageState: string,
  indexingState:string,
  statusCode: number
  crawledAt: string
  indexedAt: string
  indexedResult: string,
  indexedStatus: string,
  type:string
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
  indexedSucceed: number
  indexedFailed: number
  indexedQueued: number
  hasDailyQuotaExceed: boolean
  site: SiteInfo
}

interface SiteInfo {
  type: string
  name: string
  url: string
  scheduleMessage: string
}

const route = useRoute()
const siteId = Number(route.params.siteId)

const urls = ref<CrawledUrl[]>([])
const selectedIds = ref<Set<number>>(new Set())
const siteInfo = ref<SiteInfo | null>(null)
const isLoading = ref(false)

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
  indexedSucceed: 0,
  indexedFailed: 0,
  indexedQueued: 0,
  hasDailyQuotaExceed: false,
  site: { type:'', name:'', url:'', scheduleMessage:'' }
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
  siteInfo.value = res.data.data.site
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
  const { value: priority } = await Swal.fire({
    title: "Queue Selected URLs",
    icon: "warning",
    input: "select",
    inputOptions: {
      2: "High",
      1: "Medium",
      0: "Low"
    },
    inputPlaceholder: "Select priority",
    showCancelButton: true,
    confirmButtonText: "Next",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#22c55e"
  });

  if (!priority && priority !== 0) return; // user cancelled

  // Next step: ask if indexing or removing
  const result = await Swal.fire({
    title: "Queue Selected URLs",
    text: "What do you want to do with the selected URLs?",
    icon: "warning",
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "📥 Index",
    denyButtonText: "🗑️ Remove Index",
    confirmButtonColor: "#22c55e",
    denyButtonColor: "#ef4444",
    cancelButtonText: "Cancel"
  });

  if (result.isDismissed) return;

  const type =
    result.isConfirmed ? "URL_UPDATED" :
    result.isDenied ? "URL_DELETED" :
    null;

  if (!type) return;

  // API call including priority
  const resQueue = await api.post("/crawl/index", {
    websiteId: siteId,
    urlId: Array.from(selectedIds.value),
    type,
    priority: Number(priority) // send priority here
  });

  if(resQueue?.data.isSuccess){
    Swal.fire(
      "Queued",
      type === "URL_UPDATED"
        ? "URLs queued for indexing"
        : "URLs queued for removal",
      "success"
    );
  } else {
    Swal.fire("Failed", resQueue?.data?.meta, "error");
  }

  selectedIds.value.clear();
  fetchCrawlDetails();
  fetchCrawlCounts();
};


const indexSingleUrl = async (id: number) => {
  try {
    // Step 1: Ask user for action (Instant or Queue)
    const result = await Swal.fire({
      title: "Index URL",
      text: "Choose indexing method",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "⚡ Index",
      denyButtonText: "⏳ Add to Queue",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#22c55e",
      denyButtonColor: "#3b82f6"
    });

    if (result.isDismissed) return; // Cancel clicked

    if (result.isConfirmed) {
      isLoading.value = true;
      // Instant indexing
      const res = await api.post("/crawl/index-direct", {
        websiteId: siteId,
        urlId: id,
        type: "URL_UPDATED"
      });

      if (res?.data.isSuccess) {
        Swal.fire("Indexed", "URL Indexed Instantly", "success");
      } else {
        Swal.fire("Failed", res?.data?.meta, "error");
      }
    }

    if (result.isDenied) {
      // Queued indexing - ask for priority
      const { value: priority } = await Swal.fire({
        title: "Queue URL for Indexing",
        icon: "question",
        input: "select",
        inputOptions: {
          2: "High",
          1: "Medium",
          0: "Low"
        },
        inputPlaceholder: "Select priority",
        showCancelButton: true,
        cancelButtonText: "Cancel"
      });

      if (priority === null) return; // User cancelled

      isLoading.value = true;
      const resQueue = await api.post("/crawl/index", {
        websiteId: siteId,
        urlId: [id],
        type: "URL_UPDATED",
        priority: Number(priority)
      });

      if (resQueue?.data.isSuccess) {
        Swal.fire("Queued", "URL queued for indexing", "success");
      } else {
        Swal.fire("Failed", resQueue?.data?.meta, "error");
      }
    }

    fetchCrawlDetails();
    fetchCrawlCounts();
  } catch (err: any) {
    console.log(err);
    const msg = err?.response?.data?.error?.description || "You are not authorized to perform instant indexing.";
    Swal.fire("Failed", msg, "error");
  } finally {
    isLoading.value = false;
  }
};



const removeIndexSingleUrl = async (id: number) => {
  try {
    // Step 1: Ask user for action (Instant or Queue)
    const result = await Swal.fire({
      title: "Remove Index URL",
      text: "Choose removal method",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "⚡ Remove",
      denyButtonText: "⏳ Queue to Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      denyButtonColor: "#dc2626"
    });

    if (result.isDismissed) return; // Cancel clicked

    if (result.isConfirmed) {
      
    isLoading.value = true;

      // Instant removal
      const res = await api.post("/crawl/index-direct", {
        websiteId: siteId,
        urlId: id,
        type: "URL_DELETED"
      });

      if (res?.data.isSuccess) {
        Swal.fire("Removed", "URL removed instantly", "success");
      } else {
        Swal.fire("Failed", res?.data?.meta, "error");
      }
    }

    if (result.isDenied) {
      // Queued removal - ask for priority
      const { value: priority } = await Swal.fire({
        title: "Queue URL for Removal",
        icon: "question",
        input: "select",
        inputOptions: {
          2: "High",
          1: "Medium",
          0: "Low"
        },
        inputPlaceholder: "Select priority",
        showCancelButton: true,
        cancelButtonText: "Cancel"
      });

      if (priority === null) return; // user cancelled

      isLoading.value = true;

      const resQueue = await api.post("/crawl/index", {
        websiteId: siteId,
        urlId: [id],
        type: "URL_DELETED",
        priority: Number(priority)
      });

      if (resQueue?.data.isSuccess) {
        Swal.fire("Queued", "URL queued for removal", "success");
      } else {
        Swal.fire("Failed", resQueue?.data?.meta, "error");
      }
    }

    fetchCrawlDetails();
    fetchCrawlCounts();
  } catch (err: any) {
    console.log(err);
    const msg = err?.response?.data?.error?.description || "You are not authorized to perform instant removal.";
    Swal.fire("Failed", msg, "error");
  } finally {
    isLoading.value = false;
  }
};


/* COMPUTED */
const totalUrlCount = computed(() => counts.value.totalCount)
const successCount = computed(() => counts.value.successCount)
const failedCount = computed(() => counts.value.failedCount)
const indexed = computed(() => counts.value.indexedSucceed)
const indexedFailed = computed(() => counts.value.indexedFailed)
const indexedQueued = computed(() => counts.value.indexedQueued)
const totalPages = computed(() => Math.ceil(counts.value.totalCount / pageInfo.value.pageSize))

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

.action-cell {
    display: flex;
    gap: 8px;
  }
  .row-index-btn.failed {
    background :red;
  }

/* SITE INFO */
.site-info {
  margin-top: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.site-type-chip {
  background: #22c55e; /* green background */
  color: white;         /* white text */
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.site-name {
  color: black;
  font-weight: 600;
}

.site-url {
  color: black;
  text-decoration: none;
  font-weight: 500;
}

.site-url:hover {
  text-decoration: underline;
}

/* SCHEDULE ALERT ORANGE */
.schedule-alert-orange {
  background: #fff7ed; /* subtle light orange background */
  border: 1px solid #f97316; /* orange border */
  color: #f97316; /* orange text */
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

  </style>
  
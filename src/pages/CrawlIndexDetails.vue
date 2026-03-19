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

    <div class="alert-grid">
  <!-- QUOTA ALERT -->
  <div v-if="isQuotaExceeded" class="alert-box quota">
    <div class="alert-title">⚠️ Quota Limit</div>
    <div class="alert-text">
      Quota exceeded. Resets daily at midnight (Pacific Time).
    </div>
  </div>

  <!-- SCHEDULE ALERT -->
  <div
    v-if="siteInfo && siteInfo.scheduleMessage && siteInfo.scheduleMessage.trim() !== ''"
    class="alert-box schedule"
  >
    <div class="alert-title">⏰ Queue Schedule</div>
    <div class="alert-text">
      {{ siteInfo.scheduleMessage }}
    </div>
  </div>
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
        <span class="label">DeIndexed</span>
        <span class="value success">{{ deIndexed }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Index Failed</span>
        <span class="value failed">{{ indexedFailed }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Total Queued</span>
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

    
    <div class="table-scroll">

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
            <th>Robots Txt State</th>
            <th>Page Fetch State</th>
            <th>Queue Status</th>
            <th>Priority</th>
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

            <td>
  <span style="text-align: center;"
    class="indexing-chip"
    :class="getIndexingStateClass(item.indexingState)"
  >
    {{ item.indexingState.replace(/_/g, ' ') }}
  </span>
</td>            <td>{{ item.coverageState}}</td>
            <td>{{ item.robotsTxtState ? item.robotsTxtState.replace(/_/g, ' ') : '-' }}</td>
            <td>{{ item.pageFetchSpecified ? item.pageFetchSpecified.replace(/_/g, ' ') : '-' }}</td>
            <td>{{ item.indexedStatus}}</td>
            <td>{{ item.priority}}</td>
            <td>{{ item.indexedResult}}</td>
            <td>{{ item.type }}</td>
            <td>{{ item.indexedAt }}</td>

            <td class="action-cell">
              <button title="View Logs" class="row-index-btn view" @click="viewLogs(item.id)">Logs</button>
              <button title="Instant Index" class="row-index-btn" @click="indexSingleUrl(item.id)">
                ReIndex
              </button>
              <button title="Queue Index" class="row-index-btn failed" @click="removeIndexSingleUrl(item.id)">
                DeIndex
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



      <div class="table-footer">
  <!-- Page Size Selector -->
  <div class="page-size-wrapper">
    <label for="pageSize">Rows per page:</label>
    <select id="pageSize" v-model.number="pageInfo.pageSize">
      <option :value="10">10</option>
      <option :value="25">25</option>
      <option :value="50">50</option>
      <option :value="100">100</option>
      <option :value="1000">1000</option>
    </select>
  </div>

  <!-- Pagination -->
  <div class="pagination-wrapper">
    <button class="pagination-btn" :disabled="!pageInfo.hasPreviousPage" @click="previousPage">
      Previous
    </button>
    <span class="pagination-info">
      Page {{ pageInfo.page }} of {{ totalPages }}
    </span>
    <button class="pagination-btn" :disabled="!pageInfo.hasNextPage" @click="nextPage">
      Next
    </button>
  </div>
</div>

    </div>


    <Loading :active.sync="logsLoading" :is-full-page="false" />

    <transition name="overlay">
  <div
    v-if="showLogsModal"
    class="modal-overlay"
    @click.self="showLogsModal = false"
  >
    <transition name="modal">
      <div class="modal">
        <!-- Close icon -->
        <span class="modal-close" @click="showLogsModal = false">
          <svg xmlns="http://www.w3.org/2000/svg" class="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>

        <h3>Queue Logs</h3>

        <table v-if="logs.length > 0" class="logs-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(log, index) in logs" :key="index">
              <td>{{ log.type }}</td>
              <td :class="log.status === 'Success' ? 'success' : 'failed'">
                {{ log.status }}
              </td>
              <td>{{ new Date(log.date).toLocaleDateString() }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else style="padding:10px;">No logs found</div>

      </div>
    </transition>
  </div>
</transition>



  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import api from "../api"
import Swal from "sweetalert2"
import Loading from "vue-loading-overlay"
import 'vue-loading-overlay/dist/css/index.css'

const isQuotaExceeded = ref(false)

const fetchIndexLimit = async () => {
  try {
    const res = await api.get(`/crawl/index-limit`)

    if (res?.data?.isSuccess) {
      isQuotaExceeded.value = res.data.data === true
    } else {
      isQuotaExceeded.value = false
    }
  } catch (err) {
    console.error("Index limit error:", err)
    isQuotaExceeded.value = false
  }
}

const showLogsModal = ref(false); // controls modal visibility
const logs = ref<any[]>([]); // store logs
const logsLoading = ref(false);

const getIndexingStateClass = (state: string) => {
  if (!state) return "red";

  if (state === "INDEXING_ALLOWED") return "green";
  if (state === "INDEXING_STATE_UNSPECIFIED") return "orange";

  return "red";
};
const viewLogs = async (urlId: number) => {
  showLogsModal.value = true; // first show modal
  logsLoading.value = true;
  console.log("Fetching logs for URL ID:", urlId);

  try {
    const res = await api.get(`/crawl/queue-logs?urlId=${urlId}`);
    if (res?.data?.isSuccess) {
      logs.value = res.data.data;
      console.log("Logs fetched:", logs.value);
    } else {
      logs.value = [];
      Swal.fire("Error", res?.data?.meta || "Failed to fetch logs", "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to fetch logs", "error");
    logs.value = [];
  } finally {
    logsLoading.value = false;
  }
};

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
  type:string,
  priority:string,
  verdit:string,
  pageFetchSpecified:string,
  robotsTxtState:string
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
  deIndexedSucceed:number
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


watch(() => pageInfo.value.pageSize, () => {
  pageInfo.value.page = 1
  fetchCrawlDetails()
});

const counts = ref<CrawlCount>({
  totalCount: 0,
  successCount: 0,
  failedCount: 0,
  indexedSucceed: 0,
  deIndexedSucceed:0,
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
      confirmButtonText: "⚡ Index Now",
      denyButtonText: "⏳ Add to Queue",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#22c55e",
      denyButtonColor: "#3b82f6"
    });

    if (result.isDismissed) return; // Cancel clicked

    // --- Instant Indexing ---
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        const res = await api.post("/crawl/index-direct", {
          websiteId: siteId,
          urlId: id,
          type: "URL_UPDATED"
        });

        if (res?.data?.isSuccess) {
          Swal.fire("Indexed", "URL Indexed Instantly", "success");
        } else {
          Swal.fire("Failed", res?.data?.meta || "Something went wrong", "error");
        }
      } finally {
        isLoading.value = false;
      }
    }

    // --- Queue Indexing ---
    if (result.isDenied) {
      const queueResult = await Swal.fire({
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

      if (queueResult.isDismissed || queueResult.value === undefined) return;

      const priority = Number(queueResult.value);

      isLoading.value = true;
      try {
        const resQueue = await api.post("/crawl/index", {
          websiteId: siteId,
          urlId: [id],
          type: "URL_UPDATED",
          priority
        });

        if (resQueue?.data?.isSuccess) {
          Swal.fire("Queued", "URL queued for indexing", "success");
        } else {
          Swal.fire("Failed", resQueue?.data?.meta || "Something went wrong", "error");
        }
      } finally {
        isLoading.value = false;
      }
    }

    // Refresh UI data after any successful action
    fetchCrawlDetails();
    fetchCrawlCounts();
    
  } catch (err: any) {
    console.error(err);
    const msg = err?.response?.data?.error?.description || "You are not authorized to perform indexing.";
    Swal.fire("Failed", msg, "error");
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
      confirmButtonText: "⚡ Deindex Now",
      denyButtonText: "⏳ Queue to Deindex",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      denyButtonColor: "#dc2626"
    });

    if (result.isDismissed) return; // Cancel clicked

    // --- Instant Removal ---
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        const res = await api.post("/crawl/index-direct", {
          websiteId: siteId,
          urlId: id,
          type: "URL_DELETED"
        });

        if (res?.data?.isSuccess) {
          Swal.fire("Removed", "URL deindexed instantly", "success");
        } else {
          Swal.fire("Failed", res?.data?.meta || "Something went wrong", "error");
        }
      } finally {
        isLoading.value = false;
      }
    }

    // --- Queue Removal ---
    if (result.isDenied) {
      const queueResult = await Swal.fire({
        title: "Queue URL for Deindexing",
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

      if (queueResult.isDismissed || queueResult.value === undefined) return;

      const priority = Number(queueResult.value);

      isLoading.value = true;
      try {
        const resQueue = await api.post("/crawl/index", {
          websiteId: siteId,
          urlId: [id],
          type: "URL_DELETED",
          priority
        });

        if (resQueue?.data?.isSuccess) {
          Swal.fire("Queued", "URL queued for deindexing", "success");
        } else {
          Swal.fire("Failed", resQueue?.data?.meta || "Something went wrong", "error");
        }
      } finally {
        isLoading.value = false;
      }
    }

    // Refresh UI
    fetchCrawlDetails();
    fetchCrawlCounts();

  } catch (err: any) {
    console.error(err);
    const msg = err?.response?.data?.error?.description || "You are not authorized to perform removal.";
    Swal.fire("Failed", msg, "error");
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
const deIndexed = computed(() => counts.value.deIndexedSucceed)
const totalPages = computed(() => Math.ceil(counts.value.totalCount / pageInfo.value.pageSize))

/* PAGINATION */
const nextPage = () => pageInfo.value.hasNextPage && pageInfo.value.page++
const previousPage = () => pageInfo.value.hasPreviousPage && pageInfo.value.page--

onMounted(() => {
  fetchCrawlDetails()
  fetchCrawlCounts()
  fetchIndexLimit()   
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

.summary-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-item {
  background: #fff;
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

/* Table Scroll Wrapper */
.table-scroll {
  overflow-x: auto; /* horizontal scroll for small screens */
  max-width: 100%;
  display: block;
  max-height: calc(20 * 48px); /* 48px per row including padding/border */
  overflow-y: auto;
}

/* Table Styles */
.urls-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px; /* ensures horizontal scroll triggers on small screens */
}

.urls-table thead {
  position: sticky;
  top: 0;
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
  z-index: 1;
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
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
  vertical-align: middle;
}

.urls-table tbody tr.success {
  background: #fafafa;
}

.urls-table tbody tr.failed {
  background: #fef2f2;
}

.url-cell a {
  text-decoration: none;
}

.url-cell a:hover {
  text-decoration: underline;
}

/* Status Badges */
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

/* Buttons */
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
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  min-width: 60px;
  text-align: center;
  border: none;
  cursor: pointer;
  color: #fff;
  margin: 2px;
  background-color: rgb(126 134 175);
}

.row-index-btn.view {
  background-color: #1cb397;
}

.row-index-btn.failed {
  background-color: #f44336;
}

.urls-table .action-cell {
  gap: 8px;
  justify-content: center;
  align-items: center;
  min-height: 40px;
  white-space: nowrap;
}

/* Site Info */
.site-info {
  margin-top: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.site-type-chip {
  background: #22c55e;
  color: white;
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

/* Schedule Alert */
.schedule-alert-orange {
  background: #fff7ed;
  border: 1px solid #f97316;
  color: #f97316;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Pagination Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9f9f9;
  border-top: 1px solid #e8e8e8;
  flex-wrap: wrap;
  gap: 10px;
}

.page-size-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #555;
}

.page-size-wrapper select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.pagination-btn {
  padding: 6px 14px;
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
  color: #fff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Chips */
.indexing-chip {
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  text-transform: capitalize;
}

.indexing-chip.green {
  background-color: rgba(41, 145, 69, 0.12);
  color: #299145;
}

.indexing-chip.orange {
  background-color: #ffedd5;
  color: #ea580c;
}

.indexing-chip.red {
  background-color: #fee2e2;
  color: #dc2626;
}

/* Responsive */
@media (max-width: 1024px) {
  .table-scroll {
    overflow-x: auto; /* horizontal scroll for medium screens */
  }

  .urls-table {
    min-width: 900px; /* force scroll if table is too wide */
  }

  .urls-table th,
  .urls-table td {
    padding: 6px 8px;
    font-size: 12px;
  }

  .row-index-btn {
    padding: 4px 8px;
    font-size: 11px;
    min-width: 50px;
  }

  .index-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}

@media (max-width: 640px) {
  .summary-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .page-size-wrapper,
  .pagination-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

.table-footer {
  position: sticky;
  bottom: 0; /* stick to bottom */
  background: #f5f5f5;
  border-top: 1px solid #e8e8e8;
  z-index: 2; /* higher than table rows */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

/* Logs Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  position: relative;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  cursor: pointer;
}

.close-icon {
  width: 24px;
  height: 24px;
  color: #666;
  transition: color 0.2s;
}

.close-icon:hover {
  color: #ef4444;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.logs-table th,
.logs-table td {
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  font-size: 13px;
  text-align: left;
}

.logs-table td.success {
  color: #22c55e;
  font-weight: 600;
}

.logs-table td.failed {
  color: #ef4444;
  font-weight: 600;
}

/* Overlay animation */

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.overlay-enter-to,
.overlay-leave-from {
  opacity: 1;
}

/* Modal animation */

.modal-enter-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-leave-active {
  transition: all 0.18s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: translateY(-25px) scale(0.92);
}

.modal-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.modal-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.modal-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.alert-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.alert-box {
  padding: 14px 18px;
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
  font-size: 14px;
}
 </style>
  
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
  <div v-if="showQuotaBanner" class="alert-box quota">
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


<!-- SINGLE SUMMARY CARD -->
<div class="summary-card">
  <div class="summary-item clickable"
       :class="{ active: selectedFilter === 'ALL' }"
       @click="applyFilter('ALL')">
    <span class="label">Total URLs</span>
    <span class="value">{{ totalUrlCount }}</span>
  </div>

  <div class="summary-item clickable"
       :class="{ active: selectedFilter === 'SUCCESS' }"
       @click="applyFilter('SUCCESS')">
    <span class="label">Valid URLs</span>
    <span class="value success">{{ successCount }}</span>
  </div>

  <div class="summary-item clickable"
       :class="{ active: selectedFilter === 'FAILED' }"
       @click="applyFilter('FAILED')">
    <span class="label">Issues</span>
    <span class="value failed">{{ failedCount }}</span>
  </div>

  <div class="summary-item clickable"
       :class="{ active: selectedFilter === 'INDEXED' }"
       @click="applyFilter('INDEXED')">
    <span class="label">Indexed</span>
    <span class="value success">{{ indexed }}</span>
  </div>

  <div class="summary-item clickable"
       :class="{ active: selectedFilter === 'DEINDEXED' }"
       @click="applyFilter('DEINDEXED')">
    <span class="label">Deindexed</span>
    <span class="value success">{{ deIndexed }}</span>
  </div>

  <div class="summary-item clickable"
       :class="{ active: selectedFilter === 'INDEX_FAILED' }"
       @click="applyFilter('INDEX_FAILED')">
    <span class="label">Index Failed</span>
    <span class="value failed">{{ indexedFailed }}</span>
  </div>

  <div class="summary-item clickable"
       :class="{ active: selectedFilter === 'QUEUED' }"
       @click="applyFilter('QUEUED')">
    <span class="label">Total Queued</span>
    <span class="value">{{ indexedQueued }}</span>
  </div>
</div>

<!-- How to read grid: Indexing API ≠ live Search state -->
    <div class="alert-box indexing-guide" role="note">
      <div class="alert-title">Indexing API vs URL Inspection</div>
      <div class="alert-text">
        <strong>Queue status / API result</strong> show whether Google accepted your <em>Indexing API</em> notification (“Notify accepted”). That does not mean the URL is already visible in Search results.
        <strong>Coverage</strong>, <strong>Indexing state</strong>, <strong>Robots</strong>, and <strong>Page fetch</strong> come from <em>URL Inspection</em> (Search Console) and often lag until Google recrawls — use <strong>Google Sync</strong> to refresh those fields.
        Rows use a neutral background; a slim left-edge tint echoes <strong>API result</strong> (Indexing API outcome: notify accepted · failed · none).
      </div>
    </div>

    <!-- CONTROL BAR -->
    <div class="control-bar">
      <div class="control-bar-left">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search URLs..."
          class="search-input"
        />
        <span class="results-meta">Showing {{ urls.length }} of {{ pageInfo.totalCount }}</span>
      </div>
      <div class="control-bar-right">
        <div class="queue-priority-bar" aria-label="Default queue priority">
          <span class="priority-inline-label">Queue priority</span>
          <div class="priority-segments" role="radiogroup" aria-label="Queue priority">
            <button
              type="button"
              class="priority-seg"
              :class="{ active: queuePriority === 0 }"
              role="radio"
              :aria-checked="queuePriority === 0"
              @click="queuePriority = 0"
            >
              Low
            </button>
            <button
              type="button"
              class="priority-seg"
              :class="{ active: queuePriority === 1 }"
              role="radio"
              :aria-checked="queuePriority === 1"
              @click="queuePriority = 1"
            >
              Med
            </button>
            <button
              type="button"
              class="priority-seg"
              :class="{ active: queuePriority === 2 }"
              role="radio"
              :aria-checked="queuePriority === 2"
              @click="queuePriority = 2"
            >
              High
            </button>
          </div>
        </div>
        <template v-if="selectedIds.size > 0">
          <button type="button" class="clear-selection-btn" @click="clearSelection">
            Clear
          </button>
          <button type="button" class="index-btn" @click="queueSelectedForIndex" :disabled="!entitlementsStore.canUsePaidFeatures || entitlementsStore.isChecking" :title="paidActionTitle">
            Index queue ({{ selectedIds.size }})
          </button>
          <button type="button" class="queue-remove-btn" @click="queueSelectedForRemoval" :disabled="!entitlementsStore.canUsePaidFeatures || entitlementsStore.isChecking" :title="paidActionTitle">
            Remove queue ({{ selectedIds.size }})
          </button>
        </template>
        <button class="sync-btn" type="button" :title="paidActionTitle || 'Re-fetches URL Inspection data from Search Console for all URLs on this page (does not re-send Indexing API notifies).'" @click="startGoogleSync" :disabled="isSyncing || !entitlementsStore.canUsePaidFeatures || entitlementsStore.isChecking">
          🔄 Google Sync
        </button>
      </div>
    </div>

<!-- SYNC PROGRESS -->
<div v-if="isSyncing" class="sync-progress-card">
  <div class="sync-header">
    <span>🔄 Syncing with Google...</span>
    <span>{{ syncCompleted }} / {{ syncTotal }}</span>
  </div>

  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
  </div>

  <div class="sync-stats">
    <span class="success">✔ {{ syncCompleted }}</span>
    <span class="failed">✖ {{ syncFailed }}</span>
  </div>
</div>

    <!-- TABLE -->
    <div class="table-section">
    <div class="table-scroll">

      <table class="urls-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" :checked="isAllChecked" @change="toggleSelectAll" />
            </th>
            <th>URL</th>
            <th title="Google Search URL Inspection: indexing state (can lag after a notify).">Indexing State</th>
            <th title="Google Search URL Inspection: coverage / discovery.">Coverage State</th>
            <th title="Google Search URL Inspection.">Robots Txt State</th>
            <th title="Google Search URL Inspection.">Page Fetch State</th>
            <th title="Status of the indexing job in this app (e.g. Job done = pipeline finished; not the same as ranking).">Queue Status</th>
            <th title="Priority of the last queue request.">Priority</th>
            <th title="Indexing API outcome (notify accepted vs failed).">API Result</th>
            <th title="Update vs remove notification.">API Type</th>
            <th title="When the last indexing job finished.">Index Updated At</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in urls"
            :key="item.id"
            :class="apiResultRowClass(item.indexedResult)"
          >
            <td>
              <input
                type="checkbox"
                :checked="isSelected(item.id)"
                @change="toggleRow(item.id)"
              />
            </td>

            <td class="url-cell">
              <a :href="item.url" target="_blank" :title="item.url">{{ item.url }}</a>
            </td>

            <td
              class="inspection-cell"
              :title="inspectionTooltip(item.indexingState)"
            >
  <span
    class="indexing-chip indexing-chip--compact"
    :class="getIndexingStateClass(item.indexingState)"
  ><span class="indexing-chip__text">{{ formatGoogleInspectionLabel(item.indexingState) }}</span>
  </span>
</td>
            <td class="inspection-cell" :title="inspectionTooltip(item.coverageState)">{{ formatGoogleInspectionLabel(item.coverageState) }}</td>
            <td class="inspection-cell" :title="inspectionTooltip(item.robotsTxtState)">{{ formatGoogleInspectionLabel(item.robotsTxtState) }}</td>
            <td class="inspection-cell" :title="inspectionTooltip(item.pageFetchSpecified)">{{ formatGoogleInspectionLabel(item.pageFetchSpecified) }}</td>
            <td>{{ formatStateLabel(item.indexedStatus) }}</td>
            <td>{{ formatStateLabel(item.priority) }}</td>
            <td class="api-result-cell">
              <span
                class="api-result-chip"
                :class="apiResultChipClass(item.indexedResult)"
                :title="'Indexing API outcome: ' + (item.indexedResult || '—')"
              >{{ formatIndexedResult(item.indexedResult) }}</span>
            </td>
            <td>{{ item.type }}</td>
            <td>{{ formatDateTime(item.indexedAt) }}</td>

            <td class="action-cell">
              <div class="row-action-group" @click.stop>
                <button
                  title="Index actions"
                  class="row-index-btn"
                  :class="{ 'is-open-menu': rowMenuPortal?.urlId === item.id && rowMenuPortal.kind === 'index' }"
                  @click.stop="openRowDropdown($event, item.id, 'index')"
                >
                  ReIndex ▾
                </button>
              </div>

              <div class="row-action-group" @click.stop>
                <button
                  title="Deindex actions"
                  class="row-index-btn failed"
                  :class="{ 'is-open-menu': rowMenuPortal?.urlId === item.id && rowMenuPortal.kind === 'remove' }"
                  @click.stop="openRowDropdown($event, item.id, 'remove')"
                >
                  DeIndex ▾
                </button>
              </div>

              <button title="View Logs" class="row-index-btn view" @click="viewLogs(item.id)">Logs</button>
            </td>
          </tr>

          <tr v-if="urls.length === 0">
            <td colspan="12" style="text-align:center; padding:20px">
              {{ searchQuery ? 'No matching URLs found for current search/filter.' : 'No crawl data found.' }}
            </td>
          </tr>
        </tbody>
      </table>



      <div class="table-footer">
        <div class="page-size-wrapper">
          <label for="pageSize">Rows</label>
          <select id="pageSize" v-model.number="pageInfo.pageSize" :disabled="urlsFetching" @change="onPageSizeChange">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
            <option :value="1000">1000</option>
          </select>
        </div>

        <span class="pagination-range">
          {{ pageStartRow }}-{{ pageEndRow }} of {{ pageInfo.totalCount }}
        </span>

        <div class="pagination-wrapper">
          <button class="pagination-btn" :disabled="urlsFetching || !pageInfo.hasPreviousPage" @click="firstPage">
            First
          </button>
          <button class="pagination-btn" :disabled="urlsFetching || !pageInfo.hasPreviousPage" @click="previousPage">
            Prev
          </button>
          <span class="pagination-info">Page {{ pageInfo.page }} / {{ totalPages }}</span>
          <button class="pagination-btn" :disabled="urlsFetching || !pageInfo.hasNextPage" @click="nextPage">
            Next
          </button>
          <button class="pagination-btn" :disabled="urlsFetching || !pageInfo.hasNextPage" @click="lastPage">
            Last
          </button>
        </div>
      </div>
    </div>
    </div>


    <Loading :active.sync="logsLoading" :is-full-page="false" />

    <transition name="overlay">
      <div
        v-if="showLogsModal"
        class="modal-backdrop"
        @click.self="showLogsModal = false"
      >
        <transition name="modal">
          <div class="modal-box modal-box--xl" role="dialog" aria-modal="true">
            <header class="modal-header">
              <div>
                <h3 class="modal-title">Queue logs</h3>
                <p class="modal-subtitle">Indexing attempts recorded for this URL.</p>
              </div>
              <button type="button" class="modal-close" aria-label="Close" @click="showLogsModal = false">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div class="modal-body modal-body--flush">
              <table v-if="logs.length > 0" class="logs-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(log, index) in logs" :key="index">
                    <td>{{ log.type }}</td>
                    <td :class="log.status === 'Success' ? 'success' : 'failed'">
                      {{ log.status }}
                    </td>
                    <td>{{ log.message }}</td>
                    <td>{{ new Date(log.date).toLocaleDateString() }}</td>
                  </tr>
                </tbody>
              </table>

              <div v-else class="logs-empty">
                <div class="logs-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="9" y1="13" x2="15" y2="13"/>
                    <line x1="9" y1="17" x2="13" y2="17"/>
                  </svg>
                </div>
                <p class="logs-empty-title">No logs yet</p>
                <p class="logs-empty-desc">No indexing attempts have been recorded for this URL.</p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>


  <!-- Row action menus (fixed to viewport; avoids table overflow + layout shift) -->
  <Teleport to="body">
    <div
      v-if="rowMenuPortal"
      class="row-menu-backdrop"
      aria-hidden="true"
      @click="closeRowDropdown"
    />
  </Teleport>
  <Teleport to="body">
    <div
      v-if="rowMenuPortal"
      ref="rowMenuFloatingEl"
      class="row-action-menu-portal"
      role="menu"
      @click.stop
    >
      <template v-if="rowMenuPortal.kind === 'index'">
        <button type="button" class="row-action-menu-item" @click="indexSingleUrl(rowMenuPortal.urlId, 'direct')">
          Index now
        </button>
        <button type="button" class="row-action-menu-item" @click="indexSingleUrl(rowMenuPortal.urlId, 'queue')">
          Add to queue ({{ queuePriorityLabel }})
        </button>
      </template>
      <template v-else>
        <button type="button" class="row-action-menu-item" @click="removeIndexSingleUrl(rowMenuPortal.urlId, 'direct')">
          Deindex now
        </button>
        <button type="button" class="row-action-menu-item" @click="removeIndexSingleUrl(rowMenuPortal.urlId, 'queue')">
          Queue remove ({{ queuePriorityLabel }})
        </button>
      </template>
    </div>
  </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue"
import { useRoute } from "vue-router"
import api from "../api"
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom"
import Swal from "sweetalert2"
import { useToast } from "vue-toastification"
import Loading from "vue-loading-overlay"
import 'vue-loading-overlay/dist/css/index.css'
import { useEntitlementsStore } from "../Shared/entitlements"

const toast = useToast()
const route = useRoute()
const entitlementsStore = useEntitlementsStore()
const paidActionTitle = computed(() => entitlementsStore.canUsePaidFeatures ? '' : entitlementsStore.blockingReason)

const ensurePaidAccess = async () => {
  await entitlementsStore.refresh()
  if (entitlementsStore.canUsePaidFeatures) return true
  await Swal.fire('Subscription required', entitlementsStore.blockingReason, 'warning')
  return false
}

const selectedFilter = ref<string>("ALL");
  const searchQuery = ref("")
  let debounceTimer: any = null

  watch(searchQuery, () => {
  resetSelectionForDatasetChange()
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (pageInfo.value.page !== 1) pageInfo.value.page = 1
    else void fetchCrawlDetails()
  }, 500)
})
//   const fetchCrawlDetails = async () => {
//   const res = await api.get(
//     `/crawl/${siteId}/details`,
//     {
//       params: {
//         PageNo: pageInfo.value.page,
//         PageSize: pageInfo.value.pageSize,
//         filter: selectedFilter.value // 👈 ADD THIS
//       }
//     }
//   )

//   urls.value = res.data.data
//   pageInfo.value = res.data.pageInfo
// }

const applyFilter = (filter: string | null) => {
  resetSelectionForDatasetChange()
  selectedFilter.value = filter ?? "ALL"
  if (pageInfo.value.page !== 1) pageInfo.value.page = 1
  else void fetchCrawlDetails()
}
///google sync

// SYNC STATE
const isSyncing = ref(false)
const syncTotal = ref(0)
const syncCompleted = ref(0)
const syncFailed = ref(0)
let eventSource: EventSource|null = null

const progressPercent = computed(() => 
  syncTotal.value === 0 ? 0 : Math.round((syncCompleted.value / syncTotal.value) * 100)
)

// START SYNC
const startGoogleSync = async () => {
  if (isSyncing.value) return
  if (!(await ensurePaidAccess())) return

  const confirm = await Swal.fire({
  title: 'Confirm Google Sync',
  text: 'This will Syncs and updates the indexing status of URLs in the grid.',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes',
  cancelButtonText: 'Cancel',
  confirmButtonColor: '#22c55e'
  // remove reverseButtons
});

  if (!confirm.isConfirmed) return

  isSyncing.value = true
  syncTotal.value = 0
  syncCompleted.value = 0
  syncFailed.value = 0

  // 🔥 START SSE FIRST (no waiting)
  connectSSE()

  try {
    await api.post(`/crawl/sync-url-to-google?websiteId=${siteId}`)
  } catch (err) {
    console.error(err)

    isSyncing.value = false
    eventSource?.close()
    eventSource = null

    Swal.fire("Error", "Failed to start sync", "error")
  }
}

const connectSSE = () => {
  if (eventSource) return // ✅ prevent duplicate connections

  eventSource = new EventSource(
    `${import.meta.env.VITE_API_BASE_URL}/crawl/get-sync-url-to-google/${siteId}`
  )

  eventSource.onmessage = (event) => {
    if (!event.data) return

    const data = JSON.parse(event.data)

    syncTotal.value = data.Total ?? syncTotal.value
    syncCompleted.value = data.Completed ?? syncCompleted.value
    syncFailed.value = data.Failed ?? syncFailed.value

    // optional: mark syncing if we get any progress
    if (!isSyncing.value) isSyncing.value = true

    if (data.status === "completed") {
      isSyncing.value = false

      eventSource?.close()
      eventSource = null

      fetchCrawlDetails()
      fetchCrawlCounts()
    }
  }

  eventSource.onerror = () => {
    eventSource?.close()
    eventSource = null

    // 🔁 optional auto-reconnect (only if still syncing)
    if (isSyncing.value) {
      setTimeout(connectSSE, 3000)
    }
  }
}
///google sync
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

/** Row + chip styling from Indexing API outcome (indexedResult). */
const apiResultRowClass = (raw?: string | null) => {
  const v = (raw ?? "").trim().toLowerCase()
  if (!v) return "api-row api-row--neutral"
  if (v.includes("fail")) return "api-row api-row--fail"
  if (v.includes("notify") || v.includes("accepted") || v === "success")
    return "api-row api-row--ok"
  return "api-row api-row--neutral"
}

const apiResultChipClass = (raw?: string | null) => {
  const v = (raw ?? "").trim()
  if (!v) return "api-result-chip--muted"
  const lo = v.toLowerCase()
  if (lo.includes("fail")) return "api-result-chip--fail"
  if (lo.includes("notify") || lo.includes("accepted") || lo === "success")
    return "api-result-chip--ok"
  return "api-result-chip--muted"
}

const getIndexingStateClass = (state: string) => {
  if (!state) return "red";

  if (state === "INDEXING_ALLOWED") return "green";
  if (state === "INDEXING_STATE_UNSPECIFIED") return "orange";

  return "red";
};

const formatStateLabel = (value?: string | null) => {
  if (!value) return "-"
  return value.replace(/_/g, " ")
}

/** DB / API: last Indexing API outcome (not Search “indexed” rank). Legacy rows may still say Success. */
const formatIndexedResult = (value?: string | null) => {
  if (!value) return "-"
  const v = value.trim()
  if (v === "Success") return "Notify accepted"
  return v.replace(/_/g, " ")
}

/** Full Inspection text for tooltips (underscores → spaces). */
const inspectionTooltip = (value?: string | null) => {
  if (value == null || value === "") return ""
  return value.replace(/_/g, " ").trim()
}

/** Short single-line labels for URL Inspection-derived cells (full detail in tooltip). */
const formatGoogleInspectionLabel = (value?: string | null) => {
  if (value == null || value === "") return "—"
  const t = value.trim()

  const lower = t.toLowerCase()

  // Condense ENUM-style unspecified states to one token
  if (/coverage_state/i.test(t) && /unspecified/i.test(t)) return "Unset"
  if (/indexing_state/i.test(t) && /unspecified/i.test(t)) return "Unset"
  if (/indexing.+unspecified/i.test(lower) || /^indexing\s+state\s+unspecified$/i.test(t.trim()))
    return "Unset"
  if (/robots_txt/i.test(t) && /unspecified/i.test(t)) return "Unset"
  if (/robots.+unspecified/i.test(lower)) return "Unset"
  if (/page_fetch/i.test(t) && /unspecified/i.test(t)) return "Unset"
  if (/page\s+fetch.+unspecified/i.test(lower)) return "Unset"
  if (/coverage.+unspecified/i.test(lower)) return "Unset"
  if (/^unspecified$/i.test(t)) return "Unset"
  if (/unspecified/i.test(t) && (/state$/i.test(t) || /^[A-Z_]+_/i.test(t))) return "Unset"

  if (/url\s+is\s+unknown/i.test(lower) || /unknown\s+to\s+google/i.test(lower)) return "Unknown to Google"

  return t.replace(/_/g, " ")
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const viewLogs = async (urlId: number) => {
  showLogsModal.value = true; // first show modal
  logsLoading.value = true;
  console.log("Fetching logs for URL ID:", urlId);

  try {
    const res = await api.get(`/crawl/queue-logs`, {
      params: { urlId }
    });
    if (res?.data?.isSuccess) {
      logs.value = res.data.data;
      console.log("Logs fetched:", logs.value);
    } else {
      logs.value = [];
      Swal.fire("Error", res?.data?.meta || "Failed to fetch logs", "error");
    }
  } catch (err: any) {
    console.error(err);
    const message =
      err?.response?.data?.meta ||
      err?.response?.data?.error?.description ||
      "Failed to fetch logs";
    Swal.fire("Error", message, "error");
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

const siteId = Number(route.params.siteId)

const urls = ref<CrawledUrl[]>([])
const selectedIds = ref<Set<number>>(new Set())
const siteInfo = ref<SiteInfo | null>(null)
const isLoading = ref(false)
/** True while URL grid request is in flight — avoids overlapping pagination races. */
const urlsFetching = ref(false)
let crawlDetailsFetchSeq = 0

const pageInfo = ref<PageInfo>({
  page: 1,
  pageSize: 10,
  totalCount: 0,
  hasNextPage: false,
  hasPreviousPage: false
})

const onPageSizeChange = () => {
  pageInfo.value.page = 1
}


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

const showQuotaBanner = computed(
  () => isQuotaExceeded.value || Boolean(counts.value?.hasDailyQuotaExceed)
)

/* API */
const fetchCrawlDetails = async () => {
  const seq = ++crawlDetailsFetchSeq
  urlsFetching.value = true
  try {
    const res = await api.get(
      `/crawl/${siteId}/details`,
      {
        params: {
          SearchBy: searchQuery.value,
          Filter: selectedFilter.value === "ALL" ? null : selectedFilter.value,
          SortBy: null,
          PageNo: pageInfo.value.page,
          PageSize: pageInfo.value.pageSize
        }
      }
    )
    if (seq !== crawlDetailsFetchSeq) return

    urls.value = res.data.data

    const p = res.data.pageInfo
    pageInfo.value.page = Number(p?.page) || 1
    pageInfo.value.pageSize = Number(p?.pageSize) || 10
    pageInfo.value.totalCount = Number(p?.totalCount) || 0
    pageInfo.value.hasNextPage = Boolean(p?.hasNextPage)
    pageInfo.value.hasPreviousPage = Boolean(p?.hasPreviousPage)
  } catch (err) {
    if (seq !== crawlDetailsFetchSeq) return
    console.error(err)
  } finally {
    if (seq === crawlDetailsFetchSeq) urlsFetching.value = false
  }
}

watch(
  [() => pageInfo.value.page, () => pageInfo.value.pageSize],
  () => {
    resetSelectionForDatasetChange()
    void fetchCrawlDetails()
  }
)

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

/** Default queue priority for toolbar + single-row “add to queue” (0 low, 1 med, 2 high). */
const queuePriority = ref<0 | 1 | 2>(1)

const queuePriorityLabel = computed(() =>
  queuePriority.value === 2 ? "High" : queuePriority.value === 1 ? "Medium" : "Low"
)

const clearSelection = () => {
  selectedIds.value = new Set()
}

const resetSelectionForDatasetChange = () => {
  if (selectedIds.value.size > 0) clearSelection()
}

type RowMenuKind = "index" | "remove"

interface RowMenuPortalState {
  urlId: number
  kind: RowMenuKind
}

const rowMenuPortal = ref<RowMenuPortalState | null>(null)
const rowMenuFloatingEl = ref<HTMLElement | null>(null)
/** Trigger button — Floating UI reference element. */
const rowMenuAnchorEl = ref<HTMLElement | null>(null)
const MENU_MIN_WIDTH = 196

let stopFloatingAutoUpdate: (() => void) | undefined

const detachFloatingUpdates = () => {
  stopFloatingAutoUpdate?.()
  stopFloatingAutoUpdate = undefined
}

const positionFloatingMenu = async () => {
  const refEl = rowMenuAnchorEl.value
  const floatEl = rowMenuFloatingEl.value
  if (!refEl || !floatEl) return

  const r = refEl.getBoundingClientRect()
  const menuWidth = Math.max(MENU_MIN_WIDTH, Math.ceil(r.width))
  const { x, y } = await computePosition(refEl, floatEl, {
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  })
  Object.assign(floatEl.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: `${menuWidth}px`,
  })
}

const bindFloatingUpdates = async () => {
  detachFloatingUpdates()
  await nextTick()

  const refEl = rowMenuAnchorEl.value
  const floatEl = rowMenuFloatingEl.value
  if (!refEl || !floatEl) return

  stopFloatingAutoUpdate = autoUpdate(refEl, floatEl, () => {
    void positionFloatingMenu()
  })
  await positionFloatingMenu()
}

const closeRowDropdown = () => {
  detachFloatingUpdates()
  rowMenuAnchorEl.value = null
  rowMenuPortal.value = null
}

const openRowDropdown = async (ev: MouseEvent, urlId: number, kind: RowMenuKind) => {
  const btn = ev.currentTarget as HTMLElement | null
  if (!btn) return

  const sameOpen =
    rowMenuPortal.value?.urlId === urlId && rowMenuPortal.value.kind === kind
  if (sameOpen) {
    closeRowDropdown()
    return
  }

  detachFloatingUpdates()
  rowMenuAnchorEl.value = btn
  rowMenuPortal.value = { urlId, kind }
  await bindFloatingUpdates()
}

const queueSelectedForIndex = async () => {
  if (selectedIds.value.size === 0) return
  if (!(await ensurePaidAccess())) return
  isLoading.value = true
  try {
    const resQueue = await api.post("/crawl/index", {
      websiteId: siteId,
      urlId: Array.from(selectedIds.value),
      type: "URL_UPDATED",
      priority: queuePriority.value
    })
    if (resQueue?.data?.isSuccess) {
      toast.success(resQueue?.data?.message || `${selectedIds.value.size} URL(s) queued for indexing (${queuePriorityLabel.value}).`)
    } else {
      Swal.fire("Failed", resQueue?.data?.meta ?? "Request failed", "error")
    }
  } catch (e) {
    console.error(e)
    Swal.fire("Failed", "Could not queue URLs.", "error")
  } finally {
    isLoading.value = false
    selectedIds.value = new Set()
    fetchCrawlDetails()
    fetchCrawlCounts()
  }
}

const queueSelectedForRemoval = async () => {
  if (selectedIds.value.size === 0) return
  if (!(await ensurePaidAccess())) return
  const n = selectedIds.value.size
  const confirm = await Swal.fire({
    title: "Queue removal?",
    text: `Send ${n} URL(s) to the deindex queue at ${queuePriorityLabel.value} priority.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Queue removal",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ef4444"
  })
  if (!confirm.isConfirmed) return

  isLoading.value = true
  try {
    const resQueue = await api.post("/crawl/index", {
      websiteId: siteId,
      urlId: Array.from(selectedIds.value),
      type: "URL_DELETED",
      priority: queuePriority.value
    })
    if (resQueue?.data?.isSuccess) {
      toast.success(resQueue?.data?.message || `${n} URL(s) queued for removal (${queuePriorityLabel.value}).`)
    } else {
      Swal.fire("Failed", resQueue?.data?.meta ?? "Request failed", "error")
    }
  } catch (e) {
    console.error(e)
    Swal.fire("Failed", "Could not queue URLs.", "error")
  } finally {
    isLoading.value = false
    selectedIds.value = new Set()
    fetchCrawlDetails()
    fetchCrawlCounts()
  }
}

/* INDEXING */


const indexSingleUrl = async (id: number, mode: "direct" | "queue") => {
  try {
    if (!(await ensurePaidAccess())) return
    closeRowDropdown()
    isLoading.value = true;
    try {
      if (mode === "direct") {
        const res = await api.post("/crawl/index-direct", {
          websiteId: siteId,
          urlId: id,
          type: "URL_UPDATED"
        });

        if (res?.data?.isSuccess) {
          Swal.fire({
            title: "Indexing API",
            text:
              res?.data?.message ??
              "Google accepted the notification. URL Inspection fields can take time to update.",
            icon: "success"
          })
        } else {
          Swal.fire("Failed", res?.data?.meta || "Something went wrong", "error");
        }
      } else {
        const resQueue = await api.post("/crawl/index", {
          websiteId: siteId,
          urlId: [id],
          type: "URL_UPDATED",
          priority: queuePriority.value
        });

        if (resQueue?.data?.isSuccess) {
          toast.success(resQueue?.data?.message || `Queued for indexing (${queuePriorityLabel.value} priority).`);
        } else {
          Swal.fire("Failed", resQueue?.data?.meta || "Something went wrong", "error");
        }
      }
    } finally {
      isLoading.value = false;
    }

    fetchCrawlDetails();
    fetchCrawlCounts();
    
  } catch (err: any) {
    console.error(err);
    const msg = err?.response?.data?.error?.description || "You are not authorized to perform indexing.";
    Swal.fire("Failed", msg, "error");
    isLoading.value = false;
     fetchCrawlDetails();
    fetchCrawlCounts();
  }
};



const removeIndexSingleUrl = async (id: number, mode: "direct" | "queue") => {
  try {
    if (!(await ensurePaidAccess())) return
    closeRowDropdown()
    isLoading.value = true;
    try {
      if (mode === "direct") {
        const res = await api.post("/crawl/index-direct", {
          websiteId: siteId,
          urlId: id,
          type: "URL_DELETED"
        });

        if (res?.data?.isSuccess) {
          Swal.fire({
            title: "Indexing API",
            text:
              res?.data?.message ??
              "Google accepted the removal notification. URL Inspection can take time to update.",
            icon: "success"
          })
        } else {
          Swal.fire("Failed", res?.data?.meta || "Something went wrong", "error");
        }
      } else {
        const resQueue = await api.post("/crawl/index", {
          websiteId: siteId,
          urlId: [id],
          type: "URL_DELETED",
          priority: queuePriority.value
        });

        if (resQueue?.data?.isSuccess) {
          toast.success(resQueue?.data?.message || `Queued for removal (${queuePriorityLabel.value} priority).`);
        } else {
          Swal.fire("Failed", resQueue?.data?.meta || "Something went wrong", "error");
        }
      }
    } finally {
      isLoading.value = false;
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
const totalPages = computed(() => {
  return Math.ceil(pageInfo.value.totalCount / pageInfo.value.pageSize) || 1
})
const pageStartRow = computed(() => {
  if (pageInfo.value.totalCount === 0) return 0
  return (pageInfo.value.page - 1) * pageInfo.value.pageSize + 1
})
const pageEndRow = computed(() => {
  if (pageInfo.value.totalCount === 0) return 0
  return Math.min(pageInfo.value.page * pageInfo.value.pageSize, pageInfo.value.totalCount)
})
/* PAGINATION */
const firstPage = () => {
  if (pageInfo.value.hasPreviousPage) pageInfo.value.page = 1
}
const nextPage = () => pageInfo.value.hasNextPage && pageInfo.value.page++
const previousPage = () => pageInfo.value.hasPreviousPage && pageInfo.value.page--
const lastPage = () => {
  if (pageInfo.value.hasNextPage) pageInfo.value.page = totalPages.value
}

const refreshQuotaOnFocus = () => {
  if (document.visibilityState !== "visible") return
  void fetchCrawlCounts()
  void fetchIndexLimit()
}

let quotaPoll: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  entitlementsStore.refresh()
  fetchCrawlDetails()
  fetchCrawlCounts()
  fetchIndexLimit()
  connectSSE()
  document.addEventListener("click", closeRowDropdown)
  document.addEventListener("visibilitychange", refreshQuotaOnFocus)
  quotaPoll = setInterval(refreshQuotaOnFocus, 90_000)
})

onBeforeUnmount(() => {
  detachFloatingUpdates()
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
  document.removeEventListener("click", closeRowDropdown)
  document.removeEventListener("visibilitychange", refreshQuotaOnFocus)
  if (quotaPoll) clearInterval(quotaPoll)
})

</script>

 <style scoped>
.page-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f9f9f9;
}

.page-header {
  margin-bottom: 16px;
}

.back-link {
  display: inline-block;
  margin-bottom: 10px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}
.back-link:hover {
  color: var(--color-text);
}

.back-link:hover {
  color: #16a34a;
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

@media (max-width: 1280px) {
  /* fallback for smaller screens: scroll horizontally */
  .summary-card {
    grid-template-columns: repeat(7, minmax(140px, 1fr));
    overflow-x: auto;
  }
}

.summary-item {
  background: var(--color-card-bg);
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}

.summary-item .label {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-item .value {
  font-size: 22px;
  color: var(--color-text);
  font-weight: 700;
}

.summary-item .value.success {
  color: var(--success-700);
}

.summary-item .value.failed {
  color: var(--danger-700);
}

/* =====================================================================
   Table Scroll Wrapper
   - horizontal scroll handled with sticky leading/trailing columns and
     edge shadows that only render while content is clipped
   ===================================================================== */
.table-scroll {
  position: relative;
  display: block;
  max-width: 100%;
  overflow: auto;
  max-height: calc(20 * 42px);

  /* Edge-shadow technique: two transparent gradient masks pinned to the
     viewport (scroll background-attachment), and two solid white covers
     pinned to the content (local background-attachment). When fully
     scrolled to an edge the cover hides the shadow on that side. */
  background:
    /* left cover (hides left shadow when at start) */
    linear-gradient(to right, var(--color-card-bg) 30%, rgba(255, 255, 255, 0)) left center / 24px 100% no-repeat,
    /* right cover (hides right shadow when at end) */
    linear-gradient(to left,  var(--color-card-bg) 30%, rgba(255, 255, 255, 0)) right center / 24px 100% no-repeat,
    /* left scroll-shadow */
    radial-gradient(ellipse at left, rgba(17, 24, 39, 0.08), rgba(17, 24, 39, 0) 70%) left center / 14px 100% no-repeat,
    /* right scroll-shadow */
    radial-gradient(ellipse at right, rgba(17, 24, 39, 0.08), rgba(17, 24, 39, 0) 70%) right center / 14px 100% no-repeat;
  background-attachment: local, local, scroll, scroll;
}

/* Table Styles */
.urls-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 980px;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
}

.urls-table thead {
  position: sticky;
  top: 0;
  z-index: 3;
}

.urls-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--fw-medium);
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--neutral-50);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.urls-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  font-size: var(--fs-base);
  color: var(--color-text);
  vertical-align: middle;
  background: var(--color-card-bg);
}

.urls-table tbody tr {
  transition: background 120ms ease;
  position: relative;
  z-index: 1;
  height: 42px;
}
/* Rows: stripe from Indexing API result (indexedResult) */
.urls-table tbody tr.api-row td {
  background: var(--color-card-bg);
}

.urls-table tbody tr:hover td {
  background: var(--neutral-50);
}

.urls-table tbody tr.api-row--ok td:nth-child(1) {
  box-shadow: inset 2px 0 0 rgba(5, 150, 105, 0.72);
}

.urls-table tbody tr.api-row--fail td:nth-child(1) {
  box-shadow: inset 2px 0 0 rgba(220, 38, 38, 0.78);
}

.urls-table tbody tr.api-row--neutral td:nth-child(1) {
  box-shadow: inset 2px 0 0 rgba(148, 163, 184, 0.55);
}

.urls-table tbody tr:last-child td {
  border-bottom: none;
}

/* ----------------- Sticky leading + trailing columns -------------------
   Columns 1 (checkbox), 2 (URL) freeze on the left.
   Last column (Action) freezes on the right.
   This keeps row identity + actions reachable when scrolling horizontally.
   ----------------------------------------------------------------------- */
.urls-table th:nth-child(1),
.urls-table td:nth-child(1) {
  position: sticky;
  left: 0;
  z-index: 2;
  width: 40px;
  min-width: 40px;
}
.urls-table thead th:nth-child(1) { z-index: 4; }

.urls-table th:nth-child(2),
.urls-table td:nth-child(2) {
  position: sticky;
  left: 40px;
  z-index: 2;
  /* divider that visually separates frozen column from scrolling area */
  box-shadow: inset -1px 0 0 var(--color-divider);
}
.urls-table thead th:nth-child(2) { z-index: 4; }

.urls-table th:last-child,
.urls-table td:last-child {
  position: sticky;
  right: 0;
  z-index: 2;
  box-shadow: inset 1px 0 0 var(--color-divider);
}
.urls-table thead th:last-child { z-index: 4; }

/* URL cell: cap width and truncate with ellipsis (full URL stays in tooltip) */
.url-cell {
  max-width: 320px;
}
.url-cell a {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  text-decoration: none;
  color: var(--color-text);
  font-weight: var(--fw-medium);
}
.url-cell a:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

/* Status Badges */
.status-badge {
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.005em;
  font-variant-numeric: tabular-nums;
}
.status-badge::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.status-badge.success {
  background: var(--success-50);
  color: var(--success-700);
  border: 1px solid var(--success-100);
}

.status-badge.failed {
  background: var(--danger-50);
  color: var(--danger-700);
  border: 1px solid var(--danger-100);
}

/* Indexing API result — pill chips (paired with api-row stripes) */
.api-result-cell {
  max-width: 170px;
  vertical-align: middle;
}

.api-result-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: var(--fw-medium);
  letter-spacing: 0.008em;
  border: 1px solid transparent;
  white-space: nowrap;
  max-width: 100%;
  line-height: 1.25;
}

.api-result-chip::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.api-result-chip--ok {
  background: var(--success-50);
  color: var(--success-700);
  border-color: var(--success-100);
}

.api-result-chip--fail {
  background: var(--danger-50);
  color: var(--danger-700);
  border-color: var(--danger-100);
}

.api-result-chip--muted {
  background: var(--neutral-100);
  color: var(--neutral-600);
  border-color: var(--neutral-200);
}

/* Buttons */
.index-btn {
  padding: 8px 14px;
  background: var(--color-accent);
  color: var(--color-accent-fg);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: var(--fw-medium);
  font-family: inherit;
  transition: background 140ms ease;
}
.index-btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.index-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.row-index-btn {
  padding: 5px 10px;
  font-size: var(--fs-sm);
  border-radius: var(--radius-sm);
  min-width: 60px;
  text-align: center;
  cursor: pointer;
  margin: 2px;
  font-family: inherit;
  font-weight: var(--fw-medium);
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.row-index-btn:hover {
  background: var(--neutral-50);
  border-color: var(--neutral-400);
}

.row-index-btn.view {
  background: var(--color-card-bg);
  color: var(--color-text);
  border-color: var(--color-border-strong);
}
.row-index-btn.view:hover {
  background: var(--neutral-900);
  border-color: var(--neutral-900);
  color: #fff;
}

.row-index-btn.failed {
  background: var(--color-card-bg);
  color: var(--color-danger);
  border-color: var(--danger-100);
}
.row-index-btn.failed:hover {
  background: var(--danger-50);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.urls-table .action-cell {
  position: relative;
  overflow: visible;
  gap: 6px;
  justify-content: center;
  align-items: center;
  height: 42px;
  min-height: 42px;
  white-space: nowrap;
  box-sizing: border-box;
}

.row-action-group {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  height: 32px;
}

:global(.row-menu-backdrop) {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

:global(.row-action-menu-portal) {
  position: fixed;
  z-index: 9999;
  min-width: 180px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:global(.row-action-menu-portal .row-action-menu-item) {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--fs-sm);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: block;
}

:global(.row-action-menu-portal .row-action-menu-item:hover) {
  background: var(--neutral-50);
}

/* Site Info */
.site-info {
  margin-top: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.site-type-chip {
  background: var(--neutral-100);
  color: var(--neutral-700);
  border: 1px solid var(--color-border);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
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
  background: var(--warning-50);
  border: 1px solid var(--warning-100);
  color: var(--warning-700);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Pagination Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f9f9f9;
  border-top: 1px solid #e8e8e8;
  flex-wrap: wrap;
  gap: 8px;
}

.page-size-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
}

.page-size-wrapper select {
  padding: 5px 26px 5px 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background: var(--color-card-bg);
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-family: inherit;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748b' stroke-width='1.5'/%3E%3C/svg%3E%0A");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 10px 6px;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pagination-info {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-weight: var(--fw-medium);
  font-variant-numeric: tabular-nums;
}

.pagination-btn {
  padding: 5px 12px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  font-family: inherit;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--neutral-900);
  border-color: var(--neutral-900);
  color: #fff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Chips (default sizing; tightened inside .inspection-cell) */
.indexing-chip {
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-transform: capitalize;
  letter-spacing: 0.005em;
  border: 1px solid transparent;
}

/* URL Inspection columns: fixed row height — single line + ellipsis */
.inspection-cell {
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.inspection-cell .indexing-chip--compact {
  max-width: 100%;
  min-width: 0;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.25;
}

.inspection-cell .indexing-chip--compact::before {
  flex-shrink: 0;
}

.indexing-chip__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.indexing-chip::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.indexing-chip.green {
  background-color: var(--success-50);
  color: var(--success-700);
  border-color: var(--success-100);
}

.indexing-chip.orange {
  background-color: var(--warning-50);
  color: var(--warning-700);
  border-color: var(--warning-100);
}

.indexing-chip.red {
  background-color: var(--danger-50);
  color: var(--danger-700);
  border-color: var(--danger-100);
}

/* Responsive */
@media (max-width: 1024px) {
  .urls-table {
    min-width: 980px;
  }
  .urls-table th,
  .urls-table td {
    padding: var(--space-2) var(--space-3);
    font-size: var(--fs-sm);
  }
  .url-cell { max-width: 220px; }
  .row-index-btn {
    padding: 4px 8px;
    font-size: var(--fs-xs);
    min-width: 50px;
  }
  .index-btn {
    padding: 6px 10px;
    font-size: var(--fs-sm);
  }
}

@media (max-width: 640px) {
  .control-bar-left,
  .control-bar-right {
    width: 100%;
  }

  .control-bar-right {
    margin-left: 0;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .results-meta {
    width: 100%;
  }

  .url-cell { max-width: 180px; }
  /* On mobile, drop sticky leading column to give content more room.
     Action column stays sticky for quick access. */
  .urls-table th:nth-child(1),
  .urls-table td:nth-child(1),
  .urls-table th:nth-child(2),
  .urls-table td:nth-child(2) {
    position: static;
    box-shadow: none;
  }

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
  padding: 10px 12px;
}

/* Logs Modal — backdrop/box from theme.css */
/* Modal close button styling comes from theme.css (.modal-close) */

.modal-body--flush { padding: 0 !important; }

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-sm);
  font-variant-numeric: tabular-nums;
}

.logs-table thead th {
  position: sticky;
  top: 0;
  background: var(--neutral-50);
  border-bottom: 1px solid var(--color-divider);
  padding: 10px var(--space-6);
  text-align: left;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  z-index: 1;
}

.logs-table tbody td {
  padding: 12px var(--space-6);
  border-bottom: 1px solid var(--color-divider);
  color: var(--color-text);
  vertical-align: top;
}

.logs-table tbody tr:last-child td { border-bottom: none; }
.logs-table tbody tr:hover td { background: var(--neutral-50); }

.logs-table td.success {
  color: var(--success-700);
  font-weight: var(--fw-medium);
}

.logs-table td.failed {
  color: var(--danger-700);
  font-weight: var(--fw-medium);
}

.logs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-7) var(--space-6);
  text-align: center;
  color: var(--color-text-secondary);
}
.logs-empty-icon {
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
.logs-empty-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}
.logs-empty-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: var(--fw-semi);
  color: var(--color-text);
}
.logs-empty-desc {
  margin: 4px 0 0 0;
  font-size: var(--fs-sm);
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
  gap: 12px;
  margin-bottom: 14px;
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
  background: var(--warning-50);
  border-color: var(--warning-100);
  color: var(--warning-700);
}

/* URL Inspection explainer */
.alert-box.indexing-guide {
  background: var(--neutral-50);
  border-color: var(--color-border);
  color: var(--color-text);
  margin-bottom: 14px;
}

.alert-title {
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
}

.alert-text {
  font-size: 13px;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  padding: 10px;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--neutral-50);
}

.control-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 320px;
  flex: 1;
}

.control-bar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
}

.queue-priority-bar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
}

.priority-inline-label {
  font-size: 11px;
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.priority-segments {
  display: inline-flex;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  overflow: hidden;
  background: var(--neutral-100);
}

.priority-seg {
  font-family: inherit;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  padding: 6px 12px;
  border: none;
  border-right: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}

.priority-seg:last-child {
  border-right: none;
}

.priority-seg:hover {
  background: var(--neutral-50);
  color: var(--color-text);
}

.priority-seg.active {
  background: var(--color-accent);
  color: var(--color-accent-fg);
}

.queue-remove-btn {
  font-family: inherit;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--danger-100);
  background: var(--color-card-bg);
  color: var(--color-danger);
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}

.queue-remove-btn:hover {
  background: var(--danger-50);
  border-color: var(--color-danger);
}

.results-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.clear-selection-btn {
  background: var(--color-card-bg);
  color: var(--color-text);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  font-weight: var(--fw-medium);
  cursor: pointer;
}

.clear-selection-btn:hover {
  background: var(--neutral-50);
}

.sync-btn {
  background: var(--color-accent);
  color: var(--color-accent-fg);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  font-weight: var(--fw-medium);
  font-size: var(--fs-base);
  cursor: pointer;
  font-family: inherit;
  transition: background 140ms ease;
}
.sync-btn:hover { background: var(--color-accent-hover); }
.sync-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.sync-progress-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
}
.sync-header { display:flex; justify-content:space-between; font-weight:600; margin-bottom:8px; font-size:13px; }
.progress-bar { width:100%; height:6px; background: var(--neutral-200); border-radius:6px; overflow:hidden; }
.progress-fill { height:100%; background: var(--color-accent); transition:width 0.3s ease; }
.sync-stats { display:flex; gap:12px; margin-top:8px; font-size:13px; }
.sync-stats .success { color: var(--success-700); font-weight: 600; }
.sync-stats .failed  { color: var(--danger-700);  font-weight: 600; }

.summary-item.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.summary-item.clickable:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-strong);
}

.summary-item.active {
  border-color: var(--color-accent);
  background: var(--success-50);
  box-shadow: 0 0 0 1px var(--success-100) inset;
}

.search-input {
  width: min(460px, 100%);
  padding: 8px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--color-card-bg);
  color: var(--color-text);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
  box-shadow: 0 0 0 2px rgba(34,197,94,0.2);
}

.table-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-card-bg);
}

.table-footer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: var(--neutral-50);
  border-top: 1px solid var(--color-divider);
}

.pagination-range {
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
  font-variant-numeric: tabular-nums;
}

.control-bar {
  border: 1px solid var(--color-border);
  background: var(--color-card-bg);
}

 </style>
  

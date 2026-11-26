/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { showUpgradePrompt } from '../Shared/upgradePrompt';
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import api from "../api";
import { autoUpdate, computePosition, flip, offset, shift, } from "@floating-ui/dom";
import Swal from "sweetalert2";
import { useToast } from "vue-toastification";
import Loading from "vue-loading-overlay";
import 'vue-loading-overlay/dist/css/index.css';
import { useEntitlementsStore } from "../Shared/entitlements";
const toast = useToast();
const route = useRoute();
const entitlementsStore = useEntitlementsStore();
const paidActionTitle = computed(() => entitlementsStore.canUsePaidFeatures ? '' : entitlementsStore.blockingReason);
const ensurePaidAccess = async () => {
    await entitlementsStore.refresh();
    if (entitlementsStore.canUsePaidFeatures)
        return true;
    await showUpgradePrompt(entitlementsStore.blockingReason);
    return false;
};
const selectedFilter = ref("ALL");
const searchQuery = ref("");
let debounceTimer = null;
watch(searchQuery, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (pageInfo.value.page !== 1)
            pageInfo.value.page = 1;
        else
            void fetchCrawlDetails();
    }, 500);
});
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
const applyFilter = (filter) => {
    selectedFilter.value = filter ?? "ALL";
    if (pageInfo.value.page !== 1)
        pageInfo.value.page = 1;
    else
        void fetchCrawlDetails();
};
///google sync
// SYNC STATE
const isSyncing = ref(false);
const syncTotal = ref(0);
const syncCompleted = ref(0);
const syncFailed = ref(0);
let eventSource = null;
const progressPercent = computed(() => syncTotal.value === 0 ? 0 : Math.round((syncCompleted.value / syncTotal.value) * 100));
// START SYNC
const startGoogleSync = async () => {
    if (isSyncing.value)
        return;
    if (!(await ensurePaidAccess()))
        return;
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
    if (!confirm.isConfirmed)
        return;
    isSyncing.value = true;
    syncTotal.value = 0;
    syncCompleted.value = 0;
    syncFailed.value = 0;
    // 🔥 START SSE FIRST (no waiting)
    connectSSE();
    try {
        await api.post(`/crawl/sync-url-to-google?websiteId=${siteId}`);
    }
    catch (err) {
        console.error(err);
        isSyncing.value = false;
        eventSource?.close();
        eventSource = null;
        Swal.fire("Error", "Failed to start sync", "error");
    }
};
const connectSSE = () => {
    if (eventSource)
        return; // ✅ prevent duplicate connections
    eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/crawl/get-sync-url-to-google/${siteId}`, { withCredentials: true });
    eventSource.onmessage = (event) => {
        if (!event.data)
            return;
        const data = JSON.parse(event.data);
        syncTotal.value = data.Total ?? syncTotal.value;
        syncCompleted.value = data.Completed ?? syncCompleted.value;
        syncFailed.value = data.Failed ?? syncFailed.value;
        // optional: mark syncing if we get any progress
        if (!isSyncing.value)
            isSyncing.value = true;
        if (data.status === "completed") {
            isSyncing.value = false;
            eventSource?.close();
            eventSource = null;
            fetchCrawlDetails();
            fetchCrawlCounts();
        }
    };
    eventSource.onerror = () => {
        eventSource?.close();
        eventSource = null;
        // 🔁 optional auto-reconnect (only if still syncing)
        if (isSyncing.value) {
            setTimeout(connectSSE, 3000);
        }
    };
};
///google sync
const isQuotaExceeded = ref(false);
const fetchIndexLimit = async () => {
    try {
        const res = await api.get(`/crawl/index-limit`);
        if (res?.data?.isSuccess) {
            isQuotaExceeded.value = res.data.data === true;
        }
        else {
            isQuotaExceeded.value = false;
        }
    }
    catch (err) {
        console.error("Index limit error:", err);
        isQuotaExceeded.value = false;
    }
};
const showLogsModal = ref(false); // controls modal visibility
const logs = ref([]); // store logs
const timeline = ref(null);
const logsLoading = ref(false);
/** Row + chip styling from Indexing API outcome (indexedResult). */
const apiResultRowClass = (raw) => {
    const v = (raw ?? "").trim().toLowerCase();
    if (!v)
        return "api-row api-row--neutral";
    if (v.includes("fail"))
        return "api-row api-row--fail";
    if (v.includes("notify") || v.includes("accepted") || v === "success")
        return "api-row api-row--ok";
    return "api-row api-row--neutral";
};
const apiResultChipClass = (raw) => {
    const v = (raw ?? "").trim();
    if (!v)
        return "api-result-chip--muted";
    const lo = v.toLowerCase();
    if (lo.includes("fail"))
        return "api-result-chip--fail";
    if (lo.includes("notify") || lo.includes("accepted") || lo === "success")
        return "api-result-chip--ok";
    return "api-result-chip--muted";
};
const getIndexingStateClass = (state) => {
    if (!state)
        return "red";
    if (state === "INDEXING_ALLOWED")
        return "green";
    if (state === "INDEXING_STATE_UNSPECIFIED")
        return "orange";
    return "red";
};
const formatStateLabel = (value) => {
    if (!value)
        return "-";
    return value.replace(/_/g, " ");
};
/** DB / API: last Indexing API outcome (not Search “indexed” rank). Legacy rows may still say Success. */
const formatIndexedResult = (value) => {
    if (!value)
        return "-";
    const v = value.trim();
    if (v === "Success")
        return "Notify accepted";
    return v.replace(/_/g, " ");
};
/** Full Inspection text for tooltips (underscores → spaces). */
/** Short single-line labels for URL Inspection-derived cells (full detail in tooltip). */
const formatGoogleInspectionLabel = (value) => {
    if (value == null || value === "")
        return "—";
    const t = value.trim();
    const lower = t.toLowerCase();
    // Condense ENUM-style unspecified states to one token
    if (/coverage_state/i.test(t) && /unspecified/i.test(t))
        return "Unset";
    if (/indexing_state/i.test(t) && /unspecified/i.test(t))
        return "Unset";
    if (/indexing.+unspecified/i.test(lower) || /^indexing\s+state\s+unspecified$/i.test(t.trim()))
        return "Unset";
    if (/robots_txt/i.test(t) && /unspecified/i.test(t))
        return "Unset";
    if (/robots.+unspecified/i.test(lower))
        return "Unset";
    if (/page_fetch/i.test(t) && /unspecified/i.test(t))
        return "Unset";
    if (/page\s+fetch.+unspecified/i.test(lower))
        return "Unset";
    if (/coverage.+unspecified/i.test(lower))
        return "Unset";
    if (/^unspecified$/i.test(t))
        return "Unset";
    if (/unspecified/i.test(t) && (/state$/i.test(t) || /^[A-Z_]+_/i.test(t)))
        return "Unset";
    if (/url\s+is\s+unknown/i.test(lower) || /unknown\s+to\s+google/i.test(lower))
        return "Unknown to Google";
    return t.replace(/_/g, " ");
};
const formatDateTime = (value) => {
    if (!value)
        return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    return date.toLocaleString();
};
const viewLogs = async (urlId) => {
    showLogsModal.value = true; // first show modal
    logsLoading.value = true;
    timeline.value = null;
    // The timeline (crawl → submissions → Google inspections) is independent of the queue logs.
    api.get(`/crawl/url/${urlId}/timeline`)
        .then(res => { timeline.value = res?.data?.data ?? null; })
        .catch(() => { timeline.value = null; });
    try {
        const res = await api.get(`/crawl/queue-logs`, {
            params: { urlId }
        });
        if (res?.data?.isSuccess) {
            logs.value = res.data.data;
            console.log("Logs fetched:", logs.value);
        }
        else {
            logs.value = [];
            Swal.fire("Error", res?.data?.meta || "Failed to fetch logs", "error");
        }
    }
    catch (err) {
        console.error(err);
        const message = err?.response?.data?.meta ||
            err?.response?.data?.error?.description ||
            "Failed to fetch logs";
        Swal.fire("Error", message, "error");
        logs.value = [];
    }
    finally {
        logsLoading.value = false;
    }
};
const siteId = Number(route.params.siteId);
const urls = ref([]);
const selectedIds = ref(new Set());
const siteInfo = ref(null);
const isLoading = ref(false);
/** True while URL grid request is in flight — avoids overlapping pagination races. */
const urlsFetching = ref(false);
let crawlDetailsFetchSeq = 0;
const pageInfo = ref({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
});
const onPageSizeChange = () => {
    pageInfo.value.page = 1;
};
const counts = ref({
    totalCount: 0,
    successCount: 0,
    failedCount: 0,
    indexedSucceed: 0,
    indexedInGoogle: 0,
    deIndexedSucceed: 0,
    indexedFailed: 0,
    indexedQueued: 0,
    hasDailyQuotaExceed: false,
    site: { type: '', name: '', url: '', scheduleMessage: '' }
});
const showQuotaBanner = computed(() => isQuotaExceeded.value || Boolean(counts.value?.hasDailyQuotaExceed));
/* API */
const fetchCrawlDetails = async () => {
    const seq = ++crawlDetailsFetchSeq;
    urlsFetching.value = true;
    try {
        const res = await api.get(`/crawl/${siteId}/details`, {
            params: {
                SearchBy: searchQuery.value,
                Filter: selectedFilter.value === "ALL" ? null : selectedFilter.value,
                SortBy: null,
                PageNo: pageInfo.value.page,
                PageSize: pageInfo.value.pageSize
            }
        });
        if (seq !== crawlDetailsFetchSeq)
            return;
        urls.value = res.data.data;
        const p = res.data.pageInfo;
        pageInfo.value.page = Number(p?.page) || 1;
        pageInfo.value.pageSize = Number(p?.pageSize) || 10;
        pageInfo.value.totalCount = Number(p?.totalCount) || 0;
        pageInfo.value.hasNextPage = Boolean(p?.hasNextPage);
        pageInfo.value.hasPreviousPage = Boolean(p?.hasPreviousPage);
    }
    catch (err) {
        if (seq !== crawlDetailsFetchSeq)
            return;
        console.error(err);
    }
    finally {
        if (seq === crawlDetailsFetchSeq)
            urlsFetching.value = false;
    }
};
watch([() => pageInfo.value.page, () => pageInfo.value.pageSize], () => {
    void fetchCrawlDetails();
});
const fetchCrawlCounts = async () => {
    const res = await api.get(`/crawl/${siteId}/details-count`);
    counts.value = res.data.data;
    siteInfo.value = res.data.data.site;
};
/* SELECTION */
const isSelected = (id) => selectedIds.value.has(id);
const toggleRow = (id) => {
    selectedIds.value.has(id)
        ? selectedIds.value.delete(id)
        : selectedIds.value.add(id);
};
const isAllChecked = computed(() => urls.value.length > 0 &&
    urls.value.every(u => selectedIds.value.has(u.id)));
const toggleSelectAll = () => {
    if (isAllChecked.value) {
        urls.value.forEach(u => selectedIds.value.delete(u.id));
    }
    else {
        urls.value.forEach(u => selectedIds.value.add(u.id));
    }
};
/** Default queue priority for toolbar + single-row “add to queue” (0 low, 1 med, 2 high). */
const queuePriority = ref(1);
const queuePriorityLabel = computed(() => queuePriority.value === 2 ? "High" : queuePriority.value === 1 ? "Medium" : "Low");
const clearSelection = () => {
    selectedIds.value = new Set();
};
const rowMenuPortal = ref(null);
const rowMenuFloatingEl = ref(null);
/** Trigger button — Floating UI reference element. */
const rowMenuAnchorEl = ref(null);
const MENU_MIN_WIDTH = 196;
let stopFloatingAutoUpdate;
const detachFloatingUpdates = () => {
    stopFloatingAutoUpdate?.();
    stopFloatingAutoUpdate = undefined;
};
const positionFloatingMenu = async () => {
    const refEl = rowMenuAnchorEl.value;
    const floatEl = rowMenuFloatingEl.value;
    if (!refEl || !floatEl)
        return;
    const r = refEl.getBoundingClientRect();
    const menuWidth = Math.max(MENU_MIN_WIDTH, Math.ceil(r.width));
    const { x, y } = await computePosition(refEl, floatEl, {
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [offset(4), flip(), shift({ padding: 8 })],
    });
    Object.assign(floatEl.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        width: `${menuWidth}px`,
    });
};
const bindFloatingUpdates = async () => {
    detachFloatingUpdates();
    await nextTick();
    const refEl = rowMenuAnchorEl.value;
    const floatEl = rowMenuFloatingEl.value;
    if (!refEl || !floatEl)
        return;
    stopFloatingAutoUpdate = autoUpdate(refEl, floatEl, () => {
        void positionFloatingMenu();
    });
    await positionFloatingMenu();
};
const closeRowDropdown = () => {
    detachFloatingUpdates();
    rowMenuAnchorEl.value = null;
    rowMenuPortal.value = null;
};
const openRowDropdown = async (ev, urlId, kind) => {
    const btn = ev.currentTarget;
    if (!btn)
        return;
    const sameOpen = rowMenuPortal.value?.urlId === urlId && rowMenuPortal.value.kind === kind;
    if (sameOpen) {
        closeRowDropdown();
        return;
    }
    detachFloatingUpdates();
    rowMenuAnchorEl.value = btn;
    rowMenuPortal.value = { urlId, kind };
    await bindFloatingUpdates();
};
const queueSelectedForIndex = async () => {
    if (selectedIds.value.size === 0)
        return;
    if (!(await ensurePaidAccess()))
        return;
    isLoading.value = true;
    try {
        const resQueue = await api.post("/crawl/index", {
            websiteId: siteId,
            urlId: Array.from(selectedIds.value),
            type: "URL_UPDATED",
            priority: queuePriority.value
        });
        if (resQueue?.data?.isSuccess) {
            toast.success(resQueue?.data?.message || `${selectedIds.value.size} URL(s) queued for indexing (${queuePriorityLabel.value}).`);
        }
        else {
            Swal.fire("Failed", resQueue?.data?.meta ?? "Request failed", "error");
        }
    }
    catch (e) {
        console.error(e);
        Swal.fire("Failed", "Could not queue URLs.", "error");
    }
    finally {
        isLoading.value = false;
        selectedIds.value = new Set();
        fetchCrawlDetails();
        fetchCrawlCounts();
    }
};
const queueSelectedForRemoval = async () => {
    if (selectedIds.value.size === 0)
        return;
    if (!(await ensurePaidAccess()))
        return;
    const n = selectedIds.value.size;
    const confirm = await Swal.fire({
        title: "Queue removal?",
        text: `Send ${n} URL(s) to the deindex queue at ${queuePriorityLabel.value} priority.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Queue removal",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#ef4444"
    });
    if (!confirm.isConfirmed)
        return;
    isLoading.value = true;
    try {
        const resQueue = await api.post("/crawl/index", {
            websiteId: siteId,
            urlId: Array.from(selectedIds.value),
            type: "URL_DELETED",
            priority: queuePriority.value
        });
        if (resQueue?.data?.isSuccess) {
            toast.success(resQueue?.data?.message || `${n} URL(s) queued for removal (${queuePriorityLabel.value}).`);
        }
        else {
            Swal.fire("Failed", resQueue?.data?.meta ?? "Request failed", "error");
        }
    }
    catch (e) {
        console.error(e);
        Swal.fire("Failed", "Could not queue URLs.", "error");
    }
    finally {
        isLoading.value = false;
        selectedIds.value = new Set();
        fetchCrawlDetails();
        fetchCrawlCounts();
    }
};
/* INDEXING */
const indexSingleUrl = async (id, mode) => {
    try {
        if (!(await ensurePaidAccess()))
            return;
        closeRowDropdown();
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
                        text: res?.data?.message ??
                            "Google accepted the notification. URL Inspection fields can take time to update.",
                        icon: "success"
                    });
                }
                else {
                    Swal.fire("Failed", res?.data?.meta || "Something went wrong", "error");
                }
            }
            else {
                const resQueue = await api.post("/crawl/index", {
                    websiteId: siteId,
                    urlId: [id],
                    type: "URL_UPDATED",
                    priority: queuePriority.value
                });
                if (resQueue?.data?.isSuccess) {
                    toast.success(resQueue?.data?.message || `Queued for indexing (${queuePriorityLabel.value} priority).`);
                }
                else {
                    Swal.fire("Failed", resQueue?.data?.meta || "Something went wrong", "error");
                }
            }
        }
        finally {
            isLoading.value = false;
        }
        fetchCrawlDetails();
        fetchCrawlCounts();
    }
    catch (err) {
        console.error(err);
        const msg = err?.response?.data?.error?.description || "You are not authorized to perform indexing.";
        Swal.fire("Failed", msg, "error");
        isLoading.value = false;
        fetchCrawlDetails();
        fetchCrawlCounts();
    }
};
const removeIndexSingleUrl = async (id, mode) => {
    if (mode === 'direct') {
        const ok = await Swal.fire({
            title: 'Ask Google to remove this URL?',
            text: 'Google will be told the page is gone (URL_DELETED). Only do this for pages that no longer exist. Re-indexing later takes time.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, request removal',
            cancelButtonText: 'Keep it indexed',
        });
        if (!ok.isConfirmed)
            return;
    }
    try {
        if (!(await ensurePaidAccess()))
            return;
        closeRowDropdown();
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
                        text: res?.data?.message ??
                            "Google accepted the removal notification. URL Inspection can take time to update.",
                        icon: "success"
                    });
                }
                else {
                    Swal.fire("Failed", res?.data?.meta || "Something went wrong", "error");
                }
            }
            else {
                const resQueue = await api.post("/crawl/index", {
                    websiteId: siteId,
                    urlId: [id],
                    type: "URL_DELETED",
                    priority: queuePriority.value
                });
                if (resQueue?.data?.isSuccess) {
                    toast.success(resQueue?.data?.message || `Queued for removal (${queuePriorityLabel.value} priority).`);
                }
                else {
                    Swal.fire("Failed", resQueue?.data?.meta || "Something went wrong", "error");
                }
            }
        }
        finally {
            isLoading.value = false;
        }
        // Refresh UI
        fetchCrawlDetails();
        fetchCrawlCounts();
    }
    catch (err) {
        console.error(err);
        const msg = err?.response?.data?.error?.description || "You are not authorized to perform removal.";
        Swal.fire("Failed", msg, "error");
        isLoading.value = false;
    }
};
/* COMPUTED */
const totalUrlCount = computed(() => counts.value.totalCount);
const successCount = computed(() => counts.value.successCount);
const failedCount = computed(() => counts.value.failedCount);
const indexed = computed(() => counts.value.indexedSucceed);
const indexedInGoogle = computed(() => counts.value.indexedInGoogle ?? 0);
const indexedFailed = computed(() => counts.value.indexedFailed);
const indexedQueued = computed(() => counts.value.indexedQueued);
const deIndexed = computed(() => counts.value.deIndexedSucceed);
const totalPages = computed(() => {
    return Math.ceil(pageInfo.value.totalCount / pageInfo.value.pageSize) || 1;
});
const pageStartRow = computed(() => {
    if (pageInfo.value.totalCount === 0)
        return 0;
    return (pageInfo.value.page - 1) * pageInfo.value.pageSize + 1;
});
const pageEndRow = computed(() => {
    if (pageInfo.value.totalCount === 0)
        return 0;
    return Math.min(pageInfo.value.page * pageInfo.value.pageSize, pageInfo.value.totalCount);
});
/* PAGINATION */
const firstPage = () => {
    if (pageInfo.value.hasPreviousPage)
        pageInfo.value.page = 1;
};
const nextPage = () => pageInfo.value.hasNextPage && pageInfo.value.page++;
const previousPage = () => pageInfo.value.hasPreviousPage && pageInfo.value.page--;
const lastPage = () => {
    if (pageInfo.value.hasNextPage)
        pageInfo.value.page = totalPages.value;
};
const refreshQuotaOnFocus = () => {
    if (document.visibilityState !== "visible")
        return;
    void fetchCrawlCounts();
    void fetchIndexLimit();
};
let quotaPoll;
onMounted(() => {
    entitlementsStore.refresh();
    fetchCrawlDetails();
    fetchCrawlCounts();
    fetchIndexLimit();
    connectSSE();
    document.addEventListener("click", closeRowDropdown);
    document.addEventListener("visibilitychange", refreshQuotaOnFocus);
    quotaPoll = setInterval(refreshQuotaOnFocus, 90_000);
});
onBeforeUnmount(() => {
    detachFloatingUpdates();
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    document.removeEventListener("click", closeRowDropdown);
    document.removeEventListener("visibilitychange", refreshQuotaOnFocus);
    if (quotaPoll)
        clearInterval(quotaPoll);
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(siteInfo, {});
    __VLS_withDotValue(showQuotaBanner, {});
    __VLS_withDotValue(selectedFilter, {});
    __VLS_withDotValue(urls, {});
    __VLS_withDotValue(pageInfo, {});
    __VLS_withDotValue(queuePriority, {});
    __VLS_withDotValue(selectedIds, {});
    __VLS_withDotValue(entitlementsStore, {});
    __VLS_withDotValue(paidActionTitle, {});
    __VLS_withDotValue(isSyncing, {});
    __VLS_withDotValue(rowMenuPortal, {});
    __VLS_withDotValue(searchQuery, {});
    __VLS_withDotValue(urlsFetching, {});
    __VLS_withDotValue(showLogsModal, {});
    __VLS_withDotValue(timeline, {});
    __VLS_withDotValue(logs, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['url-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['url-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['success']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['failed']} */ ;
    /** @type {__VLS_StyleScopedClasses['api-result-chip']} */ ;
    /** @type {__VLS_StyleScopedClasses['index-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['index-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-index-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-index-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-index-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['view']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-index-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['failed']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-index-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['failed']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-action-menu-portal']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-action-menu-portal']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-action-menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-url']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-size-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['inspection-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['inspection-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['indexing-chip--compact']} */ ;
    /** @type {__VLS_StyleScopedClasses['indexing-chip']} */ ;
    /** @type {__VLS_StyleScopedClasses['indexing-chip']} */ ;
    /** @type {__VLS_StyleScopedClasses['indexing-chip']} */ ;
    /** @type {__VLS_StyleScopedClasses['indexing-chip']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['url-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-index-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['index-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['control-bar-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['url-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-size-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['table-footer']} */ ;
    /** @type {__VLS_StyleScopedClasses['logs-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['logs-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['logs-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['logs-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['logs-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['success']} */ ;
    /** @type {__VLS_StyleScopedClasses['logs-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['failed']} */ ;
    /** @type {__VLS_StyleScopedClasses['logs-empty-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['alert-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['alert-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['control-bar-left']} */ ;
    /** @type {__VLS_StyleScopedClasses['control-bar-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['priority-seg']} */ ;
    /** @type {__VLS_StyleScopedClasses['priority-seg']} */ ;
    /** @type {__VLS_StyleScopedClasses['priority-seg']} */ ;
    /** @type {__VLS_StyleScopedClasses['queue-remove-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['results-meta']} */ ;
    /** @type {__VLS_StyleScopedClasses['clear-selection-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['sync-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['sync-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['sync-stats']} */ ;
    /** @type {__VLS_StyleScopedClasses['success']} */ ;
    /** @type {__VLS_StyleScopedClasses['sync-stats']} */ ;
    /** @type {__VLS_StyleScopedClasses['failed']} */ ;
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['search-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['table-footer']} */ ;
    /** @type {__VLS_StyleScopedClasses['control-bar']} */ ;
    /** @type {__VLS_StyleScopedClasses['timeline-box__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['timeline-box__state']} */ ;
    /** @type {__VLS_StyleScopedClasses['timeline-list']} */ ;
    /** @type {__VLS_StyleScopedClasses['timeline-list']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof Loading} */
    Loading;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        active: (__VLS_unwrap(isLoading, {})), isFullPage: (true),
    }));
    const __VLS_2 = __VLS_1({
        active: (__VLS_unwrap(isLoading, {})),
        isFullPage: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-container" },
    });
    /** @type {__VLS_StyleScopedClasses['page-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-header" },
    });
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        // @ts-ignore
        to: "/crawl-index-management", ...{ class: "back-link" },
    }));
    const __VLS_7 = __VLS_6({
        to: "/crawl-index-management",
        ...{ class: "back-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    var __VLS_8;
    const { default: __VLS_10 } = __VLS_nonNull(__VLS_8.slots);
    // @ts-ignore
    [isLoading,];
    if (siteInfo.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "site-info" },
        });
        /** @type {__VLS_StyleScopedClasses['site-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "site-type-chip" },
        });
        /** @type {__VLS_StyleScopedClasses['site-type-chip']} */ ;
        (siteInfo.value.type);
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "site-name" },
        });
        /** @type {__VLS_StyleScopedClasses['site-name']} */ ;
        (siteInfo.value.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (siteInfo.value.url),
            target: "_blank",
            ...{ class: "site-url" },
        });
        /** @type {__VLS_StyleScopedClasses['site-url']} */ ;
        (siteInfo.value.url);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-grid']} */ ;
    if (showQuotaBanner.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert-box quota" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['quota']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert-title" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert-text" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-text']} */ ;
    }
    if (siteInfo.value && siteInfo.value.scheduleMessage && siteInfo.value.scheduleMessage.trim() !== '') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert-box schedule" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['schedule']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert-title" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert-text" },
        });
        /** @type {__VLS_StyleScopedClasses['alert-text']} */ ;
        (siteInfo.value.scheduleMessage);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "summary-card" },
    });
    /** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(applyFilter, {})('ALL'));
                // @ts-ignore
                [siteInfo, siteInfo, siteInfo, siteInfo, siteInfo, siteInfo, siteInfo, siteInfo, siteInfo, showQuotaBanner, applyFilter,];
            } },
        ...{ class: "summary-item clickable" },
        ...{ class: ({ active: selectedFilter.value === 'ALL' }) },
    });
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_unwrap(totalUrlCount, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(applyFilter, {})('SUCCESS'));
                // @ts-ignore
                [applyFilter, selectedFilter, totalUrlCount,];
            } },
        ...{ class: "summary-item clickable" },
        ...{ class: ({ active: selectedFilter.value === 'SUCCESS' }) },
    });
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value success" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['success']} */ ;
    (__VLS_unwrap(successCount, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(applyFilter, {})('FAILED'));
                // @ts-ignore
                [applyFilter, selectedFilter, successCount,];
            } },
        ...{ class: "summary-item clickable" },
        ...{ class: ({ active: selectedFilter.value === 'FAILED' }) },
    });
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value failed" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['failed']} */ ;
    (__VLS_unwrap(failedCount, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(applyFilter, {})('INDEXED'));
                // @ts-ignore
                [applyFilter, selectedFilter, failedCount,];
            } },
        ...{ class: "summary-item clickable" },
        ...{ class: ({ active: selectedFilter.value === 'INDEXED' }) },
        title: "Confirmed by Google's URL Inspection (the Google status column)",
    });
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value success" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['success']} */ ;
    (__VLS_unwrap(indexedInGoogle, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(applyFilter, {})('SUBMITTED'));
                // @ts-ignore
                [applyFilter, selectedFilter, indexedInGoogle,];
            } },
        ...{ class: "summary-item clickable" },
        ...{ class: ({ active: selectedFilter.value === 'SUBMITTED' }) },
        title: "Indexing API accepted our notification; not the same as being indexed",
    });
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_unwrap(indexed, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(applyFilter, {})('DEINDEXED'));
                // @ts-ignore
                [applyFilter, selectedFilter, indexed,];
            } },
        ...{ class: "summary-item clickable" },
        ...{ class: ({ active: selectedFilter.value === 'DEINDEXED' }) },
        title: "Removal notifications Google accepted",
    });
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_unwrap(deIndexed, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(applyFilter, {})('INDEX_FAILED'));
                // @ts-ignore
                [applyFilter, selectedFilter, deIndexed,];
            } },
        ...{ class: "summary-item clickable" },
        ...{ class: ({ active: selectedFilter.value === 'INDEX_FAILED' }) },
        title: "Indexing API rejected the notification",
    });
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value failed" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['failed']} */ ;
    (__VLS_unwrap(indexedFailed, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(applyFilter, {})('QUEUED'));
                // @ts-ignore
                [applyFilter, selectedFilter, indexedFailed,];
            } },
        ...{ class: "summary-item clickable" },
        ...{ class: ({ active: selectedFilter.value === 'QUEUED' }) },
        title: "Waiting for the next scheduled run",
    });
    /** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_unwrap(indexedQueued, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-box indexing-guide" },
        role: "note",
    });
    /** @type {__VLS_StyleScopedClasses['alert-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['indexing-guide']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-title" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-text" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.em, __VLS_intrinsics.em)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "control-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['control-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "control-bar-left" },
    });
    /** @type {__VLS_StyleScopedClasses['control-bar-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (searchQuery.value),
        type: "text",
        placeholder: "Search URLs...",
        ...{ class: "search-input" },
    });
    /** @type {__VLS_StyleScopedClasses['search-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "results-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['results-meta']} */ ;
    (urls.value.length);
    (pageInfo.value.totalCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "control-bar-right" },
    });
    /** @type {__VLS_StyleScopedClasses['control-bar-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "queue-priority-bar" },
        'aria-label': "Priority for new queue items",
        title: "Applies to URLs you add to the queue from now on (Index queue, ReIndex, DeIndex). Higher priority is sent first in each scheduled run.",
    });
    /** @type {__VLS_StyleScopedClasses['queue-priority-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "priority-inline-label" },
    });
    /** @type {__VLS_StyleScopedClasses['priority-inline-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "priority-segments" },
        role: "radiogroup",
        'aria-label': "Priority for new queue items",
    });
    /** @type {__VLS_StyleScopedClasses['priority-segments']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (queuePriority.value = 0);
                // @ts-ignore
                [selectedFilter, indexedQueued, searchQuery, urls, pageInfo, queuePriority,];
            } },
        type: "button",
        ...{ class: "priority-seg" },
        ...{ class: ({ active: queuePriority.value === 0 }) },
        role: "radio",
        'aria-checked': (queuePriority.value === 0),
    });
    /** @type {__VLS_StyleScopedClasses['priority-seg']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (queuePriority.value = 1);
                // @ts-ignore
                [queuePriority, queuePriority, queuePriority,];
            } },
        type: "button",
        ...{ class: "priority-seg" },
        ...{ class: ({ active: queuePriority.value === 1 }) },
        role: "radio",
        'aria-checked': (queuePriority.value === 1),
    });
    /** @type {__VLS_StyleScopedClasses['priority-seg']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (queuePriority.value = 2);
                // @ts-ignore
                [queuePriority, queuePriority, queuePriority,];
            } },
        type: "button",
        ...{ class: "priority-seg" },
        ...{ class: ({ active: queuePriority.value === 2 }) },
        role: "radio",
        'aria-checked': (queuePriority.value === 2),
    });
    /** @type {__VLS_StyleScopedClasses['priority-seg']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    if (selectedIds.value.size > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(clearSelection, {})) },
            type: "button",
            ...{ class: "clear-selection-btn" },
        });
        /** @type {__VLS_StyleScopedClasses['clear-selection-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(queueSelectedForIndex, {})) },
            type: "button",
            ...{ class: "index-btn" },
            disabled: (!entitlementsStore.value.canUsePaidFeatures || entitlementsStore.value.isChecking),
            title: (paidActionTitle.value),
        });
        /** @type {__VLS_StyleScopedClasses['index-btn']} */ ;
        (selectedIds.value.size);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(queueSelectedForRemoval, {})) },
            type: "button",
            ...{ class: "queue-remove-btn" },
            disabled: (!entitlementsStore.value.canUsePaidFeatures || entitlementsStore.value.isChecking),
            title: (paidActionTitle.value),
        });
        /** @type {__VLS_StyleScopedClasses['queue-remove-btn']} */ ;
        (selectedIds.value.size);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(startGoogleSync, {})) },
        ...{ class: "sync-btn" },
        type: "button",
        title: (paidActionTitle.value || 'Re-fetches URL Inspection data from Search Console for all URLs on this page (does not re-send Indexing API notifies).'),
        disabled: (isSyncing.value || !entitlementsStore.value.canUsePaidFeatures || entitlementsStore.value.isChecking),
    });
    /** @type {__VLS_StyleScopedClasses['sync-btn']} */ ;
    if (isSyncing.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "sync-progress-card" },
        });
        /** @type {__VLS_StyleScopedClasses['sync-progress-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "sync-header" },
        });
        /** @type {__VLS_StyleScopedClasses['sync-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_unwrap(syncCompleted, {}));
        (__VLS_unwrap(syncTotal, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-bar" },
        });
        /** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "progress-fill" },
            ...{ style: ({ width: __VLS_unwrap(progressPercent, {}) + '%' }) },
        });
        /** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "sync-stats" },
        });
        /** @type {__VLS_StyleScopedClasses['sync-stats']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "success" },
        });
        /** @type {__VLS_StyleScopedClasses['success']} */ ;
        (__VLS_unwrap(syncCompleted, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "failed" },
        });
        /** @type {__VLS_StyleScopedClasses['failed']} */ ;
        (__VLS_unwrap(syncFailed, {}));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-section" },
    });
    /** @type {__VLS_StyleScopedClasses['table-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-scroll" },
    });
    /** @type {__VLS_StyleScopedClasses['table-scroll']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
        ...{ class: "urls-table" },
    });
    /** @type {__VLS_StyleScopedClasses['urls-table']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_unwrap(toggleSelectAll, {})) },
        type: "checkbox",
        checked: (__VLS_unwrap(isAllChecked, {})),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        title: "What Google's URL Inspection reports for this page, in plain language. Hover for the cause and the fix.",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        title: "Status of the indexing job in this app (e.g. Job done = pipeline finished; not the same as ranking).",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        title: "Priority of the last queue request.",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        title: "Indexing API outcome (notify accepted vs failed).",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        title: "Update vs remove notification.",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        title: "When the last indexing job finished.",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
    const __VLS_11 = __VLS_tryAsConstant((urls.value));
    for (const [item] of __VLS_vFor(__VLS_nonNull(__VLS_11))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            key: (item.id),
            ...{ class: (__VLS_unwrap(apiResultRowClass, {})(item.indexedResult)) },
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onChange: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(toggleRow, {})(item.id));
                    // @ts-ignore
                    [urls, queuePriority, queuePriority, selectedIds, selectedIds, selectedIds, clearSelection, queueSelectedForIndex, entitlementsStore, entitlementsStore, entitlementsStore, entitlementsStore, entitlementsStore, entitlementsStore, paidActionTitle, paidActionTitle, paidActionTitle, queueSelectedForRemoval, startGoogleSync, isSyncing, isSyncing, syncCompleted, syncCompleted, syncTotal, progressPercent, syncFailed, toggleSelectAll, isAllChecked, apiResultRowClass, toggleRow,];
                } },
            type: "checkbox",
            checked: (__VLS_unwrap(isSelected, {})(item.id)),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "url-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['url-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (item.url),
            target: "_blank",
            title: (item.url),
        });
        (item.url);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "inspection-cell google-status-cell" },
            title: ((item.explanationCause || '') + (item.explanationFix ? ' Fix: ' + item.explanationFix : '')),
        });
        /** @type {__VLS_StyleScopedClasses['inspection-cell']} */ ;
        /** @type {__VLS_StyleScopedClasses['google-status-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "indexing-chip indexing-chip--compact" },
            ...{ class: (item.isIndexed ? 'indexing-chip--allowed' : __VLS_unwrap(getIndexingStateClass, {})(item.indexingState)) },
        });
        /** @type {__VLS_StyleScopedClasses['indexing-chip']} */ ;
        /** @type {__VLS_StyleScopedClasses['indexing-chip--compact']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "indexing-chip__text" },
        });
        /** @type {__VLS_StyleScopedClasses['indexing-chip__text']} */ ;
        (item.isIndexed ? '✓ Indexed' : (item.explanationState || __VLS_unwrap(formatGoogleInspectionLabel, {})(item.coverageState)));
        if (item.firstIndexedAt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "google-status-since" },
            });
            /** @type {__VLS_StyleScopedClasses['google-status-since']} */ ;
            (__VLS_unwrap(formatDateTime, {})(item.firstIndexedAt));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        (__VLS_unwrap(formatStateLabel, {})(item.indexedStatus));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            title: (item.priority ? 'Queue priority' : 'Not in the queue'),
        });
        (__VLS_unwrap(formatStateLabel, {})(item.priority));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "api-result-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['api-result-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "api-result-chip" },
            ...{ class: (__VLS_unwrap(apiResultChipClass, {})(item.indexedResult)) },
            title: ('Indexing API outcome: ' + (item.indexedResult || '—')),
        });
        /** @type {__VLS_StyleScopedClasses['api-result-chip']} */ ;
        (__VLS_unwrap(formatIndexedResult, {})(item.indexedResult));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        (item.type);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        (__VLS_unwrap(formatDateTime, {})(item.indexedAt));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "action-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['action-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "row-action-group" },
        });
        /** @type {__VLS_StyleScopedClasses['row-action-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(openRowDropdown, {})($event, item.id, 'index'));
                    // @ts-ignore
                    [isSelected, getIndexingStateClass, formatGoogleInspectionLabel, formatDateTime, formatDateTime, formatStateLabel, formatStateLabel, apiResultChipClass, formatIndexedResult, openRowDropdown,];
                } },
            title: "Index actions",
            ...{ class: "row-index-btn" },
            ...{ class: ({ 'is-open-menu': rowMenuPortal.value?.urlId === item.id && rowMenuPortal.value.kind === 'index' }) },
        });
        /** @type {__VLS_StyleScopedClasses['row-index-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['is-open-menu']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "row-action-group" },
        });
        /** @type {__VLS_StyleScopedClasses['row-action-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(openRowDropdown, {})($event, item.id, 'remove'));
                    // @ts-ignore
                    [openRowDropdown, rowMenuPortal, rowMenuPortal,];
                } },
            title: "Deindex actions",
            ...{ class: "row-index-btn failed" },
            ...{ class: ({ 'is-open-menu': rowMenuPortal.value?.urlId === item.id && rowMenuPortal.value.kind === 'remove' }) },
        });
        /** @type {__VLS_StyleScopedClasses['row-index-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['failed']} */ ;
        /** @type {__VLS_StyleScopedClasses['is-open-menu']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(viewLogs, {})(item.id));
                    // @ts-ignore
                    [rowMenuPortal, rowMenuPortal, viewLogs,];
                } },
            title: "View Logs",
            ...{ class: "row-index-btn view" },
        });
        /** @type {__VLS_StyleScopedClasses['row-index-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['view']} */ ;
        // @ts-ignore
        [];
    }
    if (urls.value.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            colspan: "12",
            ...{ style: {} },
        });
        (searchQuery.value ? 'No matching URLs found for current search/filter.' : 'No crawl data found.');
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['table-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-size-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['page-size-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "pageSize",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        ...{ onChange: (__VLS_unwrap(onPageSizeChange, {})) },
        id: "pageSize",
        value: (pageInfo.value.pageSize),
        disabled: (urlsFetching.value),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (10),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (25),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (50),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (100),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: (1000),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pagination-range" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-range']} */ ;
    (__VLS_unwrap(pageStartRow, {}));
    (__VLS_unwrap(pageEndRow, {}));
    (pageInfo.value.totalCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(firstPage, {})) },
        ...{ class: "pagination-btn" },
        disabled: (urlsFetching.value || !pageInfo.value.hasPreviousPage),
    });
    /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(previousPage, {})) },
        ...{ class: "pagination-btn" },
        disabled: (urlsFetching.value || !pageInfo.value.hasPreviousPage),
    });
    /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pagination-info" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-info']} */ ;
    (pageInfo.value.page);
    (__VLS_unwrap(totalPages, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(nextPage, {})) },
        ...{ class: "pagination-btn" },
        disabled: (urlsFetching.value || !pageInfo.value.hasNextPage),
    });
    /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(lastPage, {})) },
        ...{ class: "pagination-btn" },
        disabled: (urlsFetching.value || !pageInfo.value.hasNextPage),
    });
    /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
    let __VLS_12;
    /** @ts-ignore @type { | typeof Loading} */
    Loading;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        // @ts-ignore
        active: (__VLS_unwrap(logsLoading, {})), isFullPage: (false),
    }));
    const __VLS_14 = __VLS_13({
        active: (__VLS_unwrap(logsLoading, {})),
        isFullPage: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_17;
    /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
    transition;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        // @ts-ignore
        name: "overlay",
    }));
    const __VLS_19 = __VLS_18({
        name: "overlay",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    var __VLS_20;
    const { default: __VLS_22 } = __VLS_nonNull(__VLS_20.slots);
    if (showLogsModal.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    if (!(showLogsModal.value))
                        throw 0;
                    return (showLogsModal.value = false);
                    // @ts-ignore
                    [searchQuery, urls, pageInfo, pageInfo, pageInfo, pageInfo, pageInfo, pageInfo, pageInfo, onPageSizeChange, urlsFetching, urlsFetching, urlsFetching, urlsFetching, urlsFetching, pageStartRow, pageEndRow, firstPage, previousPage, totalPages, nextPage, lastPage, logsLoading, showLogsModal, showLogsModal,];
                } },
            ...{ class: "modal-backdrop" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
        transition;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            // @ts-ignore
            name: "modal",
        }));
        const __VLS_25 = __VLS_24({
            name: "modal",
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        var __VLS_26;
        const { default: __VLS_28 } = __VLS_nonNull(__VLS_26.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modal-box modal-box--xl" },
            role: "dialog",
            'aria-modal': "true",
        });
        /** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['modal-box--xl']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
            ...{ class: "modal-header" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "modal-title" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modal-subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-subtitle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    if (!(showLogsModal.value))
                        throw 0;
                    return (showLogsModal.value = false);
                    // @ts-ignore
                    [showLogsModal,];
                } },
            type: "button",
            ...{ class: "modal-close" },
            'aria-label': "Close",
        });
        /** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "18",
            y1: "6",
            x2: "6",
            y2: "18",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "6",
            y1: "6",
            x2: "18",
            y2: "18",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modal-body modal-body--flush" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
        /** @type {__VLS_StyleScopedClasses['modal-body--flush']} */ ;
        if (timeline.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "timeline-box" },
            });
            /** @type {__VLS_StyleScopedClasses['timeline-box']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "timeline-box__state" },
                ...{ class: (timeline.value.isIndexed ? 'is-ok' : 'is-warn') },
            });
            /** @type {__VLS_StyleScopedClasses['timeline-box__state']} */ ;
            (timeline.value.explanation.state);
            if (timeline.value.daysToIndex != null) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "timeline-box__meta" },
                });
                /** @type {__VLS_StyleScopedClasses['timeline-box__meta']} */ ;
                (timeline.value.daysToIndex);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "timeline-box__cause" },
            });
            /** @type {__VLS_StyleScopedClasses['timeline-box__cause']} */ ;
            (timeline.value.explanation.cause);
            if (!timeline.value.isIndexed) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "timeline-box__fix" },
                });
                /** @type {__VLS_StyleScopedClasses['timeline-box__fix']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                (timeline.value.explanation.fix);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.ol, __VLS_intrinsics.ol)({
                ...{ class: "timeline-list" },
            });
            /** @type {__VLS_StyleScopedClasses['timeline-list']} */ ;
            const __VLS_29 = __VLS_tryAsConstant((timeline.value.events));
            for (const [e, i] of __VLS_vFor(__VLS_nonNull(__VLS_29))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (i),
                    ...{ class: ('timeline-' + e.kind) },
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "timeline-at" },
                });
                /** @type {__VLS_StyleScopedClasses['timeline-at']} */ ;
                (__VLS_unwrap(formatDateTime, {})(e.at));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "timeline-title" },
                });
                /** @type {__VLS_StyleScopedClasses['timeline-title']} */ ;
                (e.title);
                if (e.detail) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "timeline-detail" },
                    });
                    /** @type {__VLS_StyleScopedClasses['timeline-detail']} */ ;
                    (e.detail);
                }
                // @ts-ignore
                [formatDateTime, timeline, timeline, timeline, timeline, timeline, timeline, timeline, timeline, timeline,];
            }
        }
        if (logs.value.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
                ...{ class: "logs-table" },
            });
            /** @type {__VLS_StyleScopedClasses['logs-table']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
            const __VLS_30 = __VLS_tryAsConstant((logs.value));
            for (const [log, index] of __VLS_vFor(__VLS_nonNull(__VLS_30))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                    key: (index),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
                (log.type);
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                    ...{ class: (log.status === 'Success' ? 'success' : 'failed') },
                });
                (log.status);
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
                (log.message);
                __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
                (new Date(log.date).toLocaleString());
                // @ts-ignore
                [logs, logs,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "logs-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['logs-empty']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "logs-empty-icon" },
            });
            /** @type {__VLS_StyleScopedClasses['logs-empty-icon']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                points: "14 2 14 8 20 8",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                x1: "9",
                y1: "13",
                x2: "15",
                y2: "13",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                x1: "9",
                y1: "17",
                x2: "13",
                y2: "17",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "logs-empty-title" },
            });
            /** @type {__VLS_StyleScopedClasses['logs-empty-title']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "logs-empty-desc" },
            });
            /** @type {__VLS_StyleScopedClasses['logs-empty-desc']} */ ;
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    let __VLS_31;
    /** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
    Teleport;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        // @ts-ignore
        to: "body",
    }));
    const __VLS_33 = __VLS_32({
        to: "body",
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    var __VLS_34;
    const { default: __VLS_36 } = __VLS_nonNull(__VLS_34.slots);
    if (rowMenuPortal.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            ...{ onClick: (__VLS_unwrap(closeRowDropdown, {})) },
            ...{ class: "row-menu-backdrop" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['row-menu-backdrop']} */ ;
    }
    // @ts-ignore
    [rowMenuPortal, closeRowDropdown,];
    let __VLS_37;
    /** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
    Teleport;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        // @ts-ignore
        to: "body",
    }));
    const __VLS_39 = __VLS_38({
        to: "body",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    var __VLS_40;
    const { default: __VLS_42 } = __VLS_nonNull(__VLS_40.slots);
    if (rowMenuPortal.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ref: "rowMenuFloatingEl",
            ...{ class: "row-action-menu-portal" },
            role: "menu",
        });
        /** @type {__VLS_StyleScopedClasses['row-action-menu-portal']} */ ;
        if (rowMenuPortal.value.kind === 'index') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(rowMenuPortal.value))
                            throw 0;
                        if (!(rowMenuPortal.value.kind === 'index'))
                            throw 0;
                        return (__VLS_unwrap(indexSingleUrl, {})(rowMenuPortal.value.urlId, 'direct'));
                        // @ts-ignore
                        [rowMenuPortal, rowMenuPortal, rowMenuPortal, indexSingleUrl,];
                    } },
                type: "button",
                ...{ class: "row-action-menu-item" },
            });
            /** @type {__VLS_StyleScopedClasses['row-action-menu-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(rowMenuPortal.value))
                            throw 0;
                        if (!(rowMenuPortal.value.kind === 'index'))
                            throw 0;
                        return (__VLS_unwrap(indexSingleUrl, {})(rowMenuPortal.value.urlId, 'queue'));
                        // @ts-ignore
                        [rowMenuPortal, indexSingleUrl,];
                    } },
                type: "button",
                ...{ class: "row-action-menu-item" },
            });
            /** @type {__VLS_StyleScopedClasses['row-action-menu-item']} */ ;
            (__VLS_unwrap(queuePriorityLabel, {}));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(rowMenuPortal.value))
                            throw 0;
                        if (!!(rowMenuPortal.value.kind === 'index'))
                            throw 0;
                        return (__VLS_unwrap(removeIndexSingleUrl, {})(rowMenuPortal.value.urlId, 'direct'));
                        // @ts-ignore
                        [rowMenuPortal, queuePriorityLabel, removeIndexSingleUrl,];
                    } },
                type: "button",
                ...{ class: "row-action-menu-item" },
            });
            /** @type {__VLS_StyleScopedClasses['row-action-menu-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(rowMenuPortal.value))
                            throw 0;
                        if (!!(rowMenuPortal.value.kind === 'index'))
                            throw 0;
                        return (__VLS_unwrap(removeIndexSingleUrl, {})(rowMenuPortal.value.urlId, 'queue'));
                        // @ts-ignore
                        [rowMenuPortal, removeIndexSingleUrl,];
                    } },
                type: "button",
                ...{ class: "row-action-menu-item" },
            });
            /** @type {__VLS_StyleScopedClasses['row-action-menu-item']} */ ;
            (__VLS_unwrap(queuePriorityLabel, {}));
        }
    }
    // @ts-ignore
    [queuePriorityLabel,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

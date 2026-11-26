/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { showUpgradePrompt } from '../Shared/upgradePrompt';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import { useGoogleConfigStore } from '../Shared/googleConfig';
import { useSubscriptionStore } from '../Shared/subscription';
import { useEntitlementsStore } from '../Shared/entitlements';
const toast = useToast();
const router = useRouter();
const googleConfigStore = useGoogleConfigStore();
const subscriptionStore = useSubscriptionStore();
const entitlementsStore = useEntitlementsStore();
const paidActionTitle = computed(() => entitlementsStore.canUsePaidFeatures ? '' : entitlementsStore.blockingReason);
/** Native disabled + title is unreliable (no pointer, tooltips). Blocked styling + ensurePaidAccess on click. */
const isCrawlBlocked = computed(() => !entitlementsStore.canUsePaidFeatures || entitlementsStore.isChecking);
const ensurePaidAccess = async () => {
    await entitlementsStore.refresh();
    if (entitlementsStore.canUsePaidFeatures)
        return true;
    await showUpgradePrompt(entitlementsStore.blockingReason);
    return false;
};
const allSites = ref([]);
const selectedSites = ref([]);
const progressMap = ref({});
const eventSources = new Map();
const stats = ref({
    queuedCount: 0,
    crawledCount: 0,
    failedCount: 0,
    indexedSucceed: 0,
    indexedInGoogle: 0,
    deIndexedSucceed: 0,
    indexedFailed: 0,
    indexedQueued: 0
});
const activeSites = computed(() => allSites.value.filter(s => s.status === 'Active'));
const isAllSelected = computed(() => activeSites.value.length > 0 &&
    selectedSites.value.length === activeSites.value.length);
const isPartiallySelected = computed(() => selectedSites.value.length > 0 &&
    selectedSites.value.length < activeSites.value.length);
const toggleSelectAll = () => {
    selectedSites.value = isAllSelected.value
        ? []
        : activeSites.value.map(s => s.id);
};
const clearSelection = () => {
    selectedSites.value = [];
};
const queueForCrawl = async () => {
    if (!selectedSites.value.length)
        return;
    if (!(await ensurePaidAccess()))
        return;
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to crawl ${selectedSites.value.length} selected site(s)?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    });
    if (!result.isConfirmed)
        return;
    const siteIdsToQueue = selectedSites.value.filter(id => {
        const site = allSites.value.find(s => s.id === id);
        return site && site.crawlStatus !== 'In Progress';
    });
    if (!siteIdsToQueue.length) {
        toast.info('Selected sites are already in progress');
        return;
    }
    try {
        const res = await api.post('/crawl/edit', {
            webSiteId: siteIdsToQueue
        });
        if (res.data?.isSuccess) {
            siteIdsToQueue.forEach(id => {
                const site = allSites.value.find(s => s.id === id);
                if (site) {
                    site.crawlStatus = 'Queue';
                }
            });
            selectedSites.value = [];
            fetchStats();
            toast.success(res.data.message || 'Sites queued successfully');
        }
    }
    catch (err) {
        handleAuthError(err);
    }
};
const toggleSiteSelection = (id) => {
    const idx = selectedSites.value.indexOf(id);
    idx > -1
        ? selectedSites.value.splice(idx, 1)
        : selectedSites.value.push(id);
};
const handleAuthError = (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    if (status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
    }
    if (status && status >= 400 && status < 500) {
        const message = data?.error?.description ||
            data?.message ||
            'Something went wrong.';
        toast.warning(message);
        return;
    }
    toast.error('Unexpected error. Please try again.');
};
const fetchCrawlSites = async () => {
    try {
        const res = await api.get('/crawl/site-list?PageNo=1&PageSize=10');
        allSites.value = (res.data?.data || []).map((item) => {
            const site = {
                id: item.webSiteId,
                name: item.siteName,
                url: item.url,
                type: item.siteType,
                status: 'Active',
                crawlStatus: item.crawlStatus,
                isIndexable: item.isIndexable ? 'Yes' : 'No',
                crawlFailedReason: item.crawlFailedReason || '',
                crawlDate: parseCrawlCompletedDate(item.crawlCompletedDate)
            };
            if (site.crawlStatus === 'In Progress') {
                progressMap.value[site.id] = { status: 'in_progress' };
                listenToCrawlProgress(site.id);
            }
            return site;
        });
    }
    catch (err) {
        handleAuthError(err);
    }
};
const fetchStats = async () => {
    try {
        const res = await api.get('/crawl/site-and-queue-count');
        if (res.data?.isSuccess)
            stats.value = res.data.data;
    }
    catch (err) {
        handleAuthError(err);
    }
};
const startCrawl = async (id) => {
    if (!(await ensurePaidAccess()))
        return;
    const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to crawl this site?',
        icon: 'warning',
        showCancelButton: true
    });
    if (!confirm.isConfirmed)
        return;
    try {
        const res = await api.post('/crawl/edit', { webSiteId: [id] });
        if (res.data.isSuccess) {
            const site = allSites.value.find(s => s.id === id);
            if (site) {
                site.crawlStatus = 'Queue';
                listenToCrawlProgress(site.id);
            }
            toast.success(res.data.message);
        }
    }
    catch (err) {
        handleAuthError(err);
    }
};
const listenToCrawlProgress = (siteId) => {
    if (eventSources.has(siteId))
        return;
    const source = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/crawl/listen/${siteId}`, { withCredentials: true });
    eventSources.set(siteId, source);
    source.onmessage = async (e) => {
        if (!e.data)
            return;
        const data = JSON.parse(e.data);
        progressMap.value[siteId] = data;
        if (data.status !== 'in_progress') {
            source.close();
            eventSources.delete(siteId);
            fetchStats();
        }
        if (data.status === 'completed') {
            await fetchCrawlSites();
        }
    };
    source.onerror = () => {
        source.close();
        eventSources.delete(siteId);
    };
};
const viewDetails = (siteId) => {
    router.push({ name: 'CrawlIndexDetails', params: { siteId } });
};
const getStatusClass = (status) => `status-${(status || 'queue').toLowerCase().replace(/\s+/g, '-')}`;
/* ---------- display helpers (UI only) ---------- */
const siteInitial = (site) => {
    const source = (site.name && site.name.trim()) || site.url || '?';
    // Strip protocol for URL-derived initial
    const stripped = source.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return stripped.charAt(0).toUpperCase() || '?';
};
/** Parse API datetime (often UTC ISO without offset) into a correct Date in local TZ for display. */
const parseCrawlCompletedDate = (raw) => {
    if (raw == null)
        return undefined;
    if (raw instanceof Date)
        return Number.isNaN(raw.getTime()) ? undefined : raw;
    const s = String(raw).trim();
    if (!s)
        return undefined;
    const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
    const normalized = s.includes('T') && !hasTz ? `${s}Z` : s;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? undefined : d;
};
const formatLastCrawlDate = (date) => {
    if (!date)
        return 'Never';
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};
const lastCrawlTitle = (date) => {
    if (!date)
        return '';
    return date.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' });
};
onMounted(async () => {
    await fetchCrawlSites();
    await fetchStats();
    googleConfigStore.check();
    subscriptionStore.checkSubscription();
    entitlementsStore.refresh();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(stats, {});
    __VLS_withDotValue(entitlementsStore, {});
    __VLS_withDotValue(selectedSites, {});
    __VLS_withDotValue(paidActionTitle, {});
    __VLS_withDotValue(activeSites, {});
    __VLS_withDotValue(isAllSelected, {});
    __VLS_withDotValue(progressMap, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['stat-panel']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['notice__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['notice__icon--warning']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-toolbar__total']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary--blocked']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary--blocked']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
    /** @type {__VLS_StyleScopedClasses['crawl-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['crawl-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['crawl-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['crawl-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['crawl-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['crawl-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['crawl-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['row-selected']} */ ;
    /** @type {__VLS_StyleScopedClasses['crawl-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['url-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn--blocked']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn--blocked']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn--view']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn--blocked']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn--view']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn--blocked']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__body--4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__body--5']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__body']} */ ;
    /** @type {__VLS_StyleScopedClasses['url-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__body']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__body--4']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__body--5']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-container" },
    });
    /** @type {__VLS_StyleScopedClasses['page-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-header" },
    });
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "page-title" },
    });
    /** @type {__VLS_StyleScopedClasses['page-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stats-row" },
    });
    /** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "stat-panel" },
        'aria-label': "Crawl statistics",
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "stat-panel__head" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-panel__icon stat-panel__icon--crawl" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__icon--crawl']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "12",
        cy: "12",
        r: "10",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "2",
        y1: "12",
        x2: "22",
        y2: "12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "stat-panel__title" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "stat-panel__hint" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-panel__body" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__value']} */ ;
    (stats.value.queuedCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__pill stat-cell__pill--warning" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill--warning']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dot" },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__value']} */ ;
    (stats.value.crawledCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__pill stat-cell__pill--success" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill--success']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dot" },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__value']} */ ;
    (stats.value.failedCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__pill stat-cell__pill--danger" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill--danger']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dot" },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "stat-panel" },
        'aria-label': "Indexing statistics",
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "stat-panel__head" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-panel__icon stat-panel__icon--index" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__icon--index']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "22 12 18 12 15 21 9 3 6 12 2 12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "stat-panel__title" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "stat-panel__hint" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-panel__body stat-panel__body--5" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-panel__body']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-panel__body--5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-cell" },
        title: "Confirmed by Google's URL Inspection",
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__value']} */ ;
    (stats.value.indexedInGoogle ?? 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__pill stat-cell__pill--success" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill--success']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dot" },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-cell" },
        title: "Indexing API accepted our notification",
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__value']} */ ;
    (stats.value.indexedSucceed);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__pill stat-cell__pill--neutral" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill--neutral']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dot" },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__value']} */ ;
    (stats.value.deIndexedSucceed);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__pill stat-cell__pill--neutral" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill--neutral']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dot" },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__value']} */ ;
    (stats.value.indexedQueued);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__pill stat-cell__pill--warning" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill--warning']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dot" },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__value']} */ ;
    (stats.value.indexedFailed);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-cell__pill stat-cell__pill--danger" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-cell__pill--danger']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dot" },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "notice notice--info" },
        role: "status",
    });
    /** @type {__VLS_StyleScopedClasses['notice']} */ ;
    /** @type {__VLS_StyleScopedClasses['notice--info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "notice__icon" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['notice__icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "12",
        cy: "12",
        r: "10",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "12",
        y1: "8",
        x2: "12",
        y2: "12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "12",
        y1: "16",
        x2: "12.01",
        y2: "16",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "notice__body" },
    });
    /** @type {__VLS_StyleScopedClasses['notice__body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "notice__title" },
    });
    /** @type {__VLS_StyleScopedClasses['notice__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "notice__text" },
    });
    /** @type {__VLS_StyleScopedClasses['notice__text']} */ ;
    if (!entitlementsStore.value.canUsePaidFeatures && !entitlementsStore.value.isChecking) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "notice notice--warning" },
            role: "alert",
        });
        /** @type {__VLS_StyleScopedClasses['notice']} */ ;
        /** @type {__VLS_StyleScopedClasses['notice--warning']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "notice__icon notice__icon--warning" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['notice__icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['notice__icon--warning']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "12",
            y1: "9",
            x2: "12",
            y2: "13",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "12",
            y1: "17",
            x2: "12.01",
            y2: "17",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "notice__body" },
        });
        /** @type {__VLS_StyleScopedClasses['notice__body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "notice__title notice__title--warning" },
        });
        /** @type {__VLS_StyleScopedClasses['notice__title']} */ ;
        /** @type {__VLS_StyleScopedClasses['notice__title--warning']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "notice__text notice__text--warning" },
        });
        /** @type {__VLS_StyleScopedClasses['notice__text']} */ ;
        /** @type {__VLS_StyleScopedClasses['notice__text--warning']} */ ;
        (entitlementsStore.value.blockingReason);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid-card" },
    });
    /** @type {__VLS_StyleScopedClasses['grid-card']} */ ;
    if (selectedSites.value.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bulk-bar" },
            role: "region",
            'aria-label': "Bulk actions",
        });
        /** @type {__VLS_StyleScopedClasses['bulk-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bulk-bar__info" },
        });
        /** @type {__VLS_StyleScopedClasses['bulk-bar__info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "bulk-bar__count" },
        });
        /** @type {__VLS_StyleScopedClasses['bulk-bar__count']} */ ;
        (selectedSites.value.length);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "bulk-bar__label" },
        });
        /** @type {__VLS_StyleScopedClasses['bulk-bar__label']} */ ;
        (selectedSites.value.length === 1 ? 'site selected' : 'sites selected');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "bulk-bar__actions" },
        });
        /** @type {__VLS_StyleScopedClasses['bulk-bar__actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(clearSelection, {})) },
            ...{ class: "btn-ghost" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-ghost']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(queueForCrawl, {})) },
            ...{ class: "btn-primary" },
            type: "button",
            ...{ class: ({ 'btn-primary--blocked': __VLS_unwrap(isCrawlBlocked, {}) }) },
            'aria-disabled': (__VLS_unwrap(isCrawlBlocked, {})),
            title: (paidActionTitle.value || 'Queue selected sites for crawl'),
        });
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn-primary--blocked']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polygon)({
            points: "5 3 19 12 5 21 5 3",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid-toolbar" },
        });
        /** @type {__VLS_StyleScopedClasses['grid-toolbar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "grid-toolbar__total" },
        });
        /** @type {__VLS_StyleScopedClasses['grid-toolbar__total']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (activeSites.value.length);
        (activeSites.value.length === 1 ? 'active site' : 'active sites');
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-scroll" },
    });
    /** @type {__VLS_StyleScopedClasses['table-scroll']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
        ...{ class: "crawl-table" },
    });
    /** @type {__VLS_StyleScopedClasses['crawl-table']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-select" },
    });
    /** @type {__VLS_StyleScopedClasses['col-select']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "checkbox-container" },
        title: (isAllSelected.value ? 'Deselect all' : 'Select all'),
    });
    /** @type {__VLS_StyleScopedClasses['checkbox-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_unwrap(toggleSelectAll, {})) },
        type: "checkbox",
        checked: (isAllSelected.value),
        indeterminate: (__VLS_unwrap(isPartiallySelected, {})),
        ...{ class: "checkbox-input" },
        'aria-label': (isAllSelected.value ? 'Deselect all sites' : 'Select all sites'),
    });
    /** @type {__VLS_StyleScopedClasses['checkbox-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-url" },
    });
    /** @type {__VLS_StyleScopedClasses['col-url']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-type" },
    });
    /** @type {__VLS_StyleScopedClasses['col-type']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-status" },
    });
    /** @type {__VLS_StyleScopedClasses['col-status']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-date" },
    });
    /** @type {__VLS_StyleScopedClasses['col-date']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['col-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
    const __VLS_0 = __VLS_tryAsConstant((activeSites.value));
    for (const [site] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            key: (site.id),
            ...{ class: ({ 'row-selected': selectedSites.value.includes(site.id) }) },
        });
        /** @type {__VLS_StyleScopedClasses['row-selected']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-select" },
        });
        /** @type {__VLS_StyleScopedClasses['col-select']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onChange: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(toggleSiteSelection, {})(site.id));
                    // @ts-ignore
                    [stats, stats, stats, stats, stats, stats, stats, stats, entitlementsStore, entitlementsStore, entitlementsStore, selectedSites, selectedSites, selectedSites, selectedSites, clearSelection, queueForCrawl, isCrawlBlocked, isCrawlBlocked, paidActionTitle, activeSites, activeSites, activeSites, isAllSelected, isAllSelected, isAllSelected, toggleSelectAll, isPartiallySelected, toggleSiteSelection,];
                } },
            type: "checkbox",
            ...{ class: "checkbox-input" },
            checked: (selectedSites.value.includes(site.id)),
            'aria-label': (`Select ${site.url}`),
        });
        /** @type {__VLS_StyleScopedClasses['checkbox-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-url" },
        });
        /** @type {__VLS_StyleScopedClasses['col-url']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "url-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['url-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "url-chip" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['url-chip']} */ ;
        (__VLS_unwrap(siteInitial, {})(site));
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (site.url),
            target: "_blank",
            rel: "noopener",
            title: (site.url),
            ...{ class: "url-link" },
        });
        /** @type {__VLS_StyleScopedClasses['url-link']} */ ;
        (site.url);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-type" },
        });
        /** @type {__VLS_StyleScopedClasses['col-type']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "type-pill" },
        });
        /** @type {__VLS_StyleScopedClasses['type-pill']} */ ;
        (site.type || '—');
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-status" },
        });
        /** @type {__VLS_StyleScopedClasses['col-status']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-stack" },
        });
        /** @type {__VLS_StyleScopedClasses['status-stack']} */ ;
        if (progressMap.value[site.id]?.status === 'in_progress') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "loader-wrapper" },
            });
            /** @type {__VLS_StyleScopedClasses['loader-wrapper']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "spinner" },
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "loader-text" },
            });
            /** @type {__VLS_StyleScopedClasses['loader-text']} */ ;
        }
        if (progressMap.value[site.id]?.message) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "sse-message" },
            });
            /** @type {__VLS_StyleScopedClasses['sse-message']} */ ;
            (progressMap.value[site.id]?.message);
        }
        else if (!progressMap.value[site.id]) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "status-badge" },
                ...{ class: (__VLS_unwrap(getStatusClass, {})(site.crawlStatus)) },
            });
            /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "dot" },
            });
            /** @type {__VLS_StyleScopedClasses['dot']} */ ;
            (site.crawlStatus || 'Pending');
            if (site.crawlFailedReason) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "status-reason" },
                    title: (site.crawlFailedReason),
                });
                /** @type {__VLS_StyleScopedClasses['status-reason']} */ ;
                (site.crawlFailedReason);
            }
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-date" },
        });
        /** @type {__VLS_StyleScopedClasses['col-date']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            title: (__VLS_unwrap(lastCrawlTitle, {})(site.crawlDate)),
        });
        (__VLS_unwrap(formatLastCrawlDate, {})(site.crawlDate));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['col-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "action-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['action-cell']} */ ;
        if (site.crawlStatus !== 'In Progress') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(site.crawlStatus !== 'In Progress'))
                            throw 0;
                        return (__VLS_unwrap(startCrawl, {})(site.id));
                        // @ts-ignore
                        [selectedSites, siteInitial, progressMap, progressMap, progressMap, progressMap, getStatusClass, lastCrawlTitle, formatLastCrawlDate, startCrawl,];
                    } },
                type: "button",
                ...{ class: "action-btn" },
                ...{ class: ({ 'action-btn--blocked': __VLS_unwrap(isCrawlBlocked, {}) }) },
                'aria-disabled': (__VLS_unwrap(isCrawlBlocked, {})),
                title: (paidActionTitle.value || `Crawl ${site.url}`),
            });
            /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['action-btn--blocked']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                points: "23 4 23 10 17 10",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10",
            });
        }
        if (site.crawlStatus === 'Success') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(site.crawlStatus === 'Success'))
                            throw 0;
                        return (__VLS_unwrap(viewDetails, {})(site.id));
                        // @ts-ignore
                        [isCrawlBlocked, isCrawlBlocked, paidActionTitle, viewDetails,];
                    } },
                ...{ class: "action-btn action-btn--view" },
                title: (`View details for ${site.url}`),
            });
            /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['action-btn--view']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                x1: "5",
                y1: "12",
                x2: "19",
                y2: "12",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                points: "12 5 19 12 12 19",
            });
        }
        // @ts-ignore
        [];
    }
    if (activeSites.value.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            colspan: "6",
            ...{ class: "empty-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "12",
            cy: "12",
            r: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "2",
            y1: "12",
            x2: "22",
            y2: "12",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-title" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-desc']} */ ;
    }
    // @ts-ignore
    [activeSites,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

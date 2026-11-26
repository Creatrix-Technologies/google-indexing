/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { showUpgradePrompt } from '../Shared/upgradePrompt';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../api';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import { useEntitlementsStore } from '../Shared/entitlements';
const toast = useToast();
const entitlementsStore = useEntitlementsStore();
const paidActionTitle = computed(() => entitlementsStore.canUsePaidFeatures ? '' : entitlementsStore.blockingReason);
const ensurePaidAccess = async () => {
    await entitlementsStore.refresh();
    if (entitlementsStore.canUsePaidFeatures)
        return true;
    await showUpgradePrompt(entitlementsStore.blockingReason);
    return false;
};
const schedules = ref([]);
const dailyQuotaUsed = ref(0);
const dailyQuotaLimit = ref(0);
const progressMap = ref({});
const eventSources = new Map();
const showModal = ref(false);
const editingId = ref(null);
const selectedUrl = ref('');
const formData = ref({
    frequency: '',
    startTime: '',
    endTime: '',
    maxUrls: 1,
    isActive: true
});
/* ================= SSE LISTENER ================= */
const listenToProgress = (websiteId) => {
    if (eventSources.has(websiteId))
        return;
    const source = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/crawl/bulk-run/${websiteId}`, { withCredentials: true });
    eventSources.set(websiteId, source);
    source.onmessage = (e) => {
        const data = JSON.parse(e.data);
        const prev = progressMap.value[websiteId];
        const rawT = data.Total ?? data.total;
        const rawC = data.Completed ?? data.completed;
        const rawF = data.Failed ?? data.failed;
        let total = typeof rawT === 'number' && !Number.isNaN(rawT) ? rawT : (prev?.total ?? 0);
        let completed = typeof rawC === 'number' && !Number.isNaN(rawC) ? rawC : (prev?.completed ?? 0);
        const failed = typeof rawF === 'number' && !Number.isNaN(rawF) ? rawF : (prev?.failed ?? 0);
        if (completed > total)
            total = completed;
        progressMap.value[websiteId] = { total, completed, failed };
        if (data.status === 'completed') {
            toast.success('Queue process completed');
            source.close();
            eventSources.delete(websiteId);
            fetchSchedules();
        }
    };
    source.onerror = () => {
        source.close();
        eventSources.delete(websiteId);
    };
};
/* ================= API ================= */
const fetchSchedules = async () => {
    const res = await api.get('/schedule/get');
    const raw = res.data?.data;
    const mapRow = (i) => ({
        websiteId: i.websiteId,
        url: i.url,
        type: i.type,
        frequency: i.frequency,
        startTime: i.startTime,
        endTime: i.endTime,
        maxUrls: i.maxUrls,
        queued: i.totalQueued,
        isRunning: i.isRunning,
        isPickByJob: i.isPickByJob,
        queueCompleted: i.queueCompleted,
        isActive: i.isActive
    });
    if (raw && !Array.isArray(raw) && Array.isArray(raw.schedules)) {
        dailyQuotaUsed.value = Number(raw.dailyIndexingQuotaUsed) || 0;
        dailyQuotaLimit.value = Number(raw.dailyIndexingQuotaLimit) || 0;
        schedules.value = raw.schedules.map(mapRow);
    }
    else if (Array.isArray(raw)) {
        dailyQuotaUsed.value = 0;
        dailyQuotaLimit.value = 0;
        schedules.value = raw.map(mapRow);
    }
    else {
        dailyQuotaUsed.value = 0;
        dailyQuotaLimit.value = 0;
        schedules.value = [];
    }
    // resume listeners for running items
    schedules.value.forEach(i => {
        if (i.isRunning || i.isPickByJob)
            listenToProgress(i.websiteId);
    });
};
const bulkrun = async (websiteId) => {
    if (!(await ensurePaidAccess()))
        return;
    const confirm = await Swal.fire({
        title: 'Run Instantly?',
        text: 'The queue will begin processing right away.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Run Now',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#22c55e'
    });
    if (!confirm.isConfirmed)
        return;
    progressMap.value[websiteId] = { total: 0, completed: 0, failed: 0 };
    listenToProgress(websiteId);
    try {
        await api.post('/crawl/index-bulk', { websiteId });
    }
    catch (err) {
        fetchSchedules();
        const apiError = err?.response?.data?.error;
        if (apiError?.description) {
            toast.error(apiError.description);
        }
        else {
            toast.error('Failed to start queue process');
        }
        delete progressMap.value[websiteId];
    }
};
/* ================= UI HELPERS ================= */
const openEdit = (item) => {
    editingId.value = item.websiteId;
    selectedUrl.value = item.url;
    formData.value = {
        frequency: String(item.frequency),
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        maxUrls: item.maxUrls,
        isActive: item.isActive
    };
    showModal.value = true;
};
const saveSchedule = async () => {
    if (!editingId.value)
        return;
    if (!(await ensurePaidAccess()))
        return;
    try {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const dateOnlyLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const response = await api.post('/schedule/update', {
            websiteId: editingId.value,
            frequency: Number(formData.value.frequency),
            startTime: formData.value.startTime,
            endTime: formData.value.endTime,
            maxUrls: formData.value.maxUrls,
            isActive: formData.value.isActive,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            date: dateOnlyLocal
        });
        if (response.data?.isSuccess) {
            toast.success('Schedule updated');
            showModal.value = false;
            const wid = editingId.value;
            if (wid != null) {
                delete progressMap.value[wid];
                const es = eventSources.get(wid);
                if (es) {
                    es.close();
                    eventSources.delete(wid);
                }
            }
            fetchSchedules();
        }
        else {
            // Handle validation errors from API
            const errors = response.data?.error?.validationErrors;
            if (errors && errors.length) {
                const cleanErrors = errors.map((e) => e.replace(/'/g, ""));
                toast.error(cleanErrors.join(', '));
            }
            else {
                const description = response.data?.error?.description?.replace(/'/g, "") || 'Failed to update schedule';
                toast.error(description);
            }
        }
    }
    catch (err) {
        // Handle network or unexpected errors
        const errors = err.response?.data?.error?.validationErrors;
        const description = err.response?.data?.error?.description;
        const msg = errors?.map((e) => e.replace(/'/g, "")).join(', ')
            || description?.replace(/'/g, "")
            || err.message
            || 'Failed to update schedule';
        toast.error(msg);
    }
};
const closeModal = () => (showModal.value = false);
const formatTime = (t) => {
    if (!t)
        return '-';
    const [h, m = '00'] = t.split(':');
    const hr = Number(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};
const formatFrequency = (v) => v === 1 ? 'Daily' : v === 7 ? 'Weekly' : v === 30 ? 'Monthly' : '';
const quotaRatio = computed(() => {
    if (dailyQuotaLimit.value <= 0)
        return 0;
    return dailyQuotaUsed.value / dailyQuotaLimit.value;
});
const quotaPercent = computed(() => Math.min(100, Math.round(quotaRatio.value * 100)));
const quotaToneClass = computed(() => {
    const r = quotaRatio.value;
    if (r >= 1)
        return 'quota-tone--danger';
    if (r >= 0.85)
        return 'quota-tone--warn';
    return 'quota-tone--ok';
});
const getProgress = (websiteId) => progressMap.value[websiteId];
const liveProgressDenom = (p) => Math.max(p.total, p.completed);
const getProgressPercent = (websiteId) => {
    const p = progressMap.value[websiteId];
    if (!p)
        return 0;
    const denom = liveProgressDenom(p);
    if (denom <= 0)
        return 0;
    return Math.min(100, Math.round((p.completed / denom) * 100));
};
/* ================= DISPLAY-ONLY HELPERS ================= */
const activeCount = computed(() => schedules.value.filter(s => s.isActive).length);
const inactiveCount = computed(() => schedules.value.filter(s => !s.isActive).length);
const siteInitial = (url) => {
    if (!url)
        return '–';
    try {
        const cleaned = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
        return cleaned.charAt(0).toUpperCase();
    }
    catch {
        return '–';
    }
};
const parseMinutes = (t) => {
    if (!t || !t.includes(':'))
        return null;
    const parts = t.split(':').map((x) => Number(x));
    const h = parts[0];
    const m = parts[1];
    if (h == null || Number.isNaN(h) || Number.isNaN(m ?? 0))
        return null;
    return h * 60 + (m || 0);
};
const formatWindow = (start, end) => {
    if (!start && !end)
        return '—';
    const a = parseMinutes(start);
    const b = parseMinutes(end);
    const overnight = a != null && b != null && b <= a;
    const line = `${formatTime(start)} → ${formatTime(end)}`;
    return overnight ? `${line} · overnight` : line;
};
const formatNumber = (n) => {
    if (n === null || n === undefined)
        return '0';
    return Number(n).toLocaleString('en-US');
};
const hasLiveProgress = (websiteId) => {
    const p = progressMap.value[websiteId];
    return !!(p && p.total > 0);
};
const historicalPercent = (item) => {
    const cap = item.maxUrls;
    if (!cap || cap <= 0)
        return 0;
    return Math.min(100, Math.round(((item.queueCompleted || 0) / cap) * 100));
};
const isItemRunning = (item) => {
    if (item.isRunning || item.isPickByJob)
        return true;
    const p = progressMap.value[item.websiteId];
    if (p && p.total > 0 && p.completed < p.total)
        return true;
    return false;
};
const isRunActionDisabled = (item) => isItemRunning(item) || !entitlementsStore.canUsePaidFeatures || entitlementsStore.isChecking;
const runActionLabel = (item) => {
    if (!entitlementsStore.canUsePaidFeatures)
        return entitlementsStore.blockingReason;
    if (isItemRunning(item))
        return 'Already running';
    return 'Run instantly';
};
let refreshTimer;
const onDocVisibility = () => {
    if (document.visibilityState === 'visible') {
        void fetchSchedules();
        void entitlementsStore.refresh();
    }
};
onMounted(() => {
    void entitlementsStore.refresh();
    void fetchSchedules();
    document.addEventListener('visibilitychange', onDocVisibility);
    refreshTimer = setInterval(() => {
        if (document.visibilityState === 'visible')
            void fetchSchedules();
    }, 60_000);
});
onUnmounted(() => {
    document.removeEventListener('visibilitychange', onDocVisibility);
    if (refreshTimer)
        clearInterval(refreshTimer);
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(schedules, {});
    __VLS_withDotValue(showModal, {});
    __VLS_withDotValue(formData, {});
    __VLS_withDotValue(entitlementsStore, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-callout__fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-callout__fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-tone--ok']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-callout__fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-callout__fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-tone--warn']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-callout__fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-callout__fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-tone--danger']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-callout__value']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-tone--ok']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-callout__value']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-tone--warn']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-callout__value']} */ ;
    /** @type {__VLS_StyleScopedClasses['quota-tone--danger']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-cell']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn--accent']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn--accent']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty-state__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['switch']} */ ;
    /** @type {__VLS_StyleScopedClasses['slider']} */ ;
    /** @type {__VLS_StyleScopedClasses['slider']} */ ;
    /** @type {__VLS_StyleScopedClasses['slider']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-container" },
    });
    /** @type {__VLS_StyleScopedClasses['page-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-header" },
    });
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    if (schedules.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "header-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['header-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill meta-pill--success" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-pill--success']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-dot" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
        (__VLS_unwrap(activeCount, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill meta-pill--muted" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-pill--muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-dot" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
        (__VLS_unwrap(inactiveCount, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        (schedules.value.length);
    }
    if (__VLS_unwrap(dailyQuotaLimit, {}) > 0 && schedules.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "quota-callout" },
            role: "status",
        });
        /** @type {__VLS_StyleScopedClasses['quota-callout']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "quota-callout__text" },
        });
        /** @type {__VLS_StyleScopedClasses['quota-callout__text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "quota-callout__label" },
        });
        /** @type {__VLS_StyleScopedClasses['quota-callout__label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "quota-callout__value" },
            ...{ class: (__VLS_unwrap(quotaToneClass, {})) },
        });
        /** @type {__VLS_StyleScopedClasses['quota-callout__value']} */ ;
        (__VLS_unwrap(formatNumber, {})(__VLS_unwrap(dailyQuotaUsed, {})));
        (__VLS_unwrap(formatNumber, {})(__VLS_unwrap(dailyQuotaLimit, {})));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "quota-callout__hint" },
        });
        /** @type {__VLS_StyleScopedClasses['quota-callout__hint']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "quota-callout__track" },
            'aria-label': (`Quota ${__VLS_unwrap(quotaPercent, {})} percent used`),
        });
        /** @type {__VLS_StyleScopedClasses['quota-callout__track']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "quota-callout__fill" },
            ...{ class: (__VLS_unwrap(quotaToneClass, {})) },
            ...{ style: ({ width: Math.min(100, __VLS_unwrap(quotaPercent, {})) + '%' }) },
        });
        /** @type {__VLS_StyleScopedClasses['quota-callout__fill']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-card" },
    });
    /** @type {__VLS_StyleScopedClasses['table-card']} */ ;
    if (schedules.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid-toolbar" },
        });
        /** @type {__VLS_StyleScopedClasses['grid-toolbar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid-toolbar__left" },
        });
        /** @type {__VLS_StyleScopedClasses['grid-toolbar__left']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "grid-toolbar__count" },
        });
        /** @type {__VLS_StyleScopedClasses['grid-toolbar__count']} */ ;
        (schedules.value.length);
        (schedules.value.length === 1 ? 'site' : 'sites');
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-scroll" },
    });
    /** @type {__VLS_StyleScopedClasses['table-scroll']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
        ...{ class: "sites-table" },
    });
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "th-site" },
    });
    /** @type {__VLS_StyleScopedClasses['th-site']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "th-num" },
    });
    /** @type {__VLS_StyleScopedClasses['th-num']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "th-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['th-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
    const __VLS_0 = __VLS_tryAsConstant((schedules.value));
    for (const [item] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            key: (item.websiteId),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "site-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['site-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "url-chip" },
        });
        /** @type {__VLS_StyleScopedClasses['url-chip']} */ ;
        (__VLS_unwrap(siteInitial, {})(item.url));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "url-link" },
            title: (item.url),
        });
        /** @type {__VLS_StyleScopedClasses['url-link']} */ ;
        (item.url);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-pill" },
            ...{ class: (item.isActive ? 'status-pill--success' : 'status-pill--muted') },
        });
        /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-dot" },
        });
        /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
        (item.isActive ? 'Active' : 'Inactive');
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "type-pill" },
        });
        /** @type {__VLS_StyleScopedClasses['type-pill']} */ ;
        (item.type || '—');
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "frequency-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['frequency-cell']} */ ;
        (__VLS_unwrap(formatFrequency, {})(item.frequency) || '—');
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "window-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['window-cell']} */ ;
        (__VLS_unwrap(formatWindow, {})(item.startTime, item.endTime));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "num-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['num-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cap-stack" },
        });
        /** @type {__VLS_StyleScopedClasses['cap-stack']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "cap-stack__main" },
        });
        /** @type {__VLS_StyleScopedClasses['cap-stack__main']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "num-strong" },
        });
        /** @type {__VLS_StyleScopedClasses['num-strong']} */ ;
        (__VLS_unwrap(formatNumber, {})(item.queueCompleted));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "num-suffix" },
        });
        /** @type {__VLS_StyleScopedClasses['num-suffix']} */ ;
        (__VLS_unwrap(formatNumber, {})(item.maxUrls));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "cap-stack__sub" },
        });
        /** @type {__VLS_StyleScopedClasses['cap-stack__sub']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "queue-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['queue-cell']} */ ;
        if (__VLS_unwrap(hasLiveProgress, {})(item.websiteId)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "queue-stack" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-stack']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "queue-meta" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "queue-meta__count" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta__count']} */ ;
            (__VLS_unwrap(formatNumber, {})(__VLS_unwrap(getProgress, {})(item.websiteId).completed));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "queue-meta__total" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta__total']} */ ;
            (__VLS_unwrap(formatNumber, {})(__VLS_unwrap(liveProgressDenom, {})(__VLS_unwrap(getProgress, {})(item.websiteId))));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "queue-meta__pct" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta__pct']} */ ;
            (__VLS_unwrap(getProgressPercent, {})(item.websiteId));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "progress-track" },
                role: "progressbar",
                'aria-valuenow': (__VLS_unwrap(getProgressPercent, {})(item.websiteId)),
                'aria-valuemin': "0",
                'aria-valuemax': "100",
            });
            /** @type {__VLS_StyleScopedClasses['progress-track']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "progress-fill" },
                ...{ style: ({ width: __VLS_unwrap(getProgressPercent, {})(item.websiteId) + '%' }) },
            });
            /** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
        }
        else if (item.queued > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "queue-stack" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-stack']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "queue-meta" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "queue-meta__primary" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta__primary']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "queue-meta__count" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta__count']} */ ;
            (__VLS_unwrap(formatNumber, {})(item.queueCompleted));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "queue-meta__total" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta__total']} */ ;
            (__VLS_unwrap(formatNumber, {})(item.maxUrls));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "queue-meta__sub-muted" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta__sub-muted']} */ ;
            (__VLS_unwrap(formatNumber, {})(item.queued));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "queue-meta__pct queue-meta__pct--muted" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-meta__pct']} */ ;
            /** @type {__VLS_StyleScopedClasses['queue-meta__pct--muted']} */ ;
            (__VLS_unwrap(historicalPercent, {})(item));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "progress-track" },
            });
            /** @type {__VLS_StyleScopedClasses['progress-track']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "progress-fill progress-fill--muted" },
                ...{ style: ({ width: __VLS_unwrap(historicalPercent, {})(item) + '%' }) },
            });
            /** @type {__VLS_StyleScopedClasses['progress-fill']} */ ;
            /** @type {__VLS_StyleScopedClasses['progress-fill--muted']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "queue-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['queue-empty']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "action-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['action-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(openEdit, {})(item));
                    // @ts-ignore
                    [schedules, schedules, schedules, schedules, schedules, schedules, schedules, activeCount, inactiveCount, dailyQuotaLimit, dailyQuotaLimit, quotaToneClass, quotaToneClass, formatNumber, formatNumber, formatNumber, formatNumber, formatNumber, formatNumber, formatNumber, formatNumber, formatNumber, dailyQuotaUsed, quotaPercent, quotaPercent, siteInitial, formatFrequency, formatWindow, hasLiveProgress, getProgress, getProgress, liveProgressDenom, getProgressPercent, getProgressPercent, getProgressPercent, historicalPercent, historicalPercent, openEdit,];
                } },
            ...{ class: "action-btn" },
        });
        /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M12 20h9",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(bulkrun, {})(item.websiteId));
                    // @ts-ignore
                    [bulkrun,];
                } },
            ...{ class: "action-btn action-btn--accent" },
            disabled: (__VLS_unwrap(isRunActionDisabled, {})(item)),
            title: (__VLS_unwrap(runActionLabel, {})(item)),
        });
        /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['action-btn--accent']} */ ;
        if (__VLS_unwrap(isItemRunning, {})(item)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "spinner" },
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "1.75",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.polygon)({
                points: "5 3 19 12 5 21 5 3",
                fill: "currentColor",
                stroke: "none",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        }
        // @ts-ignore
        [isRunActionDisabled, runActionLabel, isItemRunning,];
    }
    if (!schedules.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            colspan: "8",
            ...{ class: "empty-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state__icon" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state__icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.5",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "3",
            y: "4",
            width: "18",
            height: "18",
            rx: "2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "16",
            y1: "2",
            x2: "16",
            y2: "6",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "8",
            y1: "2",
            x2: "8",
            y2: "6",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "3",
            y1: "10",
            x2: "21",
            y2: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "12",
            cy: "15",
            r: "2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state__title" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state__title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state__desc" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state__desc']} */ ;
    }
    if (showModal.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (__VLS_unwrap(closeModal, {})) },
            ...{ class: "modal-backdrop" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "modal-box modal-box--schedule" },
            role: "dialog",
            'aria-modal': "true",
        });
        /** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['modal-box--schedule']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
            ...{ class: "modal-header" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "modal-title" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modal-subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-subtitle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(closeModal, {})) },
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (__VLS_unwrap(saveSchedule, {})) },
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modal-body" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "site-info" },
        });
        /** @type {__VLS_StyleScopedClasses['site-info']} */ ;
        (__VLS_unwrap(selectedUrl, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (formData.value.frequency),
            required: true,
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "1",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "7",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "30",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-row" },
        });
        /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "time",
            required: true,
        });
        (formData.value.startTime);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "time",
            required: true,
        });
        (formData.value.endTime);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "number",
            min: "1",
            max: "200",
            required: true,
        });
        (formData.value.maxUrls);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-row" },
        });
        /** @type {__VLS_StyleScopedClasses['status-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "switch" },
        });
        /** @type {__VLS_StyleScopedClasses['switch']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "checkbox",
        });
        (formData.value.isActive);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "slider" },
        });
        /** @type {__VLS_StyleScopedClasses['slider']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: (formData.value.isActive ? 'status-active' : 'status-inactive') },
        });
        (formData.value.isActive ? 'Active' : 'Not Active');
        __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
            ...{ class: "modal-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(closeModal, {})) },
            type: "button",
            ...{ class: "btn-secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            type: "submit",
            ...{ class: "btn-primary" },
            disabled: (!entitlementsStore.value.canUsePaidFeatures || entitlementsStore.value.isChecking),
            title: (__VLS_unwrap(paidActionTitle, {})),
        });
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    }
    // @ts-ignore
    [schedules, showModal, closeModal, closeModal, closeModal, saveSchedule, selectedUrl, formData, formData, formData, formData, formData, formData, formData, entitlementsStore, entitlementsStore, paidActionTitle,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

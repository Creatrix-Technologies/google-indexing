/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { showUpgradePrompt } from '../Shared/upgradePrompt';
import { ref, computed, onMounted } from 'vue';
import api from '../api';
import { useToast } from 'vue-toastification';
import { useGoogleConfigStore } from '../Shared/googleConfig';
import { useSubscriptionStore } from '../Shared/subscription';
import { useEntitlementsStore } from '../Shared/entitlements';
import Swal from 'sweetalert2';
const loading = ref(false);
const toast = useToast();
const googleConfigStore = useGoogleConfigStore();
const subscriptionStore = useSubscriptionStore();
const entitlementsStore = useEntitlementsStore();
const paidActionTitle = computed(() => entitlementsStore.canUsePaidFeatures ? '' : entitlementsStore.blockingReason);
const ensurePaidAccess = async () => {
    await entitlementsStore.refresh();
    if (entitlementsStore.canUsePaidFeatures)
        return true;
    await showUpgradePrompt(entitlementsStore.blockingReason);
    return false;
};
const sites = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const formData = ref({
    name: '',
    url: '',
    type: '',
    activeStatus: 'Active',
    description: '',
    ignoreRobotTxt: false
});
/* ---------- derived (display only) ---------- */
const activeCount = computed(() => sites.value.filter(s => s.activeStatus === 'Active').length);
const inactiveCount = computed(() => sites.value.filter(s => s.activeStatus === 'Inactive').length);
const fetchSites = async () => {
    const res = await api.get('/site?PageNo=1&PageSize=10');
    sites.value = (res.data.data || []).map((i) => ({
        id: i.webSiteId,
        name: i.siteName,
        url: i.url,
        type: i.siteType,
        activeStatus: i.activeStatus ? 'Active' : 'Inactive',
        description: i.description || '',
        created: new Date(i.createdDate),
        ignoreRobotTxt: i.ignoreRobotTxt ?? false
    }));
};
const syncsites = async () => {
    if (!(await ensurePaidAccess()))
        return;
    const result = await Swal.fire({
        text: 'This will sync all available sites from your Google account.',
        title: `Do you want to continue?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    });
    if (!result.isConfirmed)
        return;
    loading.value = true;
    try {
        const response = await api.post('site/sync', {});
        if (response.data?.isSuccess === false) {
            toast.error(response.data.error?.description || 'Failed to sync Google Sites');
            return;
        }
        toast.success(response.data?.message || 'Google Sites synced successfully.');
        await fetchSites();
    }
    catch (err) {
        toast.error(err?.response?.data?.error?.description ||
            err?.response?.data?.message ||
            err?.message ||
            'An error occurred while syncing');
    }
    finally {
        loading.value = false;
    }
};
const saveSite = async () => {
    if (!(await ensurePaidAccess()))
        return;
    try {
        await api.post('/site', {
            siteName: formData.value.name,
            url: formData.value.url,
            siteType: formData.value.type,
            description: formData.value.description,
            isActivated: formData.value.activeStatus === 'Active',
            ignoreRobotTxt: formData.value.ignoreRobotTxt,
            webSiteId: editingId.value
        });
        toast.success('Site saved successfully');
        fetchSites();
        closeModal();
    }
    catch {
        toast.error('Failed to save site');
    }
};
// const openAddModal = async () => {
//   isEditing.value = false
//   editingId.value = null
//   formData.value = {
//     name: '',
//     url: '',
//     type: '',
//     activeStatus: 'Active',
//     description: '',
//     ignoreRobotTxt: false
//   }
//   showModal.value = true
//   fetchAvailableUrls()
// }
const editSite = async (site) => {
    isEditing.value = true;
    editingId.value = site.id;
    formData.value = { ...site };
    showModal.value = true;
    fetchAvailableUrls();
};
const closeModal = () => (showModal.value = false);
/* ---------- display helpers (UI only) ---------- */
const hostname = (url) => {
    if (!url)
        return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
};
const siteInitial = (site) => {
    const source = (site.name && site.name.trim()) || hostname(site.url) || '?';
    return source.charAt(0).toUpperCase() || '?';
};
const absoluteDate = (date) => {
    if (!date)
        return '—';
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};
const relativeDate = (date) => {
    if (!date)
        return '—';
    const now = Date.now();
    const ts = new Date(date).getTime();
    const diff = Math.max(0, now - ts);
    const sec = Math.floor(diff / 1000);
    if (sec < 60)
        return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60)
        return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24)
        return `${hr} ${hr === 1 ? 'hour' : 'hours'} ago`;
    const day = Math.floor(hr / 24);
    if (day < 7)
        return `${day} ${day === 1 ? 'day' : 'days'} ago`;
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
const availableUrls = ref([]);
const isLoadingUrls = ref(false);
const fetchAvailableUrls = async () => {
    try {
        isLoadingUrls.value = true;
        const res = await api.get('/site/google-sites');
        availableUrls.value = res.data.data || [];
    }
    finally {
        isLoadingUrls.value = false;
    }
};
onMounted(() => {
    fetchSites();
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
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(sites, {});
    __VLS_withDotValue(inactiveCount, {});
    __VLS_withDotValue(googleConfigStore, {});
    __VLS_withDotValue(entitlementsStore, {});
    __VLS_withDotValue(showModal, {});
    __VLS_withDotValue(isEditing, {});
    __VLS_withDotValue(formData, {});
    __VLS_withDotValue(isLoadingUrls, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-toolbar__total']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-url']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['robots-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty-desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-url']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-container" },
    });
    /** @type {__VLS_StyleScopedClasses['page-container']} */ ;
    if (loading.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "page-loader" },
            role: "status",
            'aria-live': "polite",
        });
        /** @type {__VLS_StyleScopedClasses['page-loader']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "loader-box" },
        });
        /** @type {__VLS_StyleScopedClasses['loader-box']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spinner" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    }
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
    if (sites.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "header-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['header-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-dot meta-dot--active" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-dot--active']} */ ;
        (__VLS_unwrap(activeCount, {}));
        if (inactiveCount.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-pill" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-dot meta-dot--inactive" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
            /** @type {__VLS_StyleScopedClasses['meta-dot--inactive']} */ ;
            (inactiveCount.value);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill meta-pill--total" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-pill--total']} */ ;
        (sites.value.length);
    }
    if (googleConfigStore.value.isValid) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(syncsites, {})) },
            ...{ class: "btn-primary" },
            disabled: (loading.value || !entitlementsStore.value.canUsePaidFeatures || entitlementsStore.value.isChecking),
            title: (__VLS_unwrap(paidActionTitle, {})),
        });
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
            ...{ class: ({ 'is-spinning': loading.value }) },
        });
        /** @type {__VLS_StyleScopedClasses['is-spinning']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "23 4 23 10 17 10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "1 20 1 14 7 14",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
        });
        (loading.value ? 'Syncing…' : 'Sync sites');
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-card" },
    });
    /** @type {__VLS_StyleScopedClasses['table-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid-toolbar" },
    });
    /** @type {__VLS_StyleScopedClasses['grid-toolbar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "grid-toolbar__total" },
    });
    /** @type {__VLS_StyleScopedClasses['grid-toolbar__total']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (sites.value.length);
    (sites.value.length === 1 ? 'site' : 'sites');
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
        ...{ class: "col-site" },
    });
    /** @type {__VLS_StyleScopedClasses['col-site']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-type" },
    });
    /** @type {__VLS_StyleScopedClasses['col-type']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-status" },
    });
    /** @type {__VLS_StyleScopedClasses['col-status']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-robots" },
    });
    /** @type {__VLS_StyleScopedClasses['col-robots']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-date" },
    });
    /** @type {__VLS_StyleScopedClasses['col-date']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ class: "col-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['col-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
    const __VLS_0 = __VLS_tryAsConstant((sites.value));
    for (const [site] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            key: (site.id),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-site" },
        });
        /** @type {__VLS_StyleScopedClasses['col-site']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "site-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['site-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "site-chip" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['site-chip']} */ ;
        (__VLS_unwrap(siteInitial, {})(site));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "site-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['site-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "site-name" },
        });
        /** @type {__VLS_StyleScopedClasses['site-name']} */ ;
        (site.name || __VLS_unwrap(hostname, {})(site.url));
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (site.url),
            target: "_blank",
            rel: "noopener",
            ...{ class: "site-url" },
            title: (site.url),
        });
        /** @type {__VLS_StyleScopedClasses['site-url']} */ ;
        (site.url);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-type" },
        });
        /** @type {__VLS_StyleScopedClasses['col-type']} */ ;
        if (site.type) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "type-pill" },
            });
            /** @type {__VLS_StyleScopedClasses['type-pill']} */ ;
            (site.type);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "muted" },
            });
            /** @type {__VLS_StyleScopedClasses['muted']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-status" },
        });
        /** @type {__VLS_StyleScopedClasses['col-status']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-badge" },
            ...{ class: (site.activeStatus.toLowerCase()) },
        });
        /** @type {__VLS_StyleScopedClasses['status-badge']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "dot" },
        });
        /** @type {__VLS_StyleScopedClasses['dot']} */ ;
        (site.activeStatus);
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-robots" },
        });
        /** @type {__VLS_StyleScopedClasses['col-robots']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "robots-pill" },
            ...{ class: (site.ignoreRobotTxt ? 'robots-pill--ignored' : 'robots-pill--followed') },
            title: (site.ignoreRobotTxt
                ? 'Crawling ignores robots.txt directives'
                : 'Crawling respects robots.txt directives'),
        });
        /** @type {__VLS_StyleScopedClasses['robots-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        if (site.ignoreRobotTxt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                cx: "12",
                cy: "12",
                r: "10",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                x1: "4.93",
                y1: "4.93",
                x2: "19.07",
                y2: "19.07",
            });
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M9 12l2 2 4-4",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                cx: "12",
                cy: "12",
                r: "10",
            });
        }
        (site.ignoreRobotTxt ? 'Ignored' : 'Followed');
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-date" },
        });
        /** @type {__VLS_StyleScopedClasses['col-date']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            title: (__VLS_unwrap(absoluteDate, {})(site.created)),
        });
        (__VLS_unwrap(relativeDate, {})(site.created));
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['col-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "action-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['action-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(editSite, {})(site));
                    // @ts-ignore
                    [loading, loading, loading, loading, sites, sites, sites, sites, sites, activeCount, inactiveCount, inactiveCount, googleConfigStore, syncsites, entitlementsStore, entitlementsStore, paidActionTitle, siteInitial, hostname, absoluteDate, relativeDate, editSite,];
                } },
            ...{ class: "action-btn" },
            title: (`Edit ${site.name || site.url}`),
            'aria-label': (`Edit ${site.name || site.url}`),
        });
        /** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
        });
        // @ts-ignore
        [];
    }
    if (sites.value.length === 0) {
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
        if (googleConfigStore.value.isValid) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        }
        else {
        }
    }
    if (showModal.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (__VLS_unwrap(closeModal, {})) },
            ...{ class: "modal-backdrop" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "modal-box modal-box--lg" },
            role: "dialog",
            'aria-modal': "true",
        });
        /** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['modal-box--lg']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
            ...{ class: "modal-header" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "modal-title" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
        (isEditing.value ? 'Edit site' : 'Add new site');
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modal-subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-subtitle']} */ ;
        (isEditing.value ? 'Update site details and indexing preferences.' : 'Connect a Google Search Console property to start indexing.');
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
            ...{ onSubmit: (__VLS_unwrap(saveSite, {})) },
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modal-body" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            required: true,
        });
        (formData.value.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (formData.value.url),
            required: true,
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "",
            disabled: true,
        });
        (isLoadingUrls.value ? 'Loading URLs...' : 'Select URL');
        const __VLS_1 = __VLS_tryAsConstant((__VLS_unwrap(availableUrls, {})));
        for (const [url] of __VLS_vFor(__VLS_nonNull(__VLS_1))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (url),
                value: (url),
            });
            (url);
            // @ts-ignore
            [sites, googleConfigStore, showModal, closeModal, closeModal, isEditing, isEditing, saveSite, formData, formData, isLoadingUrls, availableUrls,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-row" },
        });
        /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (formData.value.type),
            required: true,
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: "",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "toggle-container" },
        });
        /** @type {__VLS_StyleScopedClasses['toggle-container']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "checkbox",
            id: "status-toggle",
            'true-value': ('Active'),
            'false-value': ('Inactive'),
            ...{ class: "toggle-input" },
        });
        (formData.value.activeStatus);
        /** @type {__VLS_StyleScopedClasses['toggle-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            for: "status-toggle",
            ...{ class: "toggle-label" },
        });
        /** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "toggle-switch" },
        });
        /** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "toggle-text" },
        });
        /** @type {__VLS_StyleScopedClasses['toggle-text']} */ ;
        (formData.value.activeStatus);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "toggle-container" },
        });
        /** @type {__VLS_StyleScopedClasses['toggle-container']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "checkbox",
            id: "robots-toggle",
            ...{ class: "toggle-input" },
        });
        (formData.value.ignoreRobotTxt);
        /** @type {__VLS_StyleScopedClasses['toggle-input']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            for: "robots-toggle",
            ...{ class: "toggle-label" },
        });
        /** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "toggle-switch" },
        });
        /** @type {__VLS_StyleScopedClasses['toggle-switch']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "toggle-text" },
        });
        /** @type {__VLS_StyleScopedClasses['toggle-text']} */ ;
        (formData.value.ignoreRobotTxt ? 'Yes (Ignore)' : 'No (Follow)');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
            value: (formData.value.description),
            rows: "3",
        });
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
        (isEditing.value ? 'Update Site' : 'Add Site');
    }
    // @ts-ignore
    [entitlementsStore, entitlementsStore, paidActionTitle, closeModal, isEditing, formData, formData, formData, formData, formData, formData,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

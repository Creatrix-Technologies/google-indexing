/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, computed } from 'vue';
import api from '../api';
import FunnelPanel from '../components/admin/FunnelPanel.vue';
import { useGoogleConfigStore } from '../Shared/googleConfig';
import { useSubscriptionStore } from '../Shared/subscription';
/* =======================
   State
======================= */
const kpis = ref([]);
const signups = ref([]);
const revenue = ref([]);
const logs = ref([]);
const lastUpdated = ref(null);
/* =======================
   Header time labels
======================= */
const todayLabel = computed(() => new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
}));
const lastUpdatedLabel = computed(() => {
    if (!lastUpdated.value)
        return '';
    return relativeDate(lastUpdated.value.toISOString());
});
/* =======================
   API
======================= */
const fetchAdminDashboard = async () => {
    try {
        // TODO: backend endpoint — see file header comment for expected schema.
        const res = await api.get('/admin/dashboard');
        if (res.data?.isSuccess) {
            const d = res.data.data || {};
            kpis.value = (d.cards || []).sort((a, b) => a.order - b.order);
            signups.value = d.signups || [];
            revenue.value = d.revenue || [];
            logs.value = d.logs || [];
            lastUpdated.value = new Date();
            buildSignupChart();
            buildRevenueChart();
        }
        else {
            resetState();
        }
    }
    catch {
        resetState();
    }
};
const resetState = () => {
    kpis.value = [];
    signups.value = [];
    revenue.value = [];
    logs.value = [];
};
/* =======================
   KPI helpers
======================= */
const formatKpiValue = (k) => {
    const n = Number(k.value || 0);
    if (k.kind === 'currency' || /revenue|mrr|spent|earned|paid/i.test(k.title)) {
        if (n >= 1000)
            return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
        return `$${n.toLocaleString('en-US')}`;
    }
    return n.toLocaleString('en-US');
};
const iconForKpi = (title) => {
    const t = (title || '').toLowerCase();
    if (/(user|customer|account)/.test(t))
        return iconUsers;
    if (/(site|domain|website|property)/.test(t))
        return iconGlobe;
    if (/(subscription|plan|membership)/.test(t))
        return iconShield;
    if (/(revenue|mrr|earned|paid|spent)/.test(t))
        return iconDollar;
    return iconActivity;
};
const hintForKpi = (title) => {
    const t = (title || '').toLowerCase();
    if (/(user|customer|account)/.test(t))
        return 'Across all tenants';
    if (/(site|domain|website|property)/.test(t))
        return 'Connected properties';
    if (/(subscription|plan|membership)/.test(t))
        return 'Currently active';
    if (/(revenue|mrr|earned|paid|spent)/.test(t))
        return 'This billing cycle';
    return 'Platform total';
};
/* Inline SVG strings — kept here so CSS can scope sizing */
const iconUsers = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`;
const iconGlobe = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3a14 14 0 0 1 0 18"/>
    <path d="M12 3a14 14 0 0 0 0 18"/>
  </svg>`;
const iconShield = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>`;
const iconDollar = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>`;
const iconActivity = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 12h4l3-8 4 16 3-8h4"/>
  </svg>`;
/* =======================
   Signups
======================= */
const sortedSignups = computed(() => [...signups.value]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12));
const signupTotal = computed(() => sortedSignups.value.reduce((acc, p) => acc + (p.count || 0), 0));
const signupRangeLabel = computed(() => formatRange(sortedSignups.value.map(s => s.date)));
const signupChartOptions = ref({});
const buildSignupChart = () => {
    const data = sortedSignups.value;
    if (!data.length)
        return;
    const categories = data.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    signupChartOptions.value = baseChart('column', categories, [
        { name: 'Signups', data: data.map(p => p.count || 0), color: '#4f46e5' }
    ]);
};
/* =======================
   Revenue
======================= */
const sortedRevenue = computed(() => [...revenue.value]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12));
const revenueTotal = computed(() => sortedRevenue.value.reduce((acc, p) => acc + (p.amount || 0), 0));
const revenueAverage = computed(() => {
    const arr = sortedRevenue.value;
    if (!arr.length)
        return 0;
    return Math.round(revenueTotal.value / arr.length);
});
const revenueRangeLabel = computed(() => formatRange(sortedRevenue.value.map(r => r.date)));
const revenueChartOptions = ref({});
const buildRevenueChart = () => {
    const data = sortedRevenue.value;
    if (!data.length)
        return;
    const categories = data.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    revenueChartOptions.value = baseChart('area', categories, [
        { name: 'Revenue', data: data.map(p => p.amount || 0), color: '#10b981' }
    ], { yPrefix: '$' });
};
/* =======================
   Chart factory (shared style)
======================= */
const baseChart = (type, categories, series, opts = {}) => ({
    chart: {
        type,
        height: 300,
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, system-ui, sans-serif' },
        spacing: [12, 8, 12, 8]
    },
    title: { text: '' },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
        categories,
        lineColor: '#e5e7eb',
        tickColor: '#e5e7eb',
        labels: { style: { color: '#6b7280', fontSize: '11px' } }
    },
    yAxis: {
        title: { text: '' },
        gridLineColor: '#eceef2',
        gridLineDashStyle: 'Dash',
        labels: {
            style: { color: '#6b7280', fontSize: '11px' },
            formatter: function () {
                const v = this.value;
                const formatted = typeof v === 'number' ? v.toLocaleString('en-US') : v;
                return `${opts.yPrefix || ''}${formatted}`;
            }
        }
    },
    tooltip: {
        shared: true,
        backgroundColor: '#111827',
        borderWidth: 0,
        borderRadius: 8,
        style: { color: '#ffffff', fontSize: '12px' },
        shadow: false
    },
    plotOptions: {
        area: {
            marker: { enabled: false },
            lineWidth: 2,
            fillOpacity: 0.10
        },
        column: {
            borderRadius: 4,
            pointPadding: 0.15,
            groupPadding: 0.1
        }
    },
    series
});
/* =======================
   Date / number helpers
======================= */
const formatNumber = (n) => Number(n || 0).toLocaleString('en-US');
const formatRange = (dates) => {
    if (!dates.length)
        return '';
    const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const first = dates[0];
    const last = dates[dates.length - 1];
    return first && last ? `${fmt(first)} → ${fmt(last)}` : '';
};
const absoluteDate = (date) => new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
});
function relativeDate(date) {
    if (!date)
        return '—';
    const ts = new Date(date).getTime();
    const diff = Math.max(0, Date.now() - ts);
    const sec = Math.floor(diff / 1000);
    if (sec < 60)
        return 'just now';
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
        year: 'numeric', month: 'short', day: 'numeric'
    });
}
/* =======================
   Lifecycle
======================= */
onMounted(() => {
    useGoogleConfigStore().check();
    useSubscriptionStore().checkSubscription();
    fetchAdminDashboard();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(lastUpdatedLabel, {});
    __VLS_withDotValue(kpis, {});
    __VLS_withDotValue(signupRangeLabel, {});
    __VLS_withDotValue(signupTotal, {});
    __VLS_withDotValue(signups, {});
    __VLS_withDotValue(logs, {});
    __VLS_withDotValue(revenueRangeLabel, {});
    __VLS_withDotValue(revenueTotal, {});
    __VLS_withDotValue(revenueAverage, {});
    __VLS_withDotValue(revenue, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['kpi-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['kpi-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['kpi-card__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['kpi-card__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['activity-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['panel__head']} */ ;
    /** @type {__VLS_StyleScopedClasses['meta-stat-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['panel__body']} */ ;
    /** @type {__VLS_StyleScopedClasses['activity-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "admin-dashboard" },
    });
    /** @type {__VLS_StyleScopedClasses['admin-dashboard']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-header" },
    });
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-header-text" },
    });
    /** @type {__VLS_StyleScopedClasses['page-header-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['header-meta']} */ ;
    if (lastUpdatedLabel.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "12",
            cy: "12",
            r: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "12 6 12 12 16 14",
        });
        (lastUpdatedLabel.value);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "meta-pill" },
    });
    /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
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
    (__VLS_unwrap(todayLabel, {}));
    if (kpis.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "kpi-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['kpi-grid']} */ ;
        const __VLS_0 = __VLS_tryAsConstant((kpis.value));
        for (const [k] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (k.title),
                ...{ class: "kpi-card" },
            });
            /** @type {__VLS_StyleScopedClasses['kpi-card']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "kpi-card__head" },
            });
            /** @type {__VLS_StyleScopedClasses['kpi-card__head']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
                ...{ class: "kpi-card__icon" },
                'aria-hidden': "true",
            });
            const __VLS_1 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
            __VLS_1(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (__VLS_unwrap(iconForKpi, {})(k.title)), }, ...__VLS_directiveHookArgsRest(__VLS_1));
            /** @type {__VLS_StyleScopedClasses['kpi-card__icon']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "kpi-card__label" },
            });
            /** @type {__VLS_StyleScopedClasses['kpi-card__label']} */ ;
            (k.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "kpi-card__value" },
            });
            /** @type {__VLS_StyleScopedClasses['kpi-card__value']} */ ;
            (__VLS_unwrap(formatKpiValue, {})(k));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "kpi-card__foot" },
            });
            /** @type {__VLS_StyleScopedClasses['kpi-card__foot']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "kpi-card__hint" },
            });
            /** @type {__VLS_StyleScopedClasses['kpi-card__hint']} */ ;
            (__VLS_unwrap(hintForKpi, {})(k.title));
            // @ts-ignore
            [lastUpdatedLabel, lastUpdatedLabel, todayLabel, kpis, kpis, iconForKpi, formatKpiValue, hintForKpi,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-card kpi-empty" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['kpi-empty']} */ ;
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "3",
            y: "3",
            width: "7",
            height: "7",
            rx: "1",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "14",
            y: "3",
            width: "7",
            height: "7",
            rx: "1",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "3",
            y: "14",
            width: "7",
            height: "7",
            rx: "1",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "14",
            y: "14",
            width: "7",
            height: "7",
            rx: "1",
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
    const __VLS_2 = FunnelPanel;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent1(__VLS_2, new __VLS_2({
    // @ts-ignore
    }));
    const __VLS_4 = __VLS_3({}, ...__VLS_functionalComponentArgsRest(__VLS_3));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid-2" },
    });
    /** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel" },
    });
    /** @type {__VLS_StyleScopedClasses['panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel__head" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel__title" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "panel__subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (signupRangeLabel.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "dot-sep" },
        });
        /** @type {__VLS_StyleScopedClasses['dot-sep']} */ ;
    }
    if (signupRangeLabel.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (signupRangeLabel.value);
    }
    if (signupTotal.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__meta" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-stat__value" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-stat__value']} */ ;
        (__VLS_unwrap(formatNumber, {})(signupTotal.value));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-stat__label" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-stat__label']} */ ;
    }
    if (signups.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__body" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__body']} */ ;
        let __VLS_7;
        /** @ts-ignore @type { | typeof __VLS_components.highcharts | typeof __VLS_components.Highcharts} */
        highcharts;
        // @ts-ignore
        const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
            // @ts-ignore
            constructorType: ('chart'), options: (__VLS_unwrap(signupChartOptions, {})),
        }));
        const __VLS_9 = __VLS_8({
            constructorType: ('chart'),
            options: (__VLS_unwrap(signupChartOptions, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__empty" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__empty']} */ ;
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "9",
            cy: "7",
            r: "4",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "19",
            y1: "8",
            x2: "19",
            y2: "14",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "22",
            y1: "11",
            x2: "16",
            y2: "11",
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel" },
    });
    /** @type {__VLS_StyleScopedClasses['panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel__head" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel__title" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "panel__subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__subtitle']} */ ;
    if (logs.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__meta" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill meta-pill--soft" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-pill--soft']} */ ;
        (logs.value.length);
    }
    if (logs.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__body activity-list" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__body']} */ ;
        /** @type {__VLS_StyleScopedClasses['activity-list']} */ ;
        const __VLS_12 = __VLS_tryAsConstant((logs.value.slice(0, 12)));
        for (const [log, idx] of __VLS_vFor(__VLS_nonNull(__VLS_12))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (`${log.timestamp}-${idx}`),
                ...{ class: "activity-row" },
            });
            /** @type {__VLS_StyleScopedClasses['activity-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "activity-dot" },
                ...{ class: (`activity-dot--${log.type || 'info'}`) },
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['activity-dot']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "activity-body" },
            });
            /** @type {__VLS_StyleScopedClasses['activity-body']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "activity-line" },
            });
            /** @type {__VLS_StyleScopedClasses['activity-line']} */ ;
            if (log.actor) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                    ...{ class: "activity-actor" },
                });
                /** @type {__VLS_StyleScopedClasses['activity-actor']} */ ;
                (log.actor);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "activity-action" },
            });
            /** @type {__VLS_StyleScopedClasses['activity-action']} */ ;
            (log.action);
            if (log.target) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "activity-target" },
                });
                /** @type {__VLS_StyleScopedClasses['activity-target']} */ ;
                (log.target);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "activity-meta" },
            });
            /** @type {__VLS_StyleScopedClasses['activity-meta']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                title: (__VLS_unwrap(absoluteDate, {})(log.timestamp)),
            });
            (relativeDate(log.timestamp));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "dot-sep" },
            });
            /** @type {__VLS_StyleScopedClasses['dot-sep']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "activity-type" },
                ...{ class: (`activity-type--${log.type || 'info'}`) },
            });
            /** @type {__VLS_StyleScopedClasses['activity-type']} */ ;
            ((log.type || 'info').toUpperCase());
            // @ts-ignore
            [signupRangeLabel, signupRangeLabel, signupRangeLabel, signupTotal, signupTotal, formatNumber, signups, signupChartOptions, logs, logs, logs, logs, absoluteDate,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__empty" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__empty']} */ ;
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel" },
    });
    /** @type {__VLS_StyleScopedClasses['panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel__head" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel__title" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "panel__subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (revenueRangeLabel.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "dot-sep" },
        });
        /** @type {__VLS_StyleScopedClasses['dot-sep']} */ ;
    }
    if (revenueRangeLabel.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (revenueRangeLabel.value);
    }
    if (revenueTotal.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__meta" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "meta-stat-group" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-stat-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-stat" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-stat']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-stat__value" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-stat__value']} */ ;
        (__VLS_unwrap(formatNumber, {})(revenueTotal.value));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-stat__label" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-stat__label']} */ ;
        if (revenueAverage.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-stat" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-stat']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-stat__value" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-stat__value']} */ ;
            (__VLS_unwrap(formatNumber, {})(revenueAverage.value));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-stat__label" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-stat__label']} */ ;
        }
    }
    if (revenue.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__body" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__body']} */ ;
        let __VLS_13;
        /** @ts-ignore @type { | typeof __VLS_components.highcharts | typeof __VLS_components.Highcharts} */
        highcharts;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            constructorType: ('chart'), options: (__VLS_unwrap(revenueChartOptions, {})),
        }));
        const __VLS_15 = __VLS_14({
            constructorType: ('chart'),
            options: (__VLS_unwrap(revenueChartOptions, {})),
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__empty" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__empty']} */ ;
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "12",
            y1: "1",
            x2: "12",
            y2: "23",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
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
    [formatNumber, formatNumber, revenueRangeLabel, revenueRangeLabel, revenueRangeLabel, revenueTotal, revenueTotal, revenueAverage, revenueAverage, revenue, revenueChartOptions,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

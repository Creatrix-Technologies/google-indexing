/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import SetupChecklist from '../components/SetupChecklist.vue';
import { useEntitlementsStore as useEntitlementsForSetup } from '../Shared/entitlements';
import { ref, onMounted, computed } from "vue";
import api from "../api";
import StatCard from "../components/StatCard.vue";
import GoogleSetupSteps from "../components/GoogleSetupSteps.vue";
import { useGoogleConfigStore } from "../Shared/googleConfig";
import { useSubscriptionStore } from "../Shared/subscription";
/* =======================
   Google config (reactive)
======================= */
const googleConfig = useGoogleConfigStore();
/* =======================
   Greeting
======================= */
const greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12)
        return "Good morning";
    if (hour < 17)
        return "Good afternoon";
    return "Good evening";
});
const todayLabel = computed(() => new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
}));
/* =======================
   State
======================= */
const cards = ref([]);
const charts = ref([]);
const chartOptions = ref({
    chart: { type: "area", height: 280 },
    title: { text: "" },
    xAxis: { categories: [] },
    yAxis: { title: { text: "Index Count" } },
    tooltip: { shared: true },
    series: []
});
/* =======================
   API Call
======================= */
const fetchDashboard = async () => {
    try {
        const res = await api.get("/dashboard");
        if (res.data?.isSuccess) {
            cards.value = res.data.data.cards.sort((a, b) => a.order - b.order);
            charts.value = res.data.data.charts || [];
            buildChart();
        }
        else {
            cards.value = [];
            charts.value = [];
        }
    }
    catch (err) {
        console.error("Dashboard API error", err);
        cards.value = [];
        charts.value = [];
    }
};
/* =======================
   Chart Builder
======================= */
const buildChart = () => {
    if (!charts.value.length)
        return;
    const sorted = [...charts.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last12 = sorted.slice(-12);
    const categories = last12.map(x => new Date(x.date).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit"
    }));
    const success = last12.map(x => x.successIndex || 0);
    const deIndex = last12.map(x => x.successDeIndex || 0);
    const failed = last12.map(x => x.failedIndex || 0);
    chartOptions.value = {
        chart: {
            type: "area",
            height: 320,
            backgroundColor: "transparent",
            style: { fontFamily: 'Inter, system-ui, sans-serif' },
            spacing: [12, 8, 12, 8]
        },
        title: { text: "" },
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
            labels: { style: { color: '#6b7280', fontSize: '11px' } }
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
                marker: { enabled: false, symbol: 'circle', radius: 3 },
                lineWidth: 2,
                fillOpacity: 0.10
            }
        },
        series: [
            { name: "Submitted", data: success, color: "#4f46e5" },
            { name: "Removals", data: deIndex, color: "#10b981" },
            { name: "Failed", data: failed, color: "#ef4444" }
        ]
    };
};
/* =======================
   Display Helpers
======================= */
const getCardColor = (_title) => "#f3f4f6";
const cardIconFor = (title) => {
    const t = (title || "").toLowerCase();
    if (/(user|client|customer|account)/.test(t))
        return 'users';
    if (/(site|domain|website|company|organization|property)/.test(t))
        return 'building';
    if (/(index|success|growth|increase|crawl)/.test(t))
        return 'trending';
    return 'default';
};
const formatValue = (v) => {
    if (v === null || v === undefined || v === '')
        return '0';
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isNaN(n))
        return String(v);
    return n.toLocaleString('en-US');
};
const seriesTotals = computed(() => {
    if (!charts.value.length)
        return { index: 0, deIndex: 0, failed: 0 };
    const sorted = [...charts.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last12 = sorted.slice(-12);
    return {
        index: last12.reduce((acc, x) => acc + (x.successIndex || 0), 0),
        deIndex: last12.reduce((acc, x) => acc + (x.successDeIndex || 0), 0),
        failed: last12.reduce((acc, x) => acc + (x.failedIndex || 0), 0)
    };
});
const rangeLabel = computed(() => {
    if (!charts.value.length)
        return '';
    const sorted = [...charts.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last12 = sorted.slice(-12);
    if (!last12.length)
        return '';
    const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${fmt(last12[0].date)} → ${fmt(last12[last12.length - 1].date)}`;
});
/* =======================
   Lifecycle
======================= */
onMounted(() => {
    googleConfig.check();
    useSubscriptionStore().checkSubscription();
    fetchDashboard();
});
const entitlementsForSetup = useEntitlementsForSetup();
// Hide the checklist once a URL has been submitted (the last step).
const setupComplete = computed(() => entitlementsForSetup.data.urlsSubmittedThisMonth > 0 || entitlementsForSetup.data.trialUrlsUsed > 0);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(googleConfig, {});
    __VLS_withDotValue(setupComplete, {});
    __VLS_withDotValue(cards, {});
    __VLS_withDotValue(charts, {});
    __VLS_withDotValue(rangeLabel, {});
    __VLS_withDotValue(seriesTotals, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-hero']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-error-note']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-primary-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['series-chip__dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['series-chip__dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['series-chip__dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-hero']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-hero__aside']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-primary-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-hero__icon-wrap']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-guide__header']} */ ;
    /** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['series-summary']} */ ;
    /** @type {__VLS_StyleScopedClasses['chart-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dashboard" },
    });
    /** @type {__VLS_StyleScopedClasses['dashboard']} */ ;
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
    (__VLS_unwrap(greeting, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['header-meta']} */ ;
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
    if (!googleConfig.value.isValid && !googleConfig.value.isChecking) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "google-onboarding" },
        });
        /** @type {__VLS_StyleScopedClasses['google-onboarding']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-hero" },
        });
        /** @type {__VLS_StyleScopedClasses['og-hero']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-hero__icon-wrap" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['og-hero__icon-wrap']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 48 48",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            width: "44",
            height: "44",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "24",
            cy: "24",
            r: "21",
            stroke: "#e5e7eb",
            'stroke-width': "2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M24 5.5 A18.5 18.5 0 0 1 42.5 24",
            stroke: "#4285F4",
            'stroke-width': "4",
            'stroke-linecap': "round",
            fill: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M42.5 24 A18.5 18.5 0 0 1 24 42.5",
            stroke: "#EA4335",
            'stroke-width': "4",
            'stroke-linecap': "round",
            fill: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M24 42.5 A18.5 18.5 0 0 1 5.5 24",
            stroke: "#FBBC05",
            'stroke-width': "4",
            'stroke-linecap': "round",
            fill: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M5.5 24 A18.5 18.5 0 0 1 24 5.5",
            stroke: "#34A853",
            'stroke-width': "4",
            'stroke-linecap': "round",
            fill: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "24",
            cy: "24",
            r: "6",
            stroke: "#4285F4",
            'stroke-width': "2",
            fill: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "28.2",
            y1: "28.2",
            x2: "32",
            y2: "32",
            stroke: "#4285F4",
            'stroke-width': "2.5",
            'stroke-linecap': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-hero__body" },
        });
        /** @type {__VLS_StyleScopedClasses['og-hero__body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "og-badge" },
        });
        /** @type {__VLS_StyleScopedClasses['og-badge']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "og-hero__title" },
        });
        /** @type {__VLS_StyleScopedClasses['og-hero__title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "og-hero__desc" },
        });
        /** @type {__VLS_StyleScopedClasses['og-hero__desc']} */ ;
        if (googleConfig.value.errors.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "og-error-note" },
            });
            /** @type {__VLS_StyleScopedClasses['og-error-note']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 16 16",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "1.75",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
                width: "14",
                height: "14",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                cx: "8",
                cy: "8",
                r: "7",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                x1: "8",
                y1: "5.5",
                x2: "8",
                y2: "8.5",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                cx: "8",
                cy: "10.5",
                r: ".5",
                fill: "currentColor",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (googleConfig.value.errors[0]);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-hero__aside" },
        });
        /** @type {__VLS_StyleScopedClasses['og-hero__aside']} */ ;
        let __VLS_0;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            // @ts-ignore
            to: "/settings/google-configuration", ...{ class: "og-primary-btn" },
        }));
        const __VLS_2 = __VLS_1({
            to: "/settings/google-configuration",
            ...{ class: "og-primary-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['og-primary-btn']} */ ;
        var __VLS_3;
        const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 16 16",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
            width: "13",
            height: "13",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "3",
            y1: "8",
            x2: "13",
            y2: "8",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "8 3 13 8 8 13",
        });
        // @ts-ignore
        [greeting, todayLabel, googleConfig, googleConfig, googleConfig, googleConfig,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "og-time-est" },
        });
        /** @type {__VLS_StyleScopedClasses['og-time-est']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 14 14",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
            width: "12",
            height: "12",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "7",
            cy: "7",
            r: "6",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "7 4 7 7 9.5 9",
        });
        const __VLS_6 = SetupChecklist;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        // @ts-ignore
        }));
        const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-guide" },
        });
        /** @type {__VLS_StyleScopedClasses['og-guide']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-guide__header" },
        });
        /** @type {__VLS_StyleScopedClasses['og-guide__header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "og-guide__title" },
        });
        /** @type {__VLS_StyleScopedClasses['og-guide__title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "og-guide__sub" },
        });
        /** @type {__VLS_StyleScopedClasses['og-guide__sub']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-guide__steps-count" },
        });
        /** @type {__VLS_StyleScopedClasses['og-guide__steps-count']} */ ;
        const __VLS_11 = GoogleSetupSteps;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            // @ts-ignore
            allExpanded: (true),
        }));
        const __VLS_13 = __VLS_12({
            allExpanded: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    }
    else {
        if (!setupComplete.value) {
            const __VLS_16 = SetupChecklist;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
            // @ts-ignore
            }));
            const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
        }
        if (cards.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "stats-grid" },
            });
            /** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
            const __VLS_21 = __VLS_tryAsConstant((cards.value));
            for (const [card] of __VLS_vFor(__VLS_nonNull(__VLS_21))) {
                const __VLS_22 = StatCard;
                // @ts-ignore
                const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
                    // @ts-ignore
                    key: (card.title), label: (card.title), value: (__VLS_unwrap(formatValue, {})(card.value)), meta: (card.hint || ''), iconType: (__VLS_unwrap(cardIconFor, {})(card.title)), iconBg: (__VLS_unwrap(getCardColor, {})(card.title)),
                }));
                const __VLS_24 = __VLS_23({
                    key: (card.title),
                    label: (card.title),
                    value: (__VLS_unwrap(formatValue, {})(card.value)),
                    meta: (card.hint || ''),
                    iconType: (__VLS_unwrap(cardIconFor, {})(card.title)),
                    iconBg: (__VLS_unwrap(getCardColor, {})(card.title)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_23));
                // @ts-ignore
                [setupComplete, cards, cards, formatValue, cardIconFor, getCardColor,];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "empty-card stats-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-card']} */ ;
            /** @type {__VLS_StyleScopedClasses['stats-empty']} */ ;
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
        if (charts.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "chart-card" },
            });
            /** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "card-header" },
            });
            /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "card-header__title" },
            });
            /** @type {__VLS_StyleScopedClasses['card-header__title']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "card-subtitle" },
            });
            /** @type {__VLS_StyleScopedClasses['card-subtitle']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            if (rangeLabel.value) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "card-subtitle__sep" },
                });
                /** @type {__VLS_StyleScopedClasses['card-subtitle__sep']} */ ;
            }
            if (rangeLabel.value) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (rangeLabel.value);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "series-summary" },
            });
            /** @type {__VLS_StyleScopedClasses['series-summary']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "series-chip series-chip--index" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip']} */ ;
            /** @type {__VLS_StyleScopedClasses['series-chip--index']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "series-chip__dot" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip__dot']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "series-chip__label" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip__label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "series-chip__value" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip__value']} */ ;
            (__VLS_unwrap(formatValue, {})(seriesTotals.value.index));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "series-chip series-chip--deindex" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip']} */ ;
            /** @type {__VLS_StyleScopedClasses['series-chip--deindex']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "series-chip__dot" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip__dot']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "series-chip__label" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip__label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "series-chip__value" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip__value']} */ ;
            (__VLS_unwrap(formatValue, {})(seriesTotals.value.deIndex));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "series-chip series-chip--failed" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip']} */ ;
            /** @type {__VLS_StyleScopedClasses['series-chip--failed']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "series-chip__dot" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip__dot']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "series-chip__label" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip__label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "series-chip__value" },
            });
            /** @type {__VLS_StyleScopedClasses['series-chip__value']} */ ;
            (__VLS_unwrap(formatValue, {})(seriesTotals.value.failed));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "chart-content" },
            });
            /** @type {__VLS_StyleScopedClasses['chart-content']} */ ;
            let __VLS_27;
            /** @ts-ignore @type { | typeof __VLS_components.highcharts | typeof __VLS_components.Highcharts} */
            highcharts;
            // @ts-ignore
            const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
                // @ts-ignore
                constructorType: ('chart'), options: (__VLS_unwrap(chartOptions, {})),
            }));
            const __VLS_29 = __VLS_28({
                constructorType: ('chart'),
                options: (__VLS_unwrap(chartOptions, {})),
            }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "empty-card chart-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-card']} */ ;
            /** @type {__VLS_StyleScopedClasses['chart-empty']} */ ;
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
                y1: "20",
                x2: "12",
                y2: "10",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                x1: "18",
                y1: "20",
                x2: "18",
                y2: "4",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                x1: "6",
                y1: "20",
                x2: "6",
                y2: "16",
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
    }
    // @ts-ignore
    [formatValue, formatValue, formatValue, charts, rangeLabel, rangeLabel, rangeLabel, seriesTotals, seriesTotals, seriesTotals, chartOptions,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

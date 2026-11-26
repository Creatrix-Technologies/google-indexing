/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
/* Illustrative daily coverage, % of submitted URLs indexed. Index = day. */
const api = [0, 42, 68, 80, 84, 86, 87, 87, 87, 87, 87, 87, 87, 87, 87];
const sitemap = [0, 2, 6, 12, 20, 30, 40, 50, 57, 63, 68, 72, 75, 78, 80];
const days = Array.from({ length: 15 }, (_, i) => i);
/* The SVG coordinate system tracks the rendered width so text stays at CSS-pixel size on phones. */
const width = ref(760);
const compact = computed(() => width.value < 560);
const W = computed(() => Math.max(300, Math.round(width.value)));
const H = computed(() => (compact.value ? 240 : 300));
const PL = computed(() => (compact.value ? 38 : 44));
const PR = computed(() => (compact.value ? 52 : 128));
const PT = 44;
const PB = 32;
const x = (d) => PL.value + (d / 14) * (W.value - PL.value - PR.value);
const y = (v) => PT + (1 - v / 100) * (H.value - PT - PB);
const yTicks = [0, 25, 50, 75, 100];
const xTicks = [0, 3, 7, 14];
const linePath = (s) => s.map((v, d) => `${d === 0 ? 'M' : 'L'} ${x(d).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
const areaPath = (s) => `${linePath(s)} L ${x(14).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
const hoverDay = ref(null);
const showTable = ref(false);
const plotEl = ref(null);
const drawn = ref(false);
const apiLineStyle = computed(() => (drawn.value ? { strokeDashoffset: 0 } : {}));
const onPointer = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W.value;
    const d = Math.round(((px - PL.value) / (W.value - PL.value - PR.value)) * 14);
    hoverDay.value = Math.min(14, Math.max(0, d));
};
const onKey = (e) => {
    if (e.key === 'ArrowRight') {
        hoverDay.value = Math.min(14, (hoverDay.value ?? 0) + 1);
        e.preventDefault();
    }
    if (e.key === 'ArrowLeft') {
        hoverDay.value = Math.max(0, (hoverDay.value ?? 0) - 1);
        e.preventDefault();
    }
    if (e.key === 'Home') {
        hoverDay.value = 0;
        e.preventDefault();
    }
    if (e.key === 'End') {
        hoverDay.value = 14;
        e.preventDefault();
    }
};
const tipStyle = computed(() => {
    if (hoverDay.value === null)
        return {};
    const leftPct = (x(hoverDay.value) / W.value) * 100;
    const flip = leftPct > 58;
    return {
        left: `${leftPct}%`,
        top: `${(PT / H.value) * 100}%`,
        transform: flip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
    };
});
let ro = null;
let io = null;
onMounted(() => {
    const el = plotEl.value;
    if (el) {
        width.value = el.clientWidth || 760;
        ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width;
            if (w)
                width.value = w;
        });
        ro.observe(el);
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !el) {
        drawn.value = true;
        return;
    }
    io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) {
            drawn.value = true;
            io?.disconnect();
        }
    }, { threshold: 0.3 });
    io.observe(el);
});
onBeforeUnmount(() => {
    ro?.disconnect();
    io?.disconnect();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(showTable, {});
    __VLS_withDotValue(hoverDay, {});
    __VLS_withDotValue(api, {});
    __VLS_withDotValue(compact, {});
    __VLS_withDotValue(sitemap, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['cov__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__svg']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__note']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__tip-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__tip-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__table']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__table']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__table']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__table']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__table']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__line--api']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cov" },
    });
    /** @type {__VLS_StyleScopedClasses['cov']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cov__top" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__top']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "cov__title" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "cov__sub" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__sub']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cov__legend" },
        'aria-label': "Series",
    });
    /** @type {__VLS_StyleScopedClasses['cov__legend']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "cov__key" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__key']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "cov__swatch cov__swatch--api" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['cov__swatch']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__swatch--api']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "cov__key" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__key']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "cov__swatch cov__swatch--map" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['cov__swatch']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__swatch--map']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (showTable.value = !showTable.value);
                // @ts-ignore
                [showTable, showTable,];
            } },
        type: "button",
        ...{ class: "cov__toggle" },
        'aria-pressed': (showTable.value),
    });
    /** @type {__VLS_StyleScopedClasses['cov__toggle']} */ ;
    (showTable.value ? 'Show chart' : 'Show as table');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cov__plot" },
        ref: "plotEl",
    });
    const __VLS_0 = __VLS_asFunctionalDirective(__VLS_directives.vShow, {});
    __VLS_0(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (!showTable.value), }, ...__VLS_directiveHookArgsRest(__VLS_0));
    /** @type {__VLS_StyleScopedClasses['cov__plot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ onPointermove: (__VLS_unwrap(onPointer, {})) },
        ...{ onPointerleave: (...[$event]) => {
                void $event;
                return (hoverDay.value = null);
                // @ts-ignore
                [showTable, showTable, showTable, onPointer, hoverDay,];
            } },
        ...{ onKeydown: (__VLS_unwrap(onKey, {})) },
        ...{ onFocus: (...[$event]) => {
                void $event;
                return (hoverDay.value = hoverDay.value ?? 2);
                // @ts-ignore
                [hoverDay, hoverDay, onKey,];
            } },
        ...{ onBlur: (...[$event]) => {
                void $event;
                return (hoverDay.value = null);
                // @ts-ignore
                [hoverDay,];
            } },
        viewBox: (`0 0 ${__VLS_unwrap(W, {})} ${__VLS_unwrap(H, {})}`),
        ...{ class: "cov__svg" },
        role: "img",
        'aria-label': "Line chart: with the Indexing API about 68% of URLs are indexed by day 2 and 87% by day 6; sitemap-only reaches 50% around day 7 and 80% by day 14.",
        tabindex: "0",
    });
    /** @type {__VLS_StyleScopedClasses['cov__svg']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.defs, __VLS_intrinsics.defs)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.linearGradient, __VLS_intrinsics.linearGradient)({
        id: "covApiFill",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
        offset: "0",
        'stop-color': "#2f6fdb",
        'stop-opacity': "0.16",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
        offset: "1",
        'stop-color': "#2f6fdb",
        'stop-opacity': "0.02",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.linearGradient, __VLS_intrinsics.linearGradient)({
        id: "covMapFill",
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
        offset: "0",
        'stop-color': "#b45309",
        'stop-opacity': "0.12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
        offset: "1",
        'stop-color': "#b45309",
        'stop-opacity': "0.01",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
        ...{ class: "cov__grid" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__grid']} */ ;
    const __VLS_1 = __VLS_tryAsConstant((__VLS_unwrap(yTicks, {})));
    for (const [t] of __VLS_vFor(__VLS_nonNull(__VLS_1))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            key: (t),
            x1: (__VLS_unwrap(PL, {})),
            x2: (__VLS_unwrap(W, {}) - __VLS_unwrap(PR, {})),
            y1: (__VLS_unwrap(y, {})(t)),
            y2: (__VLS_unwrap(y, {})(t)),
        });
        // @ts-ignore
        [W, W, H, yTicks, PL, PR, y, y,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
        ...{ class: "cov__axis-text" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__axis-text']} */ ;
    const __VLS_2 = __VLS_tryAsConstant((__VLS_unwrap(yTicks, {})));
    for (const [t] of __VLS_vFor(__VLS_nonNull(__VLS_2))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
            key: ('y' + t),
            x: (__VLS_unwrap(PL, {}) - 8),
            y: (__VLS_unwrap(y, {})(t) + 4),
            'text-anchor': "end",
        });
        (t);
        // @ts-ignore
        [yTicks, PL, y,];
    }
    const __VLS_3 = __VLS_tryAsConstant((__VLS_unwrap(xTicks, {})));
    for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_3))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
            key: ('x' + d),
            x: (__VLS_unwrap(x, {})(d)),
            y: (__VLS_unwrap(H, {}) - 10),
            'text-anchor': "middle",
        });
        (d === 0 ? 'Publish' : 'Day ' + d);
        // @ts-ignore
        [H, xTicks, x,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: (__VLS_unwrap(areaPath, {})(sitemap.value)),
        fill: "url(#covMapFill)",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: (__VLS_unwrap(areaPath, {})(api.value)),
        fill: "url(#covApiFill)",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: (__VLS_unwrap(linePath, {})(sitemap.value)),
        ...{ class: "cov__line cov__line--map" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__line']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__line--map']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: (__VLS_unwrap(linePath, {})(api.value)),
        ...{ class: "cov__line cov__line--api" },
        ...{ style: (__VLS_unwrap(apiLineStyle, {})) },
    });
    /** @type {__VLS_StyleScopedClasses['cov__line']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__line--api']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
        ...{ class: "cov__note" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__note']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: (__VLS_unwrap(x, {})(2)),
        x2: (__VLS_unwrap(x, {})(2)),
        y1: (__VLS_unwrap(y, {})(api.value[2])),
        y2: (__VLS_unwrap(y, {})(api.value[2]) - 34),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: (__VLS_unwrap(x, {})(2)),
        cy: (__VLS_unwrap(y, {})(api.value[2])),
        r: "4",
        ...{ class: "cov__dot cov__dot--api" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__dot--api']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
        x: (__VLS_unwrap(x, {})(2) + 6),
        y: (__VLS_unwrap(y, {})(api.value[2]) - 38),
    });
    (compact.value ? '68% by day 2' : '68% indexed by day 2');
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: (__VLS_unwrap(x, {})(14)),
        cy: (__VLS_unwrap(y, {})(api.value[14])),
        r: "4",
        ...{ class: "cov__dot cov__dot--api" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__dot--api']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: (__VLS_unwrap(x, {})(14)),
        cy: (__VLS_unwrap(y, {})(sitemap.value[14])),
        r: "4",
        ...{ class: "cov__dot cov__dot--map" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['cov__dot--map']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
        x: (__VLS_unwrap(x, {})(14) + 10),
        y: (__VLS_unwrap(y, {})(api.value[14]) + 4),
        ...{ class: "cov__end" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__end']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.tspan, __VLS_intrinsics.tspan)({
        ...{ class: "cov__end-val" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__end-val']} */ ;
    if (!compact.value) {
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
        x: (__VLS_unwrap(x, {})(14) + 10),
        y: (__VLS_unwrap(y, {})(sitemap.value[14]) + 4),
        ...{ class: "cov__end" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__end']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.tspan, __VLS_intrinsics.tspan)({
        ...{ class: "cov__end-val" },
    });
    /** @type {__VLS_StyleScopedClasses['cov__end-val']} */ ;
    if (!compact.value) {
    }
    if (hoverDay.value !== null) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.g, __VLS_intrinsics.g)({
            ...{ class: "cov__hover" },
        });
        /** @type {__VLS_StyleScopedClasses['cov__hover']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: (__VLS_unwrap(x, {})(hoverDay.value)),
            x2: (__VLS_unwrap(x, {})(hoverDay.value)),
            y1: (__VLS_unwrap(PT, {})),
            y2: (__VLS_unwrap(H, {}) - __VLS_unwrap(PB, {})),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: (__VLS_unwrap(x, {})(hoverDay.value)),
            cy: (__VLS_unwrap(y, {})(sitemap.value[hoverDay.value])),
            r: "5",
            ...{ class: "cov__dot cov__dot--map" },
        });
        /** @type {__VLS_StyleScopedClasses['cov__dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['cov__dot--map']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: (__VLS_unwrap(x, {})(hoverDay.value)),
            cy: (__VLS_unwrap(y, {})(api.value[hoverDay.value])),
            r: "5",
            ...{ class: "cov__dot cov__dot--api" },
        });
        /** @type {__VLS_StyleScopedClasses['cov__dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['cov__dot--api']} */ ;
    }
    if (hoverDay.value !== null) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cov__tip" },
            ...{ style: (__VLS_unwrap(tipStyle, {})) },
            role: "status",
            'aria-live': "polite",
        });
        /** @type {__VLS_StyleScopedClasses['cov__tip']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "cov__tip-head" },
        });
        /** @type {__VLS_StyleScopedClasses['cov__tip-head']} */ ;
        (hoverDay.value === 0 ? 'At publish' : `Day ${hoverDay.value}`);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "cov__tip-row" },
        });
        /** @type {__VLS_StyleScopedClasses['cov__tip-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "cov__swatch cov__swatch--api" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['cov__swatch']} */ ;
        /** @type {__VLS_StyleScopedClasses['cov__swatch--api']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (api.value[hoverDay.value]);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "cov__tip-row" },
        });
        /** @type {__VLS_StyleScopedClasses['cov__tip-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "cov__swatch cov__swatch--map" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['cov__swatch']} */ ;
        /** @type {__VLS_StyleScopedClasses['cov__swatch--map']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (sitemap.value[hoverDay.value]);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    if (showTable.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cov__table-wrap" },
        });
        /** @type {__VLS_StyleScopedClasses['cov__table-wrap']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
            ...{ class: "cov__table" },
        });
        /** @type {__VLS_StyleScopedClasses['cov__table']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.caption, __VLS_intrinsics.caption)({
            ...{ class: "sr-only" },
        });
        /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            scope: "col",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            scope: "col",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            scope: "col",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
        const __VLS_4 = __VLS_tryAsConstant((__VLS_unwrap(days, {})));
        for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_4))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                key: (d),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
                scope: "row",
            });
            (d);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (api.value[d]);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            (sitemap.value[d]);
            // @ts-ignore
            [showTable, hoverDay, hoverDay, hoverDay, hoverDay, hoverDay, hoverDay, hoverDay, hoverDay, hoverDay, hoverDay, hoverDay, hoverDay, H, y, y, y, y, y, y, y, y, y, y, x, x, x, x, x, x, x, x, x, x, x, x, areaPath, areaPath, sitemap, sitemap, sitemap, sitemap, sitemap, sitemap, sitemap, api, api, api, api, api, api, api, api, api, api, api, linePath, linePath, apiLineStyle, compact, compact, compact, PT, PB, tipStyle, days,];
        }
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

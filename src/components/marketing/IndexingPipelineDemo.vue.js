/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
const stages = [
    { key: 'queued', label: 'Queued' },
    { key: 'crawled', label: 'Crawled' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'indexed', label: 'Indexed' },
];
const urls = reactive([
    { path: '/collections/new-arrivals', state: 'queued' },
    { path: '/products/trail-runner-v2', state: 'queued' },
    { path: '/blog/sizing-guide-2026', state: 'queued' },
    { path: '/products/merino-base-layer', state: 'queued' },
    { path: '/pages/shipping-returns', state: 'queued' },
]);
const order = ['queued', 'crawling', 'crawled', 'submitted', 'indexed'];
/** Scripted timeline: [tick, url index, state]. Staggered so several rows move at once. */
const script = [
    [1, 0, 'crawling'], [2, 1, 'crawling'], [3, 0, 'crawled'], [4, 2, 'crawling'],
    [5, 1, 'crawled'], [5, 0, 'submitted'], [7, 3, 'crawling'], [7, 2, 'crawled'],
    [8, 1, 'submitted'], [9, 4, 'crawling'], [10, 3, 'crawled'], [10, 2, 'submitted'],
    [11, 0, 'indexed'], [12, 4, 'crawled'], [13, 3, 'submitted'], [14, 1, 'indexed'],
    [15, 4, 'submitted'], [16, 2, 'indexed'], [18, 3, 'indexed'], [20, 4, 'indexed'],
];
const lastTick = script[script.length - 1][0];
const tick = ref(0);
let timer = null;
let reduced = false;
const counts = computed(() => {
    const c = { queued: 0, crawled: 0, submitted: 0, indexed: 0 };
    for (const u of urls) {
        if (u.state === 'queued' || u.state === 'crawling')
            c.queued++;
        else if (u.state === 'crawled')
            c.crawled++;
        else if (u.state === 'submitted')
            c.submitted++;
        else
            c.indexed++;
    }
    return c;
});
const percent = computed(() => {
    const max = urls.length * (order.length - 1);
    const score = urls.reduce((acc, u) => acc + order.indexOf(u.state), 0);
    return Math.round((score / max) * 100);
});
const done = computed(() => urls.every((u) => u.state === 'indexed'));
const stageLabel = computed(() => {
    if (urls.some((u) => u.state === 'crawling'))
        return 'Crawling pages in a headless browser';
    if (urls.some((u) => u.state === 'submitted'))
        return 'Waiting for Google to confirm';
    if (urls.some((u) => u.state === 'crawled'))
        return 'Submitting to the Indexing API';
    return 'Queued for the next run';
});
const chipLabel = (s) => {
    switch (s) {
        case 'crawling': return 'Crawling';
        case 'crawled': return 'Crawled';
        case 'submitted': return 'Notify accepted';
        case 'indexed': return 'Indexed';
        default: return 'Queued';
    }
};
const applyTick = (t) => {
    for (const [at, i, state] of script) {
        if (at === t)
            urls[i].state = state;
    }
};
const reset = () => {
    for (const u of urls)
        u.state = 'queued';
    tick.value = 0;
};
const step = () => {
    tick.value += 1;
    applyTick(tick.value);
    if (tick.value >= lastTick + 6)
        reset();
};
onMounted(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
        // Static, finished state for readers who opt out of motion.
        for (let t = 1; t <= lastTick; t++)
            applyTick(t);
        return;
    }
    timer = window.setInterval(step, 650);
});
onBeforeUnmount(() => {
    if (timer)
        window.clearInterval(timer);
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(urls, {});
    __VLS_withDotValue(done, {});
    __VLS_withDotValue(counts, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['pipe__live--done']} */ ;
    /** @type {__VLS_StyleScopedClasses['pipe__live-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['pipe__chip']} */ ;
    /** @type {__VLS_StyleScopedClasses['pipe__live-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['pipe__spin']} */ ;
    /** @type {__VLS_StyleScopedClasses['pipe__bar-fill']} */ ;
    /** @type {__VLS_StyleScopedClasses['pipe']} */ ;
    /** @type {__VLS_StyleScopedClasses['pipe__stages']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pipe" },
        role: "group",
        'aria-label': "Example indexing run",
    });
    /** @type {__VLS_StyleScopedClasses['pipe']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pipe__head" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pipe__site" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__site']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pipe__favicon" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['pipe__favicon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "pipe__site-name" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__site-name']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "pipe__site-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__site-meta']} */ ;
    (urls.value.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pipe__live" },
        ...{ class: ({ 'pipe__live--done': done.value }) },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__live']} */ ;
    /** @type {__VLS_StyleScopedClasses['pipe__live--done']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pipe__live-dot" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['pipe__live-dot']} */ ;
    (done.value ? 'Run complete' : 'Running');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pipe__progress" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__progress']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pipe__progress-row" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__progress-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pipe__progress-label" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__progress-label']} */ ;
    (done.value ? 'All URLs processed' : __VLS_unwrap(stageLabel, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pipe__progress-pct" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__progress-pct']} */ ;
    (__VLS_unwrap(percent, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pipe__bar" },
        role: "progressbar",
        'aria-valuenow': (__VLS_unwrap(percent, {})),
        'aria-valuemin': "0",
        'aria-valuemax': "100",
    });
    /** @type {__VLS_StyleScopedClasses['pipe__bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pipe__bar-fill" },
        ...{ style: ({ width: __VLS_unwrap(percent, {}) + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__bar-fill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ol, __VLS_intrinsics.ol)({
        ...{ class: "pipe__stages" },
        'aria-label': "Pipeline stages",
    });
    /** @type {__VLS_StyleScopedClasses['pipe__stages']} */ ;
    const __VLS_0 = __VLS_tryAsConstant((__VLS_unwrap(stages, {})));
    for (const [s] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (s.key),
            ...{ class: "pipe__stage" },
            ...{ class: ({ 'pipe__stage--active': (counts.value[s.key] ?? 0) > 0 }) },
        });
        /** @type {__VLS_StyleScopedClasses['pipe__stage']} */ ;
        /** @type {__VLS_StyleScopedClasses['pipe__stage--active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pipe__stage-count" },
        });
        /** @type {__VLS_StyleScopedClasses['pipe__stage-count']} */ ;
        (counts.value[s.key] ?? 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pipe__stage-name" },
        });
        /** @type {__VLS_StyleScopedClasses['pipe__stage-name']} */ ;
        (s.label);
        // @ts-ignore
        [urls, done, done, done, stageLabel, percent, percent, percent, stages, counts, counts,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "pipe__urls" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__urls']} */ ;
    const __VLS_1 = __VLS_tryAsConstant((urls.value));
    for (const [u] of __VLS_vFor(__VLS_nonNull(__VLS_1))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (u.path),
            ...{ class: "pipe__url" },
        });
        /** @type {__VLS_StyleScopedClasses['pipe__url']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pipe__url-path" },
        });
        /** @type {__VLS_StyleScopedClasses['pipe__url-path']} */ ;
        (u.path);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pipe__chip" },
            ...{ class: (`pipe__chip--${u.state}`) },
        });
        /** @type {__VLS_StyleScopedClasses['pipe__chip']} */ ;
        if (u.state === 'indexed') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                viewBox: "0 0 16 16",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M3.5 8.5l3 3 6-7",
            });
        }
        else if (u.state === 'submitted') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                viewBox: "0 0 16 16",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M3 8h9M9 4.5L12.5 8 9 11.5",
            });
        }
        else if (u.state === 'crawled') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                viewBox: "0 0 16 16",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                cx: "7",
                cy: "7",
                r: "4",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M10 10l3 3",
            });
        }
        else if (u.state === 'crawling') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                ...{ class: "pipe__spin" },
                viewBox: "0 0 16 16",
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['pipe__spin']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M8 2.5a5.5 5.5 0 1 1-5.2 3.7",
            });
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                viewBox: "0 0 16 16",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                cx: "8",
                cy: "8",
                r: "5.5",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M8 5v3l2 1.5",
            });
        }
        (__VLS_unwrap(chipLabel, {})(u.state));
        // @ts-ignore
        [urls, chipLabel,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "pipe__foot" },
    });
    /** @type {__VLS_StyleScopedClasses['pipe__foot']} */ ;
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

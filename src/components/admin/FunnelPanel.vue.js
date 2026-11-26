/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, ref } from 'vue';
import api from '../../api';
const days = ref(30);
const data = ref(null);
const error = ref('');
const top = computed(() => Math.max(1, data.value?.steps[0]?.count ?? 1));
const barWidth = (n) => `${n === 0 ? 0 : Math.max(1.5, (100 * n) / top.value)}%`;
const totalSignups = computed(() => data.value?.daily.reduce((a, d) => a + d.signups, 0) ?? 0);
const maxSignups = computed(() => Math.max(1, ...(data.value?.daily.map(d => d.signups) ?? [1])));
const maxChecks = computed(() => Math.max(1, ...(data.value?.daily.map(d => d.toolChecks) ?? [1])));
const miniHeight = (n, max) => (n === 0 ? '0px' : `${Math.max(6, (100 * n) / max)}%`);
async function load(d = days.value) {
    days.value = d;
    error.value = '';
    try {
        const res = await api.get('/admin/funnel', { params: { days: d } });
        data.value = res.data?.data ?? null;
    }
    catch {
        error.value = 'Could not load the funnel.';
    }
}
onMounted(() => load());
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(days, {});
    __VLS_withDotValue(error, {});
    __VLS_withDotValue(data, {});
    __VLS_withDotValue(totalSignups, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['range']} */ ;
    /** @type {__VLS_StyleScopedClasses['range']} */ ;
    /** @type {__VLS_StyleScopedClasses['mini']} */ ;
    /** @type {__VLS_StyleScopedClasses['mini']} */ ;
    /** @type {__VLS_StyleScopedClasses['mini__bar']} */ ;
    /** @type {__VLS_StyleScopedClasses['step']} */ ;
    /** @type {__VLS_StyleScopedClasses['step__track']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel funnel" },
    });
    /** @type {__VLS_StyleScopedClasses['panel']} */ ;
    /** @type {__VLS_StyleScopedClasses['funnel']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "range" },
        role: "group",
        'aria-label': "Period",
    });
    /** @type {__VLS_StyleScopedClasses['range']} */ ;
    const __VLS_0 = __VLS_tryAsConstant(([7, 30, 90]));
    for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    return (load(d));
                } },
            key: (d),
            type: "button",
            ...{ class: ({ active: days.value === d }) },
        });
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        (d);
        // @ts-ignore
        [days,];
    }
    if (error.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__empty" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__empty']} */ ;
        (error.value);
    }
    else if (data.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__body" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.ol, __VLS_intrinsics.ol)({
            ...{ class: "steps" },
        });
        /** @type {__VLS_StyleScopedClasses['steps']} */ ;
        const __VLS_1 = __VLS_tryAsConstant((data.value.steps));
        for (const [s, i] of __VLS_vFor(__VLS_nonNull(__VLS_1))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (s.key),
                ...{ class: "step" },
                title: (`${s.label}: ${s.count} (${s.percentOfSignups}% of signups)`),
            });
            /** @type {__VLS_StyleScopedClasses['step']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "step__label" },
            });
            /** @type {__VLS_StyleScopedClasses['step__label']} */ ;
            (s.label);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "step__track" },
            });
            /** @type {__VLS_StyleScopedClasses['step__track']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "step__bar" },
                ...{ style: ({ width: __VLS_unwrap(barWidth, {})(s.count) }) },
            });
            /** @type {__VLS_StyleScopedClasses['step__bar']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "step__value" },
            });
            /** @type {__VLS_StyleScopedClasses['step__value']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (s.count.toLocaleString());
            if (i > 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "step__pct" },
                });
                /** @type {__VLS_StyleScopedClasses['step__pct']} */ ;
                (s.percentOfSignups);
            }
            // @ts-ignore
            [error, error, data, data, barWidth,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "daily" },
        });
        /** @type {__VLS_StyleScopedClasses['daily']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.figure, __VLS_intrinsics.figure)({
            ...{ class: "mini" },
        });
        /** @type {__VLS_StyleScopedClasses['mini']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.figcaption, __VLS_intrinsics.figcaption)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (totalSignups.value.toLocaleString());
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mini__bars" },
            role: "img",
            'aria-label': (`Signups per day, ${totalSignups.value} in total`),
        });
        /** @type {__VLS_StyleScopedClasses['mini__bars']} */ ;
        const __VLS_2 = __VLS_tryAsConstant((data.value.daily));
        for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_2))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: ('s' + d.date),
                ...{ class: "mini__bar" },
                ...{ style: ({ height: __VLS_unwrap(miniHeight, {})(d.signups, __VLS_unwrap(maxSignups, {})) }) },
                title: (`${d.date}: ${d.signups} signup${d.signups === 1 ? '' : 's'}`),
            });
            /** @type {__VLS_StyleScopedClasses['mini__bar']} */ ;
            // @ts-ignore
            [data, totalSignups, totalSignups, miniHeight, maxSignups,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.figure, __VLS_intrinsics.figure)({
            ...{ class: "mini" },
        });
        /** @type {__VLS_StyleScopedClasses['mini']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.figcaption, __VLS_intrinsics.figcaption)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (data.value.toolChecks.total.toLocaleString());
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mini__bars" },
            role: "img",
            'aria-label': (`Checker runs per day, ${data.value.toolChecks.total} in total`),
        });
        /** @type {__VLS_StyleScopedClasses['mini__bars']} */ ;
        const __VLS_3 = __VLS_tryAsConstant((data.value.daily));
        for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_3))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: ('c' + d.date),
                ...{ class: "mini__bar" },
                ...{ style: ({ height: __VLS_unwrap(miniHeight, {})(d.toolChecks, __VLS_unwrap(maxChecks, {})) }) },
                title: (`${d.date}: ${d.toolChecks} check${d.toolChecks === 1 ? '' : 's'}`),
            });
            /** @type {__VLS_StyleScopedClasses['mini__bar']} */ ;
            // @ts-ignore
            [data, data, data, miniHeight, maxChecks,];
        }
        if (data.value.toolChecks.total) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "mini__note" },
            });
            /** @type {__VLS_StyleScopedClasses['mini__note']} */ ;
            (data.value.toolChecks.indexable);
            (data.value.toolChecks.issues);
            (data.value.toolChecks.blocked);
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "panel__empty" },
        });
        /** @type {__VLS_StyleScopedClasses['panel__empty']} */ ;
    }
    // @ts-ignore
    [data, data, data, data,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

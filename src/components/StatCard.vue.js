/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const { defineProps, } = {};
const __VLS_props = defineProps();
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    void {};
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-meta']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-meta']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-meta']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-card" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-icon" },
        ...{ style: ({ background: __VLS_ctx.iconBg }) },
    });
    /** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
    if (__VLS_ctx.iconType === 'users') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M22 21v-2a4 4 0 0 0-3-3.87",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M16 3.13a4 4 0 0 1 0 7.75",
        });
    }
    else if (__VLS_ctx.iconType === 'building') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "12",
            cy: "12",
            r: "9",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M3 12h18",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M12 3a14 14 0 0 1 0 18",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M12 3a14 14 0 0 0 0 18",
        });
    }
    else if (__VLS_ctx.iconType === 'trending') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M22 7 13.5 15.5 8.5 10.5 2 17",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M16 7h6v6",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M3 12h4l3-8 4 16 3-8h4",
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-content" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    (__VLS_ctx.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-value" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
    (__VLS_ctx.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-meta" },
        ...{ class: (__VLS_ctx.metaClass) },
    });
    /** @type {__VLS_StyleScopedClasses['stat-meta']} */ ;
    (__VLS_ctx.meta);
    // @ts-ignore
    [iconBg, iconType, iconType, iconType, label, value, metaClass, meta,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};

/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useMenuStore } from '../Store/menu';
const SECTION_META = {
    GoogleConfiguration: {
        title: 'Google Configuration',
        desc: 'Service account credentials for Google Search Console and the Indexing API.',
        icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
      </svg>`
    },
    GoogleKeys: {
        title: 'Google OAuth',
        desc: 'OAuth client credentials used for user sign-in.',
        icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>`
    },
    StripeKeys: {
        title: 'Stripe',
        desc: 'API keys and webhook secret for payment processing.',
        icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>`
    },
    EmailSettings: {
        title: 'Email (SMTP)',
        desc: 'Outbound mail server used for confirmations and transactional email.',
        icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M22 8l-10 7L2 8"/>
      </svg>`
    }
};
const SECTION_ORDER = [
    'GoogleConfiguration',
    'GoogleKeys',
    'StripeKeys',
    'EmailSettings'
];
const menuStore = useMenuStore();
const flatMenus = computed(() => {
    const flat = [];
    const walk = (items) => {
        for (const item of items || []) {
            flat.push(item);
            if (item.children?.length)
                walk(item.children);
        }
    };
    walk(menuStore.menus);
    return flat;
});
const sections = computed(() => {
    const items = [];
    for (const compName of SECTION_ORDER) {
        const meta = SECTION_META[compName];
        if (!meta)
            continue;
        const menu = flatMenus.value.find(m => m.component === compName);
        if (!menu?.path)
            continue;
        items.push({
            component: compName,
            path: menu.path,
            title: meta.title,
            desc: meta.desc,
            icon: meta.icon
        });
    }
    return items;
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(sections, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['settings-overview__header']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-overview__card']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-overview__card']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-overview__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['settings-overview__arrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "settings-overview" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-overview']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "settings-overview__header" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-overview__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "settings-overview__desc" },
    });
    /** @type {__VLS_StyleScopedClasses['settings-overview__desc']} */ ;
    if (sections.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "settings-overview__grid" },
        });
        /** @type {__VLS_StyleScopedClasses['settings-overview__grid']} */ ;
        const __VLS_0 = __VLS_tryAsConstant((sections.value));
        for (const [s] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
            let __VLS_1;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_2 = __VLS_asFunctionalComponent1(__VLS_1, new __VLS_1({
                // @ts-ignore
                key: (s.path), to: (s.path), ...{ class: "settings-overview__card" },
            }));
            const __VLS_3 = __VLS_2({
                key: (s.path),
                to: (s.path),
                ...{ class: "settings-overview__card" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_2));
            /** @type {__VLS_StyleScopedClasses['settings-overview__card']} */ ;
            var __VLS_4;
            const { default: __VLS_6 } = __VLS_nonNull(__VLS_4.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "settings-overview__icon" },
                'aria-hidden': "true",
            });
            const __VLS_7 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
            __VLS_7(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (s.icon), }, ...__VLS_directiveHookArgsRest(__VLS_7));
            /** @type {__VLS_StyleScopedClasses['settings-overview__icon']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "settings-overview__copy" },
            });
            /** @type {__VLS_StyleScopedClasses['settings-overview__copy']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "settings-overview__title" },
            });
            /** @type {__VLS_StyleScopedClasses['settings-overview__title']} */ ;
            (s.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "settings-overview__sub" },
            });
            /** @type {__VLS_StyleScopedClasses['settings-overview__sub']} */ ;
            (s.desc);
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                ...{ class: "settings-overview__arrow" },
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "1.75",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['settings-overview__arrow']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                x1: "5",
                y1: "12",
                x2: "19",
                y2: "12",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                points: "12 5 19 12 12 19",
            });
            // @ts-ignore
            [sections, sections,];
            // @ts-ignore
            [];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "settings-overview__empty" },
        });
        /** @type {__VLS_StyleScopedClasses['settings-overview__empty']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

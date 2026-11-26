/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const svg = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const items = [
    {
        title: 'Automatic retries with backoff',
        body: 'Page fetches retry three times with exponential backoff, and every background job gets three attempts before it is marked failed with a reason you can read.',
        tag: 'No silent drops',
        icon: svg('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'),
    },
    {
        title: 'Locked, non-overlapping runs',
        body: 'A site that is already crawling cannot be queued twice. Each run holds a lock until it completes, so parallel schedules never collide or double-submit.',
        tag: 'Safe concurrency',
        icon: svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
    },
    {
        title: 'Quota-aware queue',
        body: 'Google allows 200 Indexing API requests per project per day. We track usage against Google\'s Pacific-time reset, warn you before you hit it, and hold the rest for the next window.',
        tag: '200/day, handled',
        icon: svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    },
    {
        title: 'Live progress streams',
        body: 'Crawls, bulk submissions and status syncs stream progress to your dashboard as they happen, with automatic reconnect if the connection drops.',
        tag: 'Real time',
        icon: svg('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'),
    },
    {
        title: 'Verified against Google',
        body: '"Indexed" means Google says so. Status sync pulls coverage and indexing state per URL from Google\'s URL Inspection, not from a guess.',
        tag: 'Source of truth',
        icon: svg('<path d="M9 12l2 2 4-4"/><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6z"/>'),
    },
    {
        title: 'Real-browser, robots-aware crawling',
        body: 'Pages render in a headless Chromium so JavaScript-driven sites are read correctly. Sitemaps are parsed and robots.txt rules are respected on every crawl.',
        tag: 'Playwright',
        icon: svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
    },
];
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    void {};
    /** @type {__VLS_StyleScopedClasses['rel__header']} */ ;
    /** @type {__VLS_StyleScopedClasses['rel__header']} */ ;
    /** @type {__VLS_StyleScopedClasses['rel__card']} */ ;
    /** @type {__VLS_StyleScopedClasses['rel__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['rel__card']} */ ;
    /** @type {__VLS_StyleScopedClasses['rel__card']} */ ;
    /** @type {__VLS_StyleScopedClasses['rel__grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['rel__grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['rel__card']} */ ;
    /** @type {__VLS_StyleScopedClasses['rel__card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        id: "reliability",
        ...{ class: "rel" },
    });
    /** @type {__VLS_StyleScopedClasses['rel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rel__header" },
    });
    /** @type {__VLS_StyleScopedClasses['rel__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "rel__eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['rel__eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rel__grid" },
    });
    /** @type {__VLS_StyleScopedClasses['rel__grid']} */ ;
    const __VLS_0 = __VLS_tryAsConstant((__VLS_unwrap(items, {})));
    for (const [item] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (item.title),
            ...{ class: "rel__card" },
        });
        /** @type {__VLS_StyleScopedClasses['rel__card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "rel__icon" },
            'aria-hidden': "true",
        });
        const __VLS_1 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
        __VLS_1(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (item.icon), }, ...__VLS_directiveHookArgsRest(__VLS_1));
        /** @type {__VLS_StyleScopedClasses['rel__icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        (item.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (item.body);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "rel__tag" },
        });
        /** @type {__VLS_StyleScopedClasses['rel__tag']} */ ;
        (item.tag);
        // @ts-ignore
        [items,];
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

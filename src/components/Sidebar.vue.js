/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useMenuStore } from "../Store/menu";
const { defineProps, defineEmits, } = {};
const props = defineProps({
    collapsed: Boolean
});
const emit = defineEmits();
const route = useRoute();
const menuStore = useMenuStore();
/** Matches configuration pages; backend often persists ShowInMenu = false — still surface in sidebar when role allows. */
const SETTINGS_MENU_COMPONENTS = new Set([
    'Settings',
    'Configurations',
    'GoogleConfiguration',
    'ScheduleConfiguration',
    'GoogleKeys',
    'StripeKeys',
    'EmailSettings',
]);
const openMenus = ref([]);
/** Stable ordering for API / persisted menu trees */
const sortMenus = (items) => [...items]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => ({
    ...m,
    children: m.children?.length ? sortMenus(m.children) : undefined,
}));
const visibleMenus = computed(() => {
    const raw = menuStore.menus?.length > 0
        ? menuStore.menus
        : loadMenusFromLegacyStorage();
    return sortMenus(raw).filter((m) => {
        if (m.showInMenu !== false)
            return true;
        if (Array.isArray(m.children) && m.children.length > 0) {
            const walkChildren = (items) => items.some((c) => SETTINGS_MENU_COMPONENTS.has(c.component || '') ||
                (c.children?.length ? walkChildren(c.children) : false));
            return walkChildren(m.children);
        }
        return SETTINGS_MENU_COMPONENTS.has(m.component || '');
    });
});
function loadMenusFromLegacyStorage() {
    try {
        const menuData = localStorage.getItem("menu");
        if (!menuData)
            return [];
        const parsed = JSON.parse(menuData);
        return parsed.menus || [];
    }
    catch {
        return [];
    }
}
onMounted(() => {
    if (!menuStore.loaded || menuStore.menus.length === 0) {
        const legacy = loadMenusFromLegacyStorage();
        if (legacy.length)
            menuStore.setMenus(sortMenus(legacy));
    }
    syncOpenMenusForRoute(route.path);
});
const pathMatches = (current, itemPath) => {
    if (!itemPath)
        return false;
    if (current === itemPath)
        return true;
    /* Section roots: highlight parent when drilling into nested routes */
    if (itemPath !== "/" && current.startsWith(itemPath + "/"))
        return true;
    return false;
};
const syncOpenMenusForRoute = (currentPath) => {
    const next = new Set();
    for (const m of visibleMenus.value) {
        if (!m.children?.length)
            continue;
        const hit = m.children.some((c) => pathMatches(currentPath, c.path || ""));
        if (hit)
            next.add(m.id);
    }
    openMenus.value = [...next];
};
watch(() => route.path, (p) => syncOpenMenusForRoute(p));
const hasActiveChild = (menu) => !!menu.children?.some((c) => pathMatches(route.path, c.path || ""));
const toggleSubmenu = (id) => {
    if (openMenus.value.includes(id)) {
        openMenus.value = openMenus.value.filter((mid) => mid !== id);
    }
    else {
        openMenus.value.push(id);
    }
};
const expandFromCollapsedGroup = async (id) => {
    emit("update:collapsed", false);
    await nextTick();
    if (!openMenus.value.includes(id))
        openMenus.value.push(id);
};
const toggleRail = () => {
    emit("update:collapsed", !props.collapsed);
};
/* =========================================================================
   Icon system
   ---------------------------------------------------------------------------
   Source data may store legacy emoji glyphs in `menu.icon` or `menu.title`.
   We render uniform Lucide-style SVGs by mapping on a normalized title/path.
   No data is mutated; this is presentation-only.
   ========================================================================= */
const SVG_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';
const ICONS = {
    dashboard: `<svg ${SVG_ATTRS}><rect width="7" height="9" x="3" y="3" rx="1.5"/>` +
        `<rect width="7" height="5" x="14" y="3" rx="1.5"/>` +
        `<rect width="7" height="9" x="14" y="12" rx="1.5"/>` +
        `<rect width="7" height="5" x="3" y="16" rx="1.5"/></svg>`,
    sites: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/>` +
        `<path d="M3 12h18"/>` +
        `<path d="M12 3a14 14 0 0 1 0 18"/>` +
        `<path d="M12 3a14 14 0 0 0 0 18"/></svg>`,
    crawl: `<svg ${SVG_ATTRS}><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>`,
    subscriptions: `<svg ${SVG_ATTRS}><rect width="20" height="14" x="2" y="5" rx="2"/>` +
        `<path d="M2 10h20"/>` +
        `<path d="M6 15h2"/></svg>`,
    settings: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="3"/>` +
        `<path d="M19.4 15a1.7 1.7 0 0 0 .35 1.86l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.86-.35 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.86.35l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .35-1.86 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.04 1.7 1.7 0 0 0-.35-1.86l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.86.35h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56h.01a1.7 1.7 0 0 0 1.86-.35l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.35 1.86v.01A1.7 1.7 0 0 0 20.91 10H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/></svg>`,
    users: `<svg ${SVG_ATTRS}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>` +
        `<circle cx="9" cy="7" r="4"/>` +
        `<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>` +
        `<path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    plans: `<svg ${SVG_ATTRS}><path d="m7.5 4.27 9 5.15"/>` +
        `<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>` +
        `<path d="M3.3 7 12 12l8.7-5"/>` +
        `<path d="M12 22V12"/></svg>`,
    google: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/>` +
        `<path d="M21 12c0-2-1-3-1-3h-9v3h5.5c-.5 2-2 3-5.5 3a5 5 0 1 1 0-10c1.5 0 2.7.5 3.7 1.4"/></svg>`,
    stripe: `<svg ${SVG_ATTRS}><path d="M14 7a3 3 0 0 0-3-3H8a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8a3 3 0 0 1-3-3"/>` +
        `<path d="M9 4v16"/></svg>`,
    schedule: `<svg ${SVG_ATTRS}><rect width="18" height="16" x="3" y="5" rx="2"/>` +
        `<path d="M3 9h18"/>` +
        `<path d="M8 3v4"/>` +
        `<path d="M16 3v4"/></svg>`,
    notifications: `<svg ${SVG_ATTRS}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>` +
        `<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
    fallback: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="2.25"/></svg>`
};
const stripEmoji = (s) => (s || "")
    .replace(/([\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u26FF\u2300-\u23FF\u2B00-\u2BFF\u200D\uFE0F])+/g, "")
    .trim();
const cleanTitle = (s) => stripEmoji(s);
const iconKey = (m) => {
    const t = stripEmoji(m?.title || "").toLowerCase();
    const p = (m?.path || m?.component || "").toLowerCase();
    const blob = `${t} ${p}`;
    if (/dashboard|overview|home/.test(blob))
        return "dashboard";
    if (/google.*config|google.*key|google.*credentials/.test(blob))
        return "google";
    if (/stripe/.test(blob))
        return "stripe";
    if (/smtp|mailto/.test(blob))
        return "settings";
    if (/schedule/.test(blob))
        return "schedule";
    if (/notification/.test(blob))
        return "notifications";
    if (/plan/.test(blob))
        return "plans";
    if (/subscription|billing|payment/.test(blob))
        return "subscriptions";
    if (/setting|configuration|config/.test(blob))
        return "settings";
    if (/user|member|account/.test(blob))
        return "users";
    if (/crawl|index|queue/.test(blob))
        return "crawl";
    if (/site|domain|web/.test(blob))
        return "sites";
    return "fallback";
};
const iconFor = (m) => ICONS[iconKey(m)] ?? ICONS.fallback;
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(openMenus, {});
    __VLS_withDotValue(visibleMenus, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    /** @type {__VLS_StyleScopedClasses['brand']} */ ;
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    /** @type {__VLS_StyleScopedClasses['brand-mark']} */ ;
    /** @type {__VLS_StyleScopedClasses['logo-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['rail-toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['rail-toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    /** @type {__VLS_StyleScopedClasses['rail-toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu']} */ ;
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-expand-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-trigger']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-meta-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-trigger']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-meta-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-trigger']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-open']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-meta-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-trigger']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-open']} */ ;
    /** @type {__VLS_StyleScopedClasses['submenu']} */ ;
    /** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active-sub']} */ ;
    /** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active-sub']} */ ;
    /** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['submenu-bullet']} */ ;
    /** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active-sub']} */ ;
    /** @type {__VLS_StyleScopedClasses['submenu-bullet']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-trigger']} */ ;
    /** @type {__VLS_StyleScopedClasses['arrow']} */ ;
    /** @type {__VLS_StyleScopedClasses['arrow']} */ ;
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    /** @type {__VLS_StyleScopedClasses['help-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        ...{ class: "sidebar" },
        ...{ class: ({ collapsed: __VLS_ctx.collapsed }) },
    });
    /** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "brand" },
    });
    /** @type {__VLS_StyleScopedClasses['brand']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "brand-mark" },
    });
    /** @type {__VLS_StyleScopedClasses['brand-mark']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "logo-icon" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['logo-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
    });
    if (!__VLS_ctx.collapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "logo-copy" },
        });
        /** @type {__VLS_StyleScopedClasses['logo-copy']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "logo-text" },
        });
        /** @type {__VLS_StyleScopedClasses['logo-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "logo-subtext" },
        });
        /** @type {__VLS_StyleScopedClasses['logo-subtext']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(toggleRail, {})) },
        type: "button",
        ...{ class: "rail-toggle" },
        title: (__VLS_ctx.collapsed ? 'Expand sidebar' : 'Collapse sidebar'),
    });
    /** @type {__VLS_StyleScopedClasses['rail-toggle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    if (__VLS_ctx.collapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "m9 18 6-6-6-6",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "m15 18-6-6 6-6",
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        id: "app-sidebar-nav",
        ...{ class: "menu" },
        'aria-label': "Primary",
    });
    /** @type {__VLS_StyleScopedClasses['menu']} */ ;
    if (__VLS_ctx.collapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(toggleRail, {})) },
            type: "button",
            ...{ class: "menu-item menu-expand-item" },
            title: "Expand sidebar",
        });
        /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['menu-expand-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "menu-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "m9 18 6-6-6-6",
        });
    }
    if (!__VLS_ctx.collapsed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "menu-section-label" },
        });
        /** @type {__VLS_StyleScopedClasses['menu-section-label']} */ ;
    }
    const __VLS_0 = __VLS_tryAsConstant((visibleMenus.value));
    for (const [menu] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.template)({
            key: (menu.id),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "menu-row" },
        });
        /** @type {__VLS_StyleScopedClasses['menu-row']} */ ;
        if (menu.children && menu.children.length > 0 && !__VLS_ctx.collapsed) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "menu-group" },
            });
            /** @type {__VLS_StyleScopedClasses['menu-group']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(menu.children && menu.children.length > 0 && !__VLS_ctx.collapsed))
                            throw 0;
                        return (__VLS_unwrap(toggleSubmenu, {})(menu.id));
                        // @ts-ignore
                        [collapsed, collapsed, collapsed, collapsed, collapsed, collapsed, collapsed, toggleRail, toggleRail, visibleMenus, toggleSubmenu,];
                    } },
                type: "button",
                ...{ class: "menu-item menu-trigger" },
                ...{ class: ({ 'is-open': openMenus.value.includes(menu.id), active: __VLS_unwrap(hasActiveChild, {})(menu) }) },
                'aria-expanded': (openMenus.value.includes(menu.id)),
            });
            /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['menu-trigger']} */ ;
            /** @type {__VLS_StyleScopedClasses['active']} */ ;
            /** @type {__VLS_StyleScopedClasses['is-open']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "menu-icon" },
                'aria-hidden': "true",
            });
            const __VLS_1 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
            __VLS_1(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (__VLS_unwrap(iconFor, {})(menu)), }, ...__VLS_directiveHookArgsRest(__VLS_1));
            /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "menu-label" },
            });
            /** @type {__VLS_StyleScopedClasses['menu-label']} */ ;
            (__VLS_unwrap(cleanTitle, {})(menu.title));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "menu-meta-pill" },
            });
            /** @type {__VLS_StyleScopedClasses['menu-meta-pill']} */ ;
            (menu.children.length);
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                ...{ class: "arrow" },
                ...{ class: ({ open: openMenus.value.includes(menu.id) }) },
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['arrow']} */ ;
            /** @type {__VLS_StyleScopedClasses['open']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "m6 9 6 6 6-6",
            });
            if (openMenus.value.includes(menu.id)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "submenu" },
                });
                /** @type {__VLS_StyleScopedClasses['submenu']} */ ;
                const __VLS_2 = __VLS_tryAsConstant((menu.children));
                for (const [child] of __VLS_vFor(__VLS_nonNull(__VLS_2))) {
                    let __VLS_3;
                    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
                    routerLink;
                    // @ts-ignore
                    const __VLS_4 = __VLS_asFunctionalComponent1(__VLS_3, new __VLS_3({
                        // @ts-ignore
                        key: (child.id), to: (child.path), ...{ class: "submenu-item" }, activeClass: "active-sub",
                    }));
                    const __VLS_5 = __VLS_4({
                        key: (child.id),
                        to: (child.path),
                        ...{ class: "submenu-item" },
                        activeClass: "active-sub",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_4));
                    /** @type {__VLS_StyleScopedClasses['submenu-item']} */ ;
                    var __VLS_6;
                    const { default: __VLS_8 } = __VLS_nonNull(__VLS_6.slots);
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "submenu-bullet" },
                        'aria-hidden': "true",
                    });
                    /** @type {__VLS_StyleScopedClasses['submenu-bullet']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "menu-label" },
                    });
                    /** @type {__VLS_StyleScopedClasses['menu-label']} */ ;
                    (__VLS_unwrap(cleanTitle, {})(child.title));
                    // @ts-ignore
                    [openMenus, openMenus, openMenus, openMenus, hasActiveChild, iconFor, cleanTitle, cleanTitle,];
                    // @ts-ignore
                    [];
                }
            }
        }
        else if (menu.children && menu.children.length > 0 && __VLS_ctx.collapsed) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!!(menu.children && menu.children.length > 0 && !__VLS_ctx.collapsed))
                            throw 0;
                        if (!(menu.children && menu.children.length > 0 && __VLS_ctx.collapsed))
                            throw 0;
                        return (__VLS_unwrap(expandFromCollapsedGroup, {})(menu.id));
                        // @ts-ignore
                        [collapsed, expandFromCollapsedGroup,];
                    } },
                type: "button",
                ...{ class: "menu-item" },
                ...{ class: ({ active: __VLS_unwrap(hasActiveChild, {})(menu) }) },
                title: (__VLS_unwrap(cleanTitle, {})(menu.title)),
            });
            /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['active']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "menu-icon" },
                'aria-hidden': "true",
            });
            const __VLS_9 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
            __VLS_9(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (__VLS_unwrap(iconFor, {})(menu)), }, ...__VLS_directiveHookArgsRest(__VLS_9));
            /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
        }
        else {
            let __VLS_10;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
                // @ts-ignore
                to: (menu.path), ...{ class: "menu-item" }, activeClass: "active", title: (__VLS_ctx.collapsed ? __VLS_unwrap(cleanTitle, {})(menu.title) : undefined),
            }));
            const __VLS_12 = __VLS_11({
                to: (menu.path),
                ...{ class: "menu-item" },
                activeClass: "active",
                title: (__VLS_ctx.collapsed ? __VLS_unwrap(cleanTitle, {})(menu.title) : undefined),
            }, ...__VLS_functionalComponentArgsRest(__VLS_11));
            /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
            var __VLS_13;
            const { default: __VLS_15 } = __VLS_nonNull(__VLS_13.slots);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "menu-icon" },
                'aria-hidden': "true",
            });
            const __VLS_16 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
            __VLS_16(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (__VLS_unwrap(iconFor, {})(menu)), }, ...__VLS_directiveHookArgsRest(__VLS_16));
            /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
            if (!__VLS_ctx.collapsed) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "menu-label" },
                });
                /** @type {__VLS_StyleScopedClasses['menu-label']} */ ;
                (__VLS_unwrap(cleanTitle, {})(menu.title));
            }
            // @ts-ignore
            [collapsed, collapsed, hasActiveChild, iconFor, iconFor, cleanTitle, cleanTitle, cleanTitle,];
        }
        // @ts-ignore
        [];
    }
    if (visibleMenus.value.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "menu-empty" },
            role: "status",
        });
        /** @type {__VLS_StyleScopedClasses['menu-empty']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        ...{ class: "menu-item help-link" },
        href: "/#contact",
        target: "_blank",
        rel: "noopener",
    });
    /** @type {__VLS_StyleScopedClasses['menu-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['help-link']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "menu-icon" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['menu-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "menu-label" },
    });
    /** @type {__VLS_StyleScopedClasses['menu-label']} */ ;
    // @ts-ignore
    [visibleMenus,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    props: {
        collapsed: Boolean
    },
});
export default {};

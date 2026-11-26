/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { getCurrentInstance, ref, onMounted, onUnmounted } from "vue";
import HighchartsVue from "highcharts-vue";
import Sidebar from "../components/Sidebar.vue";
import Header from "../components/Header.vue";
/** Sync registration: top-level await in setup makes this layout async and breaks router-view without Suspense. */
const inst = getCurrentInstance();
if (inst) {
    const root = inst.appContext.app;
    const marked = root;
    if (!marked.__registeredHighcharts) {
        root.use(HighchartsVue);
        marked.__registeredHighcharts = true;
    }
}
/** Sidebar overlay drawer below this width (split-screen half desktops ~960–1024px). Keep CSS media queries in sync. */
const DRAWER_BREAKPOINT_PX = 1024;
const isCollapsed = ref(false);
const isMobile = ref(window.innerWidth <= DRAWER_BREAKPOINT_PX);
const handleResize = () => {
    isMobile.value = window.innerWidth <= DRAWER_BREAKPOINT_PX;
    if (!isMobile.value)
        isCollapsed.value = false; // desktop: expanded
    else
        isCollapsed.value = true; // drawer: hidden by default
};
onMounted(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
});
const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(isCollapsed, {});
    __VLS_withDotValue(isMobile, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['main-content']} */ ;
    /** @type {__VLS_StyleScopedClasses['main-content']} */ ;
    /** @type {__VLS_StyleScopedClasses['main-content']} */ ;
    /** @type {__VLS_StyleScopedClasses['main-content']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "app-container" },
        ...{ class: ({ 'layout-sidebar-desktop-collapsed': isCollapsed.value && !isMobile.value }) },
    });
    /** @type {__VLS_StyleScopedClasses['app-container']} */ ;
    /** @type {__VLS_StyleScopedClasses['layout-sidebar-desktop-collapsed']} */ ;
    const __VLS_0 = Sidebar;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        collapsed: (isCollapsed.value),
    }));
    const __VLS_2 = __VLS_1({
        collapsed: (isCollapsed.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    if (isMobile.value && !isCollapsed.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (__VLS_unwrap(toggleSidebar, {})) },
            ...{ class: "overlay" },
        });
        /** @type {__VLS_StyleScopedClasses['overlay']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "main-content" },
    });
    /** @type {__VLS_StyleScopedClasses['main-content']} */ ;
    const __VLS_5 = Header;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        // @ts-ignore
        ...{ 'onToggleSidebar': {} }, isOpen: (!isCollapsed.value), isMobile: (isMobile.value),
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onToggleSidebar': {} },
        isOpen: (!isCollapsed.value),
        isMobile: (isMobile.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = {
        /** @type {typeof __VLS_10.toggleSidebar} */
        onToggleSidebar: (__VLS_unwrap(toggleSidebar, {})),
    };
    void __VLS_11;
    var __VLS_8;
    var __VLS_9;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['page-wrapper']} */ ;
    let __VLS_12;
    /** @ts-ignore @type { | typeof __VLS_components.routerView | typeof __VLS_components.RouterView | typeof __VLS_components['router-view']} */
    routerView;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    // @ts-ignore
    }));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    // @ts-ignore
    [isCollapsed, isCollapsed, isCollapsed, isCollapsed, isMobile, isMobile, isMobile, toggleSidebar, toggleSidebar,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

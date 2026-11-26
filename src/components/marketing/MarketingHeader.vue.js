/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
const anchorLinks = [
    { label: 'Features', hash: '#features' },
    { label: 'How it works', hash: '#how-it-works' },
    { label: 'Reliability', hash: '#reliability' },
    { label: 'FAQ', hash: '#faq' },
    { label: 'Contact', hash: '#contact' },
];
const menuOpen = ref(false);
const route = useRoute();
const closeMenu = () => {
    menuOpen.value = false;
};
watch(() => route.fullPath, closeMenu);
const onKeydown = (e) => {
    if (e.key === 'Escape')
        closeMenu();
};
const mq = window.matchMedia('(min-width: 901px)');
const onMediaChange = () => {
    if (mq.matches)
        closeMenu();
};
onMounted(() => {
    window.addEventListener('keydown', onKeydown);
    mq.addEventListener('change', onMediaChange);
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown);
    mq.removeEventListener('change', onMediaChange);
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(menuOpen, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['mk-nav__link']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-nav__cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-nav__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-mobile__link']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-mobile__link']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-mobile__secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-mobile__primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-nav']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-logo']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-nav__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-nav__cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-logo']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-nav__link']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-menu-enter-active']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-menu-leave-active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "mk-header" },
        ...{ class: ({ 'mk-header--open': menuOpen.value }) },
    });
    /** @type {__VLS_StyleScopedClasses['mk-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['mk-header--open']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        ...{ 'onClick': {} }, to: "/", ...{ class: "mk-logo" }, 'aria-label': "GoogleIndexing.com home",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        to: "/",
        ...{ class: "mk-logo" },
        'aria-label': "GoogleIndexing.com home",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = {
        /** @type {typeof __VLS_5.click} */
        onClick: (__VLS_unwrap(closeMenu, {})),
    };
    void __VLS_6;
    /** @type {__VLS_StyleScopedClasses['mk-logo']} */ ;
    var __VLS_3;
    var __VLS_4;
    const { default: __VLS_7 } = __VLS_nonNull(__VLS_3.slots);
    // @ts-ignore
    [menuOpen, closeMenu,];
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "mk-nav" },
        'aria-label': "Primary",
    });
    /** @type {__VLS_StyleScopedClasses['mk-nav']} */ ;
    const __VLS_8 = __VLS_tryAsConstant((__VLS_unwrap(anchorLinks, {})));
    for (const [link] of __VLS_vFor(__VLS_nonNull(__VLS_8))) {
        let __VLS_9;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
            // @ts-ignore
            key: (link.hash), to: ({ path: '/', hash: link.hash }), ...{ class: "mk-nav__link mk-nav__link--anchor" },
        }));
        const __VLS_11 = __VLS_10({
            key: (link.hash),
            to: ({ path: '/', hash: link.hash }),
            ...{ class: "mk-nav__link mk-nav__link--anchor" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        /** @type {__VLS_StyleScopedClasses['mk-nav__link']} */ ;
        /** @type {__VLS_StyleScopedClasses['mk-nav__link--anchor']} */ ;
        var __VLS_12;
        const { default: __VLS_14 } = __VLS_nonNull(__VLS_12.slots);
        (link.label);
        // @ts-ignore
        [anchorLinks,];
        // @ts-ignore
        [];
    }
    let __VLS_15;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        // @ts-ignore
        to: "/tools/indexability-checker", ...{ class: "mk-nav__link" },
    }));
    const __VLS_17 = __VLS_16({
        to: "/tools/indexability-checker",
        ...{ class: "mk-nav__link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    /** @type {__VLS_StyleScopedClasses['mk-nav__link']} */ ;
    var __VLS_18;
    const { default: __VLS_20 } = __VLS_nonNull(__VLS_18.slots);
    // @ts-ignore
    [];
    let __VLS_21;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        // @ts-ignore
        to: "/pricing", ...{ class: "mk-nav__link" },
    }));
    const __VLS_23 = __VLS_22({
        to: "/pricing",
        ...{ class: "mk-nav__link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    /** @type {__VLS_StyleScopedClasses['mk-nav__link']} */ ;
    var __VLS_24;
    const { default: __VLS_26 } = __VLS_nonNull(__VLS_24.slots);
    // @ts-ignore
    [];
    let __VLS_27;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        // @ts-ignore
        to: "/login", ...{ class: "mk-nav__cta" },
    }));
    const __VLS_29 = __VLS_28({
        to: "/login",
        ...{ class: "mk-nav__cta" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    /** @type {__VLS_StyleScopedClasses['mk-nav__cta']} */ ;
    var __VLS_30;
    const { default: __VLS_32 } = __VLS_nonNull(__VLS_30.slots);
    // @ts-ignore
    [];
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (menuOpen.value = !menuOpen.value);
                // @ts-ignore
                [menuOpen, menuOpen,];
            } },
        type: "button",
        ...{ class: "mk-nav__toggle" },
        'aria-expanded': (menuOpen.value),
        'aria-controls': "mk-mobile-menu",
        'aria-label': (menuOpen.value ? 'Close menu' : 'Open menu'),
    });
    /** @type {__VLS_StyleScopedClasses['mk-nav__toggle']} */ ;
    if (!menuOpen.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "4",
            y1: "7",
            x2: "20",
            y2: "7",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "4",
            y1: "12",
            x2: "20",
            y2: "12",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "4",
            y1: "17",
            x2: "20",
            y2: "17",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "6",
            y1: "6",
            x2: "18",
            y2: "18",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "18",
            y1: "6",
            x2: "6",
            y2: "18",
        });
    }
    let __VLS_33;
    /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
    transition;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        // @ts-ignore
        name: "mk-menu",
    }));
    const __VLS_35 = __VLS_34({
        name: "mk-menu",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    var __VLS_36;
    const { default: __VLS_38 } = __VLS_nonNull(__VLS_36.slots);
    if (menuOpen.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            id: "mk-mobile-menu",
            ...{ class: "mk-mobile" },
        });
        /** @type {__VLS_StyleScopedClasses['mk-mobile']} */ ;
        const __VLS_39 = __VLS_tryAsConstant((__VLS_unwrap(anchorLinks, {})));
        for (const [link] of __VLS_vFor(__VLS_nonNull(__VLS_39))) {
            let __VLS_40;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
                // @ts-ignore
                ...{ 'onClick': {} }, key: (link.hash), to: ({ path: '/', hash: link.hash }), ...{ class: "mk-mobile__link" },
            }));
            const __VLS_42 = __VLS_41({
                ...{ 'onClick': {} },
                key: (link.hash),
                to: ({ path: '/', hash: link.hash }),
                ...{ class: "mk-mobile__link" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
            let __VLS_45;
            const __VLS_46 = {
                /** @type {typeof __VLS_45.click} */
                onClick: (__VLS_unwrap(closeMenu, {})),
            };
            void __VLS_46;
            /** @type {__VLS_StyleScopedClasses['mk-mobile__link']} */ ;
            var __VLS_43;
            var __VLS_44;
            const { default: __VLS_47 } = __VLS_nonNull(__VLS_43.slots);
            (link.label);
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                viewBox: "0 0 24 24",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M9 6l6 6-6 6",
            });
            // @ts-ignore
            [menuOpen, menuOpen, menuOpen, menuOpen, closeMenu, anchorLinks,];
            // @ts-ignore
            [];
        }
        let __VLS_48;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
            // @ts-ignore
            ...{ 'onClick': {} }, to: "/tools/indexability-checker", ...{ class: "mk-mobile__link" },
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onClick': {} },
            to: "/tools/indexability-checker",
            ...{ class: "mk-mobile__link" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_53;
        const __VLS_54 = {
            /** @type {typeof __VLS_53.click} */
            onClick: (__VLS_unwrap(closeMenu, {})),
        };
        void __VLS_54;
        /** @type {__VLS_StyleScopedClasses['mk-mobile__link']} */ ;
        var __VLS_51;
        var __VLS_52;
        const { default: __VLS_55 } = __VLS_nonNull(__VLS_51.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M9 6l6 6-6 6",
        });
        // @ts-ignore
        [closeMenu,];
        let __VLS_56;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            // @ts-ignore
            ...{ 'onClick': {} }, to: "/pricing", ...{ class: "mk-mobile__link" },
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onClick': {} },
            to: "/pricing",
            ...{ class: "mk-mobile__link" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_61;
        const __VLS_62 = {
            /** @type {typeof __VLS_61.click} */
            onClick: (__VLS_unwrap(closeMenu, {})),
        };
        void __VLS_62;
        /** @type {__VLS_StyleScopedClasses['mk-mobile__link']} */ ;
        var __VLS_59;
        var __VLS_60;
        const { default: __VLS_63 } = __VLS_nonNull(__VLS_59.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M9 6l6 6-6 6",
        });
        // @ts-ignore
        [closeMenu,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mk-mobile__actions" },
        });
        /** @type {__VLS_StyleScopedClasses['mk-mobile__actions']} */ ;
        let __VLS_64;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
            // @ts-ignore
            ...{ 'onClick': {} }, to: "/login", ...{ class: "mk-mobile__secondary" },
        }));
        const __VLS_66 = __VLS_65({
            ...{ 'onClick': {} },
            to: "/login",
            ...{ class: "mk-mobile__secondary" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_69;
        const __VLS_70 = {
            /** @type {typeof __VLS_69.click} */
            onClick: (__VLS_unwrap(closeMenu, {})),
        };
        void __VLS_70;
        /** @type {__VLS_StyleScopedClasses['mk-mobile__secondary']} */ ;
        var __VLS_67;
        var __VLS_68;
        const { default: __VLS_71 } = __VLS_nonNull(__VLS_67.slots);
        // @ts-ignore
        [closeMenu,];
        let __VLS_72;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
            // @ts-ignore
            ...{ 'onClick': {} }, to: "/signup", ...{ class: "mk-mobile__primary" },
        }));
        const __VLS_74 = __VLS_73({
            ...{ 'onClick': {} },
            to: "/signup",
            ...{ class: "mk-mobile__primary" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_77;
        const __VLS_78 = {
            /** @type {typeof __VLS_77.click} */
            onClick: (__VLS_unwrap(closeMenu, {})),
        };
        void __VLS_78;
        /** @type {__VLS_StyleScopedClasses['mk-mobile__primary']} */ ;
        var __VLS_75;
        var __VLS_76;
        const { default: __VLS_79 } = __VLS_nonNull(__VLS_75.slots);
        // @ts-ignore
        [closeMenu,];
    }
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

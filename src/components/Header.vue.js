/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useEntitlementsStore } from '../Shared/entitlements';
import { computed, onMounted, ref } from 'vue';
const { defineProps, defineEmits, } = {};
const props = defineProps();
const emit = defineEmits();
import { logout, useAuthStore } from '../Store/auth';
import { useGoogleConfigStore } from '../Shared/googleConfig';
import { useSubscriptionStore } from '../Shared/subscription';
import { useUserLimitStore } from '../Shared/userLimit';
const noticeDismissed = ref(false);
const authStore = useAuthStore();
const googleConfigStore = useGoogleConfigStore();
const googleNoticeIssues = computed(() => googleConfigStore.errors.map((e) => e.trim()).filter(Boolean));
const subscriptionStore = useSubscriptionStore();
const userLimitStore = useUserLimitStore();
onMounted(() => {
    googleConfigStore.check();
    subscriptionStore.checkSubscription();
    userLimitStore.checkLimit();
});
const handleLogout = () => {
    logout();
};
// A paying customer is "Subscribed" even if trial allowance remains; trial only when no active plan.
const entitlements = useEntitlementsStore();
const accountStatusLabel = computed(() => {
    if (entitlements.isChecking && !entitlements.loaded)
        return 'Checking';
    return entitlements.statusLabel;
});
const accountStatusClass = computed(() => {
    if (entitlements.isChecking && !entitlements.loaded)
        return 'is-checking';
    if (entitlements.data.hasActiveSubscription)
        return 'is-active';
    if (entitlements.data.trialActive)
        return 'is-trial';
    if (entitlements.data.isFree && entitlements.data.freeUrlsLeft > 0)
        return 'is-trial';
    return 'is-expired';
});
const accountStatusTitle = computed(() => entitlements.usageSummary || entitlements.blockingReason);
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
    __VLS_withDotValue(authStore, {});
    __VLS_withDotValue(googleConfigStore, {});
    __VLS_withDotValue(noticeDismissed, {});
    __VLS_withDotValue(googleNoticeIssues, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['menu-toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['menu-toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['header']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-right']} */ ;
    /** @type {__VLS_StyleScopedClasses['gnb-inline-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['gnb-cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['gnb-dismiss']} */ ;
    /** @type {__VLS_StyleScopedClasses['google-notice-bar']} */ ;
    /** @type {__VLS_StyleScopedClasses['gnb-cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['account-status']} */ ;
    /** @type {__VLS_StyleScopedClasses['account-status']} */ ;
    /** @type {__VLS_StyleScopedClasses['account-status']} */ ;
    /** @type {__VLS_StyleScopedClasses['account-status']} */ ;
    /** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['header']} */ ;
    /** @type {__VLS_StyleScopedClasses['account-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
    /** @type {__VLS_StyleScopedClasses['user-email']} */ ;
    /** @type {__VLS_StyleScopedClasses['account-status']} */ ;
    /** @type {__VLS_StyleScopedClasses['logout-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "header" },
    });
    /** @type {__VLS_StyleScopedClasses['header']} */ ;
    if (__VLS_ctx.isMobile) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "header-left" },
        });
        /** @type {__VLS_StyleScopedClasses['header-left']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    if (!(__VLS_ctx.isMobile))
                        throw 0;
                    return (__VLS_unwrap(emit, {})('toggle-sidebar'));
                    // @ts-ignore
                    [isMobile, emit,];
                } },
            type: "button",
            ...{ class: "menu-toggle" },
            'aria-expanded': (__VLS_ctx.isOpen),
            'aria-controls': "app-sidebar-nav",
            'aria-label': "Toggle navigation menu",
        });
        /** @type {__VLS_StyleScopedClasses['menu-toggle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "4",
            y1: "6",
            x2: "20",
            y2: "6",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "4",
            y1: "12",
            x2: "20",
            y2: "12",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "4",
            y1: "18",
            x2: "20",
            y2: "18",
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-right" },
    });
    /** @type {__VLS_StyleScopedClasses['header-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "profile-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['profile-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "account-card" },
        title: (authStore.value.userEmail),
    });
    /** @type {__VLS_StyleScopedClasses['account-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "user-avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
    (authStore.value.userName.charAt(0).toUpperCase());
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "account-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['account-meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "user-name" },
    });
    /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
    (authStore.value.userName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "user-email" },
    });
    /** @type {__VLS_StyleScopedClasses['user-email']} */ ;
    (authStore.value.userEmail);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "account-status" },
        ...{ class: (__VLS_unwrap(accountStatusClass, {})) },
        title: (__VLS_unwrap(accountStatusTitle, {})),
    });
    /** @type {__VLS_StyleScopedClasses['account-status']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status-dot" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
    (__VLS_unwrap(accountStatusLabel, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(handleLogout, {})) },
        ...{ class: "logout-btn" },
        title: "Logout",
    });
    /** @type {__VLS_StyleScopedClasses['logout-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        ...{ class: "icon-logout" },
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
    });
    /** @type {__VLS_StyleScopedClasses['icon-logout']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'stroke-width': "2",
        d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "logout-text" },
    });
    /** @type {__VLS_StyleScopedClasses['logout-text']} */ ;
    if (!googleConfigStore.value.isValid && !googleConfigStore.value.isChecking && !noticeDismissed.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "google-notice-bar" },
            role: "alert",
        });
        /** @type {__VLS_StyleScopedClasses['google-notice-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "gnb-inner" },
        });
        /** @type {__VLS_StyleScopedClasses['gnb-inner']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "gnb-dot" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['gnb-dot']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "gnb-text" },
        });
        /** @type {__VLS_StyleScopedClasses['gnb-text']} */ ;
        if (googleConfigStore.value.hasCredentials) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        }
        else {
            let __VLS_0;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                // @ts-ignore
                to: "/settings/google-configuration", ...{ class: "gnb-inline-link" },
            }));
            const __VLS_2 = __VLS_1({
                to: "/settings/google-configuration",
                ...{ class: "gnb-inline-link" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            /** @type {__VLS_StyleScopedClasses['gnb-inline-link']} */ ;
            var __VLS_3;
            const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
            // @ts-ignore
            [isOpen, authStore, authStore, authStore, authStore, accountStatusClass, accountStatusTitle, accountStatusLabel, handleLogout, googleConfigStore, googleConfigStore, googleConfigStore, noticeDismissed,];
        }
        if (googleNoticeIssues.value.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "gnb-issue" },
            });
            /** @type {__VLS_StyleScopedClasses['gnb-issue']} */ ;
            (googleNoticeIssues.value[0]);
        }
        let __VLS_6;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            // @ts-ignore
            to: "/settings/google-configuration", ...{ class: "gnb-cta" },
        }));
        const __VLS_8 = __VLS_7({
            to: "/settings/google-configuration",
            ...{ class: "gnb-cta" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        /** @type {__VLS_StyleScopedClasses['gnb-cta']} */ ;
        var __VLS_9;
        const { default: __VLS_11 } = __VLS_nonNull(__VLS_9.slots);
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 12 12",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
            width: "10",
            height: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "2",
            y1: "6",
            x2: "10",
            y2: "6",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "6 2 10 6 6 10",
        });
        // @ts-ignore
        [googleNoticeIssues, googleNoticeIssues,];
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    if (!(!googleConfigStore.value.isValid && !googleConfigStore.value.isChecking && !noticeDismissed.value))
                        throw 0;
                    return (noticeDismissed.value = true);
                    // @ts-ignore
                    [noticeDismissed,];
                } },
            ...{ class: "gnb-dismiss" },
            'aria-label': "Dismiss Google setup notice",
        });
        /** @type {__VLS_StyleScopedClasses['gnb-dismiss']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 12 12",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
            width: "11",
            height: "11",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "2",
            y1: "2",
            x2: "10",
            y2: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "10",
            y1: "2",
            x2: "2",
            y2: "10",
        });
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};

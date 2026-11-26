/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted } from "vue";
import api from "../api";
import { useRouter, useRoute } from "vue-router";
import { login as apiLogin, redirectToGoogleLogin } from "../Store/auth";
import { useMenuStore } from "../Store/menu";
import { buildRoutes } from "../Router/dynamicRoutes";
// Plan display names mapping
const planNames = {
    trial: 'Free plan',
    solo: 'Solo plan',
    pro: 'Pro plan',
    team: 'Team plan',
    enterprise: 'Enterprise plan'
};
// Plan descriptions
const planDescriptions = {
    trial: 'A 14-day trial with 100 URL submissions, then 50 a month, free.',
    solo: 'For solo creators and small site owners. Sign in to continue to checkout.',
    pro: 'For freelancers and growing agencies. Sign in to continue to checkout.',
    team: 'For teams managing many sites. Sign in to continue to checkout.',
    enterprise: 'For agencies and teams managing many sites. Sign in to continue to checkout.'
};
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");
const rememberMe = ref(false);
// Get plan from query params
const selectedPlan = computed(() => route.query.plan);
const hasSelectedPlan = computed(() => !!selectedPlan.value && planNames[selectedPlan.value]);
const selectedPlanName = computed(() => hasSelectedPlan.value ? planNames[selectedPlan.value] : '');
const selectedPlanDesc = computed(() => hasSelectedPlan.value ? planDescriptions[selectedPlan.value] : '');
// Store plan in localStorage for persistence through registration
onMounted(() => {
    if (selectedPlan.value) {
        localStorage.setItem('selectedPlan', selectedPlan.value);
    }
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
        username.value = savedUsername;
        rememberMe.value = true;
    }
});
const unconfirmedEmail = ref('');
const handleLogin = async () => {
    if (loading.value)
        return;
    errorMessage.value = "";
    loading.value = true;
    try {
        const payload = {
            userName: username.value,
            password: password.value,
            rememberMe: rememberMe.value,
        };
        const success = await apiLogin(payload, router);
        if (success) {
            if (rememberMe.value)
                localStorage.setItem("rememberedUsername", username.value);
            else
                localStorage.removeItem("rememberedUsername");
            const menuStore = useMenuStore();
            await api.get("/auth-check");
            await menuStore.fetchMenus();
            const dynamicRoutes = buildRoutes(menuStore.menus);
            dynamicRoutes.forEach(route => {
                if (!router.hasRoute(route.name)) {
                    router.addRoute("DefaultLayout", route);
                }
            });
            // Redirect based on plan type
            const pendingPlan = localStorage.getItem('selectedPlan');
            const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '';
            if (pendingPlan) {
                localStorage.removeItem('selectedPlan');
                // Paid plans go to subscription for payment, trial goes to dashboard
                if (pendingPlan === 'trial') {
                    router.push(redirect || '/dashboard');
                }
                else {
                    router.push(`/subscriptions?plan=${pendingPlan}`);
                }
            }
            else {
                router.push(redirect || '/dashboard');
            }
        }
        else {
            errorMessage.value = "Login failed. Please check your credentials.";
        }
    }
    catch (err) {
        const code = err?.response?.data?.error?.code;
        const description = err?.response?.data?.error?.description;
        if (code === 'EmailNotConfirmed') {
            unconfirmedEmail.value = username.value.includes('@') ? username.value : '';
        }
        errorMessage.value = description || "Something went wrong.";
    }
    finally {
        loading.value = false;
    }
};
const handleGoogleLogin = () => {
    redirectToGoogleLogin();
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(showPassword, {});
    __VLS_withDotValue(router, {});
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(hasSelectedPlan, {});
    __VLS_withDotValue(selectedPlan, {});
    __VLS_withDotValue(errorMessage, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['welcome-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['welcome-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['feature-list']} */ ;
    /** @type {__VLS_StyleScopedClasses['feature-list']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['remember']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary__arrow']} */ ;
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-google']} */ ;
    /** @type {__VLS_StyleScopedClasses['signup-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['error']} */ ;
    /** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['welcome-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['feature-list']} */ ;
    /** @type {__VLS_StyleScopedClasses['feature-list']} */ ;
    /** @type {__VLS_StyleScopedClasses['feature-list']} */ ;
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['login-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['welcome-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-context-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['resend-hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "login-container" },
    });
    /** @type {__VLS_StyleScopedClasses['login-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel" },
    });
    /** @type {__VLS_StyleScopedClasses['panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid-bg" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['grid-bg']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "glow" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "content-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "welcome-text" },
    });
    /** @type {__VLS_StyleScopedClasses['welcome-text']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        to: "/", ...{ class: "back-link" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/",
        ...{ class: "back-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "19",
        y1: "12",
        x2: "5",
        y2: "12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "12 19 5 12 12 5",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "accent" },
    });
    /** @type {__VLS_StyleScopedClasses['accent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "desc" },
    });
    /** @type {__VLS_StyleScopedClasses['desc']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "feature-list" },
    });
    /** @type {__VLS_StyleScopedClasses['feature-list']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "login-card" },
    });
    /** @type {__VLS_StyleScopedClasses['login-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "login-card__accent" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['login-card__accent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "login-card__head" },
    });
    /** @type {__VLS_StyleScopedClasses['login-card__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "title" },
    });
    /** @type {__VLS_StyleScopedClasses['title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "login-username",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        id: "login-username",
        value: (__VLS_unwrap(username, {})),
        type: "text",
        disabled: (loading.value),
        placeholder: "Enter your username or email",
        autocomplete: "username",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "login-password",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "password-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onKeyup: (__VLS_unwrap(handleLogin, {})) },
        id: "login-password",
        type: (showPassword.value ? 'text' : 'password'),
        placeholder: "Enter password",
        disabled: (loading.value),
        autocomplete: "current-password",
    });
    (__VLS_unwrap(password, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (showPassword.value = !showPassword.value);
                // @ts-ignore
                [username, loading, loading, handleLogin, showPassword, showPassword, showPassword, password,];
            } },
        type: "button",
        ...{ class: "toggle" },
        'aria-label': (showPassword.value ? 'Hide password' : 'Show password'),
    });
    /** @type {__VLS_StyleScopedClasses['toggle']} */ ;
    (showPassword.value ? 'HIDE' : 'SHOW');
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (router.value.push('/forgot-password'));
                // @ts-ignore
                [showPassword, showPassword, router,];
            } },
        ...{ class: "forgot" },
    });
    /** @type {__VLS_StyleScopedClasses['forgot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "options" },
    });
    /** @type {__VLS_StyleScopedClasses['options']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "remember" },
    });
    /** @type {__VLS_StyleScopedClasses['remember']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "checkbox",
    });
    (__VLS_unwrap(rememberMe, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(handleLogin, {})) },
        ...{ class: "btn-primary" },
        disabled: (loading.value),
    });
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    if (loading.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spinner" },
        });
        /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
    }
    if (loading.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "divider" },
    });
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(handleGoogleLogin, {})) },
        ...{ class: "btn-google" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-google']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "google-icon" },
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 48 48",
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['google-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        fill: "#FFC107",
        d: "M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        fill: "#FF3D00",
        d: "M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        fill: "#4CAF50",
        d: "M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        fill: "#1976D2",
        d: "M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    if (hasSelectedPlan.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-context-banner" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-context-banner']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-context-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-context-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "12",
            cy: "12",
            r: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M12 16v-4",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M12 8h.01",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-context-content" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-context-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "plan-context-title" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-context-title']} */ ;
        (__VLS_unwrap(selectedPlanName, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "plan-context-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-context-desc']} */ ;
        (__VLS_unwrap(selectedPlanDesc, {}));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "signup-text" },
    });
    /** @type {__VLS_StyleScopedClasses['signup-text']} */ ;
    if (selectedPlan.value) {
        let __VLS_6;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            // @ts-ignore
            to: (`/signup?plan=${selectedPlan.value}`), ...{ class: "signup-link" },
        }));
        const __VLS_8 = __VLS_7({
            to: (`/signup?plan=${selectedPlan.value}`),
            ...{ class: "signup-link" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        /** @type {__VLS_StyleScopedClasses['signup-link']} */ ;
        var __VLS_9;
        const { default: __VLS_11 } = __VLS_nonNull(__VLS_9.slots);
        // @ts-ignore
        [loading, loading, loading, handleLogin, rememberMe, handleGoogleLogin, hasSelectedPlan, selectedPlanName, selectedPlanDesc, selectedPlan, selectedPlan,];
    }
    else {
        let __VLS_12;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            // @ts-ignore
            to: "/signup", ...{ class: "signup-link" },
        }));
        const __VLS_14 = __VLS_13({
            to: "/signup",
            ...{ class: "signup-link" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        /** @type {__VLS_StyleScopedClasses['signup-link']} */ ;
        var __VLS_15;
        const { default: __VLS_17 } = __VLS_nonNull(__VLS_15.slots);
        // @ts-ignore
        [];
    }
    if (errorMessage.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "error" },
            role: "alert",
        });
        /** @type {__VLS_StyleScopedClasses['error']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "12",
            cy: "12",
            r: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "12",
            y1: "8",
            x2: "12",
            y2: "12",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "12",
            y1: "16",
            x2: "12.01",
            y2: "16",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (errorMessage.value);
    }
    if (errorMessage.value.startsWith('Please confirm')) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "resend-hint" },
        });
        /** @type {__VLS_StyleScopedClasses['resend-hint']} */ ;
        let __VLS_18;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            // @ts-ignore
            to: ({ path: '/verify-required', query: { email: __VLS_unwrap(unconfirmedEmail, {}) } }),
        }));
        const __VLS_20 = __VLS_19({
            to: ({ path: '/verify-required', query: { email: __VLS_unwrap(unconfirmedEmail, {}) } }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        var __VLS_21;
        const { default: __VLS_23 } = __VLS_nonNull(__VLS_21.slots);
        // @ts-ignore
        [errorMessage, errorMessage, errorMessage, unconfirmedEmail,];
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

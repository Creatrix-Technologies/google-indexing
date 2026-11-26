/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "../api";
const route = useRoute();
const router = useRouter();
const toast = useToast();
const email = computed(() => route.query.email || '');
const selectedPlan = computed(() => {
    // Get plan from query or localStorage
    const planFromQuery = route.query.plan;
    if (planFromQuery) {
        localStorage.setItem('selectedPlan', planFromQuery);
        return planFromQuery;
    }
    return localStorage.getItem('selectedPlan') || undefined;
});
const planConfig = {
    solo: { name: 'Solo Plan', price: '$17/month' },
    pro: { name: 'Pro Plan', price: '$47/month' },
    team: { name: 'Team Plan', price: '$88/month' }
};
const signupLink = computed(() => {
    return selectedPlan.value ? `/signup?plan=${selectedPlan.value}` : '/signup';
});
const checking = ref(false);
const verified = ref(false);
const errorMessage = ref('');
const resendTimer = ref(0);
let timerInterval = null;
const startResendTimer = () => {
    resendTimer.value = 60;
    timerInterval = setInterval(() => {
        if (resendTimer.value > 0) {
            resendTimer.value--;
        }
        else if (timerInterval) {
            clearInterval(timerInterval);
        }
    }, 1000);
};
onUnmounted(() => {
    if (timerInterval)
        clearInterval(timerInterval);
});
onMounted(() => {
    startResendTimer();
    // Check if already verified (user might have clicked the email link)
    checkVerificationStatus();
});
const checkVerificationStatus = async () => {
    try {
        const response = await api.get('/register/verification-status', {
            params: { email: email.value }
        });
        if (response.data?.isVerified) {
            verified.value = true;
        }
    }
    catch {
        // Silent fail - user can click button to check
    }
};
const checkVerification = async () => {
    checking.value = true;
    errorMessage.value = '';
    try {
        const response = await api.get('/register/verification-status', {
            params: { email: email.value }
        });
        if (response.data?.isVerified) {
            verified.value = true;
            // Always go through login first — user is not yet authenticated
            if (selectedPlan.value === 'trial') {
                toast.success('Email verified! Please log in to access your dashboard.');
                setTimeout(() => router.push('/login'), 1500);
            }
            else {
                toast.success('Email verified! Please log in to complete your subscription.');
                setTimeout(() => router.push(`/login?plan=${selectedPlan.value}`), 1500);
            }
        }
        else {
            errorMessage.value = "Your email hasn't been verified yet. Please check your inbox and click the verification link.";
        }
    }
    catch (err) {
        // If API doesn't exist, redirect to login with plan preserved
        // User will complete login and then be redirected to subscription
        toast.info('Please log in to continue. You\'ll be taken to payment after login.');
        const loginPath = selectedPlan.value
            ? `/login?plan=${selectedPlan.value}`
            : '/login';
        router.push(loginPath);
    }
    finally {
        checking.value = false;
    }
};
const resendEmail = async () => {
    try {
        await api.post('/register/resend-confirmation', { email: email.value });
        toast.success('Confirmation email sent again. Check your inbox and spam folder.');
        startResendTimer();
    }
    catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to resend email. Please try again.');
    }
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(selectedPlan, {});
    __VLS_withDotValue(planConfig, {});
    __VLS_withDotValue(verified, {});
    __VLS_withDotValue(checking, {});
    __VLS_withDotValue(errorMessage, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['icon-circle']} */ ;
    /** @type {__VLS_StyleScopedClasses['step']} */ ;
    /** @type {__VLS_StyleScopedClasses['step-number']} */ ;
    /** @type {__VLS_StyleScopedClasses['step']} */ ;
    /** @type {__VLS_StyleScopedClasses['step-number']} */ ;
    /** @type {__VLS_StyleScopedClasses['step']} */ ;
    /** @type {__VLS_StyleScopedClasses['step-number']} */ ;
    /** @type {__VLS_StyleScopedClasses['trial-text']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-resend']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-resend']} */ ;
    /** @type {__VLS_StyleScopedClasses['link']} */ ;
    /** @type {__VLS_StyleScopedClasses['error']} */ ;
    /** @type {__VLS_StyleScopedClasses['verify-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['title']} */ ;
    /** @type {__VLS_StyleScopedClasses['steps']} */ ;
    /** @type {__VLS_StyleScopedClasses['step-connector']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "verify-container" },
    });
    /** @type {__VLS_StyleScopedClasses['verify-container']} */ ;
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
        ...{ class: "verify-card" },
    });
    /** @type {__VLS_StyleScopedClasses['verify-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "icon-circle" },
    });
    /** @type {__VLS_StyleScopedClasses['icon-circle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.5",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "22,6 12,13 2,6",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "title" },
    });
    /** @type {__VLS_StyleScopedClasses['title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "email" },
    });
    /** @type {__VLS_StyleScopedClasses['email']} */ ;
    (__VLS_unwrap(email, {}));
    if (selectedPlan.value && selectedPlan.value !== 'trial') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-box" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-box']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-label" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-value" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-value']} */ ;
        (planConfig.value[selectedPlan.value]?.name || selectedPlan.value);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-price" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-price']} */ ;
        (planConfig.value[selectedPlan.value]?.price);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "plan-note" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-note']} */ ;
    }
    if (selectedPlan.value !== 'trial') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "steps" },
        });
        /** @type {__VLS_StyleScopedClasses['steps']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step" },
            ...{ class: ({ active: !verified.value, complete: verified.value }) },
        });
        /** @type {__VLS_StyleScopedClasses['step']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        /** @type {__VLS_StyleScopedClasses['complete']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-number" },
        });
        /** @type {__VLS_StyleScopedClasses['step-number']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-text" },
        });
        /** @type {__VLS_StyleScopedClasses['step-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-title" },
        });
        /** @type {__VLS_StyleScopedClasses['step-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['step-desc']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-connector" },
        });
        /** @type {__VLS_StyleScopedClasses['step-connector']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step" },
            ...{ class: ({ active: verified.value, pending: !verified.value }) },
        });
        /** @type {__VLS_StyleScopedClasses['step']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        /** @type {__VLS_StyleScopedClasses['pending']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-number" },
        });
        /** @type {__VLS_StyleScopedClasses['step-number']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-text" },
        });
        /** @type {__VLS_StyleScopedClasses['step-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-title" },
        });
        /** @type {__VLS_StyleScopedClasses['step-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['step-desc']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "trial-message" },
        });
        /** @type {__VLS_StyleScopedClasses['trial-message']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "trial-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['trial-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "trial-text" },
        });
        /** @type {__VLS_StyleScopedClasses['trial-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "actions" },
    });
    /** @type {__VLS_StyleScopedClasses['actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(checkVerification, {})) },
        ...{ class: "btn-primary" },
        disabled: (checking.value),
    });
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    if (checking.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spinner" },
        });
        /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
    }
    else if (selectedPlan.value && selectedPlan.value !== 'trial') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(resendEmail, {})) },
        ...{ class: "btn-resend" },
        disabled: (__VLS_unwrap(resendTimer, {}) > 0),
    });
    /** @type {__VLS_StyleScopedClasses['btn-resend']} */ ;
    if (__VLS_unwrap(resendTimer, {}) > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_unwrap(resendTimer, {}));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "help" },
    });
    /** @type {__VLS_StyleScopedClasses['help']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        to: (__VLS_unwrap(signupLink, {})), ...{ class: "link" },
    }));
    const __VLS_2 = __VLS_1({
        to: (__VLS_unwrap(signupLink, {})),
        ...{ class: "link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['link']} */ ;
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    // @ts-ignore
    [email, selectedPlan, selectedPlan, selectedPlan, selectedPlan, selectedPlan, selectedPlan, selectedPlan, selectedPlan, planConfig, planConfig, verified, verified, verified, verified, checkVerification, checking, checking, resendEmail, resendTimer, resendTimer, resendTimer, signupLink,];
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
    // @ts-ignore
    [errorMessage, errorMessage,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

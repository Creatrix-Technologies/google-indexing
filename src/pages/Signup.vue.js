/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { redirectToGoogleLogin } from "../Store/auth";
import { trackGoogleAdsSignupConversion } from "../utils/googleAdsConversion";
import api, { refreshApi } from "../api";
import { FREE_PLAN, fetchPublicSubscriptionPlans, planLimitLines, planSlug } from "../Shared/publicPlans";
const router = useRouter();
const route = useRoute();
// Plan display config
const planConfig = {
    solo: { name: 'Solo Plan', desc: 'Perfect for individual sites and small projects.' },
    pro: { name: 'Pro Plan', desc: 'Most popular choice for growing businesses.' },
    team: { name: 'Team Plan', desc: 'For agencies and teams managing many sites.' },
    enterprise: { name: 'Enterprise Plan', desc: 'For agencies and teams managing many sites.' }
};
// Live plan (name + enforced limits) for the selected ?plan=, so the card matches the pricing page.
const publicPlans = ref([]);
const matchedPlan = computed(() => publicPlans.value.find((p) => planSlug(p.name) === selectedPlan.value) ?? null);
// State
const loading = ref(false);
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");
// Errors
const emailError = ref("");
const passwordError = ref("");
// Get plan from query
const selectedPlan = computed(() => route.query.plan);
const hasSelectedPlan = computed(() => !!selectedPlan.value && planConfig[selectedPlan.value]);
const selectedPlanName = computed(() => {
    const plan = selectedPlan.value;
    if (matchedPlan.value)
        return `${matchedPlan.value.name} plan`;
    return plan && planConfig[plan] ? planConfig[plan].name : '';
});
const selectedPlanDesc = computed(() => {
    const plan = selectedPlan.value;
    return plan && planConfig[plan] ? planConfig[plan].desc : '';
});
// Store plan in localStorage
onMounted(() => {
    fetchPublicSubscriptionPlans(refreshApi).then((p) => { publicPlans.value = p; }).catch(() => { });
    if (selectedPlan.value) {
        localStorage.setItem('selectedPlan', selectedPlan.value);
    }
});
// Validations
const validateEmail = () => {
    if (!email.value.trim())
        emailError.value = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
        emailError.value = "Please enter a valid email address.";
    else
        emailError.value = "";
};
// Mirrors ASP.NET Identity's password rules on the API, shown as a live checklist.
const passwordRules = computed(() => [
    { label: '8+ characters', ok: password.value.length >= 8 },
    { label: 'Upper & lower case', ok: /[a-z]/.test(password.value) && /[A-Z]/.test(password.value) },
    { label: 'A number', ok: /[0-9]/.test(password.value) },
    { label: 'A symbol', ok: /[^a-zA-Z0-9]/.test(password.value) },
]);
const validatePassword = () => {
    if (!password.value)
        passwordError.value = "Password is required.";
    else if (passwordRules.value.some((r) => !r.ok))
        passwordError.value = "Password doesn't meet all the rules yet.";
    else
        passwordError.value = "";
};
const isFormValid = computed(() => !!email.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) &&
    passwordRules.value.every((r) => r.ok));
/** Username is no longer asked for: derive it from the email (login also accepts the email). */
const usernameFromEmail = (addr, suffix = "") => {
    const local = addr.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 24) || "user";
    return (local.length < 3 ? `${local}user` : local) + suffix;
};
// Submit
const serverError = (err) => err?.response?.data?.error?.validationErrors?.[0] ||
    err?.response?.data?.error?.description ||
    err?.response?.data?.message ||
    "Something went wrong. Please try again.";
const handleRegister = async () => {
    validateEmail();
    validatePassword();
    if (!isFormValid.value || loading.value)
        return;
    loading.value = true;
    errorMessage.value = "";
    try {
        // The derived username can collide with an existing one; retry with a short random suffix.
        let created = false;
        for (let attempt = 0; attempt < 3 && !created; attempt++) {
            const suffix = attempt === 0 ? "" : String(Math.floor(1000 + Math.random() * 9000));
            try {
                await api.post('/register', {
                    email: email.value.trim(),
                    userName: usernameFromEmail(email.value.trim(), suffix),
                    password: password.value,
                }, { withCredentials: true });
                created = true;
            }
            catch (err) {
                const msg = serverError(err);
                if (/user\s*name already exists/i.test(msg) && attempt < 2)
                    continue;
                if (/email already exists/i.test(msg)) {
                    errorMessage.value = "An account with this email already exists. Sign in instead, or reset your password.";
                }
                else {
                    errorMessage.value = msg;
                }
                return;
            }
        }
        trackGoogleAdsSignupConversion();
        const pendingPlan = localStorage.getItem('selectedPlan');
        localStorage.removeItem('selectedPlan');
        router.push(`/verify-required?plan=${pendingPlan || 'trial'}&email=${encodeURIComponent(email.value.trim())}`);
    }
    finally {
        loading.value = false;
    }
};
const handleGoogleSignup = () => {
    // Store plan for after Google auth
    if (selectedPlan.value) {
        localStorage.setItem('selectedPlan', selectedPlan.value);
    }
    redirectToGoogleLogin();
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(hasSelectedPlan, {});
    __VLS_withDotValue(matchedPlan, {});
    __VLS_withDotValue(FREE_PLAN, {});
    __VLS_withDotValue(emailError, {});
    __VLS_withDotValue(showPassword, {});
    __VLS_withDotValue(password, {});
    __VLS_withDotValue(selectedPlan, {});
    __VLS_withDotValue(isFormValid, {});
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(errorMessage, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['verification-notice']} */ ;
    /** @type {__VLS_StyleScopedClasses['terms']} */ ;
    /** @type {__VLS_StyleScopedClasses['terms']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-google']} */ ;
    /** @type {__VLS_StyleScopedClasses['login-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['error']} */ ;
    /** @type {__VLS_StyleScopedClasses['pw-rules']} */ ;
    /** @type {__VLS_StyleScopedClasses['pw-rules']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-google']} */ ;
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['terms']} */ ;
    /** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['signup-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-info']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-features']} */ ;
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-name']} */ ;
    /** @type {__VLS_StyleScopedClasses['signup-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-info']} */ ;
    /** @type {__VLS_StyleScopedClasses['selected-plan-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "signup-container" },
    });
    /** @type {__VLS_StyleScopedClasses['signup-container']} */ ;
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
        ...{ class: "plan-info" },
    });
    /** @type {__VLS_StyleScopedClasses['plan-info']} */ ;
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        to: "/pricing", ...{ class: "back-link" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/pricing",
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
    if (hasSelectedPlan.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "selected-plan-card" },
        });
        /** @type {__VLS_StyleScopedClasses['selected-plan-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-badge" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-badge']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "plan-name" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-name']} */ ;
        (__VLS_unwrap(selectedPlanName, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "plan-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-desc']} */ ;
        (__VLS_unwrap(selectedPlanDesc, {}));
        if (matchedPlan.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "plan-features" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-features']} */ ;
            const __VLS_6 = __VLS_tryAsConstant((__VLS_unwrap(planLimitLines, {})(matchedPlan.value)));
            for (const [line] of __VLS_vFor(__VLS_nonNull(__VLS_6))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "feature" },
                    key: (line),
                });
                /** @type {__VLS_StyleScopedClasses['feature']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "check" },
                });
                /** @type {__VLS_StyleScopedClasses['check']} */ ;
                (line);
                // @ts-ignore
                [hasSelectedPlan, selectedPlanName, selectedPlanDesc, matchedPlan, matchedPlan, planLimitLines,];
            }
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "selected-plan-card" },
        });
        /** @type {__VLS_StyleScopedClasses['selected-plan-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-badge" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-badge']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
            ...{ class: "plan-name" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-name']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "plan-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-desc']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plan-features" },
        });
        /** @type {__VLS_StyleScopedClasses['plan-features']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "feature" },
        });
        /** @type {__VLS_StyleScopedClasses['feature']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "check" },
        });
        /** @type {__VLS_StyleScopedClasses['check']} */ ;
        (FREE_PLAN.value.trialDays);
        (FREE_PLAN.value.trialUrls);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "feature" },
        });
        /** @type {__VLS_StyleScopedClasses['feature']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "check" },
        });
        /** @type {__VLS_StyleScopedClasses['check']} */ ;
        (FREE_PLAN.value.monthlyUrls);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "feature" },
        });
        /** @type {__VLS_StyleScopedClasses['feature']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "check" },
        });
        /** @type {__VLS_StyleScopedClasses['check']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "signup-card" },
    });
    /** @type {__VLS_StyleScopedClasses['signup-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "signup-card__accent" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['signup-card__accent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "signup-card__head" },
    });
    /** @type {__VLS_StyleScopedClasses['signup-card__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "title" },
    });
    /** @type {__VLS_StyleScopedClasses['title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(handleGoogleSignup, {})) },
        type: "button",
        ...{ class: "btn-google" },
        disabled: (loading.value),
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "divider" },
    });
    /** @type {__VLS_StyleScopedClasses['divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_unwrap(handleRegister, {})) },
        novalidate: true,
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "signup-email",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (__VLS_unwrap(validateEmail, {})) },
        ...{ onInput: (...[$event]) => {
                void $event;
                return (emailError.value && __VLS_unwrap(validateEmail, {})());
                // @ts-ignore
                [FREE_PLAN, FREE_PLAN, FREE_PLAN, handleGoogleSignup, loading, handleRegister, validateEmail, validateEmail, emailError,];
            } },
        id: "signup-email",
        type: "email",
        autocomplete: "email",
        inputmode: "email",
        placeholder: "you@company.com",
        disabled: (loading.value),
        ...{ class: ({ 'has-error': emailError.value }) },
    });
    (__VLS_unwrap(email, {}));
    /** @type {__VLS_StyleScopedClasses['has-error']} */ ;
    if (emailError.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({
            ...{ class: "field-error" },
        });
        /** @type {__VLS_StyleScopedClasses['field-error']} */ ;
        (emailError.value);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "signup-password",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "password-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onInput: (__VLS_unwrap(validatePassword, {})) },
        id: "signup-password",
        type: (showPassword.value ? 'text' : 'password'),
        autocomplete: "new-password",
        placeholder: "Create a password",
        disabled: (loading.value),
        ...{ class: ({ 'has-error': __VLS_unwrap(passwordError, {}) }) },
    });
    (password.value);
    /** @type {__VLS_StyleScopedClasses['has-error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (showPassword.value = !showPassword.value);
                // @ts-ignore
                [loading, loading, emailError, emailError, emailError, email, validatePassword, showPassword, showPassword, showPassword, passwordError, password,];
            } },
        type: "button",
        ...{ class: "toggle" },
        'aria-label': (showPassword.value ? 'Hide password' : 'Show password'),
    });
    /** @type {__VLS_StyleScopedClasses['toggle']} */ ;
    (showPassword.value ? 'HIDE' : 'SHOW');
    if (password.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "pw-rules" },
            'aria-live': "polite",
        });
        /** @type {__VLS_StyleScopedClasses['pw-rules']} */ ;
        const __VLS_7 = __VLS_tryAsConstant((__VLS_unwrap(passwordRules, {})));
        for (const [r] of __VLS_vFor(__VLS_nonNull(__VLS_7))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (r.label),
                ...{ class: ({ ok: r.ok }) },
            });
            /** @type {__VLS_StyleScopedClasses['ok']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                'aria-hidden': "true",
            });
            (r.ok ? '✓' : '•');
            (r.label);
            // @ts-ignore
            [showPassword, showPassword, password, passwordRules,];
        }
    }
    if (hasSelectedPlan.value && selectedPlan.value !== 'trial') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "verification-notice" },
        });
        /** @type {__VLS_StyleScopedClasses['verification-notice']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "22,6 12,13 2,6",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "btn-primary" },
        disabled: (!isFormValid.value || loading.value),
    });
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    if (loading.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "spinner" },
        });
        /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
    }
    else if (hasSelectedPlan.value && selectedPlan.value !== 'trial') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "terms" },
    });
    /** @type {__VLS_StyleScopedClasses['terms']} */ ;
    let __VLS_8;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        // @ts-ignore
        to: "/terms",
    }));
    const __VLS_10 = __VLS_9({
        to: "/terms",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_11;
    const { default: __VLS_13 } = __VLS_nonNull(__VLS_11.slots);
    // @ts-ignore
    [hasSelectedPlan, hasSelectedPlan, loading, loading, selectedPlan, selectedPlan, isFormValid,];
    let __VLS_14;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        // @ts-ignore
        to: "/privacy",
    }));
    const __VLS_16 = __VLS_15({
        to: "/privacy",
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    var __VLS_17;
    const { default: __VLS_19 } = __VLS_nonNull(__VLS_17.slots);
    // @ts-ignore
    [];
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "login-text" },
    });
    /** @type {__VLS_StyleScopedClasses['login-text']} */ ;
    let __VLS_20;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        // @ts-ignore
        to: (selectedPlan.value ? `/login?plan=${selectedPlan.value}` : '/login'), ...{ class: "login-link" },
    }));
    const __VLS_22 = __VLS_21({
        to: (selectedPlan.value ? `/login?plan=${selectedPlan.value}` : '/login'),
        ...{ class: "login-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    /** @type {__VLS_StyleScopedClasses['login-link']} */ ;
    var __VLS_23;
    const { default: __VLS_25 } = __VLS_nonNull(__VLS_23.slots);
    // @ts-ignore
    [selectedPlan, selectedPlan,];
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
    // @ts-ignore
    [errorMessage, errorMessage,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

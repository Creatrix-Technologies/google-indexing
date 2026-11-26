/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { confirmEmail } from '../Store/auth';
const route = useRoute();
const router = useRouter();
const status = ref('loading');
const title = ref('Verification Failed');
const message = ref('This link may be expired or invalid.');
const selectedPlan = ref(route.query.plan);
const goToLogin = () => {
    // Get plan from localStorage (set during signup) or query param
    const plan = selectedPlan.value || localStorage.getItem('selectedPlan');
    if (plan) {
        router.push(`/login?plan=${plan}`);
    }
    else {
        router.push('/login');
    }
};
onMounted(async () => {
    const userId = route.query.userId;
    const token = route.query.token;
    if (!userId || !token) {
        status.value = 'error';
        title.value = 'Invalid Link';
        message.value = 'The confirmation link is missing required information.';
        return;
    }
    const success = await confirmEmail(userId, token);
    if (success) {
        status.value = 'success';
    }
    else {
        status.value = 'error';
        title.value = 'Verification Failed';
        message.value = 'We could not verify your email address.';
    }
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(status, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['state-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['state-icon--loading']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-arrow']} */ ;
    /** @type {__VLS_StyleScopedClasses['alert']} */ ;
    /** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "auth-container" },
    });
    /** @type {__VLS_StyleScopedClasses['auth-container']} */ ;
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
        ...{ class: "auth-card" },
    });
    /** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "auth-card__accent" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['auth-card__accent']} */ ;
    if (status.value === 'loading') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "state-icon state-icon--loading" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['state-icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['state-icon--loading']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.5",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M21 12a9 9 0 1 1-6.219-8.56",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "title" },
        });
        /** @type {__VLS_StyleScopedClasses['title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    }
    else if (status.value === 'success') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "state-icon state-icon--success" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['state-icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['state-icon--success']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "4 12 9 17 20 6",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "title" },
        });
        /** @type {__VLS_StyleScopedClasses['title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(goToLogin, {})) },
            ...{ class: "btn-primary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
            ...{ class: "btn-arrow" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-arrow']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "5",
            y1: "12",
            x2: "19",
            y2: "12",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "12 5 19 12 12 19",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "state-icon state-icon--error" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['state-icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['state-icon--error']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "title" },
        });
        /** @type {__VLS_StyleScopedClasses['title']} */ ;
        (__VLS_unwrap(title, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
        (__VLS_unwrap(message, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert alert--error" },
            role: "alert",
        });
        /** @type {__VLS_StyleScopedClasses['alert']} */ ;
        /** @type {__VLS_StyleScopedClasses['alert--error']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(goToLogin, {})) },
            ...{ class: "btn-primary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    }
    // @ts-ignore
    [status, status, goToLogin, goToLogin, title, message,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

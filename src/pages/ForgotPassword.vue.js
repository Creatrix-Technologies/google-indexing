/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import api from '../api';
const email = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const handleSubmit = async () => {
    errorMessage.value = '';
    successMessage.value = '';
    if (!email.value) {
        errorMessage.value = 'Please enter your email address.';
        return;
    }
    try {
        loading.value = true;
        await api.post('/forgot-password', { email: email.value });
        successMessage.value = 'If that email is registered, a reset link has been sent. Check your inbox.';
        email.value = '';
    }
    catch (err) {
        errorMessage.value = err?.response?.data?.message || 'Something went wrong. Please try again.';
    }
    finally {
        loading.value = false;
    }
};
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(successMessage, {});
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(errorMessage, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['auth-card__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
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
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        to: "/login", ...{ class: "back-link" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/login",
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "auth-card__hero" },
    });
    /** @type {__VLS_StyleScopedClasses['auth-card__hero']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "auth-card__icon" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['auth-card__icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.5",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M4 7.5h16c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V9c0-.83.67-1.5 1.5-1.5Z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "m2.5 9 7.35 5.51a1.5 1.5 0 0 0 1.8 0L21.5 9",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "auth-card__head" },
    });
    /** @type {__VLS_StyleScopedClasses['auth-card__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "title" },
    });
    /** @type {__VLS_StyleScopedClasses['title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    if (!successMessage.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            for: "fp-email",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onKeyup: (__VLS_unwrap(handleSubmit, {})) },
            id: "fp-email",
            type: "email",
            placeholder: "you@example.com",
            autocomplete: "email",
            disabled: (loading.value),
        });
        (__VLS_unwrap(email, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(handleSubmit, {})) },
            ...{ class: "btn-primary" },
            disabled: (loading.value),
        });
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        if (loading.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "spinner" },
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['spinner']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (loading.value ? 'Sending...' : 'Send reset link');
        if (errorMessage.value) {
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
            (errorMessage.value);
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "alert alert--success" },
            role: "status",
        });
        /** @type {__VLS_StyleScopedClasses['alert']} */ ;
        /** @type {__VLS_StyleScopedClasses['alert--success']} */ ;
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "7 12 10.5 15.5 17 8.5",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (successMessage.value);
    }
    // @ts-ignore
    [successMessage, successMessage, handleSubmit, handleSubmit, loading, loading, loading, loading, email, errorMessage, errorMessage,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

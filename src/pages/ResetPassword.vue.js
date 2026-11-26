/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import api from '../api';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const email = route.query.email;
const token = route.query.token;
const newPassword = ref('');
const confirmPassword = ref('');
const showNew = ref(false);
const showConfirm = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const handleReset = async () => {
    errorMessage.value = '';
    successMessage.value = '';
    if (!newPassword.value || !confirmPassword.value) {
        errorMessage.value = 'Please fill in both password fields.';
        return;
    }
    if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match.';
        return;
    }
    try {
        loading.value = true;
        await api.post('/reset-password', {
            email,
            token,
            newPassword: newPassword.value
        });
        successMessage.value = 'Password reset successful! Redirecting to login...';
        setTimeout(() => router.push('/login'), 1800);
    }
    catch (err) {
        errorMessage.value =
            err?.response?.data?.error?.description ||
                err?.response?.data?.message ||
                'Reset failed. The link may have expired.';
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
    __VLS_withDotValue(showNew, {});
    __VLS_withDotValue(showConfirm, {});
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(errorMessage, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['back-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['auth-card__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
        x: "3",
        y: "11",
        width: "18",
        height: "11",
        rx: "2",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M7 11V7a5 5 0 0 1 10 0v4",
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
            for: "rp-new",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "password-wrapper" },
        });
        /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            id: "rp-new",
            type: (showNew.value ? 'text' : 'password'),
            placeholder: "Enter new password",
            autocomplete: "new-password",
            disabled: (loading.value),
        });
        (__VLS_unwrap(newPassword, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    if (!(!successMessage.value))
                        throw 0;
                    return (showNew.value = !showNew.value);
                    // @ts-ignore
                    [successMessage, showNew, showNew, showNew, loading, newPassword,];
                } },
            type: "button",
            ...{ class: "toggle" },
            'aria-label': (showNew.value ? 'Hide password' : 'Show password'),
        });
        /** @type {__VLS_StyleScopedClasses['toggle']} */ ;
        (showNew.value ? 'HIDE' : 'SHOW');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-group" },
        });
        /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            for: "rp-confirm",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "password-wrapper" },
        });
        /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onKeyup: (__VLS_unwrap(handleReset, {})) },
            id: "rp-confirm",
            type: (showConfirm.value ? 'text' : 'password'),
            placeholder: "Confirm new password",
            autocomplete: "new-password",
            disabled: (loading.value),
        });
        (__VLS_unwrap(confirmPassword, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    if (!(!successMessage.value))
                        throw 0;
                    return (showConfirm.value = !showConfirm.value);
                    // @ts-ignore
                    [showNew, showNew, loading, handleReset, showConfirm, showConfirm, showConfirm, confirmPassword,];
                } },
            type: "button",
            ...{ class: "toggle" },
            'aria-label': (showConfirm.value ? 'Hide password' : 'Show password'),
        });
        /** @type {__VLS_StyleScopedClasses['toggle']} */ ;
        (showConfirm.value ? 'HIDE' : 'SHOW');
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(handleReset, {})) },
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
        (loading.value ? 'Resetting...' : 'Reset password');
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
    [successMessage, loading, loading, loading, handleReset, showConfirm, showConfirm, errorMessage, errorMessage,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

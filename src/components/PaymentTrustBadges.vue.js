/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
const { defineProps, withDefaults, } = {};
const __VLS_props = withDefaults(defineProps(), { variant: 'full', showWallets: true });
function brandHref(name) {
    const base = import.meta.env.BASE_URL || '/';
    const root = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${root}/payment-brands/${name}`;
}
const __VLS_defaults = { variant: 'full', showWallets: true };
void __VLS_defaults;
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    void {};
    /** @type {__VLS_StyleScopedClasses['payment-trust--compact']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust--compact']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__row']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust--compact']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__row']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust--compact']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__icon--amex']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust--compact']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__icon--wallet']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__stripe']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust--compact']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__stripe']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__stripe-mark']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust--compact']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__stripe-mark']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust--compact']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__stripe-name']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-trust__icon']} */ ;
    if (__VLS_ctx.variant === 'inline') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "payment-inline" },
            'aria-label': "Secured checkout with Stripe",
        });
        /** @type {__VLS_StyleScopedClasses['payment-inline']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-inline__img" },
            src: (brandHref('visa.svg')),
            alt: "Visa",
            width: "34",
            height: "22",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-inline__img']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-inline__img payment-inline__img--mastercard" },
            src: (brandHref('mastercard.svg')),
            alt: "Mastercard",
            width: "28",
            height: "22",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-inline__img']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-inline__img--mastercard']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-inline__img payment-inline__img--amex" },
            src: (brandHref('americanexpress.svg')),
            alt: "Amex",
            width: "40",
            height: "22",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-inline__img']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-inline__img--amex']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-inline__img" },
            src: (brandHref('discover.svg')),
            alt: "Discover",
            width: "34",
            height: "22",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-inline__img']} */ ;
        if (__VLS_ctx.showWallets) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                ...{ class: "payment-inline__img" },
                src: (brandHref('applepay.svg')),
                alt: "Apple Pay",
                width: "32",
                height: "20",
                decoding: "async",
            });
            /** @type {__VLS_StyleScopedClasses['payment-inline__img']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                ...{ class: "payment-inline__img" },
                src: (brandHref('googlepay.svg')),
                alt: "Google Pay",
                width: "36",
                height: "20",
                decoding: "async",
            });
            /** @type {__VLS_StyleScopedClasses['payment-inline__img']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "payment-inline__rule" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['payment-inline__rule']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-inline__stripe-mark" },
            src: (brandHref('stripe-mark.svg')),
            alt: "",
            width: "16",
            height: "16",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-inline__stripe-mark']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "payment-inline__stripe-label" },
        });
        /** @type {__VLS_StyleScopedClasses['payment-inline__stripe-label']} */ ;
    }
    else if (__VLS_ctx.variant === 'footer-bar') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "payment-footer-bar" },
            'aria-label': "Accepted payment methods; processed with Stripe where available.",
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "payment-trust__sr-only" },
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__sr-only']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "payment-footer-bar__strip" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__strip']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-footer-bar__img payment-footer-bar__img--visa" },
            src: (brandHref('visa.svg')),
            alt: "",
            width: "40",
            height: "24",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img--visa']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-footer-bar__img payment-footer-bar__img--mastercard" },
            src: (brandHref('mastercard.svg')),
            alt: "",
            width: "32",
            height: "24",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img--mastercard']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-footer-bar__img payment-footer-bar__img--amex" },
            src: (brandHref('americanexpress.svg')),
            alt: "",
            width: "48",
            height: "24",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img--amex']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-footer-bar__img" },
            src: (brandHref('discover.svg')),
            alt: "",
            width: "40",
            height: "24",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img']} */ ;
        if (__VLS_ctx.showWallets) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                ...{ class: "payment-footer-bar__img payment-footer-bar__img--wallet" },
                src: (brandHref('applepay.svg')),
                alt: "",
                width: "36",
                height: "22",
                decoding: "async",
            });
            /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img']} */ ;
            /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img--wallet']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                ...{ class: "payment-footer-bar__img payment-footer-bar__img--wallet" },
                src: (brandHref('googlepay.svg')),
                alt: "",
                width: "40",
                height: "22",
                decoding: "async",
            });
            /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img']} */ ;
            /** @type {__VLS_StyleScopedClasses['payment-footer-bar__img--wallet']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span)({
            ...{ class: "payment-footer-bar__rule" },
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__rule']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "payment-footer-bar__processor" },
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__processor']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-footer-bar__stripe-icon" },
            src: (brandHref('stripe-mark.svg')),
            alt: "",
            width: "22",
            height: "22",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__stripe-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "payment-footer-bar__stripe-label" },
        });
        /** @type {__VLS_StyleScopedClasses['payment-footer-bar__stripe-label']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "payment-trust" },
            ...{ class: ([`payment-trust--${__VLS_ctx.variant}`]) },
            'aria-label': "Accepted payment methods and processor",
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "payment-trust__sr-only" },
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__sr-only']} */ ;
        if (__VLS_ctx.variant === 'full') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "payment-trust__eyebrow" },
            });
            /** @type {__VLS_StyleScopedClasses['payment-trust__eyebrow']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "payment-trust__eyebrow payment-trust__eyebrow--compact" },
            });
            /** @type {__VLS_StyleScopedClasses['payment-trust__eyebrow']} */ ;
            /** @type {__VLS_StyleScopedClasses['payment-trust__eyebrow--compact']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "payment-trust__row payment-trust__row--cards" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__row']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-trust__row--cards']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-trust__icon payment-trust__icon--visa" },
            src: (brandHref('visa.svg')),
            alt: "",
            width: "56",
            height: "36",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-trust__icon--visa']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-trust__icon payment-trust__icon--mastercard" },
            src: (brandHref('mastercard.svg')),
            alt: "",
            width: "42",
            height: "36",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-trust__icon--mastercard']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-trust__icon payment-trust__icon--amex" },
            src: (brandHref('americanexpress.svg')),
            alt: "",
            width: "72",
            height: "36",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-trust__icon--amex']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-trust__icon payment-trust__icon--discover" },
            src: (brandHref('discover.svg')),
            alt: "",
            width: "56",
            height: "36",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['payment-trust__icon--discover']} */ ;
        if (__VLS_ctx.showWallets) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "payment-trust__row payment-trust__row--wallets" },
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['payment-trust__row']} */ ;
            /** @type {__VLS_StyleScopedClasses['payment-trust__row--wallets']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                ...{ class: "payment-trust__icon payment-trust__icon--wallet" },
                src: (brandHref('applepay.svg')),
                alt: "",
                width: "48",
                height: "32",
                decoding: "async",
            });
            /** @type {__VLS_StyleScopedClasses['payment-trust__icon']} */ ;
            /** @type {__VLS_StyleScopedClasses['payment-trust__icon--wallet']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                ...{ class: "payment-trust__icon payment-trust__icon--wallet" },
                src: (brandHref('googlepay.svg')),
                alt: "",
                width: "52",
                height: "32",
                decoding: "async",
            });
            /** @type {__VLS_StyleScopedClasses['payment-trust__icon']} */ ;
            /** @type {__VLS_StyleScopedClasses['payment-trust__icon--wallet']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "payment-trust__stripe" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__stripe']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            ...{ class: "payment-trust__stripe-mark" },
            src: (brandHref('stripe-mark.svg')),
            alt: "",
            width: "38",
            height: "38",
            decoding: "async",
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__stripe-mark']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "payment-trust__stripe-copy" },
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__stripe-copy']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "payment-trust__stripe-powered" },
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__stripe-powered']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "payment-trust__stripe-name" },
        });
        /** @type {__VLS_StyleScopedClasses['payment-trust__stripe-name']} */ ;
    }
    // @ts-ignore
    [variant, variant, variant, variant, showWallets, showWallets, showWallets,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};

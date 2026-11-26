/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ContactForm from '../components/ContactForm.vue';
import MarketingSiteFooter from '../components/MarketingSiteFooter.vue';
import MarketingHeader from '../components/marketing/MarketingHeader.vue';
import { refreshApi } from '../api';
import { FREE_PLAN, fetchPublicSubscriptionPlans, isTrialPlan, planLimitLines, planSlug } from '../Shared/publicPlans';
const showScrollTop = ref(false);
const plans = ref([]);
const plansError = ref('');
const displayPlans = computed(() => [...plans.value].sort((a, b) => {
    if (isTrialPlan(a) !== isTrialPlan(b))
        return isTrialPlan(a) ? -1 : 1;
    return a.amount - b.amount;
}));
const showDefaultTrial = computed(() => !displayPlans.value.some((plan) => isTrialPlan(plan)));
const isPopularPlan = (plan) => plan.name.toLowerCase().includes('pro');
const currencySymbol = (currency) => {
    const normalized = (currency || 'USD').toUpperCase();
    return normalized === 'USD' ? '$' : `${normalized} `;
};
const formatAmount = (amount) => {
    const value = Number(amount);
    if (Number.isNaN(value))
        return '0';
    return value.toLocaleString('en-US', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    });
};
const formatPeriod = (duration) => {
    const normalized = (duration || '').toLowerCase();
    if (normalized.includes('year'))
        return 'yr';
    if (normalized.includes('month'))
        return 'mo';
    if (normalized.includes('week'))
        return 'wk';
    if (normalized.includes('day'))
        return 'day';
    return '';
};
const planCtaPath = (plan) => {
    const slug = planSlug(plan.name);
    return `/signup?plan=${slug}`;
};
const planCtaLabel = (plan) => (isTrialPlan(plan) ? 'Start free' : `Get ${plan.name}`);
const planCtaClass = (plan) => {
    if (isTrialPlan(plan))
        return 'pricing-cta-outline';
    if (isPopularPlan(plan))
        return 'pricing-cta-primary';
    return '';
};
const fetchPlans = async () => {
    plansError.value = '';
    try {
        plans.value = await fetchPublicSubscriptionPlans(refreshApi);
    }
    catch {
        plansError.value = 'Unable to load current pricing. Please refresh or contact sales.';
        plans.value = [];
    }
};
const onScroll = () => {
    showScrollTop.value = window.scrollY > 320;
};
const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
onMounted(() => {
    void fetchPlans();
    const mesh = document.querySelector('.pricing-page .mesh-gradient');
    if (mesh) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            mesh.style.setProperty('--mouse-x', `${x}%`);
            mesh.style.setProperty('--mouse-y', `${y}%`);
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
});
onUnmounted(() => {
    window.removeEventListener('scroll', onScroll);
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(showDefaultTrial, {});
    __VLS_withDotValue(FREE_PLAN, {});
    __VLS_withDotValue(plansError, {});
    __VLS_withDotValue(showScrollTop, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-hero']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-hero']} */ ;
    /** @type {__VLS_StyleScopedClasses['api-limit-note']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-popular']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-card-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['price']} */ ;
    /** @type {__VLS_StyleScopedClasses['price']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-features']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-features']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['verify-hint']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-cta-outline']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-cta-outline']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-cta-outline']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-cta-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-cta-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-annual']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-contact__intro']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-contact__intro']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-contact__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-contact__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-contact__direct']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-contact__direct']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-contact']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-contact__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-contact__form']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['scroll-top-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-popular']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-popular']} */ ;
    /** @type {__VLS_StyleScopedClasses['container']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['logo']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta-pill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pricing-page" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-page']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mesh-gradient" },
    });
    /** @type {__VLS_StyleScopedClasses['mesh-gradient']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grain-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['grain-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "container" },
    });
    /** @type {__VLS_StyleScopedClasses['container']} */ ;
    const __VLS_0 = MarketingHeader;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        ...{ class: "fade-in-motion" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "fade-in-motion" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "pricing-hero" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-hero']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "accent" },
    });
    /** @type {__VLS_StyleScopedClasses['accent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "pricing-subtext" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-subtext']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "api-limit-note fade-in-motion delay-1" },
    });
    /** @type {__VLS_StyleScopedClasses['api-limit-note']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "api-limit-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['api-limit-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "16",
        height: "16",
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pricing-grid fade-in-motion delay-1" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-1']} */ ;
    if (showDefaultTrial.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            ...{ class: "pricing-card glass-card" },
        });
        /** @type {__VLS_StyleScopedClasses['pricing-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-glow" },
        });
        /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pricing-card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['pricing-card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "price" },
        });
        /** @type {__VLS_StyleScopedClasses['price']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "amount" },
        });
        /** @type {__VLS_StyleScopedClasses['amount']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "price-note" },
        });
        /** @type {__VLS_StyleScopedClasses['price-note']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "pricing-features" },
        });
        /** @type {__VLS_StyleScopedClasses['pricing-features']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
        (FREE_PLAN.value.trialDays);
        (FREE_PLAN.value.trialUrls);
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
        (FREE_PLAN.value.monthlyUrls);
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
        (FREE_PLAN.value.sites);
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
        let __VLS_5;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            // @ts-ignore
            to: "/signup?plan=trial", ...{ class: "pricing-cta pricing-cta-outline" },
        }));
        const __VLS_7 = __VLS_6({
            to: "/signup?plan=trial",
            ...{ class: "pricing-cta pricing-cta-outline" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        /** @type {__VLS_StyleScopedClasses['pricing-cta']} */ ;
        /** @type {__VLS_StyleScopedClasses['pricing-cta-outline']} */ ;
        var __VLS_8;
        const { default: __VLS_10 } = __VLS_nonNull(__VLS_8.slots);
        // @ts-ignore
        [showDefaultTrial, FREE_PLAN, FREE_PLAN, FREE_PLAN, FREE_PLAN,];
    }
    const __VLS_11 = __VLS_tryAsConstant((__VLS_unwrap(displayPlans, {})));
    for (const [plan] of __VLS_vFor(__VLS_nonNull(__VLS_11))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (plan.id),
            ...{ class: "pricing-card glass-card" },
            ...{ class: ({
                    'main-card pricing-popular': __VLS_unwrap(isPopularPlan, {})(plan),
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['pricing-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['main-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['pricing-popular']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-glow" },
        });
        /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
        if (__VLS_unwrap(isPopularPlan, {})(plan)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "popular-badge" },
            });
            /** @type {__VLS_StyleScopedClasses['popular-badge']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pricing-card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['pricing-card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        (plan.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "price" },
        });
        /** @type {__VLS_StyleScopedClasses['price']} */ ;
        if (__VLS_unwrap(isTrialPlan, {})(plan)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "amount" },
            });
            /** @type {__VLS_StyleScopedClasses['amount']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "currency" },
            });
            /** @type {__VLS_StyleScopedClasses['currency']} */ ;
            (__VLS_unwrap(currencySymbol, {})(plan.currency));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "amount" },
            });
            /** @type {__VLS_StyleScopedClasses['amount']} */ ;
            (__VLS_unwrap(formatAmount, {})(plan.amount));
            if (__VLS_unwrap(formatPeriod, {})(plan.duration)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "period" },
                });
                /** @type {__VLS_StyleScopedClasses['period']} */ ;
                (__VLS_unwrap(formatPeriod, {})(plan.duration));
            }
        }
        if (!__VLS_unwrap(isTrialPlan, {})(plan)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "pricing-features" },
            });
            /** @type {__VLS_StyleScopedClasses['pricing-features']} */ ;
            const __VLS_12 = __VLS_tryAsConstant((__VLS_unwrap(planLimitLines, {})(plan)));
            for (const [line] of __VLS_vFor(__VLS_nonNull(__VLS_12))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (line),
                });
                (line);
                // @ts-ignore
                [displayPlans, isPopularPlan, isPopularPlan, isTrialPlan, isTrialPlan, currencySymbol, formatAmount, formatPeriod, formatPeriod, planLimitLines,];
            }
        }
        if (plan.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "pricing-card__desc" },
            });
            const __VLS_13 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
            __VLS_13(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (plan.description), }, ...__VLS_directiveHookArgsRest(__VLS_13));
            /** @type {__VLS_StyleScopedClasses['pricing-card__desc']} */ ;
        }
        if (!__VLS_unwrap(isTrialPlan, {})(plan)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "verify-hint" },
            });
            /** @type {__VLS_StyleScopedClasses['verify-hint']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                points: "22,6 12,13 2,6",
            });
        }
        let __VLS_14;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            // @ts-ignore
            to: (__VLS_unwrap(planCtaPath, {})(plan)), ...{ class: "pricing-cta" }, ...{ class: (__VLS_unwrap(planCtaClass, {})(plan)) },
        }));
        const __VLS_16 = __VLS_15({
            to: (__VLS_unwrap(planCtaPath, {})(plan)),
            ...{ class: "pricing-cta" },
            ...{ class: (__VLS_unwrap(planCtaClass, {})(plan)) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        /** @type {__VLS_StyleScopedClasses['pricing-cta']} */ ;
        var __VLS_17;
        const { default: __VLS_19 } = __VLS_nonNull(__VLS_17.slots);
        (__VLS_unwrap(planCtaLabel, {})(plan));
        // @ts-ignore
        [isTrialPlan, planCtaPath, planCtaClass, planCtaLabel,];
        // @ts-ignore
        [];
    }
    if (plansError.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "pricing-load-error" },
        });
        /** @type {__VLS_StyleScopedClasses['pricing-load-error']} */ ;
        (plansError.value);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "compat-strip fade-in-motion delay-2" },
    });
    /** @type {__VLS_StyleScopedClasses['compat-strip']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "compat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['compat-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "compat-divider" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['compat-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "compat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['compat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "compat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['compat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "compat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['compat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "compat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['compat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "compat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['compat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "compat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['compat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "compat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['compat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "pricing-annual fade-in-motion delay-2" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-annual']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "#pricing-contact",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        id: "pricing-contact",
        ...{ class: "pricing-contact fade-in-motion delay-2" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-contact']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pricing-contact__intro" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-contact__intro']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "pricing-contact__eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-contact__eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "pricing-contact__list" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-contact__list']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "20 6 9 17 4 12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "20 6 9 17 4 12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "20 6 9 17 4 12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "20 6 9 17 4 12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "pricing-contact__direct" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-contact__direct']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "mailto:sales@nopbooster.com",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pricing-contact__form glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-contact__form']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    const __VLS_20 = ContactForm;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        // @ts-ignore
        defaultSubject: "Pricing inquiry",
    }));
    const __VLS_22 = __VLS_21({
        defaultSubject: "Pricing inquiry",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_25 = MarketingSiteFooter;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        // @ts-ignore
        ...{ class: "fade-in-motion delay-3" },
    }));
    const __VLS_27 = __VLS_26({
        ...{ class: "fade-in-motion delay-3" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-3']} */ ;
    if (showScrollTop.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(scrollToTop, {})) },
            ...{ class: "scroll-top-btn" },
            type: "button",
            'aria-label': "Go to top",
        });
        /** @type {__VLS_StyleScopedClasses['scroll-top-btn']} */ ;
    }
    // @ts-ignore
    [plansError, plansError, showScrollTop, scrollToTop,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

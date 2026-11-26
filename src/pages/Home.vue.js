/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onMounted, onUnmounted, ref } from 'vue';
import ContactForm from '../components/ContactForm.vue';
import MarketingSiteFooter from '../components/MarketingSiteFooter.vue';
import MarketingHeader from '../components/marketing/MarketingHeader.vue';
import IndexingPipelineDemo from '../components/marketing/IndexingPipelineDemo.vue';
import CoverageChart from '../components/marketing/CoverageChart.vue';
import ReliabilitySection from '../components/marketing/ReliabilitySection.vue';
import { refreshApi } from '../api';
import { fetchPublicSubscriptionPlans, formatPublicPlanAmount, lowestPaidMonthlyAmount, } from '../Shared/publicPlans';
const showScrollTop = ref(false);
const paidFromMonthly = ref(null);
const onScroll = () => {
    showScrollTop.value = window.scrollY > 420;
};
const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
onMounted(() => {
    void (async () => {
        try {
            const plans = await fetchPublicSubscriptionPlans(refreshApi);
            paidFromMonthly.value = lowestPaidMonthlyAmount(plans);
        }
        catch {
            paidFromMonthly.value = null;
        }
    })();
    document.querySelector('.home-page')?.classList.add('is-enhanced');
    // Scroll-reveal observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // Animate chart line on first reveal
                const line = entry.target.querySelector('.api-line');
                if (line)
                    line.style.strokeDashoffset = '0';
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal-hidden').forEach((el) => observer.observe(el));
    // Mouse parallax on mesh gradient
    const mesh = document.querySelector('.mesh-gradient');
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
    __VLS_withDotValue(paidFromMonthly, {});
    __VLS_withDotValue(showScrollTop, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero-proof']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero-proof']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-hero-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-hero-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-teaser']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-teaser']} */ ;
    /** @type {__VLS_StyleScopedClasses['trust-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['trust-logos']} */ ;
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['impact-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['impact-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
    /** @type {__VLS_StyleScopedClasses['process-step']} */ ;
    /** @type {__VLS_StyleScopedClasses['process-step']} */ ;
    /** @type {__VLS_StyleScopedClasses['process-step']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-form-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-form-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-side']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-side__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-side__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-side__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-side__direct']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-side__direct']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-side__direct']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-form-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-form-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-side']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-card__details']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-card__details']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-card__details']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-card__details']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-email']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-email']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-socials']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-socials']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-socials']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['home-page']} */ ;
    /** @type {__VLS_StyleScopedClasses['scroll-top-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['home-page']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-enhanced']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero-proof']} */ ;
    /** @type {__VLS_StyleScopedClasses['pricing-teaser']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
    /** @type {__VLS_StyleScopedClasses['features-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['impact-metrics']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['process-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['process-arrow']} */ ;
    /** @type {__VLS_StyleScopedClasses['process-step']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['impact-metrics']} */ ;
    /** @type {__VLS_StyleScopedClasses['container']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['logo']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero-subtext']} */ ;
    /** @type {__VLS_StyleScopedClasses['hero-proof']} */ ;
    /** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-links']} */ ;
    /** @type {__VLS_StyleScopedClasses['trust-logos']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-bottom']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['impact-metrics']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta-pill']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "home-page" },
    });
    /** @type {__VLS_StyleScopedClasses['home-page']} */ ;
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
        ...{ class: "hero" },
    });
    /** @type {__VLS_StyleScopedClasses['hero']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-copy" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "badge" },
    });
    /** @type {__VLS_StyleScopedClasses['badge']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "accent" },
    });
    /** @type {__VLS_StyleScopedClasses['accent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "hero-subtext fade-in-motion delay-1" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-subtext']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-actions fade-in-motion delay-2" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-2']} */ ;
    let __VLS_5;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        // @ts-ignore
        to: "/signup?plan=trial", ...{ class: "btn-hero-primary" },
    }));
    const __VLS_7 = __VLS_6({
        to: "/signup?plan=trial",
        ...{ class: "btn-hero-primary" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    /** @type {__VLS_StyleScopedClasses['btn-hero-primary']} */ ;
    var __VLS_8;
    const { default: __VLS_10 } = __VLS_nonNull(__VLS_8.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "#how-it-works",
        ...{ class: "btn-hero-secondary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-hero-secondary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "hero-proof fade-in-motion delay-3" },
        'aria-label': "Highlights",
    });
    /** @type {__VLS_StyleScopedClasses['hero-proof']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 16 16",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M3.5 8.5l3 3 6-7",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 16 16",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M3.5 8.5l3 3 6-7",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 16 16",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M3.5 8.5l3 3 6-7",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "pricing-teaser fade-in-motion delay-3" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-teaser']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-3']} */ ;
    let __VLS_11;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        // @ts-ignore
        to: "/tools/indexability-checker",
    }));
    const __VLS_13 = __VLS_12({
        to: "/tools/indexability-checker",
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    var __VLS_14;
    const { default: __VLS_16 } = __VLS_nonNull(__VLS_14.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "pricing-teaser fade-in-motion delay-3" },
    });
    /** @type {__VLS_StyleScopedClasses['pricing-teaser']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-3']} */ ;
    let __VLS_17;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        // @ts-ignore
        to: "/pricing",
    }));
    const __VLS_19 = __VLS_18({
        to: "/pricing",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    var __VLS_20;
    const { default: __VLS_22 } = __VLS_nonNull(__VLS_20.slots);
    if (paidFromMonthly.value != null) {
        (__VLS_unwrap(formatPublicPlanAmount, {})(paidFromMonthly.value));
    }
    else {
        let __VLS_23;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
            // @ts-ignore
            to: "/pricing",
        }));
        const __VLS_25 = __VLS_24({
            to: "/pricing",
        }, ...__VLS_functionalComponentArgsRest(__VLS_24));
        var __VLS_26;
        const { default: __VLS_28 } = __VLS_nonNull(__VLS_26.slots);
        // @ts-ignore
        [paidFromMonthly, paidFromMonthly, formatPublicPlanAmount,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-visual fade-in-motion delay-2" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-2']} */ ;
    const __VLS_29 = IndexingPipelineDemo;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    // @ts-ignore
    }));
    const __VLS_31 = __VLS_30({}, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "trust-section fade-in-motion delay-3" },
    });
    /** @type {__VLS_StyleScopedClasses['trust-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "trust-logos" },
    });
    /** @type {__VLS_StyleScopedClasses['trust-logos']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-divider fade-in-motion delay-3" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        id: "features",
        ...{ class: "features-section fade-in-motion delay-4" },
    });
    /** @type {__VLS_StyleScopedClasses['features-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-4']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "features-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['features-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "glass-card reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "13 2 13 9 20 9",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9l7 7v9a2 2 0 0 1-2 2z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "glass-card main-card reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['main-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "18",
        y1: "20",
        x2: "18",
        y2: "10",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "12",
        y1: "20",
        x2: "12",
        y2: "4",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "6",
        y1: "20",
        x2: "6",
        y2: "14",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "glass-card reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "12",
        cy: "12",
        r: "10",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "12 6 12 12 16 14",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-divider fade-in-motion delay-5" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-divider']} */ ;
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-5']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        id: "results",
        ...{ class: "impact-section reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['impact-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "impact-header" },
    });
    /** @type {__VLS_StyleScopedClasses['impact-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "section-eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['section-eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chart-container glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    const __VLS_34 = CoverageChart;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    // @ts-ignore
    }));
    const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "impact-metrics" },
    });
    /** @type {__VLS_StyleScopedClasses['impact-metrics']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "metric" },
    });
    /** @type {__VLS_StyleScopedClasses['metric']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "metric-number" },
    });
    /** @type {__VLS_StyleScopedClasses['metric-number']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "metric-label" },
    });
    /** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "metric" },
    });
    /** @type {__VLS_StyleScopedClasses['metric']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "metric-number" },
    });
    /** @type {__VLS_StyleScopedClasses['metric-number']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "metric-label" },
    });
    /** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "metric" },
    });
    /** @type {__VLS_StyleScopedClasses['metric']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "metric-number" },
    });
    /** @type {__VLS_StyleScopedClasses['metric-number']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "metric-label" },
    });
    /** @type {__VLS_StyleScopedClasses['metric-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        id: "how-it-works",
        ...{ class: "process-section reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['process-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "process-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['process-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "process-step" },
    });
    /** @type {__VLS_StyleScopedClasses['process-step']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-num" },
    });
    /** @type {__VLS_StyleScopedClasses['step-num']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "process-arrow" },
    });
    /** @type {__VLS_StyleScopedClasses['process-arrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 50 20",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M0 10 L45 10 M35 5 L45 10 L35 15",
        fill: "none",
        stroke: "currentColor",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "process-step active" },
    });
    /** @type {__VLS_StyleScopedClasses['process-step']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-num" },
    });
    /** @type {__VLS_StyleScopedClasses['step-num']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "process-arrow" },
    });
    /** @type {__VLS_StyleScopedClasses['process-arrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 50 20",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M0 10 L45 10 M35 5 L45 10 L35 15",
        fill: "none",
        stroke: "currentColor",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "process-step" },
    });
    /** @type {__VLS_StyleScopedClasses['process-step']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-num" },
    });
    /** @type {__VLS_StyleScopedClasses['step-num']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-divider']} */ ;
    const __VLS_39 = ReliabilitySection;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
        // @ts-ignore
        ...{ class: "reveal-hidden" },
    }));
    const __VLS_41 = __VLS_40({
        ...{ class: "reveal-hidden" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        id: "faq",
        ...{ class: "faq-section reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['faq-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "faq-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['faq-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "faq-item glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['faq-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "faq-item glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['faq-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "faq-item glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['faq-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "faq-item glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['faq-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "faq-item glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['faq-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "cta-section reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['cta-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cta-card glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['cta-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    let __VLS_44;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
        // @ts-ignore
        to: "/signup?plan=trial", ...{ class: "btn-hero-primary" },
    }));
    const __VLS_46 = __VLS_45({
        to: "/signup?plan=trial",
        ...{ class: "btn-hero-primary" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    /** @type {__VLS_StyleScopedClasses['btn-hero-primary']} */ ;
    var __VLS_47;
    const { default: __VLS_49 } = __VLS_nonNull(__VLS_47.slots);
    // @ts-ignore
    [];
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hero-divider" },
    });
    /** @type {__VLS_StyleScopedClasses['hero-divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        id: "contact",
        ...{ class: "contact-section reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-form-block reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-form-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-form-card glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-form-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-form-card__head" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-form-card__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-form-card__eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-form-card__eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    const __VLS_50 = ContactForm;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    // @ts-ignore
    }));
    const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        ...{ class: "contact-side glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-side']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "contact-side__list" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-side__list']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-side__num" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-side__num']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-side__num" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-side__num']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-side__num" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-side__num']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-side__direct" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-side__direct']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "mailto:sales@nopbooster.com",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-card glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: "https://flagcdn.com/40x30/np.png",
        width: "40",
        height: "30",
        alt: "Nepal",
        ...{ class: "contact-card__flag" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card__flag']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "contact-card__region" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card__region']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "contact-card__details" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card__details']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.57 3.4 2 2 0 0 1 3.54 1.26h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.9-.9a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.71A2 2 0 0 1 22 16.92z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "tel:+9779851357889",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "12",
        cy: "10",
        r: "3",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://maps.google.com/?q=Lalitpur,Kathmandu,Nepal",
        target: "_blank",
        rel: "noopener",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-card glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: "https://flagcdn.com/40x30/us.png",
        width: "40",
        height: "30",
        alt: "United States",
        ...{ class: "contact-card__flag" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card__flag']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "contact-card__region" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card__region']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "contact-card__details" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card__details']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.57 3.4 2 2 0 0 1 3.54 1.26h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.9-.9a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.71A2 2 0 0 1 22 16.92z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "tel:+16125827037",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "12",
        cy: "10",
        r: "3",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://maps.google.com/?q=Minneapolis,MN,USA",
        target: "_blank",
        rel: "noopener",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-card glass-card main-card" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['main-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-glow" },
    });
    /** @type {__VLS_StyleScopedClasses['card-glow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: "https://flagcdn.com/40x30/ae.png",
        width: "40",
        height: "30",
        alt: "United Arab Emirates",
        ...{ class: "contact-card__flag" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card__flag']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "contact-card__region" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card__region']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "contact-card__details" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-card__details']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.57 3.4 2 2 0 0 1 3.54 1.26h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.71 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.9-.9a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.71A2 2 0 0 1 22 16.92z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "tel:+971526223988",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "12",
        cy: "10",
        r: "3",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://maps.google.com/?q=Dubai,UAE",
        target: "_blank",
        rel: "noopener",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-bottom reveal-hidden" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-bottom']} */ ;
    /** @type {__VLS_StyleScopedClasses['reveal-hidden']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "mailto:sales@nopbooster.com",
        ...{ class: "contact-email" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-email']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
        x: "2",
        y: "4",
        width: "20",
        height: "16",
        rx: "2",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "2 4 12 13 22 4",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-socials" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-socials']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://facebook.com/creatrixVentures/",
        target: "_blank",
        rel: "noopener",
        'aria-label': "Facebook",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "currentColor",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://instagram.com/creatrixtechnologies",
        target: "_blank",
        rel: "noopener",
        'aria-label': "Instagram",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
        x: "2",
        y: "2",
        width: "20",
        height: "20",
        rx: "5",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "17.5",
        y1: "6.5",
        x2: "17.51",
        y2: "6.5",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        href: "https://linkedin.com/company/creatrix-media-and-solutions/",
        target: "_blank",
        rel: "noopener",
        'aria-label': "LinkedIn",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        fill: "currentColor",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
        x: "2",
        y: "9",
        width: "4",
        height: "12",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
        cx: "4",
        cy: "4",
        r: "2",
    });
    const __VLS_55 = MarketingSiteFooter;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        // @ts-ignore
        ...{ class: "fade-in-motion delay-5" },
    }));
    const __VLS_57 = __VLS_56({
        ...{ class: "fade-in-motion delay-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    /** @type {__VLS_StyleScopedClasses['fade-in-motion']} */ ;
    /** @type {__VLS_StyleScopedClasses['delay-5']} */ ;
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
    [showScrollTop, scrollToTop,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

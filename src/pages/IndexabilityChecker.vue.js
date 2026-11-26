/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MarketingHeader from '../components/marketing/MarketingHeader.vue';
import MarketingSiteFooter from '../components/MarketingSiteFooter.vue';
import { refreshApi } from '../api';
import seo from '../seo/publicPages.json';
const route = useRoute();
const router = useRouter();
const url = ref('');
const loading = ref(false);
const error = ref('');
const report = ref(null);
const STATUS_ORDER = ['pass', 'info', 'warn', 'fail'];
const statusName = (s) => typeof s === 'number' ? STATUS_ORDER[s] ?? 'info' : (s.toLowerCase() || 'info');
const statusLabel = (s) => ({ pass: 'OK', info: 'Note', warn: 'Issue', fail: 'Blocks indexing' })[statusName(s)];
const sortedChecks = computed(() => [...(report.value?.checks ?? [])].sort((a, b) => STATUS_ORDER.indexOf(statusName(b.status)) - STATUS_ORDER.indexOf(statusName(a.status))));
const verdictIcon = computed(() => ({ indexable: '✓', issues: '!', blocked: '✕' })[report.value?.verdict ?? 'issues']);
async function runCheck(fromQuery = false) {
    const value = url.value.trim();
    if (!value || loading.value)
        return;
    loading.value = true;
    error.value = '';
    report.value = null;
    if (!fromQuery)
        router.replace({ query: { url: value } }).catch(() => { });
    try {
        const res = await refreshApi.post('/tools/indexability-check', { url: value });
        report.value = res.data?.data ?? null;
        // Google Ads / GA event so campaigns can optimise on tool use (mark it as a secondary conversion in Ads).
        try {
            const gtag = window.gtag;
            if (typeof gtag === 'function')
                gtag('event', 'indexability_check', { verdict: report.value?.verdict ?? 'unknown' });
        }
        catch { /* non-fatal */ }
    }
    catch (e) {
        error.value = e?.response?.data?.error?.description || 'The check could not be completed. Please try again.';
    }
    finally {
        loading.value = false;
    }
}
onMounted(() => {
    const q = route.query.url;
    if (typeof q === 'string' && q.trim()) {
        url.value = q;
        void runCheck(true);
    }
});
const tests = [
    { title: 'Status and redirects', text: 'Does the page answer 200 OK? Redirect chains, temporary redirects, 404s, 403s and server errors all stop or delay indexing.' },
    { title: 'robots.txt', text: "Evaluated the way Googlebot does it: the Googlebot group first, Allow and Disallow with wildcards, the longest rule wins. We show the exact line that blocks the page." },
    { title: 'Noindex', text: 'Both places Google reads it: the meta robots or googlebot tag in the HTML and the X-Robots-Tag HTTP header.' },
    { title: 'Canonical', text: 'If the canonical tag points somewhere else, Google usually indexes that URL instead of this one.' },
    { title: 'Content', text: 'Pages with very little text, or whose text only appears after JavaScript runs, are often left out of the index.' },
    { title: 'HTTPS', text: 'Google prefers the HTTPS version of a page; plain HTTP pages are flagged.' },
];
const faq = seo.pages['/tools/indexability-checker'].faq;
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(url, {});
    __VLS_withDotValue(error, {});
    __VLS_withDotValue(report, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['checker-hero']} */ ;
    /** @type {__VLS_StyleScopedClasses['check-form']} */ ;
    /** @type {__VLS_StyleScopedClasses['check-form']} */ ;
    /** @type {__VLS_StyleScopedClasses['check-form']} */ ;
    /** @type {__VLS_StyleScopedClasses['check-form']} */ ;
    /** @type {__VLS_StyleScopedClasses['verdict']} */ ;
    /** @type {__VLS_StyleScopedClasses['verdict__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['verdict__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['verdict__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['verdict--indexable']} */ ;
    /** @type {__VLS_StyleScopedClasses['verdict--issues']} */ ;
    /** @type {__VLS_StyleScopedClasses['verdict--blocked']} */ ;
    /** @type {__VLS_StyleScopedClasses['check__badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['check__badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['check__badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['check__badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['check__body']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['explainer']} */ ;
    /** @type {__VLS_StyleScopedClasses['test']} */ ;
    /** @type {__VLS_StyleScopedClasses['test']} */ ;
    /** @type {__VLS_StyleScopedClasses['faq']} */ ;
    /** @type {__VLS_StyleScopedClasses['faq']} */ ;
    /** @type {__VLS_StyleScopedClasses['faq']} */ ;
    /** @type {__VLS_StyleScopedClasses['container']} */ ;
    /** @type {__VLS_StyleScopedClasses['check-form']} */ ;
    /** @type {__VLS_StyleScopedClasses['cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['check']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "checker-page" },
    });
    /** @type {__VLS_StyleScopedClasses['checker-page']} */ ;
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
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "checker-hero" },
    });
    /** @type {__VLS_StyleScopedClasses['checker-hero']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "accent" },
    });
    /** @type {__VLS_StyleScopedClasses['accent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtext" },
    });
    /** @type {__VLS_StyleScopedClasses['subtext']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (...[$event]) => {
                void $event;
                return (runCheck());
            } },
        ...{ class: "check-form glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['check-form']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        for: "check-url",
        ...{ class: "sr-only" },
    });
    /** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        id: "check-url",
        value: (url.value),
        type: "text",
        inputmode: "url",
        autocomplete: "url",
        spellcheck: "false",
        placeholder: "https://example.com/your-page",
        disabled: (loading.value),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        disabled: (loading.value || !url.value.trim()),
    });
    (loading.value ? 'Checking…' : 'Check page');
    if (loading.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "hint" },
        });
        /** @type {__VLS_StyleScopedClasses['hint']} */ ;
    }
    if (error.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "error" },
            role: "alert",
        });
        /** @type {__VLS_StyleScopedClasses['error']} */ ;
        (error.value);
    }
    if (report.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "result" },
            'aria-live': "polite",
        });
        /** @type {__VLS_StyleScopedClasses['result']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "verdict glass-card" },
            ...{ class: (`verdict--${report.value.verdict}`) },
        });
        /** @type {__VLS_StyleScopedClasses['verdict']} */ ;
        /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "verdict__icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['verdict__icon']} */ ;
        (__VLS_unwrap(verdictIcon, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
        (report.value.headline);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "verdict__meta" },
        });
        /** @type {__VLS_StyleScopedClasses['verdict__meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mono" },
        });
        /** @type {__VLS_StyleScopedClasses['mono']} */ ;
        (report.value.finalUrl);
        if (report.value.httpStatus) {
            (report.value.httpStatus);
        }
        if (report.value.responseMs) {
            (report.value.responseMs);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "checks" },
        });
        /** @type {__VLS_StyleScopedClasses['checks']} */ ;
        const __VLS_5 = __VLS_tryAsConstant((__VLS_unwrap(sortedChecks, {})));
        for (const [c] of __VLS_vFor(__VLS_nonNull(__VLS_5))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (c.key),
                ...{ class: "check glass-card" },
                ...{ class: (`check--${__VLS_unwrap(statusName, {})(c.status)}`) },
            });
            /** @type {__VLS_StyleScopedClasses['check']} */ ;
            /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "check__badge" },
            });
            /** @type {__VLS_StyleScopedClasses['check__badge']} */ ;
            (__VLS_unwrap(statusLabel, {})(c.status));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "check__body" },
            });
            /** @type {__VLS_StyleScopedClasses['check__body']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
            (c.label);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (c.detail);
            if (c.fix) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "check__fix" },
                });
                /** @type {__VLS_StyleScopedClasses['check__fix']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                (c.fix);
            }
            // @ts-ignore
            [url, url, loading, loading, loading, loading, error, error, report, report, report, report, report, report, report, report, verdictIcon, sortedChecks, statusName, statusLabel,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cta glass-card" },
        });
        /** @type {__VLS_StyleScopedClasses['cta']} */ ;
        /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "cta__small" },
        });
        /** @type {__VLS_StyleScopedClasses['cta__small']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cta__actions" },
        });
        /** @type {__VLS_StyleScopedClasses['cta__actions']} */ ;
        let __VLS_6;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
            // @ts-ignore
            to: "/signup?plan=trial", ...{ class: "btn btn--primary" },
        }));
        const __VLS_8 = __VLS_7({
            to: "/signup?plan=trial",
            ...{ class: "btn btn--primary" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn--primary']} */ ;
        var __VLS_9;
        const { default: __VLS_11 } = __VLS_nonNull(__VLS_9.slots);
        // @ts-ignore
        [];
        let __VLS_12;
        /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
        routerLink;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            // @ts-ignore
            to: "/pricing", ...{ class: "btn btn--ghost" },
        }));
        const __VLS_14 = __VLS_13({
            to: "/pricing",
            ...{ class: "btn btn--ghost" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['btn--ghost']} */ ;
        var __VLS_15;
        const { default: __VLS_17 } = __VLS_nonNull(__VLS_15.slots);
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "explainer" },
    });
    /** @type {__VLS_StyleScopedClasses['explainer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tests" },
    });
    /** @type {__VLS_StyleScopedClasses['tests']} */ ;
    const __VLS_18 = __VLS_tryAsConstant((__VLS_unwrap(tests, {})));
    for (const [t] of __VLS_vFor(__VLS_nonNull(__VLS_18))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (t.title),
            ...{ class: "test glass-card" },
        });
        /** @type {__VLS_StyleScopedClasses['test']} */ ;
        /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        (t.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (t.text);
        // @ts-ignore
        [tests,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "faq" },
    });
    /** @type {__VLS_StyleScopedClasses['faq']} */ ;
    const __VLS_19 = __VLS_tryAsConstant((__VLS_unwrap(faq, {})));
    for (const [q] of __VLS_vFor(__VLS_nonNull(__VLS_19))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.details, __VLS_intrinsics.details)({
            key: (q.q),
            ...{ class: "glass-card" },
        });
        /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.summary, __VLS_intrinsics.summary)({});
        (q.q);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (q.a);
        // @ts-ignore
        [faq,];
    }
    const __VLS_20 = MarketingSiteFooter;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    // @ts-ignore
    }));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

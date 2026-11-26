/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, ref } from 'vue';
import api from '../api';
import { useEntitlementsStore } from '../Shared/entitlements';
import { useGoogleConfigStore } from '../Shared/googleConfig';
/**
 * Live first-run checklist: account → key uploaded → Owner verified → site synced → first URL submitted.
 * Each tick is derived from real state, not from a stored flag.
 */
const entitlements = useEntitlementsStore();
const googleConfig = useGoogleConfigStore();
const ownerVerified = ref(null);
const publishUsed = ref(0);
onMounted(async () => {
    void entitlements.refresh();
    try {
        const v = await api.post('/google-config/verify');
        const props = (v.data?.data?.properties ?? []);
        ownerVerified.value = props.some(p => p.isOwner);
    }
    catch {
        ownerVerified.value = false;
    }
    try {
        const q = await api.get('/crawl/quota');
        publishUsed.value = Number(q.data?.data?.publishUsed ?? 0);
    }
    catch { /* quota is optional here */ }
});
const steps = computed(() => [
    { key: 'account', label: 'Create your account', done: true, hint: '', to: '', cta: '' },
    { key: 'key', label: 'Upload your Google service account key', done: googleConfig.hasCredentials,
        hint: 'A JSON key from Google Cloud with the Indexing API enabled.', to: '/settings/google-configuration', cta: 'Upload key' },
    { key: 'owner', label: 'Make the service account an Owner in Search Console', done: ownerVerified.value === true,
        hint: 'Settings → Users and permissions → add the service account email as Owner (Full access is not enough).', to: '/settings/google-configuration', cta: 'Verify' },
    { key: 'site', label: 'Sync or add a site', done: entitlements.data.sitesUsed > 0,
        hint: 'Your Search Console properties appear automatically once the key is verified.', to: '/sites', cta: 'Open sites' },
    { key: 'submit', label: 'Submit your first URL to Google', done: publishUsed.value > 0 || entitlements.data.urlsSubmittedThisMonth > 0 || entitlements.data.trialUrlsUsed > 0,
        hint: 'Crawl a site, pick URLs and click Index now, or let the daily schedule send them.', to: '/crawl-index-management', cta: 'Crawl & index' },
]);
const doneCount = computed(() => steps.value.filter(s => s.done).length);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(steps, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['setup-checklist__mark']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-done']} */ ;
    /** @type {__VLS_StyleScopedClasses['setup-checklist__label']} */ ;
    /** @type {__VLS_StyleScopedClasses['setup-checklist__item']} */ ;
    /** @type {__VLS_StyleScopedClasses['setup-checklist__link']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "setup-checklist" },
        'aria-label': "Setup progress",
    });
    /** @type {__VLS_StyleScopedClasses['setup-checklist']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "setup-checklist__head" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-checklist__head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "setup-checklist__title" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-checklist__title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "setup-checklist__count" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-checklist__count']} */ ;
    (__VLS_unwrap(doneCount, {}));
    (steps.value.length);
    __VLS_asFunctionalElement1(__VLS_intrinsics.ol, __VLS_intrinsics.ol)({
        ...{ class: "setup-checklist__list" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-checklist__list']} */ ;
    const __VLS_0 = __VLS_tryAsConstant((steps.value));
    for (const [step] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (step.key),
            ...{ class: "setup-checklist__item" },
            ...{ class: ({ 'is-done': step.done }) },
        });
        /** @type {__VLS_StyleScopedClasses['setup-checklist__item']} */ ;
        /** @type {__VLS_StyleScopedClasses['is-done']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "setup-checklist__mark" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['setup-checklist__mark']} */ ;
        (step.done ? '✓' : '');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "setup-checklist__body" },
        });
        /** @type {__VLS_StyleScopedClasses['setup-checklist__body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "setup-checklist__label" },
        });
        /** @type {__VLS_StyleScopedClasses['setup-checklist__label']} */ ;
        (step.label);
        if (!step.done && step.hint) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "setup-checklist__hint" },
            });
            /** @type {__VLS_StyleScopedClasses['setup-checklist__hint']} */ ;
            (step.hint);
        }
        if (!step.done && step.to) {
            let __VLS_1;
            /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
            routerLink;
            // @ts-ignore
            const __VLS_2 = __VLS_asFunctionalComponent1(__VLS_1, new __VLS_1({
                // @ts-ignore
                to: (step.to), ...{ class: "setup-checklist__link" },
            }));
            const __VLS_3 = __VLS_2({
                to: (step.to),
                ...{ class: "setup-checklist__link" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_2));
            /** @type {__VLS_StyleScopedClasses['setup-checklist__link']} */ ;
            var __VLS_4;
            const { default: __VLS_6 } = __VLS_nonNull(__VLS_4.slots);
            (step.cta);
            // @ts-ignore
            [doneCount, steps, steps,];
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

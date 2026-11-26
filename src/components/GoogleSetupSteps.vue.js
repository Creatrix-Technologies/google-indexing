/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
const { defineProps, withDefaults, } = {};
const setupSteps = [
    {
        n: 1,
        title: 'Create a Google Cloud Project',
        desc: 'A Google Cloud project is the container for your APIs and service account credentials.',
        link: 'https://console.cloud.google.com/projectcreate',
        linkLabel: 'Open Cloud Console',
        instructions: [
            'Sign in to <a href="https://console.cloud.google.com" target="_blank" rel="noopener">console.cloud.google.com</a>.',
            'Click the <strong>project selector</strong> dropdown in the top navigation bar.',
            'Select <strong>New Project</strong>, enter a name (e.g. <code>url-indexing</code>), and click <strong>Create</strong>.'
        ]
    },
    {
        n: 2,
        title: 'Enable Required APIs',
        desc: 'Two APIs are needed: the Indexing API for submitting URLs, and the Search Console API for reading site data.',
        link: 'https://console.cloud.google.com/apis/library',
        linkLabel: 'Open API Library',
        instructions: [
            'In your project, go to <strong>APIs &amp; Services → Library</strong>.',
            'Search for <strong>Web Search Indexing API</strong> → open it → click <strong>Enable</strong>.',
            'Search for <strong>Google Search Console API</strong> → open it → click <strong>Enable</strong>.'
        ]
    },
    {
        n: 3,
        title: 'Create a Service Account',
        desc: 'A service account is a server-side identity that lets this app call Google APIs on your behalf without user login.',
        link: 'https://console.cloud.google.com/iam-admin/serviceaccounts',
        linkLabel: 'Open IAM & Admin',
        instructions: [
            'Navigate to <strong>IAM &amp; Admin → Service Accounts</strong> in your project.',
            'Click <strong>+ Create Service Account</strong>.',
            'Enter a name (e.g. <code>indexing-service</code>) and a description, then click <strong>Create and Continue</strong>.',
            'Skip the optional role and user access steps — click <strong>Continue</strong> then <strong>Done</strong>.'
        ]
    },
    {
        n: 4,
        title: 'Download the JSON Key File',
        desc: 'Generate a JSON private key for the service account. This is the file you will upload to connect your Google account.',
        instructions: [
            'In the Service Accounts list, click the <strong>email address</strong> of the account you created.',
            'Select the <strong>Keys</strong> tab at the top of the page.',
            'Click <strong>Add Key → Create new key</strong>.',
            'Choose <strong>JSON</strong> as the key type and click <strong>Create</strong>.',
            'A <code>.json</code> file downloads automatically — store it securely.'
        ],
        tip: 'The JSON file contains a <code>"client_email"</code> field (e.g. <code>my-service@project.iam.gserviceaccount.com</code>). You will need this address in the next step.'
    },
    {
        n: 5,
        title: 'Add Service Account to Search Console',
        desc: 'Grant the service account Owner access to your Search Console property so the app can read and submit indexing data.',
        link: 'https://search.google.com/search-console',
        linkLabel: 'Open Search Console',
        instructions: [
            'Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener">search.google.com/search-console</a>.',
            'Select the property (website) you want to manage.',
            'Click <strong>Settings</strong> (gear icon) → <strong>Users and permissions</strong>.',
            'Click <strong>Add User</strong> and paste the <code>client_email</code> address from your JSON file.',
            'Set the permission level to <strong>Owner</strong> and click <strong>Add</strong>.'
        ]
    },
    {
        n: 6,
        title: 'Upload the JSON Key File',
        desc: 'Upload the JSON key file in Settings → Google Configuration. Your dashboard will start populating once the connection is verified.',
        isFinal: true,
        cta: 'Jump to upload form ↑'
    }
];
const props = withDefaults(defineProps(), { allExpanded: true, hideFinalCta: false });
const expandedSteps = ref(Object.fromEntries(setupSteps.map(s => [s.n, props.allExpanded])));
const isExpanded = (n) => expandedSteps.value[n] ?? props.allExpanded;
const toggleStep = (n) => {
    expandedSteps.value[n] = !expandedSteps.value[n];
};
const __VLS_defaults = { allExpanded: true, hideFinalCta: false };
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
    __VLS_withDotValue(setupSteps, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['og-step__badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__content']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-chevron']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step--final']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__title']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-ext-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__tip']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__tip']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-final-cta']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['og-step__toggle-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "og-stepper" },
    });
    /** @type {__VLS_StyleScopedClasses['og-stepper']} */ ;
    const __VLS_0 = __VLS_tryAsConstant((setupSteps.value));
    for (const [step, idx] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (step.n),
            ...{ class: "og-step" },
            ...{ class: ({ 'og-step--final': step.isFinal }) },
        });
        /** @type {__VLS_StyleScopedClasses['og-step']} */ ;
        /** @type {__VLS_StyleScopedClasses['og-step--final']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-step__gutter" },
        });
        /** @type {__VLS_StyleScopedClasses['og-step__gutter']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-step__badge" },
        });
        /** @type {__VLS_StyleScopedClasses['og-step__badge']} */ ;
        if (step.isFinal) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 14 14",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "2.5",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
                width: "12",
                height: "12",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                points: "2 7 5.5 10.5 12 4",
            });
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (step.n);
        }
        if (idx < setupSteps.value.length - 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "og-step__connector" },
            });
            /** @type {__VLS_StyleScopedClasses['og-step__connector']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "og-step__content" },
        });
        /** @type {__VLS_StyleScopedClasses['og-step__content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(toggleStep, {})(step.n));
                    // @ts-ignore
                    [setupSteps, setupSteps, toggleStep,];
                } },
            ...{ class: "og-step__toggle" },
            'aria-expanded': (__VLS_unwrap(isExpanded, {})(step.n)),
        });
        /** @type {__VLS_StyleScopedClasses['og-step__toggle']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "og-step__title" },
        });
        /** @type {__VLS_StyleScopedClasses['og-step__title']} */ ;
        (step.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "og-step__toggle-right" },
        });
        /** @type {__VLS_StyleScopedClasses['og-step__toggle-right']} */ ;
        if (step.link) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                ...{ onClick: () => { } },
                href: (step.link),
                target: "_blank",
                rel: "noopener noreferrer",
                ...{ class: "og-ext-link" },
            });
            /** @type {__VLS_StyleScopedClasses['og-ext-link']} */ ;
            (step.linkLabel);
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 12 12",
                fill: "none",
                stroke: "currentColor",
                'stroke-width': "1.75",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
                width: "10",
                height: "10",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                points: "8 1 11 1 11 4",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                x1: "6",
                y1: "6",
                x2: "11",
                y2: "1",
            });
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            ...{ class: "og-chevron" },
            ...{ class: ({ 'og-chevron--open': __VLS_unwrap(isExpanded, {})(step.n) }) },
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 12 12",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
            width: "12",
            height: "12",
        });
        /** @type {__VLS_StyleScopedClasses['og-chevron']} */ ;
        /** @type {__VLS_StyleScopedClasses['og-chevron--open']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "2 4 6 8 10 4",
        });
        let __VLS_1;
        /** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
        Transition;
        // @ts-ignore
        const __VLS_2 = __VLS_asFunctionalComponent1(__VLS_1, new __VLS_1({
            // @ts-ignore
            name: "step-expand",
        }));
        const __VLS_3 = __VLS_2({
            name: "step-expand",
        }, ...__VLS_functionalComponentArgsRest(__VLS_2));
        var __VLS_4;
        const { default: __VLS_6 } = __VLS_nonNull(__VLS_4.slots);
        if (__VLS_unwrap(isExpanded, {})(step.n)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "og-step__body" },
            });
            /** @type {__VLS_StyleScopedClasses['og-step__body']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "og-step__desc" },
            });
            /** @type {__VLS_StyleScopedClasses['og-step__desc']} */ ;
            (step.desc);
            if (step.instructions) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.ol, __VLS_intrinsics.ol)({
                    ...{ class: "og-step__list" },
                });
                /** @type {__VLS_StyleScopedClasses['og-step__list']} */ ;
                const __VLS_7 = __VLS_tryAsConstant((step.instructions));
                for (const [inst, i] of __VLS_vFor(__VLS_nonNull(__VLS_7))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (i),
                    });
                    const __VLS_8 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
                    __VLS_8(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (inst), }, ...__VLS_directiveHookArgsRest(__VLS_8));
                    // @ts-ignore
                    [isExpanded, isExpanded, isExpanded,];
                }
            }
            if (step.tip) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "og-step__tip" },
                });
                /** @type {__VLS_StyleScopedClasses['og-step__tip']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 14 14",
                    fill: "none",
                    stroke: "currentColor",
                    'stroke-width': "1.75",
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'aria-hidden': "true",
                    width: "13",
                    height: "13",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                    cx: "7",
                    cy: "7",
                    r: "6",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                    x1: "7",
                    y1: "5",
                    x2: "7",
                    y2: "7",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                    cx: "7",
                    cy: "9.5",
                    r: ".5",
                    fill: "currentColor",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                const __VLS_9 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
                __VLS_9(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (step.tip), }, ...__VLS_directiveHookArgsRest(__VLS_9));
            }
            if (step.cta && !props.hideFinalCta) {
                let __VLS_10;
                /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
                routerLink;
                // @ts-ignore
                const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
                    // @ts-ignore
                    to: "/settings/google-configuration", ...{ class: "og-final-cta" },
                }));
                const __VLS_12 = __VLS_11({
                    to: "/settings/google-configuration",
                    ...{ class: "og-final-cta" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_11));
                /** @type {__VLS_StyleScopedClasses['og-final-cta']} */ ;
                var __VLS_13;
                const { default: __VLS_15 } = __VLS_nonNull(__VLS_13.slots);
                (step.cta);
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 16 16",
                    fill: "none",
                    stroke: "currentColor",
                    'stroke-width': "2",
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'aria-hidden': "true",
                    width: "13",
                    height: "13",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                    x1: "3",
                    y1: "8",
                    x2: "13",
                    y2: "8",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                    points: "8 3 13 8 8 13",
                });
                // @ts-ignore
                [];
            }
            if (step.cta && props.hideFinalCta) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                    href: "#upload-section",
                    ...{ class: "og-final-cta" },
                });
                /** @type {__VLS_StyleScopedClasses['og-final-cta']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 16 16",
                    fill: "none",
                    stroke: "currentColor",
                    'stroke-width': "2",
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'aria-hidden': "true",
                    width: "13",
                    height: "13",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                    x1: "8",
                    y1: "13",
                    x2: "8",
                    y2: "3",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                    points: "3 8 8 3 13 8",
                });
            }
        }
        // @ts-ignore
        [];
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "guide-note" },
    });
    /** @type {__VLS_StyleScopedClasses['guide-note']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};

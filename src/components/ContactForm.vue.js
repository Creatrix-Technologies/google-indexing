/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, ref } from "vue";
import { useRoute } from "vue-router";
import api, { refreshApi } from "../api";
import { fetchPublicSubscriptionPlans, formatPublicPlanAmount, isTrialPlan, planSlug } from "../Shared/publicPlans";
const { defineProps, withDefaults, } = {};
// Plan options come from the live plan list, so the dropdown can never show stale prices.
const paidPlans = ref([]);
fetchPublicSubscriptionPlans(refreshApi).then((p) => { paidPlans.value = p.filter((x) => !isTrialPlan(x)); }).catch(() => { });
const currencySymbol = (c) => ((c || "USD").toUpperCase() === "USD" ? "$" : `${(c || "").toUpperCase()} `);
const props = withDefaults(defineProps(), {
    defaultSubject: "",
    defaultPlanInterest: ""
});
const route = useRoute();
const form = reactive({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: props.defaultSubject,
    message: "",
    planInterest: props.defaultPlanInterest,
    website: "",
    sourcePage: ""
});
const errors = reactive({
    name: "",
    email: "",
    subject: "",
    message: ""
});
const isSubmitting = ref(false);
const status = ref("idle");
const errorBanner = ref("Please try again in a moment.");
function validateField(key) {
    const value = (form[key] || "").trim();
    switch (key) {
        case "name":
            errors.name = value.length === 0
                ? "Please enter your name."
                : value.length > 120 ? "Name is too long." : "";
            break;
        case "email":
            if (!value)
                errors.email = "Please enter your email.";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                errors.email = "Enter a valid email address.";
            else
                errors.email = "";
            break;
        case "subject":
            errors.subject = value.length === 0
                ? "Please add a subject."
                : value.length > 160 ? "Subject is too long." : "";
            break;
        case "message":
            if (value.length === 0)
                errors.message = "Please write a short message.";
            else if (value.length < 10)
                errors.message = "Tell us a bit more — at least 10 characters.";
            else if (value.length > 4000)
                errors.message = "Message is too long.";
            else
                errors.message = "";
            break;
    }
    return errors[key].length === 0;
}
function validateAll() {
    const keys = ["name", "email", "subject", "message"];
    return keys.map(validateField).every(Boolean);
}
async function submit() {
    status.value = "idle";
    if (!validateAll())
        return;
    isSubmitting.value = true;
    try {
        form.sourcePage = typeof window !== "undefined"
            ? `${window.location.origin}${route.fullPath}`
            : route.fullPath;
        await api.post("/contact", {
            name: form.name,
            email: form.email,
            company: form.company,
            phone: form.phone,
            subject: form.subject,
            message: form.message,
            planInterest: form.planInterest,
            website: form.website, // honeypot
            sourcePage: form.sourcePage
        });
        status.value = "success";
        form.name = "";
        form.email = "";
        form.company = "";
        form.phone = "";
        form.subject = props.defaultSubject;
        form.message = "";
        form.planInterest = props.defaultPlanInterest;
        form.website = "";
    }
    catch (err) {
        const d = err?.response?.data;
        const message = d?.error?.description
            || d?.error?.message
            || d?.message
            || d?.meta
            || err?.message
            || "";
        errorBanner.value = message ? String(message).replace(/\.$/, "") + "." : "Please try again in a moment.";
        status.value = "error";
    }
    finally {
        isSubmitting.value = false;
    }
}
const __VLS_defaults = {
    defaultSubject: "",
    defaultPlanInterest: ""
};
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
    __VLS_withDotValue(errors, {});
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(isSubmitting, {});
    __VLS_withDotValue(status, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-error']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-select']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-select']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-submit']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-submit']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-submit']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-submit']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-banner']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-banner']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-banner']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-banner']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-form__row']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-consent']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-form__footer']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-submit']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (submit) },
        ...{ class: "contact-form" },
        novalidate: true,
    });
    /** @type {__VLS_StyleScopedClasses['contact-form']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-form__row" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-form__row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "contact-field" },
        ...{ class: ({ 'is-error': errors.value.name }) },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-field__label" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                void $event;
                return (validateField('name'));
                // @ts-ignore
                [errors,];
            } },
        value: (form.value.name),
        type: "text",
        name: "name",
        autocomplete: "name",
        placeholder: "Jane Doe",
        maxlength: "120",
        disabled: (isSubmitting.value),
    });
    if (errors.value.name) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "contact-field__error" },
        });
        /** @type {__VLS_StyleScopedClasses['contact-field__error']} */ ;
        (errors.value.name);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "contact-field" },
        ...{ class: ({ 'is-error': errors.value.email }) },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-field__label" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                void $event;
                return (validateField('email'));
                // @ts-ignore
                [errors, errors, errors, form, isSubmitting,];
            } },
        type: "email",
        name: "email",
        autocomplete: "email",
        placeholder: "you@company.com",
        maxlength: "200",
        disabled: (isSubmitting.value),
    });
    (form.value.email);
    if (errors.value.email) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "contact-field__error" },
        });
        /** @type {__VLS_StyleScopedClasses['contact-field__error']} */ ;
        (errors.value.email);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-form__row" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-form__row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "contact-field" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-field__label" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-field__hint" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (form.value.company),
        type: "text",
        name: "company",
        autocomplete: "organization",
        placeholder: "Acme Inc.",
        maxlength: "160",
        disabled: (isSubmitting.value),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "contact-field" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-field__label" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-field__hint" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "tel",
        name: "phone",
        autocomplete: "tel",
        placeholder: "+1 555 123 4567",
        maxlength: "40",
        disabled: (isSubmitting.value),
    });
    (form.value.phone);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-form__row" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-form__row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "contact-field" },
        ...{ class: ({ 'is-error': errors.value.subject }) },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-field__label" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onBlur: (...[$event]) => {
                void $event;
                return (validateField('subject'));
                // @ts-ignore
                [errors, errors, errors, form, form, form, isSubmitting, isSubmitting, isSubmitting,];
            } },
        value: (form.value.subject),
        type: "text",
        name: "subject",
        placeholder: "Help with 'crawled, currently not indexed' on our blog",
        maxlength: "160",
        disabled: (isSubmitting.value),
    });
    if (errors.value.subject) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "contact-field__error" },
        });
        /** @type {__VLS_StyleScopedClasses['contact-field__error']} */ ;
        (errors.value.subject);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "contact-field" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-field__label" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-select" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-select']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (form.value.planInterest),
        name: "planInterest",
        disabled: (isSubmitting.value),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "trial",
    });
    const __VLS_0 = __VLS_tryAsConstant((__VLS_unwrap(paidPlans, {})));
    for (const [p] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (p.id),
            value: (__VLS_unwrap(planSlug, {})(p.name)),
        });
        (p.name);
        (__VLS_unwrap(currencySymbol, {})(p.currency));
        (__VLS_unwrap(formatPublicPlanAmount, {})(p.amount));
        // @ts-ignore
        [errors, errors, form, form, isSubmitting, isSubmitting, paidPlans, planSlug, currencySymbol, formatPublicPlanAmount,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "custom",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        viewBox: "0 0 24 24",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "6 9 12 15 18 9",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "contact-field contact-field--full" },
        ...{ class: ({ 'is-error': errors.value.message }) },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field']} */ ;
    /** @type {__VLS_StyleScopedClasses['contact-field--full']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "contact-field__label" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        ...{ onBlur: (...[$event]) => {
                void $event;
                return (validateField('message'));
                // @ts-ignore
                [errors,];
            } },
        value: (form.value.message),
        name: "message",
        rows: "5",
        maxlength: "4000",
        placeholder: "Sites, current SEO setup, what you want to achieve...",
        disabled: (isSubmitting.value),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-field__meta" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-field__meta']} */ ;
    if (errors.value.message) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "contact-field__error" },
        });
        /** @type {__VLS_StyleScopedClasses['contact-field__error']} */ ;
        (errors.value.message);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "contact-field__counter" },
        });
        /** @type {__VLS_StyleScopedClasses['contact-field__counter']} */ ;
        (form.value.message.length);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-honeypot" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['contact-honeypot']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (form.value.website),
        type: "text",
        name: "website",
        tabindex: "-1",
        autocomplete: "off",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-form__footer" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-form__footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "contact-consent" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-consent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        type: "submit",
        ...{ class: "contact-submit" },
        disabled: (isSubmitting.value),
    });
    /** @type {__VLS_StyleScopedClasses['contact-submit']} */ ;
    if (isSubmitting.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "contact-submit__spinner" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['contact-submit__spinner']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (isSubmitting.value ? 'Sending...' : 'Send message');
    if (!isSubmitting.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
            'aria-hidden': "true",
        });
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
    let __VLS_1;
    /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
    transition;
    // @ts-ignore
    const __VLS_2 = __VLS_asFunctionalComponent1(__VLS_1, new __VLS_1({
        // @ts-ignore
        name: "contact-fade",
    }));
    const __VLS_3 = __VLS_2({
        name: "contact-fade",
    }, ...__VLS_functionalComponentArgsRest(__VLS_2));
    var __VLS_4;
    const { default: __VLS_6 } = __VLS_nonNull(__VLS_4.slots);
    if (status.value === 'success') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "contact-banner contact-banner--success" },
            role: "status",
        });
        /** @type {__VLS_StyleScopedClasses['contact-banner']} */ ;
        /** @type {__VLS_StyleScopedClasses['contact-banner--success']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [errors, errors, form, form, form, isSubmitting, isSubmitting, isSubmitting, isSubmitting, isSubmitting, status,];
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
    transition;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        // @ts-ignore
        name: "contact-fade",
    }));
    const __VLS_9 = __VLS_8({
        name: "contact-fade",
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    var __VLS_10;
    const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
    if (status.value === 'error') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "contact-banner contact-banner--error" },
            role: "alert",
        });
        /** @type {__VLS_StyleScopedClasses['contact-banner']} */ ;
        /** @type {__VLS_StyleScopedClasses['contact-banner--error']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            viewBox: "0 0 24 24",
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_unwrap(errorBanner, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: "mailto:sales@nopbooster.com",
        });
    }
    // @ts-ignore
    [status, errorBanner,];
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

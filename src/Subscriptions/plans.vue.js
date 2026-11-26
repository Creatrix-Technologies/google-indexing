/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import api from '../api';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
const toast = useToast();
const plans = ref([]);
const durations = ref([]);
const isLoading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const form = ref({
    planId: 0,
    name: '',
    description: '',
    amount: 0,
    durationId: 3,
    isActive: true
});
const errors = ref({
    name: '',
    amount: '',
    durationId: ''
});
const validateForm = () => {
    errors.value = { name: '', amount: '', durationId: '' };
    let valid = true;
    if (!form.value.name.trim()) {
        errors.value.name = 'Plan name is required';
        valid = false;
    }
    if (!form.value.amount || form.value.amount <= 0) {
        errors.value.amount = 'Amount must be greater than 0';
        valid = false;
    }
    if (!form.value.durationId) {
        errors.value.durationId = 'Duration is required';
        valid = false;
    }
    return valid;
};
const fetchPlans = async () => {
    try {
        isLoading.value = true;
        const res = await api.get('/payments/stripe-manage-subscription-plans');
        plans.value = res.data.data || [];
    }
    catch {
        toast.error('Failed to load plans');
    }
    finally {
        isLoading.value = false;
    }
};
const fetchDurations = async () => {
    try {
        const res = await api.get('/durations');
        durations.value = res.data.data || [];
    }
    catch {
        toast.error('Failed to load durations');
    }
};
const addPlan = () => {
    isEditing.value = false;
    showModal.value = true;
    form.value = {
        planId: 0,
        name: '',
        description: '',
        amount: 0,
        durationId: 3,
        isActive: true
    };
    errors.value = { name: '', amount: '', durationId: '' };
};
const editPlan = (plan) => {
    isEditing.value = true;
    showModal.value = true;
    form.value = {
        planId: plan.id,
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
        durationId: plan.durationId || 3,
        isActive: plan.isActive
    };
    errors.value = { name: '', amount: '', durationId: '' };
};
const savePlan = async () => {
    if (!validateForm())
        return;
    try {
        await api.post('/payments/update-plans', form.value);
        toast.success(form.value.planId === 0 ? 'Plan created' : 'Plan updated');
        showModal.value = false;
        fetchPlans();
    }
    catch (err) {
        toast.error(err.response?.data?.message || 'Failed to save plan.');
    }
};
/* ---------- display helpers (UI only) ---------- */
const activeCount = computed(() => plans.value.filter(p => p.isActive).length);
const inactiveCount = computed(() => plans.value.filter(p => !p.isActive).length);
const durationName = (id) => {
    if (!id)
        return '';
    const found = durations.value.find(d => d.id === id);
    return found?.name || '';
};
const periodSuffix = (id) => {
    const name = durationName(id).toLowerCase();
    if (!name)
        return '';
    if (/year|annual|annually/.test(name))
        return 'year';
    if (/month/.test(name))
        return 'month';
    if (/week/.test(name))
        return 'week';
    if (/day/.test(name))
        return 'day';
    return name;
};
const formatAmount = (n, currency = 'USD') => {
    if (n === null || n === undefined)
        return '—';
    const symbol = currency === 'USD' ? '$' : '';
    const value = Number(n);
    if (Number.isNaN(value))
        return '—';
    return `${symbol}${value.toLocaleString('en-US', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2
    })}`;
};
const sortedPlans = computed(() => {
    return [...plans.value].sort((a, b) => {
        if (a.isActive !== b.isActive)
            return a.isActive ? -1 : 1;
        return (a.amount || 0) - (b.amount || 0);
    });
});
onMounted(() => {
    fetchPlans();
    fetchDurations();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(plans, {});
    __VLS_withDotValue(inactiveCount, {});
    __VLS_withDotValue(isLoading, {});
    __VLS_withDotValue(showModal, {});
    __VLS_withDotValue(isEditing, {});
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(errors, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card--inactive']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card--inactive']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card--inactive']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__name']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__amount']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__period']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__edit']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__edit']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card--skeleton']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card--skeleton']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['editor']} */ ;
    /** @type {__VLS_StyleScopedClasses['editor']} */ ;
    /** @type {__VLS_StyleScopedClasses['editor']} */ ;
    /** @type {__VLS_StyleScopedClasses['checkbox-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['checkbox-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-container" },
    });
    /** @type {__VLS_StyleScopedClasses['page-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-header" },
    });
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
    if (plans.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "header-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['header-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-dot meta-dot--active" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-dot--active']} */ ;
        (__VLS_unwrap(activeCount, {}));
        if (inactiveCount.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-pill" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-dot meta-dot--inactive" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
            /** @type {__VLS_StyleScopedClasses['meta-dot--inactive']} */ ;
            (inactiveCount.value);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill meta-pill--total" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-pill--total']} */ ;
        (plans.value.length);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(addPlan, {})) },
        ...{ class: "btn-primary" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "12",
        y1: "5",
        x2: "12",
        y2: "19",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "5",
        y1: "12",
        x2: "19",
        y2: "12",
    });
    if (isLoading.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plans-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['plans-grid']} */ ;
        const __VLS_0 = __VLS_tryAsConstant((3));
        for (const [i] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (`skel-${i}`),
                ...{ class: "plan-card plan-card--skeleton" },
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
            /** @type {__VLS_StyleScopedClasses['plan-card--skeleton']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "skel skel--title" },
            });
            /** @type {__VLS_StyleScopedClasses['skel']} */ ;
            /** @type {__VLS_StyleScopedClasses['skel--title']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "skel skel--line" },
            });
            /** @type {__VLS_StyleScopedClasses['skel']} */ ;
            /** @type {__VLS_StyleScopedClasses['skel--line']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "skel skel--line skel--short" },
            });
            /** @type {__VLS_StyleScopedClasses['skel']} */ ;
            /** @type {__VLS_StyleScopedClasses['skel--line']} */ ;
            /** @type {__VLS_StyleScopedClasses['skel--short']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "skel skel--price" },
            });
            /** @type {__VLS_StyleScopedClasses['skel']} */ ;
            /** @type {__VLS_StyleScopedClasses['skel--price']} */ ;
            // @ts-ignore
            [plans, plans, activeCount, inactiveCount, inactiveCount, addPlan, isLoading,];
        }
    }
    else if (plans.value.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-card" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "7",
            y1: "7",
            x2: "7.01",
            y2: "7",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-title" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-desc']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(addPlan, {})) },
            ...{ class: "btn-primary empty-cta" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['empty-cta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "12",
            y1: "5",
            x2: "12",
            y2: "19",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "5",
            y1: "12",
            x2: "19",
            y2: "12",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plans-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['plans-grid']} */ ;
        const __VLS_1 = __VLS_tryAsConstant((__VLS_unwrap(sortedPlans, {})));
        for (const [p] of __VLS_vFor(__VLS_nonNull(__VLS_1))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!!(isLoading.value))
                            throw 0;
                        if (!!(plans.value.length === 0))
                            throw 0;
                        return (__VLS_unwrap(editPlan, {})(p));
                        // @ts-ignore
                        [plans, addPlan, sortedPlans, editPlan,];
                    } },
                ...{ onKeydown: (...[$event]) => {
                        void $event;
                        if (!!(isLoading.value))
                            throw 0;
                        if (!!(plans.value.length === 0))
                            throw 0;
                        return (__VLS_unwrap(editPlan, {})(p));
                        // @ts-ignore
                        [editPlan,];
                    } },
                key: (p.id),
                ...{ class: "plan-card" },
                ...{ class: ({
                        'plan-card--inactive': !p.isActive,
                        'plan-card--active': p.isActive
                    }) },
                role: "button",
                'aria-label': (`Edit plan ${p.name}`),
                tabindex: "0",
            });
            /** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
            /** @type {__VLS_StyleScopedClasses['plan-card--inactive']} */ ;
            /** @type {__VLS_StyleScopedClasses['plan-card--active']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "plan-card__head" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__head']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "plan-card__name" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__name']} */ ;
            (p.name || 'Untitled plan');
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "status-pill" },
                ...{ class: (p.isActive ? 'status-pill--active' : 'status-pill--inactive') },
            });
            /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "status-dot" },
            });
            /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
            (p.isActive ? 'Active' : 'Inactive');
            if (p.description) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "plan-card__desc" },
                });
                const __VLS_2 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
                __VLS_2(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (p.description), }, ...__VLS_directiveHookArgsRest(__VLS_2));
                /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
            }
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "plan-card__desc plan-card__desc--placeholder" },
                });
                /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
                /** @type {__VLS_StyleScopedClasses['plan-card__desc--placeholder']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "plan-card__divider" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__divider']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "plan-card__foot" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__foot']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "plan-card__price" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__price']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "plan-card__amount" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__amount']} */ ;
            (__VLS_unwrap(formatAmount, {})(p.amount, p.currency || 'USD'));
            if (__VLS_unwrap(periodSuffix, {})(p.durationId)) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "plan-card__period" },
                });
                /** @type {__VLS_StyleScopedClasses['plan-card__period']} */ ;
                (__VLS_unwrap(periodSuffix, {})(p.durationId));
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!!(isLoading.value))
                            throw 0;
                        if (!!(plans.value.length === 0))
                            throw 0;
                        return (__VLS_unwrap(editPlan, {})(p));
                        // @ts-ignore
                        [editPlan, formatAmount, periodSuffix, periodSuffix,];
                    } },
                ...{ class: "plan-card__edit" },
                type: "button",
                'aria-label': (`Edit ${p.name}`),
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__edit']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
            });
            // @ts-ignore
            [];
        }
    }
    if (showModal.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    if (!(showModal.value))
                        throw 0;
                    return (showModal.value = false);
                    // @ts-ignore
                    [showModal, showModal,];
                } },
            ...{ class: "modal-backdrop" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "modal-box modal-box--lg" },
            role: "dialog",
            'aria-modal': "true",
        });
        /** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['modal-box--lg']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
            ...{ class: "modal-header" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "modal-title" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
        (isEditing.value ? 'Edit plan' : 'Add new plan');
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modal-subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-subtitle']} */ ;
        (isEditing.value ? 'Update pricing, billing duration, and plan availability.' : 'Create a new subscription plan with pricing and duration.');
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    if (!(showModal.value))
                        throw 0;
                    return (showModal.value = false);
                    // @ts-ignore
                    [showModal, isEditing, isEditing,];
                } },
            type: "button",
            ...{ class: "modal-close" },
            'aria-label': "Close",
        });
        /** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "18",
            y1: "6",
            x2: "6",
            y2: "18",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "6",
            y1: "6",
            x2: "18",
            y2: "18",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modal-body" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-row" },
        });
        /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            placeholder: "e.g. Pro",
        });
        (form.value.name);
        if (errors.value.name) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "error" },
            });
            /** @type {__VLS_StyleScopedClasses['error']} */ ;
            (errors.value.name);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-row" },
        });
        /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "editor" },
        });
        /** @type {__VLS_StyleScopedClasses['editor']} */ ;
        let __VLS_3;
        /** @ts-ignore @type { | typeof QuillEditor} */
        QuillEditor;
        // @ts-ignore
        const __VLS_4 = __VLS_asFunctionalComponent1(__VLS_3, new __VLS_3({
            // @ts-ignore
            theme: "snow", content: (form.value.description), contentType: "html",
        }));
        const __VLS_5 = __VLS_4({
            theme: "snow",
            content: (form.value.description),
            contentType: "html",
        }, ...__VLS_functionalComponentArgsRest(__VLS_4));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-row" },
        });
        /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "number",
            placeholder: "0.00",
        });
        (form.value.amount);
        if (errors.value.amount) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "error" },
            });
            /** @type {__VLS_StyleScopedClasses['error']} */ ;
            (errors.value.amount);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-row" },
        });
        /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (form.value.durationId),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            disabled: true,
            value: "",
        });
        const __VLS_8 = __VLS_tryAsConstant((__VLS_unwrap(durations, {})));
        for (const [d] of __VLS_vFor(__VLS_nonNull(__VLS_8))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (d.id),
                value: (d.id),
            });
            (d.name);
            // @ts-ignore
            [form, form, form, form, errors, errors, errors, errors, durations,];
        }
        if (errors.value.durationId) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "error" },
            });
            /** @type {__VLS_StyleScopedClasses['error']} */ ;
            (errors.value.durationId);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "form-row checkbox-row" },
        });
        /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['checkbox-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            type: "checkbox",
            id: "plan-active",
        });
        (form.value.isActive);
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            for: "plan-active",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
            ...{ class: "modal-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    if (!(showModal.value))
                        throw 0;
                    return (showModal.value = false);
                    // @ts-ignore
                    [showModal, form, errors, errors,];
                } },
            type: "button",
            ...{ class: "btn-secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(savePlan, {})) },
            type: "button",
            ...{ class: "btn-primary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        (isEditing.value ? 'Save changes' : 'Create plan');
    }
    // @ts-ignore
    [isEditing, savePlan,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import api from '../api';
import { loadStripe } from '@stripe/stripe-js';
import Swal from 'sweetalert2';
import { useEntitlementsStore } from '../Shared/entitlements';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import { useSubscriptionStore } from '../Shared/subscription';
import PaymentTrustBadges from '../components/PaymentTrustBadges.vue';
const subscriptionStore = useSubscriptionStore();
const toast = useToast();
const route = useRoute();
/* ---------------- STATE ---------------- */
const entitlements = useEntitlementsStore();
entitlements.refresh();
const plans = ref([]);
const paymentHistory = ref([]);
const historyPage = ref(1);
const historyPageSize = ref(10);
const isLoading = ref(false);
const subscribingPlan = ref(null);
const savedCard = ref(null);
const cardModalMode = ref(null);
const cardElementRef = ref(null);
let stripe = null;
let card = null;
const resolveStripe = async () => {
    let pk = '';
    try {
        const res = await api.get('/payments/stripe-client-config');
        pk = String(res.data?.data?.publishableKey ?? '').trim();
    }
    catch {
        toast.error('Unable to load Stripe client configuration.');
        return null;
    }
    if (!pk) {
        toast.error('Stripe publishable key is missing in Stripe settings.');
        return null;
    }
    return loadStripe(pk);
};
/* ---------------- DERIVED (display only) ---------------- */
const currentPlan = computed(() => plans.value.find(p => p.isCurrentPlan) || null);
const visiblePlans = computed(() => 
// show active plans first, then inactive
[...plans.value].sort((a, b) => Number(b.isActive) - Number(a.isActive)));
const totalSpent = computed(() => {
    const total = paymentHistory.value
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => {
        const n = parseFloat(String(p.amount).replace(/[^0-9.\-]/g, ''));
        return sum + (isNaN(n) ? 0 : n);
    }, 0);
    return total;
});
const successCount = computed(() => paymentHistory.value.filter(p => p.status === 'Paid').length);
const failedCount = computed(() => paymentHistory.value.filter(p => p.status === 'Failed').length);
const parsePaymentDateMs = (value) => {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? 0 : ms;
};
const sortedPaymentHistory = computed(() => [...paymentHistory.value].sort((a, b) => {
    const bVal = b.dateIso || b.date;
    const aVal = a.dateIso || a.date;
    return parsePaymentDateMs(bVal) - parsePaymentDateMs(aVal);
}));
const formatPaymentDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    return date.toLocaleString();
};
const nextBillingDate = computed(() => {
    const iso = paymentHistory.value.find(p => p.nextBillingDateIso)?.nextBillingDateIso;
    if (!iso)
        return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime()))
        return null;
    return date.toLocaleDateString();
});
const totalHistoryPages = computed(() => Math.max(1, Math.ceil(sortedPaymentHistory.value.length / historyPageSize.value)));
const pagedPaymentHistory = computed(() => {
    const start = (historyPage.value - 1) * historyPageSize.value;
    return sortedPaymentHistory.value.slice(start, start + historyPageSize.value);
});
const paymentHistoryRowKey = (payment) => {
    const inv = payment.invoiceId?.trim();
    if (inv)
        return `inv:${inv}`;
    const iso = payment.dateIso || payment.date || '';
    return [iso, payment.plan, payment.amount, payment.status].join('|');
};
const historyStart = computed(() => sortedPaymentHistory.value.length === 0 ? 0 : (historyPage.value - 1) * historyPageSize.value + 1);
const historyEnd = computed(() => Math.min(historyPage.value * historyPageSize.value, sortedPaymentHistory.value.length));
const previousHistoryPage = () => {
    if (historyPage.value > 1)
        historyPage.value--;
};
const nextHistoryPage = () => {
    if (historyPage.value < totalHistoryPages.value)
        historyPage.value++;
};
watch(historyPageSize, () => {
    historyPage.value = 1;
});
const formatPeriod = (duration) => {
    if (!duration)
        return '';
    const d = duration.toLowerCase();
    if (d === 'year')
        return 'year';
    if (d === 'month')
        return 'month';
    if (d === 'week')
        return 'week';
    if (d === 'day')
        return 'day';
    return d;
};
const formatAmount = (amount) => {
    return amount.toFixed(2);
};
const scrollToPlans = () => {
    document.getElementById('available-plans')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
};
/* ---------------- FETCH PLANS ---------------- */
const fetchPlans = async () => {
    try {
        const res = await api.get('/payments/stripe-subscription-plans');
        plans.value = res.data.data || [];
        // Auto-select plan from query parameter after plans are loaded
        const planFromQuery = route.query.plan;
        if (planFromQuery) {
            autoSelectPlan(planFromQuery);
        }
    }
    catch {
        toast.error('Failed to load plans');
    }
};
/* ---------------- AUTO-SELECT PLAN FROM QUERY ---------------- */
const autoSelectPlan = (planIdentifier) => {
    // Map query plan identifiers to plan names
    const planNameMap = {
        trial: ['Trial', 'trial', 'Free', 'free'],
        solo: ['Solo', 'solo', 'Basic', 'basic'],
        pro: ['Pro', 'pro', 'Professional', 'professional'],
        team: ['Team', 'team', 'Enterprise', 'enterprise', 'Business', 'business']
    };
    const possibleNames = planNameMap[planIdentifier.toLowerCase()] || [planIdentifier];
    // Find matching plan (case-insensitive, partial match)
    const matchingPlan = plans.value.find(p => {
        const planName = p.name.toLowerCase();
        return possibleNames.some(name => planName.includes(name.toLowerCase()));
    });
    if (matchingPlan && !matchingPlan.isCurrentPlan) {
        // Pre-select the plan chosen on the pricing page. startSubscribe opens the card form or asks for
        // confirmation before charging a saved card; it never charges silently.
        setTimeout(() => {
            startSubscribe(matchingPlan);
        }, 300);
    }
};
/* ---------------- FETCH SUBSCRIPTION LOGS ---------------- */
const fetchSubscriptionLogs = async () => {
    try {
        const res = await api.get('/payments/subscription-logs');
        paymentHistory.value = res.data.data || [];
        historyPage.value = 1;
    }
    catch {
        console.log('Failed to load payment history');
    }
};
/* ---------------- FETCH SAVED CARD ---------------- */
const fetchSavedCard = async (retries = 0) => {
    try {
        const res = await api.get('/payments/payment-method');
        savedCard.value = res.data?.data || null;
    }
    catch {
        savedCard.value = null;
    }
    // Retry logic: if no card found and we have retries left, wait and retry
    // This handles the race condition after first subscription where backend
    // needs time to attach the payment method to the customer
    if (!savedCard.value && retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        await fetchSavedCard(retries - 1);
    }
};
const formatCardBrand = (brand) => {
    if (!brand)
        return 'Card';
    return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
};
const cardExpiry = computed(() => {
    if (!savedCard.value)
        return '';
    const m = String(savedCard.value.expMonth).padStart(2, '0');
    const y = String(savedCard.value.expYear).slice(-2);
    return `${m}/${y}`;
});
/* ---------------- MOUNT STRIPE CARD ELEMENT ---------------- */
const mountCardElement = async () => {
    stripe = await resolveStripe();
    if (!stripe || !cardElementRef.value)
        return;
    if (card) {
        card.unmount();
        card = null;
    }
    cardElementRef.value.innerHTML = '';
    const elements = stripe.elements();
    card = elements.create('card', { hidePostalCode: true });
    card.mount(cardElementRef.value);
};
/* ---------------- START SUBSCRIBE ---------------- */
const startSubscribe = async (plan) => {
    subscribingPlan.value = { ...plan };
    // If the customer already has a card on file, skip the card modal and
    // charge it directly. Stripe will use the stored default payment method
    // and Subscription.Status will return as "active" right away.
    if (savedCard.value) {
        // Never charge a stored card without an explicit confirmation.
        const priceText = plan.amount != null ? ` for $${plan.amount}/${plan.duration || 'month'}` : '';
        const confirm = await Swal.fire({
            title: `Subscribe to ${plan.name}?`,
            text: `Your saved card${savedCard.value?.last4 ? ' ending in ' + savedCard.value.last4 : ''} will be charged${priceText}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirm and pay',
            cancelButtonText: 'Not now'
        });
        if (!confirm.isConfirmed) {
            subscribingPlan.value = null;
            return;
        }
        await chargeWithSavedCard();
        return;
    }
    cardModalMode.value = 'subscribe';
    // Mount card on the next tick so the ref is wired up.
    await nextTickMount();
};
const nextTickMount = async () => {
    await new Promise(r => setTimeout(r, 0));
    await mountCardElement();
};
/* ---------------- SUBSCRIBE WITH SAVED CARD ---------------- */
const chargeWithSavedCard = async () => {
    if (!subscribingPlan.value)
        return;
    try {
        isLoading.value = true;
        const res = await api.post('/payments/stripe-user-subscription', { plan: subscribingPlan.value.id });
        const data = res.data?.data || {};
        const status = String(data.status || '').toLowerCase();
        const chargedSavedCard = !!data.chargedSavedCard;
        if (chargedSavedCard) {
            // Backend already attempted to charge the saved card.
            if (status === 'active' || status === 'trialing') {
                toast.success(`Subscribed to ${subscribingPlan.value.name}!`);
            }
            else if (status === 'incomplete') {
                // Card needed action and the saved card couldn't be charged silently
                // (e.g. SCA required). Fall back to the card modal flow.
                cardModalMode.value = 'subscribe';
                await nextTickMount();
                return;
            }
            else {
                toast.success(`Subscription updated to ${subscribingPlan.value.name}.`);
            }
            try {
                await api.get('/payments/sync-subscription');
            }
            catch { }
            subscribingPlan.value = null;
            cardModalMode.value = null;
            await Promise.all([
                fetchPlans(),
                fetchSubscriptionLogs(),
                fetchSavedCard(),
                subscriptionStore.checkSubscription(),
            ]);
            return;
        }
        // Backend did NOT charge the saved card (either no saved card from
        // its perspective or a fall-through). Use the SCA modal flow.
        const clientSecret = data.clientSecret;
        if (!clientSecret)
            throw new Error('Failed to create subscription');
        cardModalMode.value = 'subscribe';
        await nextTickMount();
        if (!stripe || !card)
            throw new Error('Stripe is not ready');
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card }
        });
        if (result.paymentIntent?.status === 'succeeded') {
            toast.success(`Subscribed to ${subscribingPlan.value.name}!`);
            closeModal();
            try {
                await api.get('/payments/sync-subscription');
            }
            catch { }
            await Promise.all([
                fetchPlans(),
                fetchSubscriptionLogs(),
                fetchSavedCard(),
                subscriptionStore.checkSubscription(),
            ]);
        }
        else if (result.error) {
            toast.error(result.error.message || 'Payment failed');
        }
    }
    catch (err) {
        toast.error(err.response?.data?.error?.description ||
            err.message ||
            'Subscription failed');
    }
    finally {
        isLoading.value = false;
    }
};
/* ---------------- CONFIRM PAYMENT (modal) ---------------- */
const confirmSubscription = async () => {
    if (!stripe || !card || !subscribingPlan.value)
        return;
    try {
        isLoading.value = true;
        const res = await api.post('/payments/stripe-user-subscription', { plan: subscribingPlan.value.id });
        const clientSecret = res.data?.data?.clientSecret;
        if (!clientSecret)
            throw new Error('Failed to create subscription');
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card }
        });
        if (result.paymentIntent?.status === 'succeeded') {
            toast.success(`Subscribed to ${subscribingPlan.value.name}!`);
            closeModal();
            // Stripe has charged the card, but our DB row is still "incomplete"
            // until the customer.subscription.updated / invoice.paid webhook
            // fires. Dev environments rarely receive Stripe webhooks, so we hit
            // the explicit sync endpoint to mirror the live status into the DB
            // and only then refresh the plans / store.
            try {
                await api.get('/payments/sync-subscription');
            }
            catch {
                // Non-fatal: user is subscribed on Stripe's side regardless.
                // The webhook will eventually backfill the row.
            }
            // Retry up to 3 times with 1s delay to handle race condition
            // where backend hasn't attached payment method yet
            await Promise.all([
                fetchPlans(),
                fetchSubscriptionLogs(),
                fetchSavedCard(3),
                subscriptionStore.checkSubscription()
            ]);
        }
        else if (result.error) {
            toast.error(result.error.message || 'Payment failed');
        }
    }
    catch (err) {
        toast.error(err.response?.data?.error?.description ||
            err.message ||
            'Subscription failed');
    }
    finally {
        isLoading.value = false;
    }
};
/* ---------------- UPDATE CARD ---------------- */
const startUpdateCard = async () => {
    cardModalMode.value = 'updateCard';
    await nextTickMount();
};
const confirmUpdateCard = async () => {
    if (!stripe || !card)
        return;
    try {
        isLoading.value = true;
        const res = await api.post('/payments/setup-intent');
        const clientSecret = String(res.data?.data?.clientSecret ?? '').trim();
        if (!clientSecret)
            throw new Error('Failed to start card update');
        const result = await stripe.confirmCardSetup(clientSecret, {
            payment_method: { card }
        });
        if (result.error) {
            toast.error(result.error.message || 'Card update failed');
            return;
        }
        const pmId = result.setupIntent?.payment_method;
        if (typeof pmId !== 'string')
            throw new Error('No payment method id returned');
        await api.post('/payments/payment-method', { paymentMethodId: pmId });
        toast.success('Card updated.');
        closeModal();
        await fetchSavedCard();
    }
    catch (err) {
        toast.error(err.response?.data?.error?.description ||
            err.message ||
            'Failed to update card');
    }
    finally {
        isLoading.value = false;
    }
};
/* ---------------- REMOVE CARD ---------------- */
const removeSavedCard = async () => {
    // Prevent removal if there's an active subscription (Stripe requires a payment method)
    if (currentPlan.value) {
        await Swal.fire({
            title: 'Cannot remove card',
            text: 'Please cancel your active subscription before removing your payment method.',
            icon: 'info',
            confirmButtonText: 'Got it',
        });
        return;
    }
    const result = await Swal.fire({
        title: 'Remove saved card?',
        text: 'You will need to enter card details on your next subscription.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove',
        cancelButtonText: 'Keep it',
    });
    if (!result.isConfirmed)
        return;
    try {
        // Try DELETE first (preferred), fall back to POST for older API versions
        try {
            await api.delete('/payments/payment-method');
        }
        catch (deleteErr) {
            // If DELETE returns 405 Method Not Allowed, try POST endpoint
            if (deleteErr.response?.status === 405) {
                await api.post('/payments/payment-method/remove');
            }
            else {
                throw deleteErr;
            }
        }
        toast.success('Saved card removed.');
        await fetchSavedCard();
    }
    catch (err) {
        const errorMsg = err.response?.data?.error?.description || err.message || 'Failed to remove card';
        // Show more helpful error for subscription-related failures
        if (errorMsg.toLowerCase().includes('subscription') || errorMsg.toLowerCase().includes('attached')) {
            toast.error('Cannot remove card: still attached to an active subscription. Please cancel your subscription first.');
        }
        else {
            toast.error(errorMsg);
        }
    }
};
/* ---------------- CANCEL / RESUME SUBSCRIPTION ---------------- */
const CANCEL_REASONS = {
    too_expensive: 'Too expensive',
    missing_features: 'Missing a feature I need',
    not_working: 'Pages are not getting indexed',
    switched: 'Switched to another tool',
    temporary: 'Pausing for now',
    other: 'Other',
};
const cancelSubscription = async () => {
    const ends = entitlements.data.subscriptionEndsAt ? formatDate(entitlements.data.subscriptionEndsAt) : 'the end of the current period';
    const result = await Swal.fire({
        title: 'Cancel your subscription?',
        html: `<p style="margin:0 0 12px">You keep full access until <strong>${ends}</strong>; nothing is charged after that and you can resume any time before then.</p>
      <p style="margin:0 0 6px;text-align:left;font-size:13px">Help us improve: why are you cancelling?</p>
      <select id="cancel-reason" class="swal2-select" style="margin:0 0 8px;width:100%">
        <option value="">Choose a reason (optional)</option>
        ${Object.entries(CANCEL_REASONS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
      </select>
      <textarea id="cancel-comment" class="swal2-textarea" style="margin:0;width:100%" rows="2" placeholder="Anything else? (optional)"></textarea>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Cancel at period end',
        cancelButtonText: 'Keep my plan',
        preConfirm: () => ({
            reason: document.getElementById('cancel-reason')?.value || null,
            comment: document.getElementById('cancel-comment')?.value?.trim() || null,
        }),
    });
    if (result.isConfirmed) {
        try {
            await api.post('/payments/cancel-subscription', result.value);
            toast.success(`Cancellation scheduled. You keep access until ${ends}.`);
            await entitlements.refresh(true);
            fetchPlans();
            fetchSubscriptionLogs();
        }
        catch (err) {
            toast.error(err.response?.data?.error?.description || 'Failed to cancel subscription');
        }
    }
};
const resumeSubscription = async () => {
    try {
        await api.post('/payments/resume-subscription');
        toast.success('Your subscription will renew as usual.');
        await entitlements.refresh(true);
        fetchPlans();
        fetchSubscriptionLogs();
    }
    catch (err) {
        toast.error(err.response?.data?.error?.description || 'Failed to resume subscription');
    }
};
const formatDate = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};
/* ---------------- CLOSE MODAL ---------------- */
const closeModal = () => {
    if (card) {
        card.unmount();
        card = null;
    }
    subscribingPlan.value = null;
    cardModalMode.value = null;
};
/* ---------------- INIT ---------------- */
const syncSubscription = async () => {
    // Best-effort: backfill any locally "incomplete" / stale subscription
    // row from Stripe so the UI doesn't show "Choose a plan" after a
    // successful charge that pre-dated this session.
    try {
        await api.get('/payments/sync-subscription');
    }
    catch {
        // Non-fatal — fall through and render whatever the DB currently has.
    }
};
onMounted(async () => {
    await syncSubscription();
    await fetchPlans();
    fetchSubscriptionLogs();
    fetchSavedCard();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(currentPlan, {});
    __VLS_withDotValue(entitlements, {});
    __VLS_withDotValue(savedCard, {});
    __VLS_withDotValue(visiblePlans, {});
    __VLS_withDotValue(cardModalMode, {});
    __VLS_withDotValue(subscribingPlan, {});
    __VLS_withDotValue(paymentHistory, {});
    __VLS_withDotValue(failedCount, {});
    __VLS_withDotValue(totalSpent, {});
    __VLS_withDotValue(nextBillingDate, {});
    __VLS_withDotValue(sortedPaymentHistory, {});
    __VLS_withDotValue(historyPage, {});
    __VLS_withDotValue(totalHistoryPages, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['current-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['current-card__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary-inline']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-primary-inline']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost-danger']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['pm-card__icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card--current']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card--inactive']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-btn--primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['plan-btn--primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['card-element']} */ ;
    /** @type {__VLS_StyleScopedClasses['card-element']} */ ;
    /** @type {__VLS_StyleScopedClasses['card-help']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['num']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['status']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-page-size']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-page-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['current-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['pm-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['current-card__actions']} */ ;
    /** @type {__VLS_StyleScopedClasses['pm-card__actions']} */ ;
    /** @type {__VLS_StyleScopedClasses['pm-card__actions']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['pm-card__actions']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost-danger']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-ghost-danger']} */ ;
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['history-summary']} */ ;
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
    let __VLS_0;
    /** @ts-ignore @type { | typeof Loading} */
    Loading;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        active: (__VLS_unwrap(isLoading, {})), isFullPage: (true),
    }));
    const __VLS_2 = __VLS_1({
        active: (__VLS_unwrap(isLoading, {})),
        isFullPage: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    if (currentPlan.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "current-card" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card']} */ ;
        if (entitlements.value.usageSummary) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "usage-line" },
            });
            /** @type {__VLS_StyleScopedClasses['usage-line']} */ ;
            (entitlements.value.usageSummary);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "current-card__main" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__main']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "current-card__icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['current-card__icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "20 6 9 17 4 12",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "current-card__text" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "current-card__eyebrow" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__eyebrow']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-dot status-dot--ok" },
        });
        /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['status-dot--ok']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "current-card__title" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__title']} */ ;
        (currentPlan.value.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "current-card__price" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__price']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "current-card__amount" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__amount']} */ ;
        (__VLS_unwrap(formatAmount, {})(currentPlan.value.amount));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "current-card__period" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__period']} */ ;
        (__VLS_unwrap(formatPeriod, {})(currentPlan.value.duration));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "current-card__actions" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__actions']} */ ;
        if (entitlements.value.data.cancelAt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "cancel-note" },
            });
            /** @type {__VLS_StyleScopedClasses['cancel-note']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (__VLS_unwrap(formatDate, {})(entitlements.value.data.cancelAt));
        }
        else if (entitlements.value.data.subscriptionEndsAt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "cancel-note cancel-note--muted" },
            });
            /** @type {__VLS_StyleScopedClasses['cancel-note']} */ ;
            /** @type {__VLS_StyleScopedClasses['cancel-note--muted']} */ ;
            (__VLS_unwrap(formatDate, {})(entitlements.value.data.subscriptionEndsAt));
        }
        if (entitlements.value.data.cancelAt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_unwrap(resumeSubscription, {})) },
                ...{ class: "btn-primary" },
            });
            /** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_unwrap(cancelSubscription, {})) },
                ...{ class: "btn-ghost-danger" },
            });
            /** @type {__VLS_StyleScopedClasses['btn-ghost-danger']} */ ;
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "current-card current-card--inactive" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['current-card--inactive']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "current-card__main" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__main']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "current-card__icon current-card__icon--muted" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['current-card__icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['current-card__icon--muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "2",
            y: "5",
            width: "20",
            height: "14",
            rx: "2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "2",
            y1: "10",
            x2: "22",
            y2: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "current-card__text" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "current-card__eyebrow" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__eyebrow']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-dot status-dot--muted" },
        });
        /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['status-dot--muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
            ...{ class: "current-card__title" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "current-card__hint" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__hint']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "current-card__actions" },
        });
        /** @type {__VLS_StyleScopedClasses['current-card__actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(scrollToPlans, {})) },
            type: "button",
            ...{ class: "btn-primary-inline" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-primary-inline']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        id: "available-plans",
        ...{ class: "section" },
    });
    /** @type {__VLS_StyleScopedClasses['section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    if (savedCard.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card__main" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__main']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card__icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "2",
            y: "5",
            width: "20",
            height: "14",
            rx: "2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "2",
            y1: "10",
            x2: "22",
            y2: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "6",
            y1: "15",
            x2: "10",
            y2: "15",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card__text" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pm-card__eyebrow" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__eyebrow']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-dot status-dot--ok" },
        });
        /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['status-dot--ok']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "pm-card__line" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__line']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_unwrap(formatCardBrand, {})(savedCard.value.brand));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pm-card__sep" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__sep']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pm-card__digits" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__digits']} */ ;
        (savedCard.value.last4);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pm-card__sep" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__sep']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pm-card__exp" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__exp']} */ ;
        (__VLS_unwrap(cardExpiry, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card__actions" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(startUpdateCard, {})) },
            ...{ class: "btn-secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(removeSavedCard, {})) },
            ...{ class: "btn-ghost-danger" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-ghost-danger']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card pm-card--empty" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['pm-card--empty']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card__main" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__main']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card__icon pm-card__icon--muted" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__icon']} */ ;
        /** @type {__VLS_StyleScopedClasses['pm-card__icon--muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "2",
            y: "5",
            width: "20",
            height: "14",
            rx: "2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "2",
            y1: "10",
            x2: "22",
            y2: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card__text" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "pm-card__eyebrow" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__eyebrow']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-dot status-dot--muted" },
        });
        /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['status-dot--muted']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "pm-card__hint" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__hint']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pm-card__actions" },
        });
        /** @type {__VLS_StyleScopedClasses['pm-card__actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(startUpdateCard, {})) },
            ...{ class: "btn-secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pm-trust-badges" },
    });
    /** @type {__VLS_StyleScopedClasses['pm-trust-badges']} */ ;
    const __VLS_5 = PaymentTrustBadges;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        // @ts-ignore
        variant: "inline",
    }));
    const __VLS_7 = __VLS_6({
        variant: "inline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "section" },
    });
    /** @type {__VLS_StyleScopedClasses['section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "section-subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
    if (visiblePlans.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plans-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['plans-grid']} */ ;
        const __VLS_10 = __VLS_tryAsConstant((visiblePlans.value));
        for (const [plan] of __VLS_vFor(__VLS_nonNull(__VLS_10))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
                key: (plan.id),
                ...{ class: "plan-card" },
                ...{ class: ({
                        'plan-card--inactive': !plan.isActive,
                        'plan-card--featured': plan.duration === 'YEAR' && !plan.isCurrentPlan,
                        'plan-card--current': plan.isCurrentPlan,
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card']} */ ;
            /** @type {__VLS_StyleScopedClasses['plan-card--inactive']} */ ;
            /** @type {__VLS_StyleScopedClasses['plan-card--featured']} */ ;
            /** @type {__VLS_StyleScopedClasses['plan-card--current']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
                ...{ class: "plan-card__head" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__head']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "plan-card__name-row" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__name-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
                ...{ class: "plan-card__name" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__name']} */ ;
            (plan.name);
            if (plan.isCurrentPlan) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "plan-badge plan-badge--current" },
                });
                /** @type {__VLS_StyleScopedClasses['plan-badge']} */ ;
                /** @type {__VLS_StyleScopedClasses['plan-badge--current']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'aria-hidden': "true",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                    points: "20 6 9 17 4 12",
                });
            }
            else if (plan.duration === 'YEAR') {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "plan-badge plan-badge--featured" },
                });
                /** @type {__VLS_StyleScopedClasses['plan-badge']} */ ;
                /** @type {__VLS_StyleScopedClasses['plan-badge--featured']} */ ;
            }
            else if (!plan.isActive) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "plan-badge plan-badge--inactive" },
                });
                /** @type {__VLS_StyleScopedClasses['plan-badge']} */ ;
                /** @type {__VLS_StyleScopedClasses['plan-badge--inactive']} */ ;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "plan-card__price" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__price']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "plan-card__amount" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__amount']} */ ;
            (__VLS_unwrap(formatAmount, {})(plan.amount));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "plan-card__period" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__period']} */ ;
            (__VLS_unwrap(formatPeriod, {})(plan.duration));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "plan-card__body" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__body']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "plan-card__desc" },
            });
            const __VLS_11 = __VLS_asFunctionalDirective(__VLS_directives.vHtml, {});
            __VLS_11(__VLS_nonNull(null), { ...__VLS_directiveBindingRestFields, value: (plan.description), }, ...__VLS_directiveHookArgsRest(__VLS_11));
            /** @type {__VLS_StyleScopedClasses['plan-card__desc']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
                ...{ class: "plan-card__foot" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-card__foot']} */ ;
            if (plan.isCurrentPlan) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ class: "plan-btn plan-btn--ghost" },
                    disabled: true,
                });
                /** @type {__VLS_StyleScopedClasses['plan-btn']} */ ;
                /** @type {__VLS_StyleScopedClasses['plan-btn--ghost']} */ ;
            }
            else if (plan.isActive) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            void $event;
                            if (!(visiblePlans.value.length))
                                throw 0;
                            if (!!(plan.isCurrentPlan))
                                throw 0;
                            if (!(plan.isActive))
                                throw 0;
                            return (__VLS_unwrap(startSubscribe, {})(plan));
                            // @ts-ignore
                            [isLoading, currentPlan, currentPlan, currentPlan, currentPlan, entitlements, entitlements, entitlements, entitlements, entitlements, entitlements, entitlements, formatAmount, formatAmount, formatPeriod, formatPeriod, formatDate, formatDate, resumeSubscription, cancelSubscription, scrollToPlans, savedCard, savedCard, savedCard, formatCardBrand, cardExpiry, startUpdateCard, startUpdateCard, removeSavedCard, visiblePlans, visiblePlans, startSubscribe,];
                        } },
                    ...{ class: "plan-btn plan-btn--primary" },
                });
                /** @type {__VLS_StyleScopedClasses['plan-btn']} */ ;
                /** @type {__VLS_StyleScopedClasses['plan-btn--primary']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
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
            else {
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ class: "plan-btn plan-btn--ghost" },
                    disabled: true,
                });
                /** @type {__VLS_StyleScopedClasses['plan-btn']} */ ;
                /** @type {__VLS_StyleScopedClasses['plan-btn--ghost']} */ ;
            }
            // @ts-ignore
            [];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "plans-empty" },
        });
        /** @type {__VLS_StyleScopedClasses['plans-empty']} */ ;
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "3",
            y: "3",
            width: "18",
            height: "18",
            rx: "2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "9",
            y1: "9",
            x2: "15",
            y2: "15",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "15",
            y1: "9",
            x2: "9",
            y2: "15",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-title" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-desc']} */ ;
    }
    if (cardModalMode.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (__VLS_unwrap(closeModal, {})) },
            ...{ class: "modal-backdrop" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: () => { } },
            ...{ class: "modal-box modal-box--sm" },
            role: "dialog",
            'aria-modal': "true",
        });
        /** @type {__VLS_StyleScopedClasses['modal-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['modal-box--sm']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
            ...{ class: "modal-header" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "modal-title" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
        (cardModalMode.value === 'updateCard' ? (savedCard.value ? 'Update card' : 'Add card') : 'Confirm subscription');
        if (cardModalMode.value === 'subscribe' && subscribingPlan.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modal-subtitle" },
            });
            /** @type {__VLS_StyleScopedClasses['modal-subtitle']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (subscribingPlan.value.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (__VLS_unwrap(formatAmount, {})(subscribingPlan.value.amount));
            (__VLS_unwrap(formatPeriod, {})(subscribingPlan.value.duration));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modal-subtitle" },
            });
            /** @type {__VLS_StyleScopedClasses['modal-subtitle']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(closeModal, {})) },
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "card-label" },
        });
        /** @type {__VLS_StyleScopedClasses['card-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ref: "cardElementRef",
            ...{ class: "card-element" },
        });
        /** @type {__VLS_StyleScopedClasses['card-element']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "card-help" },
        });
        /** @type {__VLS_StyleScopedClasses['card-help']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "3",
            y: "11",
            width: "18",
            height: "11",
            rx: "2",
            ry: "2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M7 11V7a5 5 0 0 1 10 0v4",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
            ...{ class: "modal-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(closeModal, {})) },
            type: "button",
            ...{ class: "modal-btn-secondary" },
        });
        /** @type {__VLS_StyleScopedClasses['modal-btn-secondary']} */ ;
        if (cardModalMode.value === 'subscribe') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_unwrap(confirmSubscription, {})) },
                type: "button",
                ...{ class: "modal-btn-primary" },
            });
            /** @type {__VLS_StyleScopedClasses['modal-btn-primary']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_unwrap(confirmUpdateCard, {})) },
                type: "button",
                ...{ class: "modal-btn-primary" },
            });
            /** @type {__VLS_StyleScopedClasses['modal-btn-primary']} */ ;
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "section payment-history" },
    });
    /** @type {__VLS_StyleScopedClasses['section']} */ ;
    /** @type {__VLS_StyleScopedClasses['payment-history']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "section-subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['section-subtitle']} */ ;
    if (paymentHistory.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-summary" },
        });
        /** @type {__VLS_StyleScopedClasses['history-summary']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-dot meta-dot--ok" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-dot--ok']} */ ;
        (__VLS_unwrap(successCount, {}));
        if (failedCount.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-pill" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-dot meta-dot--bad" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
            /** @type {__VLS_StyleScopedClasses['meta-dot--bad']} */ ;
            (failedCount.value);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill meta-pill--total" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-pill--total']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill__label" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill__label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill__value" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill__value']} */ ;
        (totalSpent.value.toFixed(2));
        if (nextBillingDate.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-pill" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-pill__label" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-pill__label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "meta-pill__value" },
            });
            /** @type {__VLS_StyleScopedClasses['meta-pill__value']} */ ;
            (nextBillingDate.value);
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "history-card" },
    });
    /** @type {__VLS_StyleScopedClasses['history-card']} */ ;
    if (paymentHistory.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "table-scroll" },
        });
        /** @type {__VLS_StyleScopedClasses['table-scroll']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
            ...{ class: "history-table" },
        });
        /** @type {__VLS_StyleScopedClasses['history-table']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
            ...{ class: "num" },
        });
        /** @type {__VLS_StyleScopedClasses['num']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
        const __VLS_12 = __VLS_tryAsConstant((__VLS_unwrap(pagedPaymentHistory, {})));
        for (const [payment] of __VLS_vFor(__VLS_nonNull(__VLS_12))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                key: (__VLS_unwrap(paymentHistoryRowKey, {})(payment)),
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "date-cell" },
            });
            /** @type {__VLS_StyleScopedClasses['date-cell']} */ ;
            (__VLS_unwrap(formatPaymentDate, {})(payment.dateIso || payment.date));
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "plan-cell" },
            });
            /** @type {__VLS_StyleScopedClasses['plan-cell']} */ ;
            (payment.plan);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "invoice-cell" },
            });
            /** @type {__VLS_StyleScopedClasses['invoice-cell']} */ ;
            (payment.invoiceId || '-');
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                ...{ class: "num" },
            });
            /** @type {__VLS_StyleScopedClasses['num']} */ ;
            (payment.amount);
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "status" },
                ...{ class: ({
                        'status--success': payment.status === 'Paid',
                        'status--failed': payment.status === 'Failed',
                        'status--pending': payment.status === '-' || payment.status === 'Pending' || !payment.status,
                        'status--ended': payment.status === 'Canceled' || payment.status === 'Expired',
                    }) },
            });
            /** @type {__VLS_StyleScopedClasses['status']} */ ;
            /** @type {__VLS_StyleScopedClasses['status--success']} */ ;
            /** @type {__VLS_StyleScopedClasses['status--failed']} */ ;
            /** @type {__VLS_StyleScopedClasses['status--pending']} */ ;
            /** @type {__VLS_StyleScopedClasses['status--ended']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "status-dot" },
            });
            /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
            (payment.status === '-' || !payment.status
                ? 'Pending'
                : payment.status);
            // @ts-ignore
            [formatAmount, formatPeriod, savedCard, cardModalMode, cardModalMode, cardModalMode, cardModalMode, closeModal, closeModal, closeModal, subscribingPlan, subscribingPlan, subscribingPlan, subscribingPlan, confirmSubscription, confirmUpdateCard, paymentHistory, paymentHistory, successCount, failedCount, failedCount, totalSpent, nextBillingDate, nextBillingDate, pagedPaymentHistory, paymentHistoryRowKey, formatPaymentDate,];
        }
    }
    if (paymentHistory.value.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['history-footer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-page-size" },
        });
        /** @type {__VLS_StyleScopedClasses['history-page-size']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            for: "historyPageSize",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            id: "historyPageSize",
            value: (__VLS_unwrap(historyPageSize, {})),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: (10),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: (25),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: (50),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            value: (100),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-range" },
        });
        /** @type {__VLS_StyleScopedClasses['history-range']} */ ;
        (__VLS_unwrap(historyStart, {}));
        (__VLS_unwrap(historyEnd, {}));
        (sortedPaymentHistory.value.length);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-pagination" },
        });
        /** @type {__VLS_StyleScopedClasses['history-pagination']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(previousHistoryPage, {})) },
            ...{ class: "history-page-btn" },
            disabled: (historyPage.value === 1),
        });
        /** @type {__VLS_StyleScopedClasses['history-page-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "history-page-info" },
        });
        /** @type {__VLS_StyleScopedClasses['history-page-info']} */ ;
        (historyPage.value);
        (totalHistoryPages.value);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(nextHistoryPage, {})) },
            ...{ class: "history-page-btn" },
            disabled: (historyPage.value === totalHistoryPages.value),
        });
        /** @type {__VLS_StyleScopedClasses['history-page-btn']} */ ;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-empty" },
        });
        /** @type {__VLS_StyleScopedClasses['history-empty']} */ ;
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
        __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
            x: "2",
            y: "5",
            width: "20",
            height: "14",
            rx: "2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "2",
            y1: "10",
            x2: "22",
            y2: "10",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "6",
            y1: "15",
            x2: "10",
            y2: "15",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-title" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "empty-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-desc']} */ ;
    }
    // @ts-ignore
    [paymentHistory, historyPageSize, historyStart, historyEnd, sortedPaymentHistory, previousHistoryPage, historyPage, historyPage, historyPage, totalHistoryPages, totalHistoryPages, nextHistoryPage,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

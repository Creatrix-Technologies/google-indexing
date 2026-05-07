<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router'
import api from '../api'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
import { useSubscriptionStore } from '../Shared/subscription'
import PaymentTrustBadges from '../components/PaymentTrustBadges.vue'

const subscriptionStore = useSubscriptionStore()
const toast = useToast()
const route = useRoute()

/* ---------------- TYPES ---------------- */
interface Plan {
  id: number
  name: string
  description: string
  amount: number
  currency: string
  isActive: boolean
  durationId: number
  duration: string
  isCurrentPlan: boolean
}

interface Payment {
  date: string
  dateIso?: string
  amount: string
  status: string
  plan: string
  invoiceId?: string
  nextBillingDateIso?: string
}

interface SavedCard {
  paymentMethodId: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

/* ---------------- STATE ---------------- */
const plans = ref<Plan[]>([])
const paymentHistory = ref<Payment[]>([])
const historyPage = ref(1)
const historyPageSize = ref(10)
const isLoading = ref(false)
const subscribingPlan = ref<Plan | null>(null)
const savedCard = ref<SavedCard | null>(null)
const cardModalMode = ref<'subscribe' | 'updateCard' | null>(null)

const cardElementRef = ref<HTMLDivElement | null>(null)

let stripe: Stripe | null = null
let card: any = null

const resolveStripe = async (): Promise<Stripe | null> => {
  let pk = ''
  try {
    const res = await api.get('/payments/stripe-client-config')
    pk = String(res.data?.data?.publishableKey ?? '').trim()
  } catch {
    toast.error('Unable to load Stripe client configuration.')
    return null
  }
  if (!pk) {
    toast.error('Stripe publishable key is missing in Stripe settings.')
    return null
  }
  return loadStripe(pk)
}

/* ---------------- DERIVED (display only) ---------------- */
const currentPlan = computed(() => plans.value.find(p => p.isCurrentPlan) || null)

const visiblePlans = computed(() =>
  // show active plans first, then inactive
  [...plans.value].sort((a, b) => Number(b.isActive) - Number(a.isActive))
)

const totalSpent = computed(() => {
  const total = paymentHistory.value
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => {
      const n = parseFloat(String(p.amount).replace(/[^0-9.\-]/g, ''))
      return sum + (isNaN(n) ? 0 : n)
    }, 0)
  return total
})

const successCount = computed(() =>
  paymentHistory.value.filter(p => p.status === 'Paid').length
)
const failedCount = computed(() =>
  paymentHistory.value.filter(p => p.status === 'Failed').length
)

const parsePaymentDateMs = (value: string) => {
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

const sortedPaymentHistory = computed(() =>
  [...paymentHistory.value].sort((a, b) => {
    const bVal = b.dateIso || b.date
    const aVal = a.dateIso || a.date
    return parsePaymentDateMs(bVal) - parsePaymentDateMs(aVal)
  })
)

const formatPaymentDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const nextBillingDate = computed(() => {
  const iso = paymentHistory.value.find(p => p.nextBillingDateIso)?.nextBillingDateIso
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString()
})

const totalHistoryPages = computed(() =>
  Math.max(1, Math.ceil(sortedPaymentHistory.value.length / historyPageSize.value))
)

const pagedPaymentHistory = computed(() => {
  const start = (historyPage.value - 1) * historyPageSize.value
  return sortedPaymentHistory.value.slice(start, start + historyPageSize.value)
})

const paymentHistoryRowKey = (payment: Payment) => {
  const inv = payment.invoiceId?.trim()
  if (inv) return `inv:${inv}`
  const iso = payment.dateIso || payment.date || ''
  return [iso, payment.plan, payment.amount, payment.status].join('|')
}

const historyStart = computed(() =>
  sortedPaymentHistory.value.length === 0 ? 0 : (historyPage.value - 1) * historyPageSize.value + 1
)

const historyEnd = computed(() =>
  Math.min(historyPage.value * historyPageSize.value, sortedPaymentHistory.value.length)
)

const previousHistoryPage = () => {
  if (historyPage.value > 1) historyPage.value--
}

const nextHistoryPage = () => {
  if (historyPage.value < totalHistoryPages.value) historyPage.value++
}

watch(historyPageSize, () => {
  historyPage.value = 1
})

const formatPeriod = (duration: string) => {
  if (!duration) return ''
  const d = duration.toLowerCase()
  if (d === 'year')  return 'year'
  if (d === 'month') return 'month'
  if (d === 'week')  return 'week'
  if (d === 'day')   return 'day'
  return d
}

const formatAmount = (amount: number) => {
  return amount.toFixed(2)
}

const scrollToPlans = () => {
  document.getElementById('available-plans')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

/* ---------------- FETCH PLANS ---------------- */
const fetchPlans = async () => {
  try {
    const res = await api.get('/payments/stripe-subscription-plans')
    plans.value = res.data.data || []

    // Auto-select plan from query parameter after plans are loaded
    const planFromQuery = route.query.plan as string | undefined
    if (planFromQuery) {
      autoSelectPlan(planFromQuery)
    }
  } catch {
    toast.error('Failed to load plans')
  }
}

/* ---------------- AUTO-SELECT PLAN FROM QUERY ---------------- */
const autoSelectPlan = (planIdentifier: string) => {
  // Map query plan identifiers to plan names
  const planNameMap: Record<string, string[]> = {
    trial: ['Trial', 'trial', 'Free', 'free'],
    solo: ['Solo', 'solo', 'Basic', 'basic'],
    pro: ['Pro', 'pro', 'Professional', 'professional'],
    team: ['Team', 'team', 'Enterprise', 'enterprise', 'Business', 'business']
  }

  const possibleNames = planNameMap[planIdentifier.toLowerCase()] || [planIdentifier]

  // Find matching plan (case-insensitive, partial match)
  const matchingPlan = plans.value.find(p => {
    const planName = p.name.toLowerCase()
    return possibleNames.some(name => planName.includes(name.toLowerCase()))
  })

  if (matchingPlan && !matchingPlan.isCurrentPlan) {
    // Small delay to ensure UI is ready
    setTimeout(() => {
      startSubscribe(matchingPlan)
    }, 300)
  }
}

/* ---------------- FETCH SUBSCRIPTION LOGS ---------------- */
const fetchSubscriptionLogs = async () => {
  try {
    const res = await api.get('/payments/subscription-logs')
    paymentHistory.value = res.data.data || []
    historyPage.value = 1
  } catch {
    console.log('Failed to load payment history')
  }
}

/* ---------------- FETCH SAVED CARD ---------------- */
const fetchSavedCard = async () => {
  try {
    const res = await api.get('/payments/payment-method')
    savedCard.value = res.data?.data || null
  } catch {
    savedCard.value = null
  }
}

const formatCardBrand = (brand: string) => {
  if (!brand) return 'Card'
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase()
}

const cardExpiry = computed(() => {
  if (!savedCard.value) return ''
  const m = String(savedCard.value.expMonth).padStart(2, '0')
  const y = String(savedCard.value.expYear).slice(-2)
  return `${m}/${y}`
})

/* ---------------- MOUNT STRIPE CARD ELEMENT ---------------- */
const mountCardElement = async () => {
  stripe = await resolveStripe()
  if (!stripe || !cardElementRef.value) return

  if (card) {
    card.unmount()
    card = null
  }
  cardElementRef.value.innerHTML = ''
  const elements = stripe.elements()
  card = elements.create('card', { hidePostalCode: true })
  card.mount(cardElementRef.value)
}

/* ---------------- START SUBSCRIBE ---------------- */
const startSubscribe = async (plan: Plan) => {
  subscribingPlan.value = { ...plan }

  // If the customer already has a card on file, skip the card modal and
  // charge it directly. Stripe will use the stored default payment method
  // and Subscription.Status will return as "active" right away.
  if (savedCard.value) {
    await chargeWithSavedCard()
    return
  }

  cardModalMode.value = 'subscribe'
  // Mount card on the next tick so the ref is wired up.
  await nextTickMount()
}

const nextTickMount = async () => {
  await new Promise(r => setTimeout(r, 0))
  await mountCardElement()
}

/* ---------------- SUBSCRIBE WITH SAVED CARD ---------------- */
const chargeWithSavedCard = async () => {
  if (!subscribingPlan.value) return
  try {
    isLoading.value = true

    const res = await api.get(
      `/payments/stripe-user-subscription?plan=${subscribingPlan.value.id}`
    )

    const data = res.data?.data || {}
    const status = String(data.status || '').toLowerCase()
    const chargedSavedCard = !!data.chargedSavedCard

    if (chargedSavedCard) {
      // Backend already attempted to charge the saved card.
      if (status === 'active' || status === 'trialing') {
        toast.success(`Subscribed to ${subscribingPlan.value.name}!`)
      } else if (status === 'incomplete') {
        // Card needed action and the saved card couldn't be charged silently
        // (e.g. SCA required). Fall back to the card modal flow.
        cardModalMode.value = 'subscribe'
        await nextTickMount()
        return
      } else {
        toast.success(`Subscription updated to ${subscribingPlan.value.name}.`)
      }

      try { await api.get('/payments/sync-subscription') } catch {}

      subscribingPlan.value = null
      cardModalMode.value = null

      await Promise.all([
        fetchPlans(),
        fetchSubscriptionLogs(),
        fetchSavedCard(),
        subscriptionStore.checkSubscription(),
      ])
      return
    }

    // Backend did NOT charge the saved card (either no saved card from
    // its perspective or a fall-through). Use the SCA modal flow.
    const clientSecret = data.clientSecret
    if (!clientSecret) throw new Error('Failed to create subscription')

    cardModalMode.value = 'subscribe'
    await nextTickMount()
    if (!stripe || !card) throw new Error('Stripe is not ready')

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    })

    if (result.paymentIntent?.status === 'succeeded') {
      toast.success(`Subscribed to ${subscribingPlan.value.name}!`)
      closeModal()
      try { await api.get('/payments/sync-subscription') } catch {}
      await Promise.all([
        fetchPlans(),
        fetchSubscriptionLogs(),
        fetchSavedCard(),
        subscriptionStore.checkSubscription(),
      ])
    } else if (result.error) {
      toast.error(result.error.message || 'Payment failed')
    }
  } catch (err: any) {
    toast.error(
      err.response?.data?.error?.description ||
        err.message ||
        'Subscription failed'
    )
  } finally {
    isLoading.value = false
  }
}

/* ---------------- CONFIRM PAYMENT (modal) ---------------- */
const confirmSubscription = async () => {
  if (!stripe || !card || !subscribingPlan.value) return

  try {
    isLoading.value = true

    const res = await api.get(
      `/payments/stripe-user-subscription?plan=${subscribingPlan.value.id}`
    )

    const clientSecret = res.data?.data?.clientSecret
    if (!clientSecret) throw new Error('Failed to create subscription')

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    })

    if (result.paymentIntent?.status === 'succeeded') {
      toast.success(`Subscribed to ${subscribingPlan.value.name}!`)
      closeModal()

      // Stripe has charged the card, but our DB row is still "incomplete"
      // until the customer.subscription.updated / invoice.paid webhook
      // fires. Dev environments rarely receive Stripe webhooks, so we hit
      // the explicit sync endpoint to mirror the live status into the DB
      // and only then refresh the plans / store.
      try {
        await api.get('/payments/sync-subscription')
      } catch {
        // Non-fatal: user is subscribed on Stripe's side regardless.
        // The webhook will eventually backfill the row.
      }

      await Promise.all([
        fetchPlans(),
        fetchSubscriptionLogs(),
        fetchSavedCard(),
        subscriptionStore.checkSubscription()
      ])
    } else if (result.error) {
      toast.error(result.error.message || 'Payment failed')
    }
  } catch (err: any) {
    toast.error(
      err.response?.data?.error?.description ||
        err.message ||
        'Subscription failed'
    )
  } finally {
    isLoading.value = false
  }
}

/* ---------------- UPDATE CARD ---------------- */
const startUpdateCard = async () => {
  cardModalMode.value = 'updateCard'
  await nextTickMount()
}

const confirmUpdateCard = async () => {
  if (!stripe || !card) return
  try {
    isLoading.value = true

    const res = await api.post('/payments/setup-intent')
    const clientSecret = String(res.data?.data?.clientSecret ?? '').trim()
    if (!clientSecret) throw new Error('Failed to start card update')

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card }
    })

    if (result.error) {
      toast.error(result.error.message || 'Card update failed')
      return
    }

    const pmId = result.setupIntent?.payment_method
    if (typeof pmId !== 'string') throw new Error('No payment method id returned')

    await api.post('/payments/payment-method', { paymentMethodId: pmId })

    toast.success('Card updated.')
    closeModal()
    await fetchSavedCard()
  } catch (err: any) {
    toast.error(
      err.response?.data?.error?.description ||
        err.message ||
        'Failed to update card'
    )
  } finally {
    isLoading.value = false
  }
}

/* ---------------- REMOVE CARD ---------------- */
const removeSavedCard = async () => {
  const result = await Swal.fire({
    title: 'Remove saved card?',
    text: 'You will need to enter card details on your next subscription.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove',
    cancelButtonText: 'Keep it',
  })
  if (!result.isConfirmed) return

  try {
    await api.delete('/payments/payment-method')
    toast.success('Saved card removed.')
    await fetchSavedCard()
  } catch (err: any) {
    toast.error(
      err.response?.data?.error?.description || 'Failed to remove card'
    )
  }
}

/* ---------------- CANCEL SUBSCRIPTION ---------------- */
const cancelSubscription = async () => {
  const result = await Swal.fire({
    title: 'Cancel Subscription?',
    text: 'Are you sure you want to cancel your subscription?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel it',
    cancelButtonText: 'No, keep it',
    reverseButtons: false
  })

  if (result.isConfirmed) {
    try {
      await api.get('/payments/cancel-subscription')
      toast.success('Subscription canceled')
      fetchPlans()
      fetchSubscriptionLogs()
    } catch (err: any) {
      toast.error(
        err.response?.data?.error?.description ||
          'Failed to cancel subscription'
      )
    }
  }
}

/* ---------------- CLOSE MODAL ---------------- */
const closeModal = () => {
  if (card) {
    card.unmount()
    card = null
  }
  subscribingPlan.value = null
  cardModalMode.value = null
}

/* ---------------- INIT ---------------- */
const syncSubscription = async () => {
  // Best-effort: backfill any locally "incomplete" / stale subscription
  // row from Stripe so the UI doesn't show "Choose a plan" after a
  // successful charge that pre-dated this session.
  try {
    await api.get('/payments/sync-subscription')
  } catch {
    // Non-fatal — fall through and render whatever the DB currently has.
  }
}

onMounted(async () => {
  await syncSubscription()
  await fetchPlans()
  fetchSubscriptionLogs()
  fetchSavedCard()
})
</script>

<template>
  <div class="page-container">
    <!-- ============ HEADER ============ -->
    <div class="page-header">
      <div>
        <h1>Subscription</h1>
        <p class="subtitle">
          Manage your plan and view billing history.
        </p>
      </div>
    </div>

    <Loading :active.sync="isLoading" :is-full-page="true" />

    <!-- ============ CURRENT PLAN BANNER ============ -->
    <section v-if="currentPlan" class="current-card">
      <div class="current-card__main">
        <div class="current-card__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div class="current-card__text">
          <span class="current-card__eyebrow">
            <span class="status-dot status-dot--ok"></span>
            Active subscription
          </span>
          <h2 class="current-card__title">{{ currentPlan.name }}</h2>
          <p class="current-card__price">
            <span class="current-card__amount">${{ formatAmount(currentPlan.amount) }}</span>
            <span class="current-card__period">/ {{ formatPeriod(currentPlan.duration) }}</span>
          </p>
        </div>
      </div>
      <div class="current-card__actions">
        <button class="btn-ghost-danger" @click="cancelSubscription">
          Cancel subscription
        </button>
      </div>
    </section>

    <section v-else class="current-card current-card--inactive">
      <div class="current-card__main">
        <div class="current-card__icon current-card__icon--muted" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <div class="current-card__text">
          <span class="current-card__eyebrow">
            <span class="status-dot status-dot--muted"></span>
            No active subscription
          </span>
          <h2 class="current-card__title">Choose a plan</h2>
          <p class="current-card__hint">
            Subscribe to unlock indexing quotas and scheduled jobs.
          </p>
        </div>
      </div>
      <div class="current-card__actions">
        <button type="button" class="btn-primary-inline" @click="scrollToPlans">
          View plans
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </section>

    <!-- ============ PAYMENT METHOD ============ -->
    <section id="available-plans" class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Payment method</h2>
        </div>
      </div>

      <div class="pm-card" v-if="savedCard">
        <div class="pm-card__main">
          <div class="pm-card__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <line x1="6" y1="15" x2="10" y2="15" />
            </svg>
          </div>
          <div class="pm-card__text">
            <span class="pm-card__eyebrow">
              <span class="status-dot status-dot--ok"></span>
              Default payment method
            </span>
            <p class="pm-card__line">
              <strong>{{ formatCardBrand(savedCard.brand) }}</strong>
              <span class="pm-card__sep" aria-hidden="true">•</span>
              <span class="pm-card__digits">•••• {{ savedCard.last4 }}</span>
              <span class="pm-card__sep" aria-hidden="true">•</span>
              <span class="pm-card__exp">Exp {{ cardExpiry }}</span>
            </p>
          </div>
        </div>
        <div class="pm-card__actions">
          <button class="btn-secondary" @click="startUpdateCard">Update card</button>
          <button class="btn-ghost-danger" @click="removeSavedCard">Remove</button>
        </div>
      </div>

      <div class="pm-card pm-card--empty" v-else>
        <div class="pm-card__main">
          <div class="pm-card__icon pm-card__icon--muted" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div class="pm-card__text">
            <span class="pm-card__eyebrow">
              <span class="status-dot status-dot--muted"></span>
              No card on file
            </span>
            <p class="pm-card__hint">
              Your card will be saved automatically the first time you subscribe.
            </p>
          </div>
        </div>
        <div class="pm-card__actions">
          <button class="btn-secondary" @click="startUpdateCard">Add card</button>
        </div>
      </div>

      <div class="pm-trust-badges">
        <PaymentTrustBadges variant="inline" />
      </div>
    </section>

    <!-- ============ PLANS ============ -->
    <section class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Available plans</h2>
          <p class="section-subtitle">Pick the plan that fits your indexing volume.</p>
        </div>
      </div>

      <div class="plans-grid" v-if="visiblePlans.length">
        <article
          v-for="plan in visiblePlans"
          :key="plan.id"
          class="plan-card"
          :class="{
            'plan-card--inactive': !plan.isActive,
            'plan-card--featured': plan.duration === 'YEAR' && !plan.isCurrentPlan,
            'plan-card--current': plan.isCurrentPlan,
          }"
        >
          <header class="plan-card__head">
            <div class="plan-card__name-row">
              <h3 class="plan-card__name">{{ plan.name }}</h3>
              <span class="plan-badge plan-badge--current" v-if="plan.isCurrentPlan">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Current
              </span>
              <span class="plan-badge plan-badge--featured" v-else-if="plan.duration === 'YEAR'">
                Best value
              </span>
              <span class="plan-badge plan-badge--inactive" v-else-if="!plan.isActive">
                Unavailable
              </span>
            </div>

            <div class="plan-card__price">
              <span class="plan-card__amount">${{ formatAmount(plan.amount) }}</span>
              <span class="plan-card__period">/ {{ formatPeriod(plan.duration) }}</span>
            </div>
          </header>

          <div class="plan-card__body">
            <div class="plan-card__desc" v-html="plan.description"></div>
          </div>

          <footer class="plan-card__foot">
            <button
              v-if="plan.isCurrentPlan"
              class="plan-btn plan-btn--ghost"
              disabled
            >
              Current plan
            </button>

            <button
              v-else-if="plan.isActive"
              class="plan-btn plan-btn--primary"
              @click="startSubscribe(plan)"
            >
              Subscribe
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button v-else class="plan-btn plan-btn--ghost" disabled>
              Unavailable
            </button>
          </footer>
        </article>
      </div>

      <div v-else class="plans-empty">
        <div class="empty-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
        </div>
        <p class="empty-title">No plans available</p>
        <p class="empty-desc">Subscription plans will appear here once published.</p>
      </div>
    </section>

    <!-- ============ CARD MODAL (subscribe + update card) ============ -->
    <div v-if="cardModalMode" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box modal-box--sm" @click.stop role="dialog" aria-modal="true">
        <header class="modal-header">
          <div>
            <h3 class="modal-title">
              {{ cardModalMode === 'updateCard' ? (savedCard ? 'Update card' : 'Add card') : 'Confirm subscription' }}
            </h3>
            <p class="modal-subtitle" v-if="cardModalMode === 'subscribe' && subscribingPlan">
              Subscribing to <strong>{{ subscribingPlan.name }}</strong> at
              <strong>${{ formatAmount(subscribingPlan.amount) }}/{{ formatPeriod(subscribingPlan.duration) }}</strong>.
            </p>
            <p class="modal-subtitle" v-else>
              Your card is stored securely with Stripe. We will not charge it now.
            </p>
          </div>
          <button type="button" class="modal-close" aria-label="Close" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div class="modal-body">
          <label class="card-label">Card details</label>
          <div ref="cardElementRef" class="card-element"></div>
          <p class="card-help">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Payments are processed securely by Stripe.
          </p>
        </div>

        <footer class="modal-footer">
          <button type="button" class="modal-btn-secondary" @click="closeModal">Cancel</button>
          <button
            v-if="cardModalMode === 'subscribe'"
            type="button"
            class="modal-btn-primary"
            @click="confirmSubscription"
          >
            Confirm payment
          </button>
          <button
            v-else
            type="button"
            class="modal-btn-primary"
            @click="confirmUpdateCard"
          >
            Save card
          </button>
        </footer>
      </div>
    </div>

    <!-- ============ PAYMENT HISTORY ============ -->
    <section class="section payment-history">
      <div class="section-header">
        <div>
          <h2 class="section-title">Billing history</h2>
          <p class="section-subtitle">All charges associated with your account (newest first).</p>
        </div>

        <div class="history-summary" v-if="paymentHistory.length">
          <span class="meta-pill">
            <span class="meta-dot meta-dot--ok"></span>
            {{ successCount }} paid
          </span>
          <span class="meta-pill" v-if="failedCount">
            <span class="meta-dot meta-dot--bad"></span>
            {{ failedCount }} failed
          </span>
          <span class="meta-pill meta-pill--total">
            <span class="meta-pill__label">Total spent</span>
            <span class="meta-pill__value">${{ totalSpent.toFixed(2) }}</span>
          </span>
          <span class="meta-pill" v-if="nextBillingDate">
            <span class="meta-pill__label">Next billing</span>
            <span class="meta-pill__value">{{ nextBillingDate }}</span>
          </span>
        </div>
      </div>

      <div class="history-card">
        <div class="table-scroll" v-if="paymentHistory.length">
          <table class="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Plan</th>
                <th>Invoice</th>
                <th class="num">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in pagedPaymentHistory" :key="paymentHistoryRowKey(payment)">
                <td class="date-cell">{{ formatPaymentDate(payment.dateIso || payment.date) }}</td>
                <td class="plan-cell">{{ payment.plan }}</td>
                <td class="invoice-cell">{{ payment.invoiceId || '-' }}</td>
                <td class="num">{{ payment.amount }}</td>
                <td>
                  <span
                    class="status"
                    :class="{
                      'status--success': payment.status === 'Paid',
                      'status--failed': payment.status === 'Failed',
                      'status--pending': payment.status === '-' || payment.status === 'Pending' || !payment.status,
                      'status--ended': payment.status === 'Canceled' || payment.status === 'Expired',
                    }"
                  >
                    <span class="status-dot"></span>
                    {{
                      payment.status === '-' || !payment.status
                        ? 'Pending'
                        : payment.status
                    }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="history-footer" v-if="paymentHistory.length">
          <div class="history-page-size">
            <label for="historyPageSize">Rows</label>
            <select id="historyPageSize" v-model.number="historyPageSize">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div class="history-range">{{ historyStart }}-{{ historyEnd }} of {{ sortedPaymentHistory.length }}</div>
          <div class="history-pagination">
            <button class="history-page-btn" :disabled="historyPage === 1" @click="previousHistoryPage">Prev</button>
            <span class="history-page-info">Page {{ historyPage }} / {{ totalHistoryPages }}</span>
            <button class="history-page-btn" :disabled="historyPage === totalHistoryPages" @click="nextHistoryPage">Next</button>
          </div>
        </div>

        <div v-else class="history-empty">
          <div class="empty-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <line x1="6" y1="15" x2="10" y2="15" />
            </svg>
          </div>
          <p class="empty-title">No payments yet</p>
          <p class="empty-desc">Once you subscribe, charges will appear here.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-container {
  padding: 0;
  background: var(--color-background);
  min-height: 100%;
  font-family: var(--font-family);
}

/* ============ Header ============ */
.page-header {
  margin-bottom: var(--space-5);
}
.page-header h1 {
  margin: 0;
  font-size: var(--fs-2xl);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  color: var(--color-text);
  line-height: 1.15;
}
.subtitle {
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  margin: 4px 0 0 0;
  max-width: 56ch;
}

/* ============ Section primitive ============ */
.section { margin-top: var(--space-6); }

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}
.section-title {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: var(--letter-tight);
  line-height: 1.2;
}
.section-subtitle {
  margin: 4px 0 0 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}

.pm-trust-badges {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
}

/* ============ Status dot helper ============ */
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.status-dot--ok     { background: var(--color-success); }
.status-dot--bad    { background: var(--color-danger);  }
.status-dot--muted  { background: var(--neutral-400);   }

/* ============ Current plan banner ============ */
.current-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  position: relative;
  overflow: hidden;
}
.current-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--color-success);
}
.current-card--inactive::before { background: var(--neutral-300); }

.current-card__main {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  min-width: 0;
}

.current-card__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--success-50);
  color: var(--color-success);
  border: 1px solid var(--success-100);
}
.current-card__icon--muted {
  background: var(--neutral-100);
  color: var(--neutral-500);
  border-color: var(--color-border);
}
.current-card__icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.current-card__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.current-card__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.current-card__title {
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tight);
  color: var(--color-text);
  line-height: 1.2;
}
.current-card__price {
  margin: 0;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
}
.current-card__amount {
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: var(--letter-tight);
}
.current-card__period { color: var(--color-text-secondary); }
.current-card__hint {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}

.current-card__actions {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-primary-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-accent-fg);
  border: 1px solid var(--color-accent);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  font-family: inherit;
  transition: background 140ms ease, border-color 140ms ease, transform 100ms ease;
}
.btn-primary-inline svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.btn-primary-inline:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  transform: translateY(-1px);
}

.btn-ghost-danger {
  padding: 7px 14px;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-danger);
  border: 1px solid var(--danger-100);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  font-family: inherit;
  transition: background 140ms ease, border-color 140ms ease;
}
.btn-ghost-danger:hover {
  background: var(--danger-50);
  border-color: var(--color-danger);
}

.btn-secondary {
  padding: 7px 14px;
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  font-family: inherit;
  transition: background 140ms ease, border-color 140ms ease;
}
.btn-secondary:hover {
  background: var(--neutral-50);
  border-color: var(--neutral-400);
}

/* ============ Payment method card ============ */
.pm-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}
.pm-card--empty {
  border-style: dashed;
  background: var(--neutral-50);
}
.pm-card__main {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}
.pm-card__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--neutral-100);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.pm-card__icon--muted {
  color: var(--neutral-500);
}
.pm-card__icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}
.pm-card__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.pm-card__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.pm-card__line {
  margin: 0;
  font-size: var(--fs-base);
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-variant-numeric: tabular-nums;
}
.pm-card__sep {
  color: var(--color-text-secondary);
  opacity: 0.55;
}
.pm-card__digits,
.pm-card__exp {
  color: var(--color-text-secondary);
  font-weight: var(--fw-regular);
}
.pm-card__hint {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}
.pm-card__actions {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

/* ============ Plans grid ============ */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-4);
}

.plan-card {
  position: relative;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  transition: border-color 160ms ease, box-shadow 160ms ease,
              transform 160ms ease;
  overflow: hidden;
}
.plan-card:hover {
  border-color: var(--neutral-400);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.plan-card--featured {
  border-color: var(--color-text);
  box-shadow: var(--shadow-sm);
}
.plan-card--current {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.10), var(--shadow-sm);
}
.plan-card--current::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--color-accent);
}
.plan-card--inactive {
  opacity: 0.62;
}
.plan-card--inactive:hover {
  transform: none;
  box-shadow: var(--shadow-xs);
  border-color: var(--color-border);
}

.plan-card__head {
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.plan-card__name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.plan-card__name {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: var(--letter-tight);
  line-height: 1.2;
}

.plan-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  letter-spacing: 0.005em;
  border: 1px solid transparent;
  white-space: nowrap;
}
.plan-badge svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
}
.plan-badge--current {
  background: rgba(99, 102, 241, 0.10);
  color: var(--color-accent);
  border-color: rgba(99, 102, 241, 0.22);
}
.plan-badge--featured {
  background: var(--neutral-900);
  color: var(--neutral-0);
  border-color: var(--neutral-900);
}
.plan-badge--inactive {
  background: var(--neutral-100);
  color: var(--neutral-600);
  border-color: var(--color-border);
}

.plan-card__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.plan-card__amount {
  font-size: 30px;
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  color: var(--color-text);
  line-height: 1;
}
.plan-card__period {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-weight: var(--fw-regular);
}

.plan-card__body {
  padding: var(--space-4) var(--space-5);
  flex: 1;
}

.plan-card__desc {
  font-size: var(--fs-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
}
.plan-card__desc :deep(*) {
  color: var(--color-text-secondary) !important;
}
.plan-card__desc :deep(p)  { margin: 0 0 8px 0; }
.plan-card__desc :deep(p:last-child) { margin-bottom: 0; }
.plan-card__desc :deep(ul) {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.plan-card__desc :deep(ul li) {
  position: relative;
  padding-left: 22px;
  font-size: var(--fs-sm);
  line-height: 1.5;
}
.plan-card__desc :deep(ul li)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--success-50);
  border: 1px solid var(--success-100);
}
.plan-card__desc :deep(ul li)::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 7px;
  width: 6px;
  height: 3px;
  border-left: 1.6px solid var(--color-success);
  border-bottom: 1.6px solid var(--color-success);
  transform: rotate(-45deg);
}

.plan-card__foot {
  padding: 0 var(--space-5) var(--space-5);
}

.plan-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  cursor: pointer;
  border: 1px solid transparent;
  font-family: inherit;
  transition: background 140ms ease, border-color 140ms ease, transform 100ms ease;
}
.plan-btn svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  transition: transform 140ms ease;
}
.plan-btn:hover svg { transform: translateX(2px); }

.plan-btn--primary {
  background: var(--color-accent);
  color: var(--color-accent-fg);
}
.plan-btn--primary:hover { background: var(--color-accent-hover); }
.plan-btn--primary:focus-visible {
  outline: none;
  box-shadow: var(--ring-accent);
}

.plan-btn--ghost {
  background: var(--color-card-bg);
  color: var(--color-text-secondary);
  border-color: var(--color-border-strong);
  cursor: not-allowed;
}

.plans-empty {
  background: var(--color-card-bg);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-7) var(--space-5);
  text-align: center;
}

/* ============ Empty state common ============ */
.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  margin-bottom: var(--space-3);
  color: var(--neutral-500);
}
.empty-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}
.empty-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: var(--fw-semi);
  color: var(--color-text);
}
.empty-desc {
  margin: 4px 0 0 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}

/* ============ Modal extras ============ */
.card-label {
  display: block;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text);
  margin-bottom: 6px;
}
.card-element {
  border: 1px solid var(--color-border-strong);
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
.card-element.StripeElement--focus,
.card-element:focus-within {
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}
.card-help {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0 0 0;
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
}
.card-help svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

/* ============ Billing history ============ */
.history-summary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.meta-pill--total {
  background: var(--neutral-50);
  color: var(--color-text);
}
.meta-pill__label {
  color: var(--color-text-secondary);
  font-weight: var(--fw-regular);
}
.meta-pill__value {
  color: var(--color-text);
  font-weight: var(--fw-semi);
}
.meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.meta-dot--ok  { background: var(--color-success); }
.meta-dot--bad { background: var(--color-danger);  }

.history-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}

.table-scroll { overflow-x: auto; }

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
  min-width: 560px;
}
.history-table thead {
  background: var(--neutral-50);
}
.history-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}
.history-table th.num,
.history-table td.num {
  text-align: right;
  font-feature-settings: "tnum" 1, "lnum" 1;
}
.history-table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--fs-base);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-divider);
  vertical-align: middle;
}
.history-table tbody tr {
  transition: background 120ms ease;
}
.history-table tbody tr:hover {
  background: var(--neutral-50);
}
.history-table tbody tr:last-child td {
  border-bottom: none;
}
.plan-cell {
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
}

.date-cell {
  white-space: nowrap;
}

.invoice-cell {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ----- Status pills (history) ----- */
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  border: 1px solid transparent;
  letter-spacing: 0.005em;
}
.status .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
}
.status--success {
  background: var(--success-50);
  color: var(--success-700);
  border-color: var(--success-100);
}
.status--failed {
  background: var(--danger-50);
  color: var(--danger-700);
  border-color: var(--danger-100);
}
.status--pending {
  background: var(--warning-50);
  color: var(--warning-700);
  border-color: var(--warning-100);
}
.status--ended {
  background: var(--neutral-100);
  color: var(--neutral-700);
  border-color: var(--neutral-200);
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-7) var(--space-5);
  text-align: center;
  color: var(--color-text-secondary);
}

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-top: 1px solid var(--color-divider);
  background: var(--neutral-50);
  flex-wrap: wrap;
}

.history-page-size {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}

.history-page-size select {
  padding: 4px 24px 4px 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background: var(--color-card-bg);
  font-size: var(--fs-sm);
  color: var(--color-text);
}

.history-range {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.history-pagination {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.history-page-btn {
  padding: 5px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background: var(--color-card-bg);
  color: var(--color-text);
  cursor: pointer;
  font-family: inherit;
}

.history-page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-page-info {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}

/* ============ Responsive ============ */
@media (max-width: 720px) {
  .current-card,
  .pm-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .current-card__actions,
  .pm-card__actions { width: 100%; }
  .pm-card__actions .btn-secondary,
  .pm-card__actions .btn-ghost-danger { flex: 1; }
  .btn-ghost-danger { width: 100%; }
  .section-header { align-items: flex-start; }
  .history-summary { width: 100%; }
}
</style>

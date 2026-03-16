<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '../api'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import Swal from 'sweetalert2'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'
import { useSubscriptionStore } from '../Shared/subscription'

const subscriptionStore = useSubscriptionStore()
const toast = useToast()

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
  amount: string
  status: string
  plan: string
}

/* ---------------- STATE ---------------- */
const plans = ref<Plan[]>([])
const paymentHistory = ref<Payment[]>([])
const isLoading = ref(false)
const subscribingPlan = ref<Plan | null>(null)

const publicKey = import.meta.env.VITE_STRIPE_PUBLIC
const stripePromise = loadStripe(publicKey)
const cardElementRef = ref<HTMLDivElement | null>(null)

let stripe: Stripe | null = null
let card: any = null

/* ---------------- FETCH PLANS ---------------- */
const fetchPlans = async () => {
  try {
    const res = await api.get('/payments/stripe-subscription-plans')
    plans.value = res.data.data || []
  } catch {
    toast.error('Failed to load plans')
  }
}

/* ---------------- FETCH SUBSCRIPTION LOGS ---------------- */
const fetchSubscriptionLogs = async () => {
  try {
    const res = await api.get('/payments/subscription-logs')
    paymentHistory.value = res.data.data || []
  } catch {
    console.log('Failed to load payment history')
  }
}

/* ---------------- START SUBSCRIBE ---------------- */
const startSubscribe = async (plan: Plan) => {
  subscribingPlan.value = { ...plan }
  stripe = await stripePromise
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

/* ---------------- CONFIRM PAYMENT ---------------- */
const confirmSubscription = async () => {
  if (!stripe || !card || !subscribingPlan.value) return

  try {
    isLoading.value = true

    const res = await api.get(
      `/payments/stripe-user-subscription?plan=${subscribingPlan.value.id}`
    )

    const clientSecret = res.data.data.clientSecret
    if (!clientSecret) throw new Error('Failed to create subscription')

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    })

    if (result.paymentIntent?.status === 'succeeded') {
      toast.success(`Subscribed to ${subscribingPlan.value.name}!`)
      closeModal()

      setTimeout(() => {
        fetchPlans()
        fetchSubscriptionLogs()
        subscriptionStore.checkSubscription()
      }, 2000)
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

/* ---------------- CANCEL SUBSCRIPTION ---------------- */
const cancelSubscription = async () => {
  const result = await Swal.fire({
    title: 'Cancel Subscription?',
    text: 'Are you sure you want to cancel your subscription?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel it',
    cancelButtonText: 'No, keep it',
    reverseButtons: true
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
}

/* ---------------- INIT ---------------- */
onMounted(() => {
  fetchPlans()
  fetchSubscriptionLogs()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Subscription Plans</h1>
      <p class="subtitle">Choose a plan and subscribe</p>
    </div>

    <Loading :active.sync="isLoading" :is-full-page="true" />

    <div class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{ inactive: !plan.isActive, featured: plan.duration === 'YEAR' }"
      >
        <div class="plan-header">
          <h3>{{ plan.name }}</h3>
          <span class="badge" v-if="plan.duration === 'YEAR'">Best Value</span>
        </div>

        <div class="description" v-html="plan.description"></div>

        <div class="amount">
          ${{ plan.amount.toFixed(2) }} / {{ plan.duration.toLowerCase() }}
        </div>

        <div class="actions">
          <button
            v-if="!plan.isCurrentPlan && plan.isActive"
            class="subscribe"
            @click="startSubscribe(plan)"
          >
            Subscribe
          </button>

          <button
            v-if="plan.isCurrentPlan"
            class="cancel-sub"
            @click="cancelSubscription"
          >
            Cancel
          </button>

          <button v-if="!plan.isActive" class="status inactive" disabled>
            Inactive
          </button>
        </div>
      </div>
    </div>

    <!-- CARD MODAL -->
    <div v-if="subscribingPlan" class="modal">
      <div class="modal-content">
        <h3>Enter Card Details for {{ subscribingPlan.name }}</h3>
        <div ref="cardElementRef" class="card-element"></div>

        <div class="modal-actions">
          <button class="confirm" @click="confirmSubscription">
            Confirm Payment
          </button>
          <button class="cancel" @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- PAYMENT HISTORY -->
    <div class="payment-history" v-if="paymentHistory.length">

      <h2>Payment History</h2>

      <table class="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Plan</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(payment, index) in paymentHistory" :key="index">
            <td>{{ payment.date }}</td>
            <td>{{ payment.amount }}</td>
            <td>
              <span
                class="status"
                :class="{
                  success: payment.status === 'Paid',
                  failed: payment.status === 'Failed',
                  pending: payment.status === '-' || payment.status === 'Pending'
                }"
              >
                {{ payment.status || 'Pending' }}
              </span>
            </td>
            <td>{{ payment.plan }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px 32px;
  background: var(--color-bg);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  margin: 0 0 6px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.plan-card {
  background: var(--color-card);
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform var(--transition-slow), box-shadow var(--transition-slow);
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.plan-card.inactive {
  opacity: 0.6;
}

.plan-card.featured {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.12);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.plan-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.badge {
  background: var(--color-primary);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.description :deep(*) {
  color: inherit !important;
}

.amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

button {
  border-radius: var(--radius-md);
  padding: 10px 18px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background var(--transition-base), transform var(--transition-fast);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.subscribe {
  background: var(--color-primary);
  color: white;
}

.subscribe:hover {
  background: var(--color-primary-hover);
}

.cancel-sub {
  background: var(--color-warning);
  color: white;
}

.cancel-sub:hover {
  background: var(--color-warning-hover);
}

.status.inactive {
  background: var(--color-slate-200);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-card);
  padding: 32px;
  border-radius: var(--radius-lg);
  width: 440px;
  max-width: 95vw;
  box-shadow: var(--box-shadow-hover);
  border: 1px solid var(--color-border);
}

.modal-content h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.card-element {
  border: 1px solid var(--color-border);
  padding: 16px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  background: var(--color-slate-50);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.confirm {
  background: var(--color-primary);
  color: white;
  flex: 1;
}

.confirm:hover {
  background: var(--color-primary-hover);
}

.cancel {
  background: var(--color-slate-200);
  color: var(--color-text-secondary);
}

.cancel:hover {
  background: var(--color-slate-400);
  color: var(--color-slate-50);
}

.payment-history {
  margin-top: 40px;
  background: var(--color-card);
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--box-shadow);
}

.payment-history h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.history-table thead tr {
  background: var(--color-slate-800);
}

.history-table th {
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-sidebar-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
}

.history-table td {
  padding: 14px 16px;
  font-size: 14px;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.history-table tbody tr:hover {
  background: var(--color-slate-50);
}

.history-table tbody tr:last-child td {
  border-bottom: none;
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status.success { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
.status.failed { background: rgba(239, 68, 68, 0.15); color: var(--color-error); }
.status.pending { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); }
</style>

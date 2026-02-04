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
.page-container { padding: 30px; background: #f0f2f5; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
.page-header h1 { margin: 0; font-size: 28px; }
.subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }

.plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }

.plan-card {
  background: #0f766e;
  padding: 22px;
  border-radius: 16px;
  box-shadow: 0 8px 22px rgba(0,0,0,0.15);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.plan-card.inactive { opacity: 0.6; }
.plan-card.featured { border: 2px solid rgba(255,255,255,0.4); }

.badge {
  background: rgba(255,255,255,0.25);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.amount { font-size: 20px; font-weight: 700; }

.actions { display: flex; gap: 10px; }

button {
  border-radius: 12px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.subscribe { background: #3b82f6; color: white; }
.cancel-sub { background: #f59e0b; color: white; }

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 480px;
}

.card-element {
  border: 1px solid #e5e7eb;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.payment-history {
  margin-top: 40px;
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  text-align: center;
}

.history-table thead tr {
  background: linear-gradient(135deg, #10b981, #0f766e);
}

.history-table th {
  padding: 14px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.history-table th:last-child {
  border-right: none;
}

.history-table td {
  padding: 14px;
  font-size: 14px;
  color: #374151;
  border-top: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  vertical-align: middle;
}

.history-table td:last-child {
  border-right: none;
}

.history-table tbody tr:hover {
  background: #f9fafb;
}

/* Status pill alignment */
.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.status.success { background: #10b981; }
.status.failed { background: #ef4444; }
.status.pending { background: #f59e0b; }

.payment-history h2 {
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}



</style>

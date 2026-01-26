<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '../api'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import Swal from "sweetalert2"
import Loading from "vue-loading-overlay"
import 'vue-loading-overlay/dist/css/index.css'
import { useSubscriptionStore } from '../Shared/subscription'

const subscriptionStore = useSubscriptionStore()

const toast = useToast()


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

const plans = ref<Plan[]>([])
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
    isLoading.value = true // start loader

    const res = await api.get(
      `/payments/stripe-user-subscription?plan=${subscribingPlan.value.id}`
    )
    const clientSecret = res.data.data.clientSecret

    if (!clientSecret) throw new Error('Failed to create subscription')

    const result = await stripe.confirmCardPayment(clientSecret, {payment_method: { card },})

if (result.paymentIntent) {
  if (result.paymentIntent.status === 'succeeded') {
    toast.success(`Subscribed to ${subscribingPlan.value.name}!`)
    closeModal()
    setTimeout(() => {
      fetchPlans();
      subscriptionStore.checkSubscription();
    }, 2000); // 2000ms = 2 seconds delay
  } else if (result.paymentIntent.status === 'requires_payment_method') {
    toast.error('Payment failed, please try another method')
  } else {
    console.log('PaymentIntent status:', result.paymentIntent.status)
  }
} else if (result.error) {
  toast.error(result.error.message || 'Payment failed')
}

////////
  } catch (err: any) {
    console.error(err)
    toast.error(err.response?.data?.error?.description || err.message || 'Subscription failed')
  }finally {
    isLoading.value = false // stop loader
  }
}

/* ---------------- CANCEL SUBSCRIPTION ---------------- */
const cancelSubscription = async () => {
  // Show confirmation popup
  const result = await Swal.fire({
    title: 'Cancel Subscription?',
    text: 'Are you sure you want to cancel your subscription? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, cancel it',
    cancelButtonText: 'No, keep it',
    reverseButtons: true
  });

  // If user confirmed
  if (result.isConfirmed) {
    try {
      await api.get('/payments/cancel-subscription');
      toast.success('Subscription canceled.');
      fetchPlans();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.description || 'Failed to cancel subscription.');
    }
  }
};


/* ---------------- CLOSE MODAL ---------------- */
const closeModal = () => {
  if (card) {
    card.unmount()
    card = null
  }
  subscribingPlan.value = null
}

onMounted(fetchPlans)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Subscription Plans</h1>
      <p class="subtitle">Choose a plan and subscribe</p>
    </div>
    <Loading :active.sync="isLoading" :is-full-page="true" />

    <div v-if="isLoading" class="loading">Loading plans...</div>

    <div v-else class="plans-grid">
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
        <p class="description">{{ plan.description }}</p>
        <div class="amount">
          ${{ plan.amount.toFixed(2) }} / {{ plan.duration.toLowerCase() }}
        </div>

        <div class="actions">
          <!-- SUBSCRIBE BUTTON -->
          <button
            v-if="!plan.isCurrentPlan && plan.isActive"
            class="subscribe"
            @click="startSubscribe(plan)"
          >
            Subscribe
          </button>

          <!-- INACTIVE BUTTON -->
          <button
            v-else-if="!plan.isActive"
            class="status inactive"
            disabled
          >
            Inactive
          </button>

          <!-- CANCEL BUTTON ONLY FOR CURRENT PLAN -->
          <button
            v-if="plan.isCurrentPlan"
            class="cancel-sub current-plan"
            @click="cancelSubscription"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Card Input Modal -->
    <div v-if="subscribingPlan" class="modal">
      <div class="modal-content">
        <h3>Enter Card Details for {{ subscribingPlan.name }}</h3>
        <div ref="cardElementRef" class="card-element"></div>
        <div class="modal-actions">
          <button class="confirm" @click="confirmSubscription">Confirm Payment</button>
          <button class="cancel" @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.page-container { padding: 30px; background: #f0f2f5; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
.page-header h1 { margin: 0; font-size: 28px; }
.subtitle { font-size: 14px; color: #6b7280; margin-top: 4px; }

/* Grid */
.plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }

/* Plan Card */
.plan-card {
  background: #fff; padding: 25px; border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08); border: 2px solid transparent; transition: all 0.3s;
  display: flex; flex-direction: column; justify-content: space-between;
}
.plan-card.featured { border-color: #3b82f6; box-shadow: 0 8px 25px rgba(59,130,246,0.2); }
.plan-card.inactive { opacity: 0.6; border-color: #e5e7eb; }

.plan-header { display: flex; justify-content: space-between; align-items: center; }
.badge { background: #3b82f6; color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 8px; font-weight: 600; }

.description { font-size: 14px; color: #4b5563; margin: 12px 0; flex-grow: 1; }
.amount { font-size: 18px; font-weight: 700; margin-bottom: 15px; }

/* Buttons */
.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start; 
}
button.subscribe, .modal-actions .confirm {
  background: #3b82f6; 
  color: #fff; 
  border: none; 
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer; 
  font-weight: 600; 
  font-size: 14px;
  transition: all 0.2s;
}
button.subscribe:hover, .modal-actions .confirm:hover { background: #2563eb; }

button.cancel-sub {
  background: #fbbf24; /* Highlighted color */
  color: #1f2937; 
  border: none; 
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer; 
  font-weight: 600; 
  font-size: 14px;
  transition: all 0.2s;
}

button.subscribe, .modal-actions .cancel {
  background: #f59e0b; 
  color: #fff; 
  border: none; 
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer; 
  font-weight: 600; 
  font-size: 14px;
  transition: all 0.2s;
}

button.cancel-sub:hover { background: #f59e0b; }

.status.inactive {
  background: #fef2f2; 
  color: #b91c1c; 
  padding: 6px 10px;
  border-radius: 10px; 
  font-weight: 600; 
  font-size: 13px;
}

/* Loading */
.loading { font-weight: 600; color: #374151; padding: 20px; }

/* Modal */
.modal { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:100; }
.modal-content {
  background: #fff; 
  padding: 30px; 
  border-radius: 20px; 
  width: 500px; 
  max-width: 95%; 
  height: 190px; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between;
  box-shadow: 0 10px 35px rgba(0,0,0,0.25); 
}
.card-element { 
  padding: 16px; 
  border: 1px solid #e5e7eb; 
  border-radius: 12px; 
  margin-bottom: 20px; 
  flex-grow: 1; 
}
.modal-actions { 
  display: flex; 
  justify-content: flex-end; 
  gap: 12px; 
}
</style>

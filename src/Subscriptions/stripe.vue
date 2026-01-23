<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useToast } from 'vue-toastification'
  import { loadStripe } from '@stripe/stripe-js'              // runtime value
  import type { Stripe, StripeCardElement } from '@stripe/stripe-js'  // types only
  import api from '../api'
  import { useSubscriptionStore } from '../Shared/subscription'

  const subscriptionStore = useSubscriptionStore()

  // Toasts
  const toast = useToast()
  const loading = ref(false)
  const selectedPlanId = ref<number | null>(null)
  const clientSecret = ref<string>('')
  
  // Dynamic plans
  interface Plan {
    id: number
    name: string
    amount: number
    currency: string
    description: string
  }
  const plans = ref<Plan[]>([])
  const isLoadingPlans = ref(true)
  
  // Stripe refs
  const stripe = ref<Stripe | null>(null)
  const card = ref<StripeCardElement | null>(null)
  const cardElementRef = ref<HTMLDivElement | null>(null)
  
  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      isLoadingPlans.value = true
      const res = await api.get('/payments/stripe-subscription-plans') // your API endpoint
      plans.value = res.data.data || []
  
      if (plans.value.length > 0) {
        selectedPlanId.value = plans.value[0]?.id ?? null
      }
    } catch (err: any) {
      toast.error('Failed to load subscription plans')
      console.error(err)
    } finally {
      isLoadingPlans.value = false
    }
  }
  
  // Initialize Stripe Elements
  onMounted(async () => {
    await fetchPlans()
    const publicKyey=import.meta.env.VITE_STRIPE_PUBLIC
    stripe.value = await loadStripe(publicKyey) // replace with your public key
    if (stripe.value && cardElementRef.value) {
      const elements = stripe.value.elements()
      card.value = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: 'Arial, sans-serif',
            '::placeholder': { color: '#a0aec0' },
            padding: '12px'
          },
          invalid: { color: '#fa755a', iconColor: '#fa755a' }
        }
      })
      card.value.mount(cardElementRef.value)
    }

    subscriptionStore.checkSubscription()
  })
  
  // Payment function
  const pay = async () => {
    if (!stripe.value || !card.value || selectedPlanId.value === null) return
    loading.value = true
  
    try {
      const res = await api.get(`/payments/stripe-intent?plan=${selectedPlanId.value}`)
      clientSecret.value = res.data.clientSecret

    if (!res.data.isSuccess || !res.data.data) {
      const backendMessage = res.data.error?.description || res.data.message || 'Payment failed';
      toast.error(backendMessage);
      return; // stop further processing
          }

    // Extract the client secret from data
    clientSecret.value = res.data.data

    const result = await stripe.value.confirmCardPayment(clientSecret.value, {
      payment_method: { card: card.value }
    })
      if (result.error) {
        toast.error(result.error.message || 'Payment failed')
      } else if (result.paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful! Subscription activated.')
        subscriptionStore.isValid = true   // mark subscription as active
        subscriptionStore.isChecking = false // mark checking complete
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.description || 'Payment processing error')
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <template>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Subscriptions</h1>
          <p class="subtitle">Select a plan and pay securely</p>
        </div>
        <span class="menu-icon">💳</span>
      </div>
  
      <!-- Loading / Plans -->
      <div v-if="isLoadingPlans" class="text-center py-6 text-gray-500">
        Loading plans...
      </div>
  
      <div v-else class="plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.id"
          :class="['plan-card', selectedPlanId === plan.id ? 'selected' : '']"
          @click="selectedPlanId = plan.id"
        >
          <h2 class="plan-name">{{ plan.name }}</h2>
          <p class="plan-description">{{ plan.description }}</p>
          <p class="plan-price">${{ plan.amount }}</p>
        </div>
      </div>
  
      <!-- Stripe Card Input -->
      <div class="card-input-container mt-6">
        <label>Card Details</label>
        <div ref="cardElementRef" class="card-element"></div>
      </div>
  
      <!-- Pay Button -->
      <button class="btn-primary w-full mt-4" :disabled="loading || !selectedPlanId" @click="pay">
        {{ loading ? 'Processing...' : 'Pay Now' }}
      </button>
    </div>
  </template>
  
  <style scoped>
  /* Container & Header */
  .page-container { flex: 1; padding: 30px; min-height: 100vh; background: #f9f9f9; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; gap: 10px; }
  .page-header h1 { font-size: 32px; font-weight: 700; margin: 0 0 5px 0; color: #333; }
  .subtitle { font-size: 14px; color: #999; margin: 0; }
  .menu-icon { font-size: 28px; color: #22c55e; }
  
  /* Buttons */
  .btn-primary { background: #22c55e; color: #fff; border-radius: 8px; font-weight: 600; padding: 12px; cursor: pointer; transition: all 0.3s; }
  .btn-primary:hover { background: #16a34a; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  
  /* Plan Cards */
  .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 20px; }
  .plan-card { background: #fff; border-radius: 12px; border: 2px solid transparent; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .plan-card.selected { border-color: #22c55e; box-shadow: 0 4px 12px rgba(34,197,94,0.2); }
  .plan-name { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .plan-description { font-size: 13px; color: #666; margin-bottom: 12px; }
  .plan-price { font-size: 20px; font-weight: 700; color: #22c55e; }
  
  /* Stripe Card Input */
  .card-input-container { margin-bottom: 20px; }
  .card-input-container label { display: block; font-weight: 600; margin-bottom: 8px; }
  .card-element { background: #f9f9f9; padding: 12px; border-radius: 8px; border: 1px solid #e8e8e8; }
  
  /* Responsive */
  @media (max-width: 768px) {
    .page-header { flex-direction: column; align-items: flex-start; }
    .plans-grid { grid-template-columns: 1fr; }
  }
  </style>
  
<template>
  <div class="verify-container">
    <div class="panel">
      <div class="grid-bg" aria-hidden="true"></div>
      <div class="glow" aria-hidden="true"></div>

      <div class="content-wrapper">
        <div class="verify-card">
          <div class="icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h1 class="title">Check your email</h1>
          <p class="subtitle">
            We've sent a verification link to<br>
            <strong class="email">{{ email }}</strong>
          </p>

          <!-- Plan info -->
          <div v-if="selectedPlan && selectedPlan !== 'trial'" class="plan-box">
            <div class="plan-label">Your selected plan</div>
            <div class="plan-value">{{ planConfig[selectedPlan]?.name || selectedPlan }}</div>
            <div class="plan-price">{{ planConfig[selectedPlan]?.price }}</div>
            <p class="plan-note">Complete payment after verifying your email</p>
          </div>

          <div class="steps" v-if="selectedPlan !== 'trial'">
            <div class="step" :class="{ active: !verified, complete: verified }">
              <div class="step-number">1</div>
              <div class="step-text">
                <div class="step-title">Verify your email</div>
                <div class="step-desc">Click the link in your inbox</div>
              </div>
            </div>
            <div class="step-connector"></div>
            <div class="step" :class="{ active: verified, pending: !verified }">
              <div class="step-number">2</div>
              <div class="step-text">
                <div class="step-title">Complete payment</div>
                <div class="step-desc">Secure checkout with Stripe</div>
              </div>
            </div>
          </div>

          <div class="trial-message" v-else>
            <div class="trial-icon">🎉</div>
            <p class="trial-text">Once verified, you'll get <strong>100 free indexing requests</strong> to try out GoogleIndexing.</p>
          </div>

          <div class="actions">
            <button 
              class="btn-primary" 
              @click="checkVerification"
              :disabled="checking"
            >
              <span v-if="checking" class="spinner"></span>
              <span v-else-if="selectedPlan && selectedPlan !== 'trial'">Continue to login & payment →</span>
            <span v-else>Continue to login →</span>
            </button>

            <button 
              class="btn-resend" 
              @click="resendEmail"
              :disabled="resendTimer > 0"
            >
              <span v-if="resendTimer > 0">Resend in {{ resendTimer }}s</span>
              <span v-else>Resend verification email</span>
            </button>
          </div>

          <p class="help">
            Wrong email? 
            <router-link :to="signupLink" class="link">Go back and sign up again</router-link>
          </p>

          <p v-if="errorMessage" class="error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "../api";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const email = computed(() => route.query.email as string || '');
const selectedPlan = computed(() => {
  // Get plan from query or localStorage
  const planFromQuery = route.query.plan as string | undefined
  if (planFromQuery) {
    localStorage.setItem('selectedPlan', planFromQuery)
    return planFromQuery
  }
  return localStorage.getItem('selectedPlan') || undefined
});

const planConfig: Record<string, { name: string; price: string }> = {
  solo: { name: 'Solo Plan', price: '$17/month' },
  pro: { name: 'Pro Plan', price: '$47/month' },
  team: { name: 'Team Plan', price: '$88/month' }
};

const signupLink = computed(() => {
  return selectedPlan.value ? `/signup?plan=${selectedPlan.value}` : '/signup';
});

const checking = ref(false);
const verified = ref(false);
const errorMessage = ref('');
const resendTimer = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const startResendTimer = () => {
  resendTimer.value = 60;
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--;
    } else if (timerInterval) {
      clearInterval(timerInterval);
    }
  }, 1000);
};

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

onMounted(() => {
  startResendTimer();
  // Check if already verified (user might have clicked the email link)
  checkVerificationStatus();
});

const checkVerificationStatus = async () => {
  try {
    const response = await api.get('/auth/check-verification', {
      params: { email: email.value }
    });
    if (response.data?.isVerified) {
      verified.value = true;
    }
  } catch {
    // Silent fail - user can click button to check
  }
};

const checkVerification = async () => {
  checking.value = true;
  errorMessage.value = '';

  try {
    const response = await api.get('/auth/check-verification', {
      params: { email: email.value }
    });

    if (response.data?.isVerified) {
      verified.value = true;

      // Always go through login first — user is not yet authenticated
      if (selectedPlan.value === 'trial') {
        toast.success('Email verified! Please log in to access your dashboard.');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        toast.success('Email verified! Please log in to complete your subscription.');
        setTimeout(() => router.push(`/login?plan=${selectedPlan.value}`), 1500);
      }
    } else {
      errorMessage.value = "Your email hasn't been verified yet. Please check your inbox and click the verification link.";
    }
  } catch (err: any) {
    // If API doesn't exist, redirect to login with plan preserved
    // User will complete login and then be redirected to subscription
    toast.info('Please log in to continue. You\'ll be taken to payment after login.');
    const loginPath = selectedPlan.value 
      ? `/login?plan=${selectedPlan.value}` 
      : '/login';
    router.push(loginPath);
  } finally {
    checking.value = false;
  }
};

const resendEmail = async () => {
  try {
    await api.post('/auth/resend-verification', { email: email.value });
    toast.success('Verification email resent! Check your inbox.');
    startResendTimer();
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to resend email. Please try again.');
  }
};
</script>

<style scoped>
.verify-container {
  min-height: 100vh;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  background-color: #fdfdfb;
  color: #0a0a0c;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  position: relative;
}

.panel {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-bg {
  position: fixed;
  top: -10%;
  left: -10%;
  width: 120vw;
  height: 120vh;
  z-index: 0;
  background:
    radial-gradient(circle at 30% 40%, rgba(66, 133, 244, 0.14) 0%, transparent 45%),
    radial-gradient(at 80% 20%, rgba(52, 168, 83, 0.10) 0px, transparent 50%),
    radial-gradient(at 20% 80%, rgba(251, 188, 5, 0.08) 0px, transparent 50%),
    radial-gradient(at 70% 80%, rgba(234, 67, 53, 0.08) 0px, transparent 50%),
    radial-gradient(at 50% 10%, rgba(66, 133, 244, 0.08) 0px, transparent 50%);
  filter: blur(72px);
  pointer-events: none;
}

.glow {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.verify-card {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  padding: 3rem 2.5rem;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 20px 50px -12px rgba(50, 50, 93, 0.10),
    0 12px 24px -18px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.icon-circle {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, rgba(66, 133, 244, 0.12), rgba(52, 168, 83, 0.08));
  border: 1px solid rgba(66, 133, 244, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle svg {
  width: 32px;
  height: 32px;
  color: #4285f4;
}

.title {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0 0 0.5rem;
  color: #0a0a0c;
}

.subtitle {
  font-size: 1rem;
  color: #5f6368;
  line-height: 1.5;
  margin: 0 0 1.5rem;
}

.email {
  color: #0a0a0c;
  word-break: break-all;
}

.plan-box {
  background: linear-gradient(135deg, rgba(66, 133, 244, 0.08), rgba(52, 168, 83, 0.06));
  border: 1px solid rgba(66, 133, 244, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.plan-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #5f6368;
  margin-bottom: 0.25rem;
}

.plan-value {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0a0a0c;
  margin-bottom: 0.25rem;
}

.plan-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4285f4;
}

.plan-note {
  font-size: 0.8rem;
  color: #5f6368;
  margin-top: 0.75rem;
  margin-bottom: 0;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step.active .step-number {
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
}

.step.complete .step-number {
  background: #34a853;
  color: white;
}

.step.pending .step-number {
  background: rgba(0, 0, 0, 0.08);
  color: #9aa0a6;
}

.step-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0a0a0c;
}

.step-desc {
  font-size: 0.75rem;
  color: #5f6368;
}

.step-connector {
  width: 30px;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 1px;
}

.trial-message {
  background: linear-gradient(135deg, rgba(52, 168, 83, 0.08), rgba(66, 133, 244, 0.06));
  border: 1px solid rgba(52, 168, 83, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.trial-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.trial-text {
  font-size: 0.9rem;
  color: #3c4043;
  line-height: 1.5;
  margin: 0;
}

.trial-text strong {
  color: #0a0a0c;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #0a0a0c;
  color: #ffffff;
  border: none;
  border-radius: 100px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 150ms ease, transform 80ms ease, box-shadow 150ms ease;
}

.btn-primary:hover:not(:disabled) {
  background: #2a2a2a;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-resend {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #0a0a0c;
  cursor: pointer;
  font-family: inherit;
  transition: all 150ms ease;
}

.btn-resend:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.2);
}

.btn-resend:disabled {
  color: #9aa0a6;
  cursor: not-allowed;
}

.help {
  font-size: 0.85rem;
  color: #5f6368;
  margin: 0;
}

.link {
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 1rem;
  padding: 10px 12px;
  background: rgba(234, 67, 53, 0.06);
  border: 1px solid rgba(234, 67, 53, 0.2);
  border-radius: 10px;
  color: #c5221f;
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.45;
  text-align: left;
}

.error svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .verify-card {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

  .title {
    font-size: 1.5rem;
  }

  .steps {
    flex-direction: column;
    gap: 1rem;
  }

  .step-connector {
    width: 2px;
    height: 20px;
  }
}
</style>

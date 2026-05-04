<template>
  <div class="auth-container">
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="glow" aria-hidden="true"></div>

    <div class="auth-card">
      <span class="auth-card__accent" aria-hidden="true"></span>

      <!-- Loading state -->
      <template v-if="status === 'loading'">
        <div class="state-icon state-icon--loading" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
        <h2 class="title">Verifying your email...</h2>
        <p class="subtitle">Please wait while we confirm your email address.</p>
      </template>

      <!-- Success state -->
      <template v-else-if="status === 'success'">
        <div class="state-icon state-icon--success" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 12 9 17 20 6"/>
          </svg>
        </div>
        <h2 class="title">Email confirmed!</h2>
        <p class="subtitle">Your account has been successfully verified. You can now sign in.</p>
        <button class="btn-primary" @click="goToLogin">
          Continue to login
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="btn-arrow">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </template>

      <!-- Error state -->
      <template v-else>
        <div class="state-icon state-icon--error" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
          </svg>
        </div>
        <h2 class="title">{{ title }}</h2>
        <p class="subtitle">{{ message }}</p>
        <div class="alert alert--error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>The link may be expired or invalid. Try requesting a new verification email.</span>
        </div>
        <button class="btn-primary" @click="goToLogin">
          Back to login
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { confirmEmail } from '../Store/auth'

const route = useRoute()
const router = useRouter()

const status = ref<'loading' | 'success' | 'error'>('loading')
const title = ref('Verification Failed')
const message = ref('This link may be expired or invalid.')
const selectedPlan = ref(route.query.plan as string | undefined)

const goToLogin = () => {
  // Get plan from localStorage (set during signup) or query param
  const plan = selectedPlan.value || localStorage.getItem('selectedPlan')
  if (plan) {
    router.push(`/login?plan=${plan}`)
  } else {
    router.push('/login')
  }
}

onMounted(async () => {
  const userId = route.query.userId
  const token = route.query.token

  if (!userId || !token) {
    status.value = 'error'
    title.value = 'Invalid Link'
    message.value = 'The confirmation link is missing required information.'
    return
  }

  const success = await confirmEmail(userId as string, token as string)

  if (success) {
    status.value = 'success'
  } else {
    status.value = 'error'
    title.value = 'Verification Failed'
    message.value = 'We could not verify your email address.'
  }
})
</script>

<style scoped>
/* ===== Base ===== */
.auth-container {
  min-height: 100vh;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  background-color: #fdfdfb;
  color: #0a0a0c;
  -webkit-font-smoothing: antialiased;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

/* ===== Background ===== */
.grid-bg {
  position: fixed;
  top: -10%; left: -10%;
  width: 120vw; height: 120vh;
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

/* ===== Card ===== */
.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  padding: 2.5rem 2rem 2.25rem;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 20px 50px -12px rgba(50, 50, 93, 0.10),
    0 12px 24px -18px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  text-align: center;
}

.auth-card__accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335);
  opacity: 0.7;
}

/* ===== State icons ===== */
.state-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}
.state-icon svg { width: 28px; height: 28px; }

.state-icon--loading {
  background: rgba(66, 133, 244, 0.08);
  border: 1px solid rgba(66, 133, 244, 0.15);
  color: #4285F4;
}
.state-icon--loading svg {
  animation: spin 1s linear infinite;
  transform-origin: center;
}

.state-icon--success {
  background: rgba(52, 168, 83, 0.09);
  border: 1px solid rgba(52, 168, 83, 0.2);
  color: #1a7f40;
}

.state-icon--error {
  background: rgba(234, 67, 53, 0.07);
  border: 1px solid rgba(234, 67, 53, 0.18);
  color: #c5221f;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Typography ===== */
.title {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #0a0a0c;
  margin: 0 0 6px;
}

.subtitle {
  font-size: 0.88rem;
  color: #5f6368;
  margin: 0 0 1.75rem;
  line-height: 1.6;
}

/* ===== Button ===== */
.btn-primary {
  width: 100%;
  padding: 11px 16px;
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
.btn-primary:hover {
  background: #2a2a2a;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); }

.btn-arrow {
  width: 14px;
  height: 14px;
  opacity: 0.85;
  transition: transform 160ms ease;
}
.btn-primary:hover .btn-arrow { transform: translateX(2px); }

/* ===== Alert ===== */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 1.25rem;
  padding: 11px 13px;
  border-radius: 12px;
  font-size: 0.83rem;
  font-weight: 500;
  line-height: 1.5;
  text-align: left;
}
.alert svg { width: 15px; height: 15px; flex-shrink: 0; margin-top: 1px; }

.alert--error {
  background: rgba(234, 67, 53, 0.06);
  border: 1px solid rgba(234, 67, 53, 0.2);
  color: #c5221f;
}

/* ===== Responsive ===== */
@media (max-width: 480px) {
  .auth-card { border-radius: 20px; padding: 2rem 1.5rem; }
}
</style>

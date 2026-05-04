<template>
  <div class="auth-container">
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="glow" aria-hidden="true"></div>

    <div class="auth-card">
      <span class="auth-card__accent" aria-hidden="true"></span>

      <router-link to="/login" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to login
      </router-link>

      <div class="auth-card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>

      <header class="auth-card__head">
        <h2 class="title">Set new password</h2>
        <p class="subtitle">Choose a strong password for your account.</p>
      </header>

      <template v-if="!successMessage">
        <div class="form-group">
          <label for="rp-new">New password</label>
          <div class="password-wrapper">
            <input
              id="rp-new"
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              placeholder="Enter new password"
              autocomplete="new-password"
              :disabled="loading"
            />
            <button type="button" class="toggle" :aria-label="showNew ? 'Hide password' : 'Show password'" @click="showNew = !showNew">
              {{ showNew ? 'HIDE' : 'SHOW' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="rp-confirm">Confirm password</label>
          <div class="password-wrapper">
            <input
              id="rp-confirm"
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Confirm new password"
              autocomplete="new-password"
              :disabled="loading"
              @keyup.enter="handleReset"
            />
            <button type="button" class="toggle" :aria-label="showConfirm ? 'Hide password' : 'Show password'" @click="showConfirm = !showConfirm">
              {{ showConfirm ? 'HIDE' : 'SHOW' }}
            </button>
          </div>
        </div>

        <button class="btn-primary" :disabled="loading" @click="handleReset">
          <span v-if="loading" class="spinner" aria-hidden="true"></span>
          <span>{{ loading ? 'Resetting...' : 'Reset password' }}</span>
        </button>

        <div v-if="errorMessage" class="alert alert--error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </template>

      <div v-else class="alert alert--success" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><polyline points="7 12 10.5 15.5 17 8.5"/>
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '../api'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const email = route.query.email as string
const token = route.query.token as string

const newPassword = ref('')
const confirmPassword = ref('')
const showNew = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleReset = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in both password fields.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  try {
    loading.value = true
    await api.post('/reset-password', {
      email,
      token,
      newPassword: newPassword.value
    })
    successMessage.value = 'Password reset successful! Redirecting to login...'
    setTimeout(() => router.push('/login'), 1800)
  } catch (err: any) {
    errorMessage.value =
      err?.response?.data?.error?.description ||
      err?.response?.data?.message ||
      'Reset failed. The link may have expired.'
  } finally {
    loading.value = false
  }
}
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
  padding: 2.5rem 2rem 2rem;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 20px 50px -12px rgba(50, 50, 93, 0.10),
    0 12px 24px -18px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.auth-card__accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335);
  opacity: 0.7;
}

/* ===== Back link ===== */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 500;
  color: #5f6368;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease;
}
.back-link svg { width: 14px; height: 14px; }
.back-link:hover { color: #0a0a0c; }

/* ===== Icon ===== */
.auth-card__icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(66, 133, 244, 0.08);
  border: 1px solid rgba(66, 133, 244, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  color: #4285F4;
}
.auth-card__icon svg { width: 22px; height: 22px; }

/* ===== Header ===== */
.auth-card__head { margin-bottom: 1.75rem; }

.title {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #0a0a0c;
  margin: 0 0 4px;
}

.subtitle {
  font-size: 0.85rem;
  color: #5f6368;
  margin: 0;
  line-height: 1.55;
}

/* ===== Form ===== */
.form-group { margin-bottom: 1rem; }

.form-group label {
  font-size: 0.82rem;
  font-weight: 500;
  color: #0a0a0c;
  display: block;
  margin-bottom: 6px;
}

.password-wrapper { position: relative; }
.password-wrapper input { padding-right: 64px; }

.form-group input {
  width: 100%;
  padding: 10px 13px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 12px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.7);
  color: #0a0a0c;
  font-family: inherit;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  box-sizing: border-box;
}
.form-group input::placeholder { color: #9aa0a6; }
.form-group input:focus {
  outline: none;
  border-color: #4285F4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.15);
  background: rgba(255, 255, 255, 0.9);
}
.form-group input:disabled { opacity: 0.6; cursor: not-allowed; }

.toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.07em;
  color: #5f6368;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 6px;
  font-family: inherit;
  transition: color 140ms ease, background 140ms ease;
}
.toggle:hover { color: #0a0a0c; background: rgba(0, 0, 0, 0.05); }

/* ===== Button ===== */
.btn-primary {
  width: 100%;
  padding: 11px;
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
  margin-top: 0.5rem;
}
.btn-primary:hover:not(:disabled) {
  background: #2a2a2a;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

/* ===== Spinner ===== */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Alerts ===== */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 1rem;
  padding: 11px 13px;
  border-radius: 12px;
  font-size: 0.83rem;
  font-weight: 500;
  line-height: 1.5;
}
.alert svg { width: 15px; height: 15px; flex-shrink: 0; margin-top: 1px; }

.alert--error {
  background: rgba(234, 67, 53, 0.06);
  border: 1px solid rgba(234, 67, 53, 0.2);
  color: #c5221f;
}

.alert--success {
  background: rgba(52, 168, 83, 0.07);
  border: 1px solid rgba(52, 168, 83, 0.2);
  color: #1a7f40;
}

/* ===== Responsive ===== */
@media (max-width: 480px) {
  .auth-card { border-radius: 20px; padding: 2rem 1.5rem; }
}
</style>

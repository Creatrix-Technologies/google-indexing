<template>
  <div class="signup-container">
    <div class="grid-bg" aria-hidden="true"></div>

    <main class="signup-card">
      <span class="signup-card__accent" aria-hidden="true"></span>

      <header class="signup-card__head">
        <h1 class="title">{{ headline }}</h1>
        <p class="subtitle">{{ benefitLine }}</p>
      </header>

      <button type="button" class="btn-google" :disabled="loading" @click="handleGoogleSignup">
        <svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
        <span>Continue with Google</span>
      </button>

      <div class="divider" role="separator"><span>or use email</span></div>

      <form novalidate @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="signup-email">Email</label>
          <input
            id="signup-email"
            v-model="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            autocapitalize="none"
            spellcheck="false"
            placeholder="you@example.com"
            :disabled="loading"
            :class="{ 'has-error': emailError }"
            :aria-invalid="emailError ? 'true' : 'false'"
            aria-describedby="signup-email-msg"
            @blur="touch('email')"
            @input="onInput('email')"
          />
          <small id="signup-email-msg" class="field-msg" :class="{ 'field-error': emailError }">{{ emailError }}</small>
        </div>

        <div class="form-group">
          <label for="signup-password">Password</label>
          <div class="password-wrapper">
            <input
              id="signup-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Create a password"
              :disabled="loading"
              :class="{ 'has-error': passwordError }"
              :aria-invalid="passwordError ? 'true' : 'false'"
              aria-describedby="signup-password-msg"
              @blur="touch('password')"
              @input="onInput('password')"
            />
            <button
              type="button"
              class="toggle"
              :aria-pressed="showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <small id="signup-password-msg" class="field-msg" :class="{ 'field-error': passwordError }">
            {{ passwordError || PASSWORD_HINT }}
          </small>
        </div>

        <p v-if="isPaidPlan" class="verification-notice">
          You'll receive an email to verify your address before completing payment.
        </p>

        <button class="btn-primary" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner" aria-hidden="true"></span>
          <span>{{ loading ? 'Creating account…' : submitLabel }}</span>
        </button>

        <div class="form-error" role="alert" aria-live="assertive">{{ errorMessage }}</div>
      </form>

      <p class="terms">
        By continuing, you agree to our
        <router-link to="/terms">Terms of Service</router-link> and
        <router-link to="/privacy">Privacy Policy</router-link>.
      </p>

      <p class="login-text">
        Already have an account?
        <router-link :to="selectedPlan ? `/login?plan=${selectedPlan}` : '/login'" class="login-link">Sign in</router-link>
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { register as apiRegister, redirectToGoogleLogin } from "../Store/auth";
import { trackGoogleAdsSignupConversion } from "../utils/googleAdsConversion";
import { refreshApi } from "../api";
import { FREE_PLAN, fetchPublicSubscriptionPlans, planSlug, type PublicPlan } from "../Shared/publicPlans";

const router = useRouter();
const route = useRoute();

// Plan display config (name only; no feature lists on this screen)
const planConfig: Record<string, { name: string }> = {
  solo: { name: 'Solo plan' },
  pro: { name: 'Pro plan' },
  team: { name: 'Team plan' },
  enterprise: { name: 'Enterprise plan' }
};

const PASSWORD_HINT = "8+ characters with upper, lower, number and a symbol.";

// Live plan name for the selected ?plan=, so it matches the pricing page.
const publicPlans = ref<PublicPlan[]>([]);
const matchedPlan = computed(() => publicPlans.value.find((p) => planSlug(p.name) === selectedPlan.value) ?? null);

// State
const loading = ref(false);
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");

// Inline errors appear after a field is left (or submit), then update as the user types.
const touched = ref({ email: false, password: false });
const emailError = ref("");
const passwordError = ref("");

// Get plan from query
const selectedPlan = computed(() => route.query.plan as string | undefined);
const hasSelectedPlan = computed(() => !!selectedPlan.value && !!planConfig[selectedPlan.value]);
const isPaidPlan = computed(() => hasSelectedPlan.value && selectedPlan.value !== 'trial');
const selectedPlanName = computed(() => {
  if (matchedPlan.value) return `${matchedPlan.value.name} plan`;
  const plan = selectedPlan.value;
  return plan && planConfig[plan] ? planConfig[plan].name : '';
});

const headline = computed(() => (hasSelectedPlan.value ? `Create your account for the ${selectedPlanName.value}` : 'Create your free account'));
const benefitLine = computed(() =>
  hasSelectedPlan.value
    ? 'Verify your email, then pay securely.'
    : `${FREE_PLAN.trialDays}-day trial with ${FREE_PLAN.trialUrls} URL submissions, then ${FREE_PLAN.monthlyUrls} a month. No card needed.`
);
const submitLabel = computed(() => (isPaidPlan.value ? 'Create account & verify email' : 'Create free account'));

// Store plan in localStorage
onMounted(() => {
  fetchPublicSubscriptionPlans(refreshApi).then((p) => { publicPlans.value = p; }).catch(() => {});
  if (selectedPlan.value) {
    localStorage.setItem('selectedPlan', selectedPlan.value);
  }
});

// Validations
const validateEmail = () => {
  if (!email.value.trim()) emailError.value = "Enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
    emailError.value = "That doesn't look like an email address.";
  else emailError.value = "";
};

const validatePassword = () => {
  const v = password.value;
  if (!v) passwordError.value = "Enter a password.";
  else if (v.length < 8 || !/[a-z]/.test(v) || !/[A-Z]/.test(v) || !/[0-9]/.test(v) || !/[^a-zA-Z0-9]/.test(v)) {
    passwordError.value = "Needs 8+ characters with upper, lower, number and a symbol.";
  } else passwordError.value = "";
};

const touch = (field: 'email' | 'password') => {
  touched.value[field] = true;
  if (field === 'email') validateEmail(); else validatePassword();
};
const onInput = (field: 'email' | 'password') => {
  errorMessage.value = "";
  if (touched.value[field]) touch(field);
};

// The API still requires a username. Derive one from the email so the form needs no extra field:
// local part limited to the characters the old form allowed, min 3 chars, plus a short suffix for uniqueness.
const deriveUserName = (addr: string) => {
  let base = (addr.split('@')[0] ?? '').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 24);
  if (base.length < 3) base = (base + 'user').slice(0, 8);
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
};

// Submit
const handleRegister = async () => {
  touched.value = { email: true, password: true };
  validateEmail();
  validatePassword();
  if (emailError.value || passwordError.value || loading.value) {
    document.getElementById(emailError.value ? 'signup-email' : 'signup-password')?.focus();
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const payload = {
      email: email.value.trim(),
      userName: deriveUserName(email.value.trim()),
      password: password.value,
    };

    const success = await apiRegister(payload);

    if (success) {
      trackGoogleAdsSignupConversion();
      const pendingPlan = localStorage.getItem('selectedPlan');
      localStorage.removeItem('selectedPlan');

      // Show verification required page after signup (for all plans)
      router.push(`/verify-required?plan=${pendingPlan || 'trial'}&email=${encodeURIComponent(email.value.trim())}`);
    } else {
      errorMessage.value = "Registration failed. Please try again.";
    }
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
};

const handleGoogleSignup = () => {
  // Store plan for after Google auth
  if (selectedPlan.value) {
    localStorage.setItem('selectedPlan', selectedPlan.value);
  }
  redirectToGoogleLogin();
};
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  background-color: #fdfdfb;
  color: #0a0a0c;
  position: relative;
  overflow-x: hidden;
}

.grid-bg {
  position: fixed;
  inset: -10%;
  z-index: 0;
  background:
    radial-gradient(circle at 30% 40%, rgba(66, 133, 244, 0.14) 0%, transparent 45%),
    radial-gradient(at 80% 20%, rgba(52, 168, 83, 0.10) 0px, transparent 50%),
    radial-gradient(at 20% 80%, rgba(251, 188, 5, 0.08) 0px, transparent 50%);
  filter: blur(72px);
  pointer-events: none;
}

.signup-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.85);
  padding: 2rem 1.5rem 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 20px 50px -12px rgba(50, 50, 93, 0.12);
  overflow: hidden;
}
@media (min-width: 481px) { .signup-card { padding: 2.5rem 2rem 2rem; } }

.signup-card__accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335);
  opacity: 0.7;
}

.signup-card__head { margin-bottom: 1.5rem; }
.title { font-size: 1.5rem; line-height: 1.2; font-weight: 700; margin: 0 0 0.5rem; letter-spacing: -0.01em; }
.subtitle { font-size: 0.95rem; line-height: 1.45; color: #4a4f55; margin: 0; }

/* Google first and most prominent */
.btn-google {
  width: 100%;
  min-height: 52px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 100px;
  border: 2px solid #4285F4;
  background: #ffffff;
  color: #0a0a0c;
  font-size: 1.02rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(66, 133, 244, 0.18);
  transition: box-shadow 150ms ease, background 150ms ease;
}
.btn-google:hover:not(:disabled) { background: #f6f9ff; box-shadow: 0 8px 22px rgba(66, 133, 244, 0.28); }
.btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
.google-icon { width: 20px; height: 20px; flex-shrink: 0; }

.divider { display: flex; align-items: center; gap: 12px; margin: 1.25rem 0 1rem; color: #5f6368; }
.divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: rgba(0,0,0,0.1); }
.divider span { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }

.form-group { margin-bottom: 0.25rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: #1f2328; }
.form-group input {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  font-size: 16px; /* prevents iOS zoom on focus */
  font-family: inherit;
  color: #0a0a0c;
  background: #ffffff;
  border: 1.5px solid rgba(0, 0, 0, 0.18);
  border-radius: 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.form-group input::placeholder { color: #6b7076; }
.form-group input:focus { border-color: #4285F4; box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2); }
.form-group input.has-error { border-color: #c5221f; }
.form-group input:disabled { opacity: 0.7; }

.password-wrapper { position: relative; }
.password-wrapper input { padding-right: 76px; }
.toggle {
  position: absolute;
  right: 4px; top: 50%;
  transform: translateY(-50%);
  min-width: 44px; min-height: 44px;
  padding: 0 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  color: #3c4043;
  cursor: pointer;
}
.toggle:hover { background: rgba(0,0,0,0.05); }

/* Reserved two-line slot so errors never move the layout */
.field-msg { display: block; min-height: 2.6em; margin-top: 6px; font-size: 0.8rem; line-height: 1.3; color: #4a4f55; }
.field-error { color: #c5221f; }

.verification-notice { margin: 0 0 0.75rem; font-size: 0.82rem; color: #3c4043; }

.btn-primary {
  width: 100%;
  min-height: 52px;
  padding: 12px;
  background: #0a0a0c;
  color: #ffffff;
  border: none;
  border-radius: 100px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 150ms ease;
}
.btn-primary:hover:not(:disabled) { background: #2a2a2a; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.form-error { min-height: 1.4em; margin-top: 10px; font-size: 0.85rem; line-height: 1.4; color: #c5221f; text-align: center; }

.terms { margin: 0.5rem 0 0; font-size: 0.78rem; line-height: 1.4; color: #4a4f55; text-align: center; }
.terms :deep(a) { color: #0a0a0c; font-weight: 600; text-decoration: underline; }

.login-text { margin: 1rem 0 0; font-size: 0.9rem; text-align: center; color: #3c4043; }
.login-link { display: inline-block; padding: 8px 4px; color: #0a0a0c; font-weight: 600; text-decoration: underline; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 2s; } }
</style>

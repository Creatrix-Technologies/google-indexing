<template>
  <div class="signup-container">
    <div class="panel">
      <div class="grid-bg" aria-hidden="true"></div>
      <div class="glow" aria-hidden="true"></div>

      <div class="content-wrapper">
        <!-- Left side - Plan info -->
        <div class="plan-info">
          <router-link to="/pricing" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to pricing
          </router-link>

          <!-- Plan Card -->
          <div v-if="hasSelectedPlan" class="selected-plan-card">
            <div class="plan-badge">You're getting</div>
            <h1 class="plan-name">{{ selectedPlanName }}</h1>
            <p class="plan-desc">{{ selectedPlanDesc }}</p>
            <div class="plan-features" v-if="selectedPlan === 'solo'">
              <div class="feature"><span class="check">✓</span> 6,000 indexings/month</div>
              <div class="feature"><span class="check">✓</span> 3 sites</div>
              <div class="feature"><span class="check">✓</span> API access</div>
            </div>
            <div class="plan-features" v-else-if="selectedPlan === 'pro'">
              <div class="feature"><span class="check">✓</span> 6,000 indexings/month</div>
              <div class="feature"><span class="check">✓</span> 10 sites</div>
              <div class="feature"><span class="check">✓</span> Priority support</div>
              <div class="feature"><span class="check">✓</span> Email alerts</div>
            </div>
            <div class="plan-features" v-else-if="selectedPlan === 'team'">
              <div class="feature"><span class="check">✓</span> 6,000 indexings/month</div>
              <div class="feature"><span class="check">✓</span> 30 sites</div>
              <div class="feature"><span class="check">✓</span> 8 team seats</div>
              <div class="feature"><span class="check">✓</span> Custom onboarding</div>
            </div>
          </div>

          <div v-else class="selected-plan-card">
            <h1 class="plan-name">Create Account</h1>
            <p class="plan-desc">Get started with GoogleIndexing and accelerate your SEO.</p>
          </div>
        </div>

        <!-- Right side - Signup form -->
        <div class="signup-card">
          <span class="signup-card__accent" aria-hidden="true"></span>

          <header class="signup-card__head">
            <h2 class="title">Create your account</h2>
            <p class="subtitle">Fill in your details to get started</p>
          </header>

          <!-- Email -->
          <div class="form-group">
            <label for="signup-email">Email</label>
            <input
              id="signup-email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              :disabled="loading"
              :class="{ 'has-error': emailError }"
              @input="validateEmail"
              @keyup.enter="handleRegister"
            />
            <small v-if="emailError" class="field-error">{{ emailError }}</small>
          </div>

          <!-- Username -->
          <div class="form-group">
            <label for="signup-username">Username</label>
            <input
              id="signup-username"
              v-model="username"
              type="text"
              placeholder="Choose a username"
              :disabled="loading"
              :class="{ 'has-error': usernameError }"
              @input="validateUsername"
              @keyup.enter="handleRegister"
            />
            <small v-if="usernameError" class="field-error">{{ usernameError }}</small>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="signup-password">Password</label>
            <div class="password-wrapper">
              <input
                id="signup-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a password"
                :disabled="loading"
                :class="{ 'has-error': passwordError }"
                @input="validatePassword"
                @keyup.enter="handleRegister"
              />
              <button
                type="button"
                class="toggle"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'HIDE' : 'SHOW' }}
              </button>
            </div>
            <small v-if="passwordError" class="field-error">{{ passwordError }}</small>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Confirm your password"
              :disabled="loading"
              :class="{ 'has-error': confirmPasswordError }"
              @input="validateConfirmPassword"
              @keyup.enter="handleRegister"
            />
            <small v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</small>
          </div>

          <!-- Email verification notice -->
          <div class="verification-notice" v-if="hasSelectedPlan && selectedPlan !== 'trial'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>You'll receive an email to verify your address before completing payment</span>
          </div>

          <!-- Terms -->
          <div class="terms">
            By creating an account, you agree to our
            <router-link to="/terms">Terms of Service</router-link> and
            <router-link to="/privacy">Privacy Policy</router-link>.
          </div>

          <button
            class="btn-primary"
            @click="handleRegister"
            :disabled="!isFormValid || loading"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else-if="hasSelectedPlan && selectedPlan !== 'trial'">Create account & verify email →</span>
            <span v-else>Create account & continue</span>
          </button>

          <div class="divider"><span>OR</span></div>

          <button class="btn-google" @click="handleGoogleSignup" :disabled="loading">
            <svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            <span>Sign up with Google</span>
          </button>

          <p class="login-text">
            Already have an account?
            <router-link :to="selectedPlan ? `/login?plan=${selectedPlan}` : '/login'" class="login-link">Sign in</router-link>
          </p>

          <p v-if="errorMessage" class="error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { register as apiRegister, redirectToGoogleLogin } from "../Store/auth";
import { trackGoogleAdsSignupConversion } from "../utils/googleAdsConversion";

const router = useRouter();
const route = useRoute();

// Plan display config
const planConfig: Record<string, { name: string; desc: string }> = {
  solo: { name: 'Solo Plan', desc: 'Perfect for individual sites and small projects.' },
  pro: { name: 'Pro Plan', desc: 'Most popular choice for growing businesses.' },
  team: { name: 'Team Plan', desc: 'Collaborate with your entire team.' }
};

// State
const loading = ref(false);
const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const errorMessage = ref("");

// Errors
const emailError = ref("");
const usernameError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");

// Get plan from query
const selectedPlan = computed(() => route.query.plan as string | undefined);
const hasSelectedPlan = computed(() => !!selectedPlan.value && planConfig[selectedPlan.value]);
const selectedPlanName = computed(() => {
  const plan = selectedPlan.value;
  return plan && planConfig[plan] ? planConfig[plan].name : '';
});
const selectedPlanDesc = computed(() => {
  const plan = selectedPlan.value;
  return plan && planConfig[plan] ? planConfig[plan].desc : '';
});

// Store plan in localStorage
onMounted(() => {
  if (selectedPlan.value) {
    localStorage.setItem('selectedPlan', selectedPlan.value);
  }
});

// Validations
const validateEmail = () => {
  if (!email.value.trim()) emailError.value = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
    emailError.value = "Please enter a valid email address.";
  else emailError.value = "";
};

const validateUsername = () => {
  if (!username.value.trim()) usernameError.value = "Username is required.";
  else if (username.value.length < 3) usernameError.value = "Username must be at least 3 characters.";
  else if (!/^[a-zA-Z0-9._-]+$/.test(username.value.trim()))
    usernameError.value = "Use letters, numbers, dot, underscore, or hyphen only.";
  else usernameError.value = "";
};

const validatePassword = () => {
  if (!password.value) passwordError.value = "Password is required.";
  else {
    const hasLower = /[a-z]/.test(password.value);
    const hasUpper = /[A-Z]/.test(password.value);
    const hasDigit = /[0-9]/.test(password.value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password.value);
    if (password.value.length < 8 || !hasLower || !hasUpper || !hasDigit || !hasSpecial) {
      passwordError.value =
        "Password must be 8+ chars and include upper, lower, number, and special character.";
    } else {
      passwordError.value = "";
    }
  }
  if (confirmPassword.value) validateConfirmPassword();
};

const validateConfirmPassword = () => {
  if (!confirmPassword.value) confirmPasswordError.value = "Please confirm your password.";
  else if (password.value !== confirmPassword.value) confirmPasswordError.value = "Passwords do not match.";
  else confirmPasswordError.value = "";
};

const isFormValid = computed(() => {
  return email.value.trim() && username.value.trim() && password.value && confirmPassword.value &&
    !emailError.value && !usernameError.value && !passwordError.value && !confirmPasswordError.value;
});

// Submit
const handleRegister = async () => {
  validateEmail();
  validateUsername();
  validatePassword();
  validateConfirmPassword();

  if (!isFormValid.value || loading.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const payload = {
      email: email.value,
      userName: username.value,
      password: password.value,
    };

    const success = await apiRegister(payload);

    if (success) {
      trackGoogleAdsSignupConversion();
      const pendingPlan = localStorage.getItem('selectedPlan');
      localStorage.removeItem('selectedPlan');

      // Show verification required page after signup (for all plans)
      // Trial users also benefit from email verification
      router.push(`/verify-required?plan=${pendingPlan || 'trial'}&email=${encodeURIComponent(email.value)}`);
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
/* ===== Base ===== */
.signup-container {
  min-height: 100vh;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  background-color: #fdfdfb;
  color: #0a0a0c;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  position: relative;
}

/* ===== Mesh gradient ===== */
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

/* ===== Layout ===== */
.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 60px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 1100px;
  width: 100%;
  padding: 2rem;
}

/* ===== Left side - Plan info ===== */
.plan-info {
  max-width: 380px;
  display: flex;
  flex-direction: column;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #5f6368;
  text-decoration: none;
  margin-bottom: 2rem;
  transition: color 0.2s ease;
}
.back-link svg {
  width: 15px;
  height: 15px;
}
.back-link:hover { color: #0a0a0c; }

.selected-plan-card {
  background: linear-gradient(135deg, rgba(66, 133, 244, 0.08), rgba(52, 168, 83, 0.06));
  border: 1px solid rgba(66, 133, 244, 0.2);
  border-radius: 24px;
  padding: 2rem;
}

.plan-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, #4285F4, #34A853);
  color: white;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

.plan-name {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0 0 0.75rem;
  color: #0a0a0c;
}

.plan-desc {
  font-size: 1rem;
  color: #5f6368;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #0a0a0c;
}

.check {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4285F4, #34A853);
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
}

/* ===== Right side - Signup form ===== */
.signup-card {
  position: relative;
  width: 420px;
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

.signup-card__accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335);
  opacity: 0.7;
}

.signup-card__head { margin-bottom: 1.75rem; }

.title {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #0a0a0c;
  margin: 0 0 4px;
}
.subtitle {
  font-size: 0.85rem;
  color: #5f6368;
  margin: 0;
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
.form-group input.has-error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.password-wrapper { position: relative; }
.password-wrapper input { padding-right: 64px; }

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
.toggle:hover { color: #0a0a0c; background: rgba(0,0,0,0.05); }

.field-error {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: #dc2626;
}

.verification-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(66, 133, 244, 0.08), rgba(52, 168, 83, 0.06));
  border: 1px solid rgba(66, 133, 244, 0.2);
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #3c4043;
  line-height: 1.4;
}

.verification-notice svg {
  width: 18px;
  height: 18px;
  color: #4285f4;
  flex-shrink: 0;
  margin-top: 1px;
}

.terms {
  font-size: 0.75rem;
  color: #5f6368;
  margin: 0.5rem 0 1.25rem;
  line-height: 1.5;
}
.terms :deep(a) {
  color: #4285F4;
  text-decoration: none;
}
.terms :deep(a:hover) {
  text-decoration: underline;
}

/* ===== Buttons ===== */
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
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== Divider ===== */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 1.25rem 0;
  color: #9aa0a6;
}
.divider::before, .divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(0,0,0,0.08);
}
.divider span {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ===== Google button ===== */
.btn-google {
  width: 100%;
  padding: 10px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 100px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.6);
  font-size: 0.92rem;
  font-weight: 500;
  color: #0a0a0c;
  font-family: inherit;
  transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 80ms ease;
}
.btn-google:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(66, 133, 244, 0.4);
  box-shadow: 0 4px 14px rgba(66, 133, 244, 0.1);
  transform: translateY(-1px);
}
.google-icon { width: 18px; height: 18px; flex-shrink: 0; }

/* ===== Login link ===== */
.login-text {
  margin-top: 1.25rem;
  font-size: 0.82rem;
  text-align: center;
  color: #5f6368;
}
.login-link {
  color: #0a0a0c;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(0,0,0,0.2);
  transition: text-decoration-color 140ms ease, color 140ms ease;
}
.login-link:hover {
  color: #4285F4;
  text-decoration-color: #4285F4;
}

/* ===== Error ===== */
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
}
.error svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px; }

/* ===== Spinner ===== */
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

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .content-wrapper { flex-direction: column; gap: 2rem; }
  .plan-info { max-width: 420px; text-align: center; }
  .plan-features { align-items: center; }
  .back-link { align-self: flex-start; }
}

@media (max-width: 480px) {
  .signup-card { width: 100%; border-radius: 20px; padding: 2rem 1.5rem; }
  .plan-info { max-width: 100%; }
  .selected-plan-card { padding: 1.5rem; }
}
</style>

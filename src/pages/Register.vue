<template>
  <transition name="modal">
    <div v-if="show" class="modal-backdrop" @click.self="close">
      <div class="modal-box modal-box--xs" @click.stop role="dialog" aria-modal="true">
        <header class="modal-header">
          <div>
            <h2 class="modal-title">Create account</h2>
            <p class="modal-subtitle">
            {{ hasSelectedPlan ? `Create account to get ${selectedPlanName}` : 'Register to continue.' }}
          </p>
          </div>
          <button type="button" class="modal-close" aria-label="Close" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <!-- Plan Context Banner -->
        <div v-if="hasSelectedPlan" class="plan-context-banner">
          <div class="plan-context-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </div>
          <div class="plan-context-content">
            <p class="plan-context-desc">{{ selectedPlanDesc }}</p>
          </div>
        </div>

        <div class="modal-body">
          <!-- Email -->
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
              :class="{ 'is-invalid': emailError }"
              @input="validateEmail"
              @keyup.enter="handleRegister"
              :disabled="loading"
            />
            <small v-if="emailError" class="field-error">{{ emailError }}</small>
          </div>

          <!-- Username -->
          <div class="form-group">
            <label class="form-label">Username</label>
            <input
              v-model="username"
              type="text"
              placeholder="Choose a username"
              :class="{ 'is-invalid': usernameError }"
              @input="validateUsername"
              @keyup.enter="handleRegister"
              :disabled="loading"
            />
            <small v-if="usernameError" class="field-error">{{ usernameError }}</small>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="Enter password"
              :class="{ 'is-invalid': passwordError }"
              @input="validatePassword"
              @keyup.enter="handleRegister"
              :disabled="loading"
            />
            <small v-if="passwordError" class="field-error">{{ passwordError }}</small>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label class="form-label">Confirm password</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm password"
              :class="{ 'is-invalid': confirmPasswordError }"
              @input="validateConfirmPassword"
              @keyup.enter="handleRegister"
              :disabled="loading"
            />
            <small v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</small>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="close" :disabled="loading">Cancel</button>
          <button type="button" class="btn-primary" @click="handleRegister" :disabled="!isFormValid || loading">
            <span v-if="loading" class="spinner"></span>
            <span v-if="loading">Creating...</span>
            <span v-else>Create account</span>
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { register as apiRegister } from "../Store/auth";
import { trackGoogleAdsSignupConversion } from "../utils/googleAdsConversion";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

// Plan display names mapping
const planNames: Record<string, string> = {
  trial: 'Trial (100 requests)',
  solo: 'Solo ($17/mo)',
  pro: 'Pro ($47/mo)',
  team: 'Team ($88/mo)'
};

const planDescriptions: Record<string, string> = {
  trial: 'Get started with 100 free indexing requests.',
  solo: 'Perfect for individual sites with 6,000 indexings/month.',
  pro: 'Most popular choice with 10 sites and priority support.',
  team: 'Collaborate with up to 8 team members across 30 sites.'
};

const router = useRouter();
const toast = useToast();

const props = defineProps({ show: Boolean });
const emit = defineEmits(["close"]);

// Track selected plan
const selectedPlan = ref<string | null>(null);
const hasSelectedPlan = computed(() => !!selectedPlan.value && planNames[selectedPlan.value]);
const selectedPlanName = computed(() => hasSelectedPlan.value ? planNames[selectedPlan.value!] : '');
const selectedPlanDesc = computed(() => hasSelectedPlan.value ? planDescriptions[selectedPlan.value!] : '');

// Load plan from localStorage when modal opens
onMounted(() => {
  const storedPlan = localStorage.getItem('selectedPlan');
  if (storedPlan) {
    selectedPlan.value = storedPlan;
  }
});

// Watch for modal open to refresh plan
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    const storedPlan = localStorage.getItem('selectedPlan');
    if (storedPlan) {
      selectedPlan.value = storedPlan;
    }
  }
});

// ---------------- STATE ----------------
const loading = ref(false);

const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");

// errors
const emailError = ref("");
const usernameError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");

// ---------------- CLOSE ----------------
const close = () => {
  if (!loading.value) emit("close");
};

// ---------------- VALIDATIONS ----------------
const validateEmail = () => {
  if (!email.value.trim()) emailError.value = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
    emailError.value = "Invalid email address.";
  else emailError.value = "";
};

const validateUsername = () => {
  if (!username.value.trim()) {
    usernameError.value = "Username is required.";
    return;
  }
  if (username.value.trim().length < 3) {
    usernameError.value = "Username must be at least 3 characters.";
    return;
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(username.value.trim())) {
    usernameError.value = "Use letters, numbers, dot, underscore, or hyphen only.";
    return;
  }
  usernameError.value = "";
};

const validatePassword = () => {
  if (!password.value.trim()) {
    passwordError.value = "Password is required.";
    return;
  }
  const hasLower = /[a-z]/.test(password.value);
  const hasUpper = /[A-Z]/.test(password.value);
  const hasDigit = /[0-9]/.test(password.value);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password.value);
  if (password.value.length < 8 || !hasLower || !hasUpper || !hasDigit || !hasSpecial) {
    passwordError.value =
      "Password must be 8+ chars and include upper, lower, number, and special character.";
    return;
  }
  passwordError.value = "";
  if (confirmPassword.value) validateConfirmPassword();
};

const validateConfirmPassword = () => {
  if (!confirmPassword.value.trim())
    confirmPasswordError.value = "Confirm password is required.";
  else if (password.value !== confirmPassword.value)
    confirmPasswordError.value = "Passwords do not match.";
  else confirmPasswordError.value = "";
};

// ---------------- FORM VALID ----------------
const isFormValid = computed(() => {
  return (
    email.value.trim() &&
    username.value.trim() &&
    password.value.trim() &&
    confirmPassword.value.trim() &&
    !emailError.value &&
    !usernameError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  );
});

// ---------------- SUBMIT ----------------
const handleRegister = async () => {
  validateEmail();
  validateUsername();
  validatePassword();
  validateConfirmPassword();

  if (!isFormValid.value || loading.value) return;

  loading.value = true;

  try {
    const payload = {
      email: email.value,
      userName: username.value,
      password: password.value,
    };

    const success = await apiRegister(payload);

    if (success) {
      trackGoogleAdsSignupConversion();
      // 1. close modal FIRST (important)
      close();

      // 2. reset form (optional but recommended)
      email.value = "";
      username.value = "";
      password.value = "";
      confirmPassword.value = "";

      // 3. redirect to subscription with plan, or to login
      setTimeout(() => {
        const pendingPlan = localStorage.getItem('selectedPlan');
        if (pendingPlan) {
          localStorage.removeItem('selectedPlan');
          router.push(`/subscriptions?plan=${pendingPlan}`);
        } else {
          router.push("/login");
        }
      }, 200);
    }
  } catch (err) {
    toast.error("Registration failed");
  } finally {
    loading.value = false;
  }
};

// ---------------- WATCH ----------------
watch(password, () => {
  if (confirmPassword.value) validateConfirmPassword();
});
</script>

<style scoped>
.modal-box.modal-box--xs {
  font-family: var(--font-family);
  animation: scaleIn 0.25s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Form */
.form-group {
  margin-bottom: var(--space-3);
}

.form-label {
  display: block;
  text-align: left;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  margin-bottom: 5px;
  color: var(--color-text);
}

.form-group input {
  width: 100%;
  padding: 9px 11px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background: var(--color-card-bg);
  color: var(--color-text);
  transition: border-color 140ms ease, box-shadow 140ms ease;
  font-size: var(--fs-base);
  font-family: inherit;
}
.form-group input::placeholder {
  color: var(--color-placeholder);
}
.form-group input:focus {
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
  outline: none;
}
.form-group input.is-invalid {
  border-color: var(--color-danger);
  box-shadow: var(--ring-danger);
}

.field-error {
  display: block;
  margin-top: 4px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-danger);
}

/* Buttons (modal footer) */
.btn-primary {
  padding: 9px 14px;
  background: var(--neutral-900);
  color: #fff;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  cursor: pointer;
  transition: background 140ms ease, opacity 140ms ease;
  font-size: var(--fs-base);
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary:hover:not(:disabled) {
  background: var(--neutral-800);
}
.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 9px 14px;
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
  font-size: var(--fs-base);
  font-family: inherit;
  font-weight: var(--fw-medium);
}
.btn-secondary:hover {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Plan Context Banner */
.plan-context-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0 24px 16px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(66, 133, 244, 0.08), rgba(52, 168, 83, 0.06));
  border: 1px solid rgba(66, 133, 244, 0.2);
  border-radius: 12px;
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.plan-context-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4285F4, #34A853);
  border-radius: 50%;
  color: white;
}

.plan-context-icon svg {
  width: 14px;
  height: 14px;
}

.plan-context-content {
  flex: 1;
  min-width: 0;
}

.plan-context-desc {
  font-size: 0.8rem;
  color: #5f6368;
  margin: 0;
  line-height: 1.4;
}
</style>

<template>
  <transition name="modal">
    <div v-if="show" class="modal-backdrop" @click.self="close">
      <div class="modal-box modal-box--xs" @click.stop role="dialog" aria-modal="true">
        <header class="modal-header">
          <div>
            <h2 class="modal-title">Create account</h2>
            <p class="modal-subtitle">Register to continue.</p>
          </div>
          <button type="button" class="modal-close" aria-label="Close" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

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

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from "vue";
import { register as apiRegister } from "../Store/auth";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

const router = useRouter();
const toast = useToast();

const props = defineProps({ show: Boolean });
const emit = defineEmits(["close"]);

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

// inline error style
const errorStyle = { borderColor: "#dc2626", boxShadow: "0 0 0 3px rgba(220, 38, 38, 0.16)" };

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
  usernameError.value = username.value.trim() ? "" : "Username is required.";
};

const validatePassword = () => {
  passwordError.value = password.value.trim() ? "" : "Password is required.";
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
      // 1. close modal FIRST (important)
      close();

      // 2. reset form (optional but recommended)
      email.value = "";
      username.value = "";
      password.value = "";
      confirmPassword.value = "";

      // 3. redirect AFTER UI update
      setTimeout(() => {
        router.push("/login");
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
</style>

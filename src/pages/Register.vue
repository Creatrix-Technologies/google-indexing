<template>
  <transition name="modal">
    <div v-if="show" class="modal-backdrop">
      <div class="modal-box modal-box--xs">

        <!-- Close Icon -->
        <button class="close-btn" @click="close" :disabled="loading">✕</button>

        <!-- Header -->
        <h2 class="title">Create Account</h2>
        <p class="subtitle">Register to continue</p>

        <!-- Email -->
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Enter email"
            :style="emailError ? errorStyle : {}"
            @input="validateEmail"
            @keyup.enter="handleRegister"
            :disabled="loading"
          />
          <small v-if="emailError" style="color:#c53030">{{ emailError }}</small>
        </div>

        <!-- Username -->
        <div class="form-group">
          <label class="form-label">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="Enter username"
            :style="usernameError ? errorStyle : {}"
            @input="validateUsername"
            @keyup.enter="handleRegister"
            :disabled="loading"
          />
          <small v-if="usernameError" style="color:#c53030">{{ usernameError }}</small>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter password"
            :style="passwordError ? errorStyle : {}"
            @input="validatePassword"
            @keyup.enter="handleRegister"
            :disabled="loading"
          />
          <small v-if="passwordError" style="color:#c53030">{{ passwordError }}</small>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm password"
            :style="confirmPasswordError ? errorStyle : {}"
            @input="validateConfirmPassword"
            @keyup.enter="handleRegister"
            :disabled="loading"
          />
          <small v-if="confirmPasswordError" style="color:#c53030">{{ confirmPasswordError }}</small>
        </div>

        <!-- Buttons -->
        <button
          class="btn-primary"
          @click="handleRegister"
          :disabled="!isFormValid || loading"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-if="loading">Creating...</span>
          <span v-else>Create Account</span>
        </button>

        <button class="btn-secondary" @click="close" :disabled="loading">
          Cancel
        </button>

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

const errorStyle = { borderColor: "#c53030" };

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
  animation: scaleIn 0.25s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Close */
.close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* Form */
.form-group { margin-bottom: 14px; }

.form-group input {
  width: 100%;
  padding: 9px 11px;
  border-radius: 6px;
  border: 1px solid #d6d6d6;
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 10px;
  background: #4c6fff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #a0b0ff;
  cursor: not-allowed;
}

.btn-secondary {
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  background: #efefef;
  border: none;
  border-radius: 6px;
}

/* Spinner */
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
  to { transform: rotate(360deg); }
}
</style>
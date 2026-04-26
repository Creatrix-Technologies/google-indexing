<template>
  <transition name="modal">
    <div v-if="show" class="modal-backdrop">
      <div class="modal-box modal-box--xs">

        <!-- Close Icon -->
        <button class="close-btn" @click="close">✕</button>

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
          />
          <small v-if="confirmPasswordError" style="color:#c53030">{{ confirmPasswordError }}</small>
        </div>

        <!-- Buttons -->
        <button class="btn-primary" @click="handleRegister" :disabled="!isFormValid">
          Create Account
        </button>
        <button class="btn-secondary" @click="close">Cancel</button>

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

const props = defineProps({ show: Boolean });
const emit = defineEmits(["close"]);

const toast = useToast();

// form fields
const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");

// field-level errors
const emailError = ref("");
const usernameError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");

// inline error style
const errorStyle = { borderColor: "#c53030" };

// Close modal
const close = () => emit("close");

// ------------------- Individual field validation -------------------
const validateEmail = () => {
  if (!email.value.trim()) emailError.value = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) emailError.value = "Invalid email address.";
  else emailError.value = "";
};

const validateUsername = () => {
  usernameError.value = username.value.trim() ? "" : "Username is required.";
};

const validatePassword = () => {
  passwordError.value = password.value.trim() ? "" : "Password is required.";
  // also validate confirm password if it has value
  if (confirmPassword.value) validateConfirmPassword();
};

const validateConfirmPassword = () => {
  if (!confirmPassword.value.trim()) confirmPasswordError.value = "Confirm password is required.";
  else if (password.value !== confirmPassword.value) confirmPasswordError.value = "Passwords do not match.";
  else confirmPasswordError.value = "";
};

// ------------------- Computed form validity -------------------
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

// ------------------- Main submit -------------------
const handleRegister = async () => {
  // validate all fields first
  validateEmail();
  validateUsername();
  validatePassword();
  validateConfirmPassword();

  if (!isFormValid.value) return;

  const payload = {
    email: email.value,
    userName: username.value,
    password: password.value,
  };

  const success = await apiRegister(payload);

  if (success) {
    router.push("/login"); 
    close();
  } 
};

// ------------------- Optional: live validation watch -------------------
// Re-validate password/confirm on password change
watch(password, () => {
  if (confirmPassword.value) validateConfirmPassword();
});
</script>

<style scoped>
/* Shell: theme.css (.modal-backdrop, .modal-box) */
.modal-box.modal-box--xs {
  animation: scaleIn 0.25s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* ------------------ Close Button ------------------ */
.close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 20px;
  color: #444;
  cursor: pointer;
  transition: 0.2s;
}

.close-btn:hover { color: #d22; }

/* ------------------ Typography ------------------ */
.title { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 4px; }
.subtitle { text-align: center; font-size: 13px; color: #666; margin-bottom: 18px; }

/* ------------------ Form Styles ------------------ */
.form-group { margin-bottom: 14px; }
.form-label { display: block; text-align: left; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #333; }
.form-group input {
  width: 100%;
  padding: 9px 11px;
  border-radius: 6px;
  border: 1px solid #d6d6d6;
  transition: all 0.2s;
  font-size: 13px;
}
.form-group input:focus {
  border-color: #4c6fff;
  box-shadow: 0 0 0 2px rgba(76, 111, 255, 0.25);
  outline: none;
}

/* ------------------ Buttons ------------------ */
.btn-primary { width: 100%; padding: 10px; background: #4c6fff; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; margin-top: 6px; transition: 0.2s; font-size: 14px; }
.btn-primary:hover { background: #3b57d8; }
.btn-primary:disabled { background: #a0b0ff; cursor: not-allowed; }
.btn-secondary { width: 100%; padding: 10px; background: #efefef; border: none; border-radius: 6px; margin-top: 8px; cursor: pointer; transition: 0.2s; font-size: 14px; }
.btn-secondary:hover { background: #dedede; }

/* ------------------ Transition ------------------ */
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>

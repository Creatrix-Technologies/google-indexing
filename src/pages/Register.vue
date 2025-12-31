<template>
    <transition name="modal">
      <div v-if="show" class="modal-backdrop">
        <div class="modal-container">
  
          <!-- Close Icon -->
          <button class="close-btn" @click="close">
            ✕
          </button>
  
          <!-- Header -->
          <h2 class="title">Create Account</h2>
          <p class="subtitle">Register to continue</p>
  
          <!-- Email -->
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="email" type="email" placeholder="Enter email" />
          </div>
  
          <!-- Username -->
          <div class="form-group">
            <label class="form-label">Username</label>
            <input v-model="username" type="text" placeholder="Enter username" />
          </div>
  
          <!-- Password -->
          <div class="form-group">
            <label class="form-label">Password</label>
            <input v-model="password" type="password" placeholder="Enter password" />
          </div>
  
          <!-- Confirm Password -->
          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input v-model="confirmPassword" type="password" placeholder="Confirm password" />
          </div>
  
          <!-- Error -->
          <div v-if="errorMessage" class="error-box">
            {{ errorMessage }}
          </div>
  
          <!-- Buttons -->
          <button class="btn-primary" @click="handleRegister">Create Account</button>
          <button class="btn-secondary" @click="close">Cancel</button>
  
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from "vue";
  import { register as apiRegister } from "../Store/auth";
  import { useToast } from "vue-toastification";
  
  const props = defineProps({ show: Boolean });
  const emit = defineEmits(["close"]);
  
  const toast = useToast();
  
  const email = ref("");
  const username = ref("");
  const password = ref("");
  const confirmPassword = ref("");
  const errorMessage = ref("");
  
  const close = () => emit("close");
  
  const handleRegister = async () => {
    errorMessage.value = "";
  
    if (password.value !== confirmPassword.value) {
      errorMessage.value = "Passwords do not match.";
      return;
    }
  
    const payload = {
      email: email.value,
      userName: username.value,
      password: password.value,
    };
  
    const success = await apiRegister(payload);
  
    if (success) {
      toast.success("Registration successful!");
      close();
    } else {
      errorMessage.value = "Registration failed.";
    }
  };
  </script>
  
  <style scoped>
  
  /* ------------------ Modal Backdrop ------------------ */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    backdrop-filter: blur(4px);
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }
  
  /* ------------------ Modal Container ------------------ */
  .modal-container {
    width: 420px;
    position: relative;
    background: #fff;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
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
  
  .close-btn:hover {
    color: #d22;
  }
  
  /* ------------------ Typography ------------------ */
  .title {
    font-size: 22px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 4px;
  }
  
  .subtitle {
    text-align: center;
    font-size: 14px;
    color: #666;
    margin-bottom: 24px;
  }
  
  /* ------------------ Form Styles ------------------ */
  .form-group {
    margin-bottom: 18px;
  }
  
  .form-label {
    display: block;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #333;
  }
  
  .form-group input {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #d6d6d6;
    transition: all 0.2s;
  }
  
  .form-group input:focus {
    border-color: #4c6fff;
    box-shadow: 0 0 0 2px rgba(76, 111, 255, 0.25);
    outline: none;
  }
  
  /* ------------------ Error Box ------------------ */
  .error-box {
    background: #ffe4e4;
    color: #c53030;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 12px;
  }
  
  /* ------------------ Buttons ------------------ */
  .btn-primary {
    width: 100%;
    padding: 12px;
    background: #4c6fff;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    transition: 0.2s;
  }
  
  .btn-primary:hover {
    background: #3b57d8;
  }
  
  .btn-secondary {
    width: 100%;
    padding: 12px;
    background: #efefef;
    border: none;
    border-radius: 8px;
    margin-top: 10px;
    cursor: pointer;
    transition: 0.2s;
  }
  
  .btn-secondary:hover {
    background: #dedede;
  }
  
  /* ------------------ Transition ------------------ */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.25s ease;
  }
  
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
  </style>
  
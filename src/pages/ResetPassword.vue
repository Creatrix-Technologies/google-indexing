<template>
    <div class="reset-container">
  
      <div class="card">
  
        <h2 class="title">Reset Password</h2>
  
        <p class="subtitle">
          Enter your new password below.
        </p>
  
        <!-- NEW PASSWORD -->
        <div class="form-group">
          <label>New Password</label>
          <input
            v-model="newPassword"
            type="password"
            placeholder="Enter new password"
          />
        </div>
  
        <!-- CONFIRM PASSWORD -->
        <div class="form-group">
          <label>Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm password"
            @keyup.enter="handleReset"
          />
        </div>
  
        <!-- BUTTON -->
        <button class="btn-primary" :disabled="loading" @click="handleReset">
          {{ loading ? "Resetting..." : "Reset Password" }}
        </button>
  
        <!-- SUCCESS -->
        <p v-if="successMessage" class="success">
          {{ successMessage }}
        </p>
  
        <!-- ERROR -->
        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>
  
        <!-- BACK -->
        <p class="back" @click="goLogin">
          ← Back to login
        </p>
  
      </div>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import api from "../api";
  import { useRoute, useRouter } from "vue-router";
  
  const route = useRoute();
  const router = useRouter();
  
  const email = route.query.email as string;
  const token = route.query.token as string;

  const newPassword = ref("");
  const confirmPassword = ref("");
  
  const loading = ref(false);
  const errorMessage = ref("");
  const successMessage = ref("");
  
  const handleReset = async () => {
    errorMessage.value = "";
    successMessage.value = "";
  
    if (!newPassword.value || !confirmPassword.value) {
      errorMessage.value = "Please fill all fields";
      return;
    }
  
    if (newPassword.value !== confirmPassword.value) {
      errorMessage.value = "Passwords do not match";
      return;
    }
  
    try {
      loading.value = true;
  
      await api.post("/reset-password", {
        email: email,
        token: token,
        newPassword: newPassword.value
      });
  
      successMessage.value = "Password reset successful! Redirecting...";
  
      setTimeout(() => {
        router.push("/login");
      }, 1500);
  
    } catch (err: any) {
  errorMessage.value =
    err?.response?.data?.error?.description ||
    err?.response?.data?.message ||
    "Reset failed";
} finally {
  loading.value = false;
}
  };
  
  const goLogin = () => {
    router.push("/login");
  };
  </script>

  <style scoped>
.reset-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Inter", "Segoe UI", sans-serif;
  background: linear-gradient(135deg, #0f3f3c, #14b8a6);
  padding: 20px;
}

/* CARD */
.card {
  width: 380px;
  background: #ffffff;
  padding: 35px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  transition: 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

/* TITLE */
.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #111827;
}

/* SUBTITLE */
.subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 25px;
}

/* FORM */
.form-group {
  margin-bottom: 18px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  display: block;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}

/* BUTTON */
.btn-primary {
  width: 100%;
  padding: 12px;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-primary:hover {
  background: #0f9f91;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* SUCCESS */
.success {
  margin-top: 12px;
  font-size: 13px;
  color: #16a34a;
  text-align: center;
}

/* ERROR */
.error {
  margin-top: 12px;
  font-size: 13px;
  color: #ef4444;
  text-align: center;
}

/* BACK */
.back {
  margin-top: 18px;
  text-align: center;
  font-size: 13px;
  color: #14b8a6;
  cursor: pointer;
  font-weight: 600;
}

.back:hover {
  text-decoration: underline;
}

/* RESPONSIVE */
@media (max-width: 480px) {
  .card {
    width: 100%;
    padding: 25px;
  }
}
</style>
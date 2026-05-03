<template>
    <div class="confirm-wrapper">
      <div class="confirm-card">
  
        <!-- Icon -->
        <div class="icon" :class="status">
          <span v-if="status === 'success'">✔</span>
          <span v-else-if="status === 'error'">✕</span>
          <span v-else>...</span>
        </div>
  
        <!-- Title -->
        <h2 class="title">
          {{ title }}
        </h2>
  
        <!-- Message -->
        <p class="message">
          {{ message }}
        </p>
  
        <!-- Action -->
        <button v-if="status === 'success'" class="btn-primary" @click="goToLogin">
          Go to Login
        </button>
  
        <button v-if="status === 'error'" class="btn-secondary" @click="retry">
          Try Again
        </button>
  
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { confirmEmail } from "../Store/auth"; // your API

const route = useRoute();
const router = useRouter();

const status = ref("loading"); // loading | success | error
const title = ref("Confirming...");
const message = ref("Please wait while we verify your email.");

const goToLogin = () => {
  router.push("/login");
};

const retry = () => {
  window.location.reload();
};

onMounted(async () => {
  const userId = route.query.userId;
  const token = route.query.token;

  if (!userId || !token) {
    status.value = "error";
    title.value = "Invalid Link";
    message.value = "Missing confirmation data.";
    return;
  }

  const success = await confirmEmail(userId, token);

  if (success) {
    status.value = "success";
    title.value = "Email Confirmed 🎉";
    message.value = "Your account has been successfully verified.";
  } else {
    status.value = "error";
    title.value = "Verification Failed";
    message.value = "This link may be expired or invalid.";
  }
});
</script>

<style scoped>
.confirm-wrapper {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
}

.confirm-card {
  width: 360px;
  background: white;
  padding: 30px 24px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  animation: fadeIn 0.3s ease;
}

/* Icon */
.icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: bold;
}

.icon.success {
  background: #e6fffa;
  color: #2f855a;
}

.icon.error {
  background: #ffe6e6;
  color: #c53030;
}

.icon.loading {
  background: #edf2ff;
  color: #4c6fff;
}

/* Typography */
.title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.message {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
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

.btn-secondary {
  width: 100%;
  padding: 10px;
  background: #efefef;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px);}
  to { opacity: 1; transform: translateY(0);}
}
</style>
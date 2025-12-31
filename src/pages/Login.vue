<template>
  <div class="login-wrapper">
    <div class="login-card">

      <h2 class="title">Welcome Back</h2>
      <p class="subtitle">Sign in to continue</p>

      <!-- Username -->
      <div class="form-group">
        <label for="username">Username</label>
        <input
          v-model="username"
          id="username"
          type="text"
          placeholder="Enter username"
        />
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password">Password</label>

        <div class="password-wrapper">
          <input
            v-model="password"
            id="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter password"
          />

          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
      </div>

      <!-- Login Button -->
      <button class="btn-primary" @click="handleLogin">
        Login
      </button>

      <!-- Divider -->
      <div class="divider">
        <span>OR</span>
      </div>

      <!-- Google Login -->
      <button class="btn-google" @click="handleGoogleLogin">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" />
        Continue with Google
      </button>

      <button
        class="btn-secondary"
        style="margin-top: 15px"
        @click="showRegister = true"
      >
        Create an Account
      </button>

      <RegisterModal :show="showRegister" @close="showRegister = false" />

      <p v-if="errorMessage" style="color:red; margin-top: 10px;">
        {{ errorMessage }}
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login as apiLogin, redirectToGoogleLogin } from "../Store/auth";
import RegisterModal from "../pages/Register.vue";

const router = useRouter();

const showRegister = ref(false);
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  errorMessage.value = "";

  const payload = {
    userName: username.value,
    password: password.value,
  };

  const success = await apiLogin(payload, router);
  if (success) {
    router.push("/");
  } else {
    errorMessage.value = "Login failed. Please check your credentials.";
  }
};

const handleGoogleLogin = () => {
  redirectToGoogleLogin();
};
</script>

<style scoped>
/* ---------- Layout ---------- */
.login-wrapper {
  background: #f5f6fa;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  background: white;
  width: 380px;
  padding: 35px;
  border-radius: 12px;
  box-shadow: 0px 3px 18px rgba(0, 0, 0, 0.08);
  text-align: center;
}

/* ---------- Titles ---------- */
.title {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: #777;
  margin-bottom: 25px;
}

/* ---------- Form Fields ---------- */
.form-group {
  text-align: left;
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #444;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dedede;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
}

.form-group input:focus {
  border-color: #4c6fff;
  box-shadow: 0 0 0 2px rgba(76, 111, 255, 0.15);
}

/* ---------- Password Toggle ---------- */
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  padding-right: 70px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  font-size: 13px;
  color: #4c6fff;
  cursor: pointer;
  font-weight: 500;
}

.toggle-password:hover {
  text-decoration: underline;
}

/* ---------- Buttons ---------- */
.btn-primary {
  width: 100%;
  padding: 10px;
  background: #4c6fff;
  border: none;
  color: white;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 5px;
  transition: 0.2s;
}

.btn-primary:hover {
  background: #3f5ae0;
}

/* ---------- Divider ---------- */
.divider {
  margin: 20px 0;
  display: flex;
  align-items: center;
  text-align: center;
}

.divider span {
  flex-grow: 1;
  max-width: 60px;
  margin: 0 auto;
  font-size: 12px;
  color: #666;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #ddd;
}

/* ---------- Google Login Button ---------- */
.btn-google {
  margin-top: 10px;
  width: 100%;
  padding: 9px;
  border: 1px solid #d3d3d3;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: #444;
  background: white;
  transition: 0.2s;
}

.btn-google img {
  width: 20px;
  margin-right: 8px;
}

.btn-google:hover {
  background: #f3f3f3;
}

/* ---------- Secondary Button ---------- */
.btn-secondary {
  width: 100%;
  padding: 10px;
  background: #e6e6e6;
  border: 1px solid #d3d3d3;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #444;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 10px;
}

.btn-secondary:hover {
  background: #dcdcdc;
}
</style>

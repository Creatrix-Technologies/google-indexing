<template>
  <div class="login-container">

    <!-- LEFT SIDE -->
    <div class="left-panel">
      <div class="bubbles">
    <span class="bubble" style="--i:1;"></span>
    <span class="bubble" style="--i:2;"></span>
    <span class="bubble" style="--i:3;"></span>
    <span class="bubble" style="--i:4;"></span>
    <span class="bubble" style="--i:5;"></span>
    <span class="bubble" style="--i:6;"></span>
    <span class="bubble" style="--i:7;"></span>
  </div>
      <div class="left-content">
        <h1>WELCOME</h1>
        <p class="tagline">SITE BOOSTER</p>
        <p class="desc">
          Easily crawl your website URLs and get them indexed on Google. Monitor your pages, improve SEO, and ensure your content is discoverable all from a single powerful API.
        </p>
      </div>
    </div>

    <!-- RIGHT SIDE -->
    <div class="right-panel">
      <div class="login-card">

        <h2 class="title">Sign in</h2>
        <p class="subtitle">Please login to continue</p>

        <!-- Username -->
        <div class="form-group">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label>Password</label>

          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password"
              @keyup.enter="handleLogin"
            />
            <span class="toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'HIDE' : 'SHOW' }}
            </span>
          </div>
        </div>

        <!-- Options -->
        <div class="options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <!-- <span class="forgot">Forgot Password?</span> -->
        </div>

        <!-- LOGIN -->
        <button class="btn-primary" @click="handleLogin">
          Sign in
        </button>

        <!-- DIVIDER -->
        <div class="divider">OR</div>

        <button class="btn-google" @click="handleGoogleLogin">
  <img class="google-icon" src="https://www.svgrepo.com/show/475656/google-color.svg" />
  <span>Continue with Google</span>
</button>

        <!-- SIGNUP -->
        <p class="signup-text">
          Don't have an account?
          <span @click="showRegister = true">Sign up</span>
        </p>

        <!-- ERROR -->
        <p v-if="errorMessage" class="error">
          {{ errorMessage }}
        </p>

      </div>
    </div>

    <!-- REGISTER MODAL -->
    <RegisterModal :show="showRegister" @close="showRegister = false" />

  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from "../api";
import { useRouter } from "vue-router";
import { login as apiLogin, redirectToGoogleLogin } from "../Store/auth";
import { useMenuStore } from "../Store/menu";
import { buildRoutes } from "../Router/dynamicRoutes";
import RegisterModal from "../pages/Register.vue";

const router = useRouter();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const showRegister = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  errorMessage.value = "";

  const payload = {
    userName: username.value,
    password: password.value,
  };

  const success = await apiLogin(payload, router);

  if (success) {
    const menuStore = useMenuStore();

    await api.get("/auth-check");

    if (!menuStore.loaded || menuStore.menus.length === 0) {
      await menuStore.fetchMenus();
    }

    const dynamicRoutes = buildRoutes(menuStore.menus);
    dynamicRoutes.forEach(route => {
      if (!router.hasRoute(route.name!)) {
        router.addRoute("DefaultLayout", route);
      }
    });

    router.push("/dashboard");
  } else {
    errorMessage.value = "Login failed. Please check your credentials.";
  }
};

const handleGoogleLogin = () => {
  redirectToGoogleLogin();
};
</script>

<style scoped>
/* Layout */
.login-container {
  display: flex;
  height: 100vh;
  font-family: "Inter", "Segoe UI", sans-serif;
}

/* LEFT PANEL */
.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #0f3f3c, #14b8a6);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: white;
  overflow: hidden;
}



.left-panel::before {
  width: 320px;
  height: 320px;
  top: -60px;
  left: -60px;
}

.left-panel::after {
  width: 220px;
  height: 220px;
  bottom: -50px;
  right: -50px;
}
.left-panel h1{
  color: white;
}

.left-content {
  max-width: 360px;
  z-index: 2;
  text-align: left;
}

.left-content h1 {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 1px;
}

.tagline {
  margin: 12px 0;
  font-weight: 600;
  font-size: 16px;
  opacity: 0.9;
}

.desc {
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.6;
}

/* RIGHT PANEL */
.right-panel {
  flex: 1;
  background: linear-gradient(135deg, #14b8a6, #0f3f3c);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* CARD */
.login-card {
  width: 380px;
  background: #ffffff;
  padding: 35px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  transition: 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
}

/* TEXT */
.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 25px;
}

/* INPUT */
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
  padding: 11px 12px;
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

/* PASSWORD */
.password-wrapper {
  position: relative;
}

.toggle {
  position: absolute;
  right: 12px;
  top: 11px;
  font-size: 11px;
  font-weight: 600;
  color: #14b8a6;
  cursor: pointer;
}

/* OPTIONS */
.options {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 18px;
  color: #6b7280;
}

/* PRIMARY BUTTON */
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

/* DIVIDER */
.divider {
  text-align: center;
  margin: 18px 0;
  font-size: 12px;
  color: #9ca3af;
  position: relative;
}

.divider::before,
.divider::after {
  content: "";
  height: 1px;
  width: 40%;
  background: #e5e7eb;
  position: absolute;
  top: 50%;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

/* GOOGLE BUTTON */
.btn-google {
  width: 100%;
  padding: 11px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 8px;
  cursor: pointer;
  background: white;
  font-size: 14px;
  transition: 0.2s;
}

.btn-google:hover {
  background: #f9fafb;
}

/* FIXED ICON */
.google-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* SIGNUP */
.signup-text {
  margin-top: 18px;
  font-size: 13px;
  text-align: center;
  color: #6b7280;
}

.signup-text span {
  color: #14b8a6;
  cursor: pointer;
  font-weight: 600;
}

/* ERROR */
.error {
  color: #ef4444;
  margin-top: 10px;
  font-size: 13px;
  text-align: center;
}

/* Bubbles container */
.left-panel .bubbles {
  position: absolute;
  inset: 0;
  z-index: 0; /* behind text */
  pointer-events: none;
}

/* Each bubble */
.left-panel .bubble {
  position: absolute;
  bottom: -60px; /* start below panel */
  width: calc(30px + var(--i) * 15px);
  height: calc(30px + var(--i) * 15px);
  background: rgba(255, 255, 255, 0.15); /* brighter white */
  border-radius: 50%;
  left: calc(var(--i) * 12%);
  animation: floatUp calc(8s + var(--i) * 2s) linear infinite;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2); /* optional glow */
}
@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.5; /* slightly higher */
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-120vh) scale(1.3);
    opacity: 0;
  }
}
</style>

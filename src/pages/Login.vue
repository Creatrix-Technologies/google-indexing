<template>
  <div class="login-wrapper">
    <!-- Left: Branding panel -->
    <div class="login-brand">
      <div class="brand-content">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
          </svg>
        </div>
        <h1 class="brand-title">Site Booster</h1>
        <p class="brand-tagline">Enterprise indexing & crawl management</p>
      </div>
    </div>

    <!-- Right: Login form -->
    <div class="login-panel">
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
             @keyup.enter="handleLogin"
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

      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from '../api';
import { useRouter } from "vue-router";
import { login as apiLogin, redirectToGoogleLogin } from "../Store/auth";
import { useMenuStore } from '../Store/menu';
import { buildRoutes } from '../Router/dynamicRoutes';
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
    const menuStore = useMenuStore();

// ✅ verify session
await api.get("/auth-check");

// ✅ load menus
if (!menuStore.loaded  || menuStore.menus.length > 0) {
  await menuStore.fetchMenus();
}

// ✅ register dynamic routes
const dynamicRoutes = buildRoutes(menuStore.menus);
dynamicRoutes.forEach(route => {
  if (!router.hasRoute(route.name!)) {
    router.addRoute("DefaultLayout", route);
  }
});

// ✅ now navigation is safe
router.push("/dashboard");  } else {
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
  display: flex;
  min-height: 100vh;
}

.login-brand {
  flex: 1;
  background: linear-gradient(135deg, var(--color-slate-900) 0%, var(--color-slate-800) 50%, var(--color-primary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.brand-content {
  max-width: 400px;
}

.brand-logo {
  width: 64px;
  height: 64px;
  background: rgba(255,255,255,0.15);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.brand-logo svg {
  width: 36px;
  height: 36px;
  color: #fff;
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
}

.brand-tagline {
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin: 0;
}

.login-panel {
  flex: 1;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  background: var(--color-card);
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: var(--radius-lg);
  box-shadow: var(--box-shadow-hover);
  border: 1px solid var(--color-border);
  text-align: center;
}

/* ---------- Titles ---------- */
.title {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
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
  color: var(--color-text-secondary);
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.form-group input:focus {
  border-color: var(--color-input-focus);
  box-shadow: 0 0 0 2px var(--color-input-focus-ring);
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
  color: var(--color-accent);
  cursor: pointer;
  font-weight: 500;
}

.toggle-password:hover {
  text-decoration: underline;
}

/* ---------- Buttons ---------- */
.btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  border: none;
  color: white;
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-md);
  cursor: pointer;
  margin-top: 5px;
  transition: background var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.35);
}

.btn-primary:active {
  transform: translateY(0);
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
  color: var(--color-text-muted);
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}

/* ---------- Google Login Button ---------- */
.btn-google {
  margin-top: 10px;
  width: 100%;
  padding: 9px;
  border: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: var(--color-text-secondary);
  background: var(--color-card);
  transition: 0.2s;
}

.btn-google img {
  width: 20px;
  margin-right: 8px;
}

.btn-google:hover {
  background: var(--color-slate-50);
}

/* ---------- Secondary Button ---------- */
.btn-secondary {
  width: 100%;
  padding: 10px;
  background: var(--color-slate-200);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: 0.2s;
  margin-top: 10px;
}

.btn-secondary:hover {
  background: var(--color-slate-400);
  color: var(--color-slate-50);
}

.error-message {
  color: var(--color-error);
  margin-top: 10px;
}

@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
  }
  .login-brand {
    min-height: 200px;
    padding: 32px;
  }
  .brand-title { font-size: 24px; }
  .brand-tagline { font-size: 14px; }
}
</style>

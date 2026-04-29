<template>
  <div class="login-container">
    <div class="panel">
      <div class="grid-bg" aria-hidden="true"></div>
      <div class="glow" aria-hidden="true"></div>

      <div class="content-wrapper">
        <!-- Brand / welcome side -->
        <div class="welcome-text">
          <router-link to="/" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to home
          </router-link>
          <h1>Google<br><span class="accent">Indexing</span></h1>
          <p class="desc">
            Crawl your URLs and get them indexed on Google in hours, not weeks. Monitor pages, improve SEO, and stay discoverable — all from one dashboard.
          </p>
          <div class="feature-pills">
            <span>⚡ Sub-2 day indexing</span>
            <span>📊 Real-time monitoring</span>
            <span>🔁 Auto recrawls</span>
          </div>
        </div>

        <!-- Login card -->
        <div class="login-card">
          <span class="login-card__accent" aria-hidden="true"></span>

          <header class="login-card__head">
            <h2 class="title">Sign in</h2>
            <p class="subtitle">Please login to continue</p>
          </header>

          <div class="form-group">
            <label for="login-username">Username</label>
            <input
              id="login-username"
              v-model="username"
              type="text"
              placeholder="Enter username"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label for="login-password">Password</label>
            <div class="password-wrapper">
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password"
                autocomplete="current-password"
                @keyup.enter="handleLogin"
              />
              <button
                type="button"
                class="toggle"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'HIDE' : 'SHOW' }}
              </button>
            </div>
          </div>

          <div class="options">
            <label class="remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
          </div>

          <button class="btn-primary" @click="handleLogin">
            Sign in
            <svg
              class="btn-primary__arrow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>

          <div class="divider"><span>OR</span></div>

          <button class="btn-google" @click="handleGoogleLogin">
            <svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <p class="signup-text">
            Don't have an account?
            <span class="signup-link" @click="showRegister = true">Sign up</span>
          </p>

          <p v-if="errorMessage" class="error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </p>
        </div>
      </div>
    </div>

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
/* ===== Base ===== */
.login-container {
  min-height: 100vh;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  background-color: #fdfdfb;
  color: #0a0a0c;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  position: relative;
}

/* ===== Mesh gradient (same as homepage) ===== */
.panel {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-bg {
  position: fixed;
  top: -10%;
  left: -10%;
  width: 120vw;
  height: 120vh;
  z-index: 0;
  background:
    radial-gradient(circle at 30% 40%, rgba(66, 133, 244, 0.14) 0%, transparent 45%),
    radial-gradient(at 80% 20%, rgba(52, 168, 83, 0.10) 0px, transparent 50%),
    radial-gradient(at 20% 80%, rgba(251, 188, 5, 0.08) 0px, transparent 50%),
    radial-gradient(at 70% 80%, rgba(234, 67, 53, 0.08) 0px, transparent 50%),
    radial-gradient(at 50% 10%, rgba(66, 133, 244, 0.08) 0px, transparent 50%);
  filter: blur(72px);
  pointer-events: none;
}

.glow {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.03;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ===== Layout ===== */
.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 80px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 1020px;
  width: 100%;
  padding: 2rem;
}

/* ===== Welcome side ===== */
.welcome-text {
  max-width: 360px;
  display: flex;
  flex-direction: column;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #5f6368;
  text-decoration: none;
  margin-bottom: 2rem;
  transition: color 0.2s ease;
}
.back-link svg {
  width: 15px;
  height: 15px;
}
.back-link:hover { color: #0a0a0c; }

.welcome-text h1 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(2.4rem, 5vw, 3.4rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -3px;
  color: #0a0a0c;
  margin: 0;
}
.welcome-text h1 .accent {
  opacity: 0.38;
  font-weight: 400;
}

.desc {
  font-size: 1rem;
  color: #5f6368;
  line-height: 1.7;
  margin-top: 1.5rem;
  font-weight: 300;
}

.feature-pills {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 2rem;
}
.feature-pills span {
  font-size: 0.85rem;
  color: #5f6368;
  font-weight: 400;
}

/* ===== Login card (glass) ===== */
.login-card {
  position: relative;
  width: 400px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  padding: 2.5rem 2rem 2rem;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 20px 50px -12px rgba(50, 50, 93, 0.10),
    0 12px 24px -18px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.login-card__accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335);
  opacity: 0.7;
}

.login-card__head { margin-bottom: 1.75rem; }

.title {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #0a0a0c;
  margin: 0 0 4px;
}
.subtitle {
  font-size: 0.85rem;
  color: #5f6368;
  margin: 0;
}

/* ===== Form ===== */
.form-group { margin-bottom: 1rem; }

.form-group label {
  font-size: 0.82rem;
  font-weight: 500;
  color: #0a0a0c;
  display: block;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 13px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 12px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.7);
  color: #0a0a0c;
  font-family: inherit;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  box-sizing: border-box;
}
.form-group input::placeholder { color: #9aa0a6; }
.form-group input:focus {
  outline: none;
  border-color: #4285F4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.15);
  background: rgba(255, 255, 255, 0.9);
}

.password-wrapper { position: relative; }
.password-wrapper input { padding-right: 64px; }

.toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.07em;
  color: #5f6368;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 6px;
  font-family: inherit;
  transition: color 140ms ease, background 140ms ease;
}
.toggle:hover { color: #0a0a0c; background: rgba(0,0,0,0.05); }

.options {
  display: flex;
  margin-bottom: 1.25rem;
}
.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.82rem;
  color: #5f6368;
}
.remember input[type="checkbox"] {
  accent-color: #4285F4;
  width: 14px;
  height: 14px;
  cursor: pointer;
}

/* ===== Buttons ===== */
.btn-primary {
  width: 100%;
  padding: 11px;
  background: #0a0a0c;
  color: #ffffff;
  border: none;
  border-radius: 100px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 150ms ease, transform 80ms ease, box-shadow 150ms ease;
}
.btn-primary:hover {
  background: #2a2a2a;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); }

.btn-primary__arrow {
  width: 14px;
  height: 14px;
  opacity: 0.85;
  transition: transform 160ms ease;
}
.btn-primary:hover .btn-primary__arrow { transform: translateX(2px); }

/* ===== Divider ===== */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 1.25rem 0;
  color: #9aa0a6;
}
.divider::before, .divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(0,0,0,0.08);
}
.divider span {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ===== Google button ===== */
.btn-google {
  width: 100%;
  padding: 10px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 100px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.6);
  font-size: 0.92rem;
  font-weight: 500;
  color: #0a0a0c;
  font-family: inherit;
  transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 80ms ease;
}
.btn-google:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(66, 133, 244, 0.4);
  box-shadow: 0 4px 14px rgba(66, 133, 244, 0.1);
  transform: translateY(-1px);
}
.google-icon { width: 18px; height: 18px; flex-shrink: 0; }

/* ===== Signup ===== */
.signup-text {
  margin-top: 1.25rem;
  font-size: 0.82rem;
  text-align: center;
  color: #5f6368;
}
.signup-link {
  color: #0a0a0c;
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(0,0,0,0.2);
  transition: text-decoration-color 140ms ease, color 140ms ease;
  margin-left: 2px;
}
.signup-link:hover {
  color: #4285F4;
  text-decoration-color: #4285F4;
}

/* ===== Error ===== */
.error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 1rem;
  padding: 10px 12px;
  background: rgba(234, 67, 53, 0.06);
  border: 1px solid rgba(234, 67, 53, 0.2);
  border-radius: 10px;
  color: #c5221f;
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.45;
}
.error svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px; }

/* ===== Responsive ===== */
@media (max-width: 860px) {
  .content-wrapper { flex-direction: column; gap: 2.5rem; padding: 2rem 1.5rem; }
  .welcome-text { text-align: center; align-items: center; max-width: 480px; }
  .feature-pills { align-items: center; }
  .back-link { align-self: flex-start; }
}
@media (max-width: 480px) {
  .login-card { width: 100%; border-radius: 20px; padding: 2rem 1.5rem; }
  .welcome-text h1 { font-size: 2.4rem; }
}
</style>
<template>
  <div class="login-container">
    <div class="panel">
      <div class="grid-bg" aria-hidden="true"></div>
      <div class="glow" aria-hidden="true"></div>

      <div class="content-wrapper">
        <!-- Brand / welcome side -->
        <div class="welcome-text">
          <h1>WELCOME</h1>
          <p class="tagline">SITE BOOSTER</p>
          <p class="desc">
            Easily crawl your website URLs and get them indexed on Google. Monitor your pages, improve SEO, and ensure your content is discoverable all from a single powerful API.
          </p>
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
/* ============ Container ============ */
.login-container {
  height: 100vh;
  font-family: var(--font-family);
}

/* ============ Panel ============ */
.panel {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--neutral-950);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--neutral-0);
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 70% 70% at 50% 45%, #000 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 45%, #000 40%, transparent 100%);
  pointer-events: none;
}

.glow {
  position: absolute;
  width: 620px;
  height: 620px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%);
  top: 32%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  filter: blur(28px);
}

/* ============ Content ============ */
.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 88px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 1100px;
  padding: var(--space-5);
}

/* ============ Welcome side ============ */
.welcome-text {
  max-width: 380px;
  display: flex;
  flex-direction: column;
}
.welcome-text h1 {
  color: #ffffff;
  font-size: 36px;
  font-weight: var(--fw-bold);
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: 0;
}
.tagline {
  margin: var(--space-3) 0 0;
  font-size: 11px;
  font-weight: var(--fw-semi);
  letter-spacing: 0.22em;
  color: var(--accent-400);
  text-transform: uppercase;
}
.desc {
  font-size: var(--fs-md);
  color: rgba(255,255,255,0.65);
  line-height: 1.65;
  margin-top: var(--space-5);
  max-width: 38ch;
}

/* ============ Login card ============ */
.login-card {
  position: relative;
  width: 400px;
  background: var(--color-card-bg);
  padding: var(--space-7) var(--space-6) var(--space-6);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 28px 56px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}
.login-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-accent) 50%,
    transparent 100%
  );
  opacity: 0.85;
}

.login-card__head {
  margin-bottom: var(--space-6);
}
.title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tight);
  color: var(--color-text);
  margin: 0 0 4px;
}
.subtitle {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* ============ Form ============ */
.form-group { margin-bottom: var(--space-4); }
.form-group label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text);
  display: block;
  margin-bottom: 6px;
  letter-spacing: -0.005em;
}
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  background: var(--color-card-bg);
  color: var(--color-text);
  font-family: inherit;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
.form-group input::placeholder {
  color: var(--color-placeholder);
}
.form-group input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}

/* Password */
.password-wrapper { position: relative; }
.password-wrapper input { padding-right: 64px; }
.toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: var(--fw-semi);
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  transition: color 140ms ease, background 140ms ease;
}
.toggle:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

/* Options */
.options {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-sm);
  margin-bottom: var(--space-5);
  color: var(--color-text-secondary);
}
.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: var(--fs-sm);
  color: var(--color-text);
}
.remember input[type="checkbox"] {
  accent-color: var(--color-accent);
  width: 14px;
  height: 14px;
  cursor: pointer;
}

/* ============ Buttons ============ */
.btn-primary {
  width: 100%;
  padding: 11px;
  background: var(--neutral-900);
  color: #ffffff;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  font-size: var(--fs-base);
  cursor: pointer;
  transition: background 140ms ease, transform 60ms ease;
  letter-spacing: -0.005em;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary__arrow {
  width: 14px;
  height: 14px;
  opacity: 0.85;
  transition: transform 160ms ease;
}
.btn-primary:hover { background: var(--neutral-800); }
.btn-primary:hover .btn-primary__arrow { transform: translateX(2px); }
.btn-primary:active { transform: translateY(1px); }
.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--ring-accent);
}

/* ============ Divider ============ */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: var(--space-5) 0;
  color: var(--color-text-secondary);
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--color-border);
}
.divider span {
  font-size: 11px;
  font-weight: var(--fw-medium);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ============ Google button ============ */
.btn-google {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--color-card-bg);
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  color: var(--color-text);
  font-family: inherit;
  transition: background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
}
.btn-google:hover {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}
.btn-google:focus-visible {
  outline: none;
  box-shadow: var(--ring-accent);
}
.google-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* ============ Signup ============ */
.signup-text {
  margin-top: var(--space-5);
  font-size: var(--fs-sm);
  text-align: center;
  color: var(--color-text-secondary);
}
.signup-link {
  color: var(--color-text);
  cursor: pointer;
  font-weight: var(--fw-medium);
  text-decoration: underline;
  text-decoration-color: var(--color-border-strong);
  text-underline-offset: 3px;
  transition: text-decoration-color 140ms ease, color 140ms ease;
  margin-left: 2px;
}
.signup-link:hover {
  color: var(--color-accent);
  text-decoration-color: var(--color-accent);
}

/* ============ Error ============ */
.error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: var(--space-4);
  padding: 10px 12px;
  background: var(--danger-50);
  border: 1px solid var(--danger-100);
  border-radius: var(--radius-md);
  color: var(--danger-700);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: 1.45;
}
.error svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ============ Responsive ============ */
@media (max-width: 900px) {
  .content-wrapper {
    flex-direction: column;
    gap: var(--space-7);
  }
  .welcome-text {
    text-align: center;
    align-items: center;
    max-width: 480px;
  }
  .welcome-text h1 { font-size: 28px; }
  .desc { max-width: 100%; }
  .login-card { width: 100%; max-width: 400px; padding: var(--space-6); }
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--space-5) var(--space-4);
    border-radius: var(--radius-lg);
  }
  .welcome-text h1 { font-size: 24px; }
  .glow { width: 360px; height: 360px; }
}
</style>
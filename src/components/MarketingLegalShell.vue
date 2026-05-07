<template>
  <div class="legal-shell">
    <div class="legal-shell__mesh" aria-hidden="true"></div>
    <div class="legal-shell__grain" aria-hidden="true"></div>
    <div class="container">
      <header class="site-header">
        <router-link to="/" class="logo" aria-label="GoogleIndexing.com home">GoogleIndexing</router-link>
        <nav class="header-links">
          <router-link :to="{ path: '/', hash: '#features' }" class="hide-below-tablet">Features</router-link>
          <router-link :to="{ path: '/', hash: '#how-it-works' }" class="hide-below-tablet">How it works</router-link>
          <router-link :to="{ path: '/', hash: '#faq' }" class="hide-below-tablet">FAQ</router-link>
          <router-link :to="{ path: '/', hash: '#contact' }" class="hide-below-tablet">Contact</router-link>
          <router-link to="/pricing">Pricing</router-link>
          <router-link to="/login" class="cta-pill">Sign In</router-link>
        </nav>
      </header>

      <main class="legal-shell__main">
        <slot />
      </main>

      <footer class="legal-shell__footer">
        <p class="legal-shell__copy">&copy; 2026 GoogleIndexing.com</p>
        <p class="legal-shell__links">
          <router-link to="/terms">Terms</router-link>
          <span aria-hidden="true"> · </span>
          <router-link to="/privacy">Privacy</router-link>
          <span aria-hidden="true"> · </span>
          <router-link to="/pricing">Pricing</router-link>
          <span aria-hidden="true"> · </span>
          <router-link to="/">Home</router-link>
        </p>
        <p class="legal-shell__muted">
          Not affiliated with Google Inc. Questions:
          <a href="mailto:sales@nopbooster.com">sales@nopbooster.com</a>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.legal-shell {
  font-family: "Outfit", "Inter", system-ui, sans-serif;
  background: #fdfdfb;
  color: #0a0a0c;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.legal-shell__mesh {
  position: fixed;
  inset: -10% -10% auto auto;
  width: 120vw;
  height: 120vh;
  z-index: 0;
  background:
    radial-gradient(at 15% 20%, rgba(66, 133, 244, 0.12) 0px, transparent 45%),
    radial-gradient(at 85% 15%, rgba(52, 168, 83, 0.1) 0px, transparent 42%),
    radial-gradient(at 50% 60%, rgba(251, 188, 5, 0.06) 0px, transparent 50%),
    radial-gradient(at 10% 90%, rgba(234, 67, 53, 0.08) 0px, transparent 45%),
    radial-gradient(at 90% 85%, rgba(66, 133, 244, 0.1) 0px, transparent 45%);
  filter: blur(72px);
  pointer-events: none;
}

.legal-shell__grain {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.035;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.container {
  position: relative;
  z-index: 1;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  box-sizing: border-box;
}

.site-header {
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: "Syne", "Inter", sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  text-decoration: none;
  background: linear-gradient(45deg, #1a1a1a, #4a4a4a);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-links > a {
  white-space: nowrap;
  text-decoration: none;
  color: #0a0a0c;
  font-weight: 500;
  font-size: 0.9rem;
  transition: opacity 0.3s ease;
}

.header-links > a:not(.cta-pill):hover {
  opacity: 0.65;
}

.cta-pill {
  padding: 0.6rem 1.4rem;
  background: #0a0a0c !important;
  color: white !important;
  border-radius: 100px;
  transition: transform 0.3s ease, opacity 0.3s ease !important;
}

.cta-pill:hover {
  transform: translateY(-2px);
  opacity: 1 !important;
}

@media (max-width: 900px) {
  .hide-below-tablet {
    display: none !important;
  }
}

.legal-shell__main {
  padding: 1.5rem 0 3rem;
  max-width: 820px;
}

.legal-shell__footer {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  font-size: 0.85rem;
  color: #5f6368;
}

.legal-shell__copy {
  margin: 0 0 0.5rem;
}

.legal-shell__links {
  margin: 0 0 0.5rem;
}

.legal-shell__links a {
  color: #0a0a0c;
  text-decoration: none;
  font-weight: 500;
}

.legal-shell__links a:hover {
  text-decoration: underline;
}

.legal-shell__muted {
  margin: 0;
  font-size: 0.8rem;
  color: #9aa0a6;
}

.legal-shell__muted a {
  color: #4285f4;
  text-decoration: none;
}

.legal-shell__muted a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .container {
    padding: 0 1.25rem 3rem;
  }

  .header-links {
    gap: 0.85rem;
  }

  .cta-pill {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>

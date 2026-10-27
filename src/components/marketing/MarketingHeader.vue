<template>
  <header class="mk-header" :class="{ 'mk-header--open': menuOpen }">
    <router-link to="/" class="mk-logo" aria-label="GoogleIndexing.com home" @click="closeMenu">
      GoogleIndexing
    </router-link>

    <nav class="mk-nav" aria-label="Primary">
      <router-link
        v-for="link in anchorLinks"
        :key="link.hash"
        :to="{ path: '/', hash: link.hash }"
        class="mk-nav__link mk-nav__link--anchor"
      >
        {{ link.label }}
      </router-link>
      <router-link to="/pricing" class="mk-nav__link">Pricing</router-link>
      <router-link to="/login" class="mk-nav__cta">Sign In</router-link>

      <button
        type="button"
        class="mk-nav__toggle"
        :aria-expanded="menuOpen"
        aria-controls="mk-mobile-menu"
        :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        @click="menuOpen = !menuOpen"
      >
        <svg v-if="!menuOpen" viewBox="0 0 24 24" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>
    </nav>

    <transition name="mk-menu">
      <div v-if="menuOpen" id="mk-mobile-menu" class="mk-mobile">
        <router-link
          v-for="link in anchorLinks"
          :key="link.hash"
          :to="{ path: '/', hash: link.hash }"
          class="mk-mobile__link"
          @click="closeMenu"
        >
          {{ link.label }}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </router-link>
        <router-link to="/pricing" class="mk-mobile__link" @click="closeMenu">
          Pricing
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </router-link>
        <div class="mk-mobile__actions">
          <router-link to="/login" class="mk-mobile__secondary" @click="closeMenu">Sign in</router-link>
          <router-link to="/signup" class="mk-mobile__primary" @click="closeMenu">Start free</router-link>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const anchorLinks = [
  { label: 'Features', hash: '#features' },
  { label: 'How it works', hash: '#how-it-works' },
  { label: 'Reliability', hash: '#reliability' },
  { label: 'FAQ', hash: '#faq' },
  { label: 'Contact', hash: '#contact' },
]

const menuOpen = ref(false)
const route = useRoute()

const closeMenu = () => {
  menuOpen.value = false
}

watch(() => route.fullPath, closeMenu)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMenu()
}

const mq = window.matchMedia('(min-width: 901px)')
const onMediaChange = () => {
  if (mq.matches) closeMenu()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  mq.addEventListener('change', onMediaChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  mq.removeEventListener('change', onMediaChange)
})
</script>

<style scoped>
.mk-header {
  position: relative;
  z-index: 50; /* above animated hero siblings so the phone menu panel paints on top */
  min-height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.mk-logo {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(45deg, #1a1a1a, #4a4a4a);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  flex-shrink: 0;
}

.mk-nav {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex: 1 1 auto;
  min-width: 0;
  justify-content: flex-end;
}

.mk-nav__link {
  white-space: nowrap;
  text-decoration: none;
  color: #0a0a0c;
  font-weight: 500;
  font-size: 0.9rem;
  transition: opacity 0.25s ease;
}

.mk-nav__link:hover {
  opacity: 0.65;
}

.mk-nav__cta {
  padding: 0.6rem 1.4rem;
  background: #0a0a0c;
  color: #fff;
  border-radius: 100px;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.mk-nav__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
}

.mk-nav__toggle {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(10, 10, 12, 0.12);
  background: rgba(255, 255, 255, 0.7);
  color: #0a0a0c;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mk-nav__toggle svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.mk-mobile {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(10, 10, 12, 0.08);
  border-radius: 20px;
  padding: 0.5rem;
  box-shadow: 0 24px 60px -20px rgba(15, 23, 42, 0.25);
}

.mk-mobile__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 0.9rem;
  border-radius: 12px;
  color: #0a0a0c;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
}

.mk-mobile__link:hover {
  background: rgba(66, 133, 244, 0.08);
}

.mk-mobile__link svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: #9aa0a6;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mk-mobile__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.5rem 0.4rem 0.4rem;
  border-top: 1px solid rgba(10, 10, 12, 0.06);
  margin-top: 0.35rem;
}

.mk-mobile__secondary,
.mk-mobile__primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1rem;
  border-radius: 100px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
}

.mk-mobile__secondary {
  border: 1.5px solid rgba(10, 10, 12, 0.14);
  color: #0a0a0c;
}

.mk-mobile__primary {
  background: #0a0a0c;
  color: #fff;
}

.mk-menu-enter-active,
.mk-menu-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.mk-menu-enter-from,
.mk-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 900px) {
  .mk-nav {
    gap: 0.6rem;
    flex: 0 0 auto;
  }

  .mk-logo {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mk-nav__link--anchor {
    display: none;
  }

  .mk-nav__toggle {
    display: inline-flex;
  }

  .mk-nav__cta {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 600px) {
  .mk-header {
    min-height: 60px;
  }

  .mk-logo {
    font-size: 1.15rem;
    letter-spacing: -0.5px;
  }

  /* Pricing lives in the menu on phones; keep only Sign In + menu in the bar. */
  .mk-nav__link {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mk-menu-enter-active,
  .mk-menu-leave-active {
    transition: none;
  }
}
</style>

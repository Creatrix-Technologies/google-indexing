<!--
  SettingsLayout
  ─────────────────────────────────────────────────────────────
  Shared chrome for all settings sub-pages. Provides:
    • Breadcrumb header (Settings / <current section>)
    • Left-rail navigation for all settings sections
    • Slot for the section's content
  The nav is dynamic: it reads from the menu store and shows
  only sections the current user has permission to access.
-->
<template>
  <div class="settings-shell">
    <!-- Header / breadcrumb -->
    <header class="settings-shell__header">
      <div class="settings-shell__crumb">
        <span class="crumb-root">Configurations</span>
        <svg
          v-if="currentSection"
          class="crumb-sep"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span v-if="currentSection" class="crumb-current">
          {{ currentSection.title }}
        </span>
      </div>
      <p v-if="currentSection" class="settings-shell__desc">
        {{ currentSection.desc }}
      </p>
    </header>

    <div class="settings-shell__body">
      <!-- Left rail -->
      <aside class="settings-nav" aria-label="Settings sections" v-if="sections.length">
        <router-link
          v-for="s in sections"
          :key="s.path"
          :to="s.path"
          class="settings-nav__item"
          active-class="settings-nav__item--active"
        >
          <span class="settings-nav__icon" v-html="s.icon" aria-hidden="true"></span>
          <span class="settings-nav__copy">
            <span class="settings-nav__title">{{ s.title }}</span>
            <span class="settings-nav__desc">{{ s.desc }}</span>
          </span>
        </router-link>
      </aside>

      <!-- Section content -->
      <main class="settings-shell__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore, type Menu } from '../Store/menu'

interface SectionMeta {
  title: string
  desc: string
  icon: string
}

const SECTION_META: Record<string, SectionMeta> = {
  GoogleConfiguration: {
    title: 'Google Configuration',
    desc: 'Service account credentials for Google Search Console and the Indexing API.',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
      </svg>`
  },
  GoogleKeys: {
    title: 'Google OAuth',
    desc: 'OAuth client credentials used for user sign-in.',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>`
  },
  StripeKeys: {
    title: 'Stripe',
    desc: 'API keys and webhook secret for payment processing.',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>`
  }
}

const SECTION_ORDER = [
  'GoogleConfiguration',
  'GoogleKeys',
  'StripeKeys'
]

interface SectionItem {
  component: string
  path: string
  title: string
  desc: string
  icon: string
}

const route = useRoute()
const menuStore = useMenuStore()

const flatMenus = computed<Menu[]>(() => {
  const flat: Menu[] = []
  const walk = (items?: Menu[]) => {
    for (const item of items || []) {
      flat.push(item)
      if (item.children?.length) walk(item.children)
    }
  }
  walk(menuStore.menus)
  return flat
})

const sections = computed<SectionItem[]>(() => {
  const items: SectionItem[] = []
  for (const compName of SECTION_ORDER) {
    const meta = SECTION_META[compName]
    if (!meta) continue
    const menu = flatMenus.value.find(m => m.component === compName)
    if (!menu?.path) continue
    items.push({
      component: compName,
      path: menu.path,
      title: meta.title,
      desc: meta.desc,
      icon: meta.icon
    })
  }
  return items
})

const currentSection = computed<SectionItem | null>(() => {
  const name = route.name as string | undefined
  if (!name) return null
  const found = sections.value.find(s => s.component === name)
  if (found) return found
  const meta = SECTION_META[name]
  if (meta) {
    return { component: name, path: route.path, ...meta }
  }
  return null
})
</script>

<style scoped>
.settings-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  font-family: var(--font-family);
  min-height: 100%;
  gap: var(--space-5);
}

/* ============ Header ============ */
.settings-shell__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.settings-shell__crumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
}
.crumb-root {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  letter-spacing: -0.005em;
}
.crumb-sep {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: var(--color-text-secondary);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.7;
}
.crumb-current {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: var(--letter-tighter);
  line-height: 1.15;
}
.settings-shell__desc {
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 64ch;
}

/* ============ Body ============ */
.settings-shell__body {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: var(--space-5);
  align-items: flex-start;
  flex: 1;
  min-height: 0;
}

/* ============ Left rail ============ */
.settings-nav {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: sticky;
  top: 0;
  box-shadow: var(--shadow-xs);
}

.settings-nav__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid transparent;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.settings-nav__item:hover {
  background: var(--neutral-50);
}
.settings-nav__item--active {
  background: var(--neutral-100);
  border-color: var(--color-border);
}

.settings-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  color: var(--neutral-600);
}
.settings-nav__item--active .settings-nav__icon {
  background: var(--color-accent);
  color: var(--color-accent-fg);
  border-color: var(--color-accent);
}
.settings-nav__icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.settings-nav__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.settings-nav__title {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: -0.005em;
  line-height: 1.3;
}
.settings-nav__desc {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  line-height: 1.4;
  font-weight: var(--fw-regular);
}
.settings-nav__item--active .settings-nav__title {
  color: var(--color-text);
}

/* ============ Main content ============ */
.settings-shell__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ============ Responsive ============ */
@media (max-width: 960px) {
  .settings-shell__body {
    grid-template-columns: 1fr;
  }
  .settings-nav {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
  }
  .settings-nav__item {
    flex: 1 1 calc(50% - 6px);
    min-width: 0;
  }
}

@media (max-width: 540px) {
  .settings-nav__item {
    flex: 1 1 100%;
  }
  .crumb-current {
    font-size: var(--fs-xl);
  }
}
</style>

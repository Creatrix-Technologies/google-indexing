<!--
  Settings hub page.
  Used when the user lands on the bare /settings route. Renders an
  overview grid that links into each available settings section.
  Each individual settings sub-page (GoogleConfiguration, ScheduleConfiguration,
  GoogleKeys, StripeKeys) wraps its own content in <SettingsLayout> so the
  shell + nav rail remain consistent across all settings views.
-->
<template>
  <div class="settings-overview">
    <header class="settings-overview__header">
      <h1>Configurations</h1>
      <p class="settings-overview__desc">
        Manage your workspace integrations, authentication, and billing keys.
      </p>
    </header>

    <div class="settings-overview__grid" v-if="sections.length">
      <router-link
        v-for="s in sections"
        :key="s.path"
        :to="s.path"
        class="settings-overview__card"
      >
        <span class="settings-overview__icon" v-html="s.icon" aria-hidden="true"></span>
        <span class="settings-overview__copy">
          <span class="settings-overview__title">{{ s.title }}</span>
          <span class="settings-overview__sub">{{ s.desc }}</span>
        </span>
        <svg
          class="settings-overview__arrow"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </router-link>
    </div>

    <div class="settings-overview__empty" v-else>
      <p>No settings sections are available for your account.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
</script>

<style scoped>
.settings-overview {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  background: var(--color-background);
  font-family: var(--font-family);
  min-height: 100%;
}

.settings-overview__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.settings-overview__header h1 {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  color: var(--color-text);
  margin: 0;
  line-height: 1.15;
}
.settings-overview__desc {
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 64ch;
}

.settings-overview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-3);
}

.settings-overview__card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: var(--space-4);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
  box-shadow: var(--shadow-xs);
}
.settings-overview__card:hover {
  border-color: var(--neutral-400);
  box-shadow: var(--shadow-sm);
}
.settings-overview__card:hover .settings-overview__arrow {
  transform: translateX(2px);
  color: var(--color-text);
}

.settings-overview__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--neutral-50);
  color: var(--neutral-600);
  border: 1px solid var(--color-border);
}
.settings-overview__icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.settings-overview__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.settings-overview__title {
  font-size: var(--fs-base);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: -0.005em;
  line-height: 1.3;
}
.settings-overview__sub {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.settings-overview__arrow {
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
  transition: transform 160ms ease, color 160ms ease;
  flex-shrink: 0;
  margin-top: 10px;
}

.settings-overview__empty {
  padding: var(--space-6);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
  background: var(--color-card-bg);
}
</style>

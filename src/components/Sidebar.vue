<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <!-- Brand -->
    <div class="brand">
      <div class="brand-mark">
        <div class="logo-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div v-if="!collapsed" class="logo-copy">
          <span class="logo-text">GoogleIndexing.com</span>
          <span class="logo-subtext">Admin Console</span>
        </div>
      </div>
      <button
        type="button"
        class="rail-toggle"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggleRail"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-if="collapsed" d="m9 18 6-6-6-6" />
          <path v-else d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>

    <!-- Menu -->
    <nav id="app-sidebar-nav" class="menu" aria-label="Primary">
      <button
        v-if="collapsed"
        type="button"
        class="menu-item menu-expand-item"
        title="Expand sidebar"
        @click="toggleRail"
      >
        <span class="menu-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </button>

      <p v-if="!collapsed" class="menu-section-label">Navigation</p>

      <template v-for="menu in visibleMenus" :key="menu.id">
        <div class="menu-row">

          <!-- Menu with children (expanded sidebar) -->
          <div
            v-if="menu.children && menu.children.length > 0 && !collapsed"
            class="menu-group"
          >
            <button
              type="button"
              class="menu-item menu-trigger"
              :class="{ 'is-open': openMenus.includes(menu.id), active: hasActiveChild(menu) }"
              @click="toggleSubmenu(menu.id)"
              :aria-expanded="openMenus.includes(menu.id)"
            >
              <span class="menu-icon" aria-hidden="true" v-html="iconFor(menu)"></span>
              <span class="menu-label">{{ cleanTitle(menu.title) }}</span>
              <span class="menu-meta-pill">{{ menu.children.length }}</span>
              <svg
                class="arrow"
                :class="{ open: openMenus.includes(menu.id) }"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div v-if="openMenus.includes(menu.id)" class="submenu">
              <router-link
                v-for="child in menu.children"
                :key="child.id"
                :to="child.path"
                class="submenu-item"
                active-class="active-sub"
              >
                <span class="submenu-bullet" aria-hidden="true"></span>
                <span class="menu-label">{{ cleanTitle(child.title) }}</span>
              </router-link>
            </div>
          </div>

          <!-- Parent with children (collapsed sidebar): expand rail to pick a child -->
          <button
            v-else-if="menu.children && menu.children.length > 0 && collapsed"
            type="button"
            class="menu-item"
            :class="{ active: hasActiveChild(menu) }"
            :title="cleanTitle(menu.title)"
            @click="expandFromCollapsedGroup(menu.id)"
          >
            <span class="menu-icon" aria-hidden="true" v-html="iconFor(menu)"></span>
          </button>

          <!-- Leaf: no children -->
          <router-link
            v-else
            :to="menu.path"
            class="menu-item"
            active-class="active"
            :title="collapsed ? cleanTitle(menu.title) : undefined"
          >
            <span class="menu-icon" aria-hidden="true" v-html="iconFor(menu)"></span>
            <span v-if="!collapsed" class="menu-label">{{ cleanTitle(menu.title) }}</span>
          </router-link>

        </div>
      </template>

      <p v-if="visibleMenus.length === 0" class="menu-empty" role="status">
        No menu items
      </p>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue"
import { useRoute } from "vue-router"
import { useMenuStore, type Menu } from "../Store/menu"

const props = defineProps({
  collapsed: Boolean
})

const emit = defineEmits<{
  "update:collapsed": [value: boolean]
}>()

const route = useRoute()
const menuStore = useMenuStore()

/** Matches configuration pages; backend often persists ShowInMenu = false — still surface in sidebar when role allows. */
const SETTINGS_MENU_COMPONENTS = new Set([
  'Settings',
  'Configurations',
  'GoogleConfiguration',
  'ScheduleConfiguration',
  'GoogleKeys',
  'StripeKeys',
  'EmailSettings',
])

const openMenus = ref<number[]>([])

/** Stable ordering for API / persisted menu trees */
const sortMenus = (items: Menu[]): Menu[] =>
  [...items]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => ({
      ...m,
      children: m.children?.length ? sortMenus(m.children) : undefined,
    }))

const visibleMenus = computed<Menu[]>(() => {
  const raw =
    menuStore.menus?.length > 0
      ? menuStore.menus
      : loadMenusFromLegacyStorage()
  return sortMenus(raw).filter((m) => {
    if (m.showInMenu !== false) return true
    if (Array.isArray(m.children) && m.children.length > 0) {
      const walkChildren = (items: Menu[]): boolean =>
        items.some(
          (c) =>
            SETTINGS_MENU_COMPONENTS.has(c.component || '') ||
            (c.children?.length ? walkChildren(c.children) : false)
        )
      return walkChildren(m.children)
    }
    return SETTINGS_MENU_COMPONENTS.has(m.component || '')
  })
})

function loadMenusFromLegacyStorage(): Menu[] {
  try {
    const menuData = localStorage.getItem("menu")
    if (!menuData) return []
    const parsed = JSON.parse(menuData)
    return parsed.menus || []
  } catch {
    return []
  }
}

onMounted(() => {
  if (!menuStore.loaded || menuStore.menus.length === 0) {
    const legacy = loadMenusFromLegacyStorage()
    if (legacy.length) menuStore.setMenus(sortMenus(legacy))
  }
  syncOpenMenusForRoute(route.path)
})

const pathMatches = (current: string, itemPath: string) => {
  if (!itemPath) return false
  if (current === itemPath) return true
  /* Section roots: highlight parent when drilling into nested routes */
  if (itemPath !== "/" && current.startsWith(itemPath + "/")) return true
  return false
}

const syncOpenMenusForRoute = (currentPath: string) => {
  const next = new Set<number>()
  for (const m of visibleMenus.value) {
    if (!m.children?.length) continue
    const hit = m.children.some((c) => pathMatches(currentPath, c.path || ""))
    if (hit) next.add(m.id)
  }
  openMenus.value = [...next]
}

watch(
  () => route.path,
  (p) => syncOpenMenusForRoute(p)
)

const hasActiveChild = (menu: Menu) =>
  !!menu.children?.some((c) => pathMatches(route.path, c.path || ""))

const toggleSubmenu = (id: number) => {
  if (openMenus.value.includes(id)) {
    openMenus.value = openMenus.value.filter((mid) => mid !== id)
  } else {
    openMenus.value.push(id)
  }
}

const expandFromCollapsedGroup = async (id: number) => {
  emit("update:collapsed", false)
  await nextTick()
  if (!openMenus.value.includes(id)) openMenus.value.push(id)
}

const toggleRail = () => {
  emit("update:collapsed", !props.collapsed)
}

/* =========================================================================
   Icon system
   ---------------------------------------------------------------------------
   Source data may store legacy emoji glyphs in `menu.icon` or `menu.title`.
   We render uniform Lucide-style SVGs by mapping on a normalized title/path.
   No data is mutated; this is presentation-only.
   ========================================================================= */

const SVG_ATTRS =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"'

const ICONS: Record<string, string> = {
  dashboard:
    `<svg ${SVG_ATTRS}><rect width="7" height="9" x="3" y="3" rx="1.5"/>` +
    `<rect width="7" height="5" x="14" y="3" rx="1.5"/>` +
    `<rect width="7" height="9" x="14" y="12" rx="1.5"/>` +
    `<rect width="7" height="5" x="3" y="16" rx="1.5"/></svg>`,
  sites:
    `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/>` +
    `<path d="M3 12h18"/>` +
    `<path d="M12 3a14 14 0 0 1 0 18"/>` +
    `<path d="M12 3a14 14 0 0 0 0 18"/></svg>`,
  crawl:
    `<svg ${SVG_ATTRS}><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>`,
  subscriptions:
    `<svg ${SVG_ATTRS}><rect width="20" height="14" x="2" y="5" rx="2"/>` +
    `<path d="M2 10h20"/>` +
    `<path d="M6 15h2"/></svg>`,
  settings:
    `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="3"/>` +
    `<path d="M19.4 15a1.7 1.7 0 0 0 .35 1.86l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.86-.35 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.86.35l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .35-1.86 1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.04 1.7 1.7 0 0 0-.35-1.86l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.86.35h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56h.01a1.7 1.7 0 0 0 1.86-.35l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.35 1.86v.01A1.7 1.7 0 0 0 20.91 10H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/></svg>`,
  users:
    `<svg ${SVG_ATTRS}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>` +
    `<circle cx="9" cy="7" r="4"/>` +
    `<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>` +
    `<path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  plans:
    `<svg ${SVG_ATTRS}><path d="m7.5 4.27 9 5.15"/>` +
    `<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>` +
    `<path d="M3.3 7 12 12l8.7-5"/>` +
    `<path d="M12 22V12"/></svg>`,
  google:
    `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/>` +
    `<path d="M21 12c0-2-1-3-1-3h-9v3h5.5c-.5 2-2 3-5.5 3a5 5 0 1 1 0-10c1.5 0 2.7.5 3.7 1.4"/></svg>`,
  stripe:
    `<svg ${SVG_ATTRS}><path d="M14 7a3 3 0 0 0-3-3H8a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H8a3 3 0 0 1-3-3"/>` +
    `<path d="M9 4v16"/></svg>`,
  schedule:
    `<svg ${SVG_ATTRS}><rect width="18" height="16" x="3" y="5" rx="2"/>` +
    `<path d="M3 9h18"/>` +
    `<path d="M8 3v4"/>` +
    `<path d="M16 3v4"/></svg>`,
  notifications:
    `<svg ${SVG_ATTRS}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>` +
    `<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  fallback:
    `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="2.25"/></svg>`
}

const stripEmoji = (s: string): string =>
  (s || "")
    .replace(
      /([\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u26FF\u2300-\u23FF\u2B00-\u2BFF\u200D\uFE0F])+/g,
      ""
    )
    .trim()

const cleanTitle = (s: string): string => stripEmoji(s)

const iconKey = (m: any): string => {
  const t = stripEmoji(m?.title || "").toLowerCase()
  const p = (m?.path || m?.component || "").toLowerCase()
  const blob = `${t} ${p}`

  if (/dashboard|overview|home/.test(blob)) return "dashboard"
  if (/google.*config|google.*key|google.*credentials/.test(blob)) return "google"
  if (/stripe/.test(blob)) return "stripe"
  if (/smtp|mailto/.test(blob)) return "settings"
  if (/schedule/.test(blob)) return "schedule"
  if (/notification/.test(blob)) return "notifications"
  if (/plan/.test(blob)) return "plans"
  if (/subscription|billing|payment/.test(blob)) return "subscriptions"
  if (/setting|configuration|config/.test(blob)) return "settings"
  if (/user|member|account/.test(blob)) return "users"
  if (/crawl|index|queue/.test(blob)) return "crawl"
  if (/site|domain|web/.test(blob)) return "sites"

  return "fallback"
}

const iconFor = (m: any): string => ICONS[iconKey(m) as keyof typeof ICONS] ?? ICONS.fallback!
</script>

<style scoped>
/* ----------------- Sidebar shell ----------------- */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width, 240px);
  height: 100vh;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  transition: width 240ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 240ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: var(--z-sidebar);
  font-family: var(--font-family);
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed, 64px);
}

/* ----------------- Brand area (top) ----------------- */
.brand {
  height: var(--header-height, 56px);
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--sidebar-border);
}

.sidebar.collapsed .brand {
  padding: 0;
  justify-content: center;
}

.sidebar.collapsed .brand-mark {
  width: 100%;
  justify-content: center;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.logo-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.logo-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--accent-500), var(--accent-700));
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.14) inset,
              0 0 0 1px rgba(0, 0, 0, 0.30);
}

.logo-icon svg {
  width: 16px;
  height: 16px;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tight);
  color: var(--sidebar-text-strong);
}

.logo-subtext {
  margin-top: 1px;
  font-size: 10.5px;
  color: var(--sidebar-text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.rail-toggle {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--sidebar-border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--sidebar-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
}

.rail-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--sidebar-text-strong);
  border-color: rgba(255, 255, 255, 0.28);
}

.rail-toggle svg {
  width: 14px;
  height: 14px;
}

.sidebar.collapsed .rail-toggle {
  display: none;
}

/* ----------------- Menu (scrollable) ----------------- */
.menu {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-4) var(--space-3) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.menu-empty {
  margin: var(--space-4) 10px;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px dashed var(--sidebar-border);
  font-size: var(--fs-sm);
  color: var(--sidebar-text-muted);
  text-align: center;
}

.sidebar.collapsed .menu {
  padding: var(--space-4) var(--space-2) var(--space-5);
  align-items: center;
}

.menu::-webkit-scrollbar { width: 6px; }
.menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
}
.menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.14);
}

.menu-section-label {
  margin: 0 0 var(--space-2);
  padding: 0 10px;
  font-size: 10.5px;
  font-weight: var(--fw-semi);
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: var(--sidebar-text-muted);
}

.menu-row {
  display: contents;
}

/* ----------------- Items ----------------- */
.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 10px;
  border-radius: var(--radius-md);
  color: var(--sidebar-text);
  text-decoration: none;
  cursor: pointer;
  font-size: var(--fs-base);
  font-weight: var(--fw-regular);
  gap: 11px;
  white-space: nowrap;
  transition: background 140ms ease, color 140ms ease;
  width: 100%;
  background: transparent;
  border: 0;
  font-family: inherit;
  text-align: left;
}

.sidebar.collapsed .menu-item {
  width: 40px;
  height: 40px;
  padding: 0;
  justify-content: center;
  gap: 0;
}

.menu-item:hover:not(.active) {
  background: rgba(255, 255, 255, 0.045);
  color: var(--sidebar-text-strong);
}

.menu-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.55);
}

.menu-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-fg);
  font-weight: var(--fw-medium);
}

.menu-expand-item {
  margin-bottom: 6px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(180deg, rgba(79, 70, 229, 0.95), rgba(67, 56, 202, 0.95));
  color: #fff;
}

.menu-expand-item:hover {
  background: linear-gradient(180deg, rgba(99, 102, 241, 1), rgba(79, 70, 229, 1));
  color: #fff;
}

.menu-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--sidebar-active-bar);
}

.sidebar.collapsed .menu-item.active::before {
  left: -8px;
}

.menu-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-text-muted);
  transition: color 140ms ease;
}

.menu-icon :deep(svg) {
  width: 18px;
  height: 18px;
  stroke-width: 1.75;
}

.menu-item.active .menu-icon,
.menu-item:hover .menu-icon,
.menu-trigger.is-open .menu-icon {
  color: var(--sidebar-text-strong);
}

.sidebar.collapsed .menu-icon :deep(svg) {
  width: 19px;
  height: 19px;
}

.menu-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  letter-spacing: -0.003em;
}

.menu-meta-pill {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--sidebar-text-muted);
  background: rgba(255, 255, 255, 0.03);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--fw-medium);
}

.menu-trigger.active .menu-meta-pill,
.menu-trigger:hover .menu-meta-pill,
.menu-trigger.is-open .menu-meta-pill {
  color: var(--sidebar-text-strong);
  border-color: rgba(255, 255, 255, 0.22);
}

/* ----------------- Group / submenu ----------------- */
.menu-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.menu-trigger.is-open {
  color: var(--sidebar-text-strong);
}

.submenu {
  position: relative;
  margin: 4px 0 6px 19px;
  padding: 2px 0 2px var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.submenu::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: rgba(255, 255, 255, 0.10);
}

.submenu-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: var(--fs-sm);
  font-weight: var(--fw-regular);
  gap: 10px;
  white-space: nowrap;
  transition: background 140ms ease, color 140ms ease;
}

.submenu-item:hover:not(.active-sub) {
  color: var(--sidebar-text-strong);
  background: rgba(255, 255, 255, 0.05);
}

.submenu-item.active-sub {
  color: var(--sidebar-text-strong);
  font-weight: var(--fw-medium);
  background: var(--sidebar-active-bg);
}

.submenu-item.active-sub::before {
  content: "";
  position: absolute;
  left: -16px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  border-radius: 2px;
  background: var(--sidebar-active-bar);
}

.submenu-bullet {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.45;
  flex-shrink: 0;
  transition: background 140ms ease, opacity 140ms ease, transform 140ms ease;
}

.submenu-item:hover .submenu-bullet { opacity: 0.8; }
.submenu-item.active-sub .submenu-bullet {
  background: var(--sidebar-active-bar);
  opacity: 1;
  transform: scale(1.2);
}

/* ----------------- Arrow (group toggle) ----------------- */
.arrow {
  margin-left: auto;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  opacity: 0.55;
  transition: transform 200ms ease, opacity 140ms ease;
}

.menu-trigger:hover .arrow { opacity: 0.9; }
.arrow.open {
  transform: rotate(180deg);
  opacity: 1;
}

/* Drawer layout — sync breakpoint with DefaultLayout DRAWER_BREAKPOINT_PX */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    width: min(86vw, 320px);
    box-shadow: 8px 0 32px rgba(15, 23, 42, 0.18);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>

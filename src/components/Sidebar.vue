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
        <span v-if="!collapsed" class="logo-text">Site Booster</span>
      </div>
    </div>

    <!-- Menu -->
    <nav class="menu" aria-label="Primary">
      <p v-if="!collapsed" class="menu-section-label">Main</p>

      <template v-for="menu in menus" :key="menu.id">
        <div v-if="menu.showInMenu" class="menu-row">

          <!-- Menu with children -->
          <div
            v-if="menu.children && menu.children.length > 0 && !collapsed"
            class="menu-group"
          >
            <button
              type="button"
              class="menu-item menu-trigger"
              :class="{ 'is-open': openMenus.includes(menu.id) }"
              @click="toggleSubmenu(menu.id)"
              :aria-expanded="openMenus.includes(menu.id)"
            >
              <span class="menu-icon" aria-hidden="true" v-html="iconFor(menu)"></span>
              <span class="menu-label">{{ cleanTitle(menu.title) }}</span>
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

          <!-- Menu without children -->
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
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps({
  collapsed: Boolean,
  isMobile: Boolean
});

const emit = defineEmits(["update:collapsed"]);

const menus = ref<any[]>([]);
const openMenus = ref<number[]>([]);

const toggleSubmenu = (id: number) => {
  if (openMenus.value.includes(id)) {
    openMenus.value = openMenus.value.filter(mid => mid !== id);
  } else {
    openMenus.value.push(id);
  }
};

onMounted(() => {
  const menuData = localStorage.getItem("menu");
  if (menuData) {
    const parsed = JSON.parse(menuData);
    menus.value = parsed.menus || [];
  }
});

/* =========================================================================
   Icon system
   ---------------------------------------------------------------------------
   Source data may store legacy emoji glyphs in `menu.icon` or `menu.title`.
   We render uniform Lucide-style SVGs by mapping on a normalized title/path.
   No data is mutated; this is presentation-only.
   ========================================================================= */

const SVG_ATTRS =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

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
};

const stripEmoji = (s: string): string =>
  (s || "")
    .replace(
      /([\u2700-\u27BF\uE000-\uF8FF\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u26FF\u2300-\u23FF\u2B00-\u2BFF\u200D\uFE0F])+/g,
      ""
    )
    .trim();

const cleanTitle = (s: string): string => stripEmoji(s);

const iconKey = (m: any): string => {
  const t = stripEmoji(m?.title || "").toLowerCase();
  const p = (m?.path || m?.component || "").toLowerCase();
  const blob = `${t} ${p}`;

  if (/dashboard|overview|home/.test(blob)) return "dashboard";
  if (/google.*config|google.*key|google.*credentials/.test(blob)) return "google";
  if (/stripe/.test(blob)) return "stripe";
  if (/schedule/.test(blob)) return "schedule";
  if (/notification/.test(blob)) return "notifications";
  if (/plan/.test(blob)) return "plans";
  if (/subscription|billing|payment/.test(blob)) return "subscriptions";
  if (/setting|configuration|config/.test(blob)) return "settings";
  if (/user|member|account/.test(blob)) return "users";
  if (/crawl|index|queue/.test(blob)) return "crawl";
  if (/site|domain|web/.test(blob)) return "sites";

  return "fallback";
};

const iconFor = (m: any): string => ICONS[iconKey(m)] || ICONS.fallback;
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
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--sidebar-border);
}

.sidebar.collapsed .brand {
  padding: 0;
  justify-content: center;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: var(--space-3);
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
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tight);
  color: var(--sidebar-text-strong);
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
  /* Vertical rail aligns with the icon center of the parent item.
     Parent: 10px padding + 18px icon = icon center at 19px.
     Submenu margin-left: 19px places the rail along that center line. */
  position: relative;
  margin: 4px 0 6px 19px;
  padding: 2px 0 2px var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* Visible rail running through the group, slightly brighter than the
   sidebar border so it's perceivable on the dark surface. */
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

/* Left-edge accent mark on active submenu item: a 2px segment that
   "punches through" the rail to indicate selection. */
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

/* ----------------- Mobile ----------------- */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: var(--sidebar-width, 240px);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>

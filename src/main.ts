import { createApp, nextTick } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "sweetalert2/dist/sweetalert2.min.css";
import "./style.css";

// Notifications
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// Axios
import api, { refreshApi } from './api';

// Pinia
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Stores
import { useAuthStore } from './Store/auth';
import { useEntitlementsStore } from './Shared/entitlements'
import { useMenuStore } from './Store/menu';

// Dynamic routes
import { buildRoutes } from './Router/dynamicRoutes';

import { enhanceSalesMailtoLinks } from './utils/enhanceSalesMailto'
/* ---------------- ROUTES ---------------- */

import seo from './seo/publicPages.json'

const SITE_URL = seo.siteUrl;
type SeoPath = keyof typeof seo.pages;
/** Route meta for public marketing pages, from the same file the build uses to write static HTML. */
const seoMeta = (path: SeoPath) => {
  const page = seo.pages[path];
  return { public: true, title: page.title, description: page.description, canonical: `${SITE_URL}${path === '/' ? '/' : path}`, robots: page.robots };
};
const DEFAULT_TITLE = 'GoogleIndexing.com | Google SEO Indexing API Automation';
const DEFAULT_DESCRIPTION =
  "GoogleIndexing.com helps SEO teams crawl URLs, submit indexing signals through Google's official Indexing API, monitor coverage, and automate scheduled recrawls.";

const routes = [
  {
    path: "/",
    component: () => import("./pages/Home.vue"),
    meta: seoMeta('/')
  },
  {
    path: "/pricing",
    component: () => import("./pages/Pricing.vue"),
    meta: seoMeta('/pricing')
  },
  {
    path: "/tools/indexability-checker",
    component: () => import("./pages/IndexabilityChecker.vue"),
    meta: seoMeta('/tools/indexability-checker')
  },
  {
    path: "/terms",
    component: () => import("./pages/TermsOfService.vue"),
    meta: seoMeta('/terms')
  },
  {
    path: "/privacy",
    component: () => import("./pages/PrivacyPolicy.vue"),
    meta: seoMeta('/privacy')
  },

  {
    path: "/app",
    redirect: "/dashboard",
    component: () => import("./layout/DefaultLayout.vue"),
    name: "DefaultLayout",
    children: [] // filled dynamically via addRoute
  },

  {
    path: "/login",
    component: () => import("./layout/AuthLayout.vue"),
    children: [{ path: "", component: () => import("./pages/Login.vue"), meta: { public: true, robots: 'noindex,nofollow' } }],
  },

  {
    path: "/signup",
    component: () => import("./pages/Signup.vue"),
    meta: { public: true, robots: 'noindex,nofollow' }
  },
  {
    path: "/verify-required",
    component: () => import("./pages/VerifyRequired.vue"),
    meta: { public: true, robots: 'noindex,nofollow' }
  },

  { path: "/google-callback", component: () => import('./pages/GoogleCallback.vue'), meta: { robots: 'noindex,nofollow' } },
  { path: "/unauthorized", component: () => import('./pages/Unauthorized.vue'), meta: { public: true, robots: 'noindex,nofollow' } },
  { path: "/unsubscribe", component: () => import('./pages/Unsubscribe.vue'), meta: { public: true, robots: 'noindex,nofollow' } },

  {
    path: "/confirm-email",
    component: () => import("./layout/AuthLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("./pages/ConfirmEmail.vue"),
        meta: { public: true, robots: 'noindex,nofollow' } // 🔥 IMPORTANT
      }
    ]
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("./pages/ForgotPassword.vue"),
    meta: { public: true, robots: 'noindex,nofollow' }
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: () => import("./pages/ResetPassword.vue"),
    meta: { public: true, robots: 'noindex,nofollow' }
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("./layout/AuthLayout.vue"),
    children: [{ path: "", component: () => import("./pages/NotFound.vue"), meta: { public: true, robots: 'noindex,nofollow' } }]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash)
      return { el: to.hash, behavior: "smooth", top: 72 };
    return { left: 0, top: 0 };
  },
});


const PUBLIC_PATHS = [
  "/unauthorized", "/",
  "/pricing",
  "/tools/indexability-checker",
  "/terms",
  "/privacy",
  "/unsubscribe",
  "/login",
  "/signup",
  "/verify-required",
  "/google-callback",
  "/confirm-email",
  "/forgot-password",
  "/reset-password"
];

const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attrName, attrValue)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

const setCanonical = (href: string) => {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.href = href
}

router.afterEach((to) => {
  const title = String(to.meta.title || DEFAULT_TITLE)
  const description = String(to.meta.description || DEFAULT_DESCRIPTION)
  const robots = String(to.meta.robots || 'noindex,nofollow')
  const canonical = String(to.meta.canonical || `${SITE_URL}${to.path}`)

  document.title = title
  setMetaTag('meta[name="description"]', 'name', 'description', description)
  setMetaTag('meta[name="robots"]', 'name', 'robots', robots)
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', title)
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description)
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonical)
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  setCanonical(canonical)
  void nextTick(() => {
    enhanceSalesMailtoLinks()
  })
})

/* ---------------- AUTH GUARD ---------------- */

router.beforeEach(async (to, _, next) => {
  const isPublicPath = PUBLIC_PATHS.includes(to.path);
  // const isPublic = to.meta.public === true;
  // const requiresAuth = to.meta.requiresAuth === true;

  if (isPublicPath) {
    return next();
  }

  try {
    await api.get('/auth-check');
  } catch {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }
  // Entitlements are cached for 30s inside the store; this no longer costs a request per navigation.
  void useEntitlementsStore().refresh();
  return next();
});

/* ---------------- APP INIT ---------------- */

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(Toast, { position: POSITION.BOTTOM_RIGHT, timeout: 3000 });

function registerDynamicRoutesFromMenus(menus: Parameters<typeof buildRoutes>[0]) {
  const dynamicRoutes = buildRoutes(menus);
  for (const r of dynamicRoutes) {
    const name = r.name != null ? String(r.name) : "";
    if (name && !router.hasRoute(name)) {
      router.addRoute("DefaultLayout", r);
    }
  }
}

async function reconcileAuthSession() {
  const authStore = useAuthStore();
  const menuStore = useMenuStore();
  try {
    try {
      await refreshApi.post('/refresh-token');
    } catch {
      /* access cookie may still be valid */
    }
    await api.get('/auth-check');

    await menuStore.fetchMenus();

    registerDynamicRoutesFromMenus(menuStore.menus);
  } catch {
    authStore.clearUser();
    menuStore.clearMenus();
    if (!PUBLIC_PATHS.includes(window.location.pathname)) {
      // Keep the deep link so the user lands where they were going after signing in.
      router.push({ path: '/login', query: { redirect: window.location.pathname + window.location.search } });
    }
  }
}

const initApp = async () => {
  const authStore = useAuthStore();
  const menuStore = useMenuStore();

  if (!authStore.isLoggedIn) {
    return;
  }

  const path = window.location.pathname;
  const onPublicMarketing = PUBLIC_PATHS.includes(path);

  if (onPublicMarketing && menuStore.loaded && menuStore.menus.length > 0) {
    registerDynamicRoutesFromMenus(menuStore.menus);
    void reconcileAuthSession();
    return;
  }

  await reconcileAuthSession();
};


await initApp();

app.use(router);
app.mount("#app");

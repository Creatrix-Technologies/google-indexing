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
import { useMenuStore } from './Store/menu';

// Dynamic routes
import { buildRoutes } from './Router/dynamicRoutes';

import { useUserLimitStore } from './Shared/userLimit'
import { enhanceSalesMailtoLinks } from './utils/enhanceSalesMailto'
/* ---------------- ROUTES ---------------- */

const SITE_URL = 'https://googleindexing.com';
const DEFAULT_TITLE = 'GoogleIndexing.com | Google SEO Indexing API Automation';
const DEFAULT_DESCRIPTION =
  "GoogleIndexing.com helps SEO teams crawl URLs, submit indexing signals through Google's official Indexing API, monitor coverage, and automate scheduled recrawls.";

const routes = [
  {
    path: "/",
    component: () => import("./pages/Home.vue"),
    meta: {
      public: true,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: `${SITE_URL}/`,
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    }
  },
  {
    path: "/pricing",
    component: () => import("./pages/Pricing.vue"),
    meta: {
      public: true,
      title: 'Pricing | GoogleIndexing.com',
      description: "Simple pricing for GoogleIndexing.com. Start with a free trial, then choose Solo, Pro, or Team plans for Google Indexing API automation.",
      canonical: `${SITE_URL}/pricing`,
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    }
  },
  {
    path: "/terms",
    component: () => import("./pages/TermsOfService.vue"),
    meta: {
      public: true,
      title: "Terms of Service | GoogleIndexing.com",
      description: "Terms of Service for GoogleIndexing.com indexing automation and subscription.",
      canonical: `${SITE_URL}/terms`,
      robots: "index,follow,max-snippet:-1"
    }
  },
  {
    path: "/privacy",
    component: () => import("./pages/PrivacyPolicy.vue"),
    meta: {
      public: true,
      title: "Privacy Policy | GoogleIndexing.com",
      description: "Privacy Policy describing how GoogleIndexing.com collects and uses personal data.",
      canonical: `${SITE_URL}/privacy`,
      robots: "index,follow,max-snippet:-1"
    }
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
  "/",
  "/pricing",
  "/terms",
  "/privacy",
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

  const store = useUserLimitStore()
  
  await store.checkLimit()
  
    try {
      await api.get('/auth-check');
      return next();
    } catch {
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }
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
      router.push('/login');
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

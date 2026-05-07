import { createApp, nextTick } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "sweetalert2/dist/sweetalert2.min.css";
import "./style.css";

// Notifications
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// Pages
import Login from "./pages/Login.vue";
import Signup from "./pages/Signup.vue";
import VerifyRequired from "./pages/VerifyRequired.vue";
import Home from "./pages/Home.vue";
import Pricing from "./pages/Pricing.vue";
import GoogleCallback from './pages/GoogleCallback.vue';

// Layouts
import DefaultLayout from "./layout/DefaultLayout.vue";
import AuthLayout from "./layout/AuthLayout.vue";

// Axios
import api from './api';

// Pinia
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Stores
import { useAuthStore } from './Store/auth';
import { useMenuStore } from './Store/menu';

// Dynamic routes
import { buildRoutes } from './Router/dynamicRoutes';

import HighchartsVue from 'highcharts-vue'
import { useUserLimitStore } from './Shared/userLimit'
import { enhanceSalesMailtoLinks } from './utils/enhanceSalesMailto'

import ConfirmEmail from "./pages/ConfirmEmail.vue";
/* ---------------- ROUTES ---------------- */

const SITE_URL = 'https://googleindexing.com';
const DEFAULT_TITLE = 'GoogleIndexing.com | Google SEO Indexing API Automation';
const DEFAULT_DESCRIPTION =
  "GoogleIndexing.com helps SEO teams crawl URLs, submit indexing signals through Google's official Indexing API, monitor coverage, and automate scheduled recrawls.";

const routes = [
  {
    path: "/",
    component: Home,
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
    component: Pricing,
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
    component: DefaultLayout,
    name: "DefaultLayout",
    children: [] // filled dynamically via addRoute
  },

  {
    path: "/login",
    component: AuthLayout,
    children: [{ path: "", component: Login, meta: { public: true, robots: 'noindex,nofollow' } }],
  },

  {
    path: "/signup",
    component: Signup,
    meta: { public: true, robots: 'noindex,nofollow' }
  },
  {
    path: "/verify-required",
    component: VerifyRequired,
    meta: { public: true, robots: 'noindex,nofollow' }
  },

  { path: "/google-callback", component: GoogleCallback, meta: { robots: 'noindex,nofollow' } },

  {
    path: "/confirm-email",
    component: AuthLayout,
    children: [
      {
        path: "",
        component: ConfirmEmail,
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
    component: AuthLayout,
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

  next();
});

/* ---------------- APP INIT ---------------- */

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(HighchartsVue);
app.use(Toast, { position: POSITION.BOTTOM_RIGHT, timeout: 3000 });

const initApp = async () => {
  const authStore = useAuthStore();
  const menuStore = useMenuStore();

  if (authStore.isLoggedIn) {
    try {
      await api.get('/auth-check');

      await menuStore.fetchMenus();

      const dynamicRoutes = buildRoutes(menuStore.menus);
      dynamicRoutes.forEach(r => router.addRoute("DefaultLayout", r));

    } catch {
      authStore.clearUser();
      menuStore.clearMenus();
      if (!PUBLIC_PATHS.includes(window.location.pathname)) {
        router.push('/login');
      }
    }
  }
};


await initApp();

app.use(router);
app.mount("#app");

import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./style.css";

// Google
import GoogleCallback from './pages/GoogleCallback.vue';

// Notifications
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// Import pages
import Dashboard from "./pages/Dashboard.vue";
import SiteManagement from "./pages/SiteManagement.vue";
import Settings from "./pages/Settings.vue";
import CrawlIndexManagement from "./pages/CrawlIndexManagement.vue";
import CrawlIndexDetails from "./pages/CrawlIndexDetails.vue";

import Login from "./pages/Login.vue";

// Layouts
import DefaultLayout from "./layout/DefaultLayout.vue";
import AuthLayout from "./layout/AuthLayout.vue";

// Axios instance
import api from './api'; // Axios instance with withCredentials: true
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';


const routes = [
  { path: "/", redirect: "/dashboard" },

  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "dashboard", component: Dashboard, meta: { requiresAuth: true } },
      { path: "sites", component: SiteManagement, meta: { requiresAuth: true } },
      {
        path: "settings",
        component: Settings,
        meta: { requiresAuth: true },
        children: [
          {
            path: "google-configuration",
            name: "GoogleConfiguration",
            component: () => import("./pages/GoogleConfiguration.vue"),
            meta: { requiresAuth: true }
          },
          {
            path: "schedule-configuration",
            name: "ScheduleConfiguration",
            component: () => import("./pages/ScheduleConfiguration.vue"),
            meta: { requiresAuth: true }
          }
        ]
      },

      { path: "crawl-index-management", component: CrawlIndexManagement, meta: { requiresAuth: true } },
      { path: "crawl-index-details/:siteId",name: 'CrawlIndexDetails', component: CrawlIndexDetails, meta: { requiresAuth: true } },
    ],
  },

  {
    path: "/login",
    component: AuthLayout,
    children: [{ path: "", component: Login, meta: { public: true } }],
  },

  { path: "/google-callback", component: GoogleCallback },

  {
    path: "/:pathMatch(.*)*",
    component: AuthLayout,
    children: [{ path: "", component: () => import('./pages/NotFound.vue'), meta: { public: true } }],
  }
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ------------------------------------------------------
//  GLOBAL AUTH GUARD (using server session/cookies)
// ------------------------------------------------------
router.beforeEach(async (to, _, next) => {
  const isPublic = to.meta.public === true;
  const requiresAuth = to.meta.requiresAuth === true;

  // ----- PUBLIC ROUTES -----
  if (isPublic) return next();

  // ----- PROTECTED ROUTES -----
  if (requiresAuth) {
    try {
      await api.get('/auth-check'); // backend checks HttpOnly cookie
      return next();
    } catch {
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }
  }

  // ----- LOGIN PAGE -----
  if (to.path === "/login") {
    try {
      await api.get('/auth-check');
      return next("/dashboard"); // already logged in
    } catch {
      return next(); // allow login
    }
  }

  next();
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);     // ✅ THIS IS REQUIRED

app.use(router);

// Add toastification
app.use(Toast, {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
});

app.mount("#app");

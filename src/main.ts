import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./style.css";

// Notifications
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// Pages
import Login from "./pages/Login.vue";
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

/* ---------------- ROUTES ---------------- */

const routes = [
  // { path: "/", redirect: "/dashboard" },

  {
    path: "/",
    redirect: "/dashboard",
    component: DefaultLayout,
    name: "DefaultLayout",
    children: [] // 🔥 filled dynamically
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


const PUBLIC_PATHS = [
  "/login"
];

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

      if (!menuStore.loaded) {
        await menuStore.fetchMenus();
      }

      const dynamicRoutes = buildRoutes(menuStore.menus);
      dynamicRoutes.forEach(r => router.addRoute("DefaultLayout", r));

    } catch {
      authStore.clearUser();
      menuStore.clearMenus();
      router.push('/login');
    }
  }
};


await initApp();

app.use(router);
app.mount("#app");

// auth.tsimport api from '../api';
import { useToast } from 'vue-toastification';
import api from '../api';
const toast = useToast();

// import { useMenuStore } from '../Store/menu';


import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),

  getters: {
    userName: (state) => state.user?.name ?? '',
    userEmail: (state) => state.user?.email ?? '',
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    setUser(user: User) {
      this.user = user;
    },

    clearUser() {
      this.user = null;
    },
  },

  // ✅ CORRECT for pinia-plugin-persistedstate v3+
  persist: true,
});



export interface User {
  name: string;
  email: string;
}

interface LoginPayload {
  userName: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  userName: string;
  password: string;
}

// Login function — router passed from component
export async function login(payload: LoginPayload, router: any): Promise<boolean> {
  try {
    console.log(router)
    const response = await api.post('/login', payload, { withCredentials: true });

    // const token = response.data.data.accessToken;
    // localStorage.setItem('aT', token);
    // ✅ CORRECT PATH
    const userData = response.data.data;

    const authStore = useAuthStore();
    authStore.setUser({
      name: userData.name,
      email: userData.email,
    });
    toast.success('Welcome! Login successful!');
    return true;

  } catch (err) {
    toast.error('Login failed. Please check your credentials.');
    return false;
  }
}



// -----------------------------
// Register (FIXED)
// -----------------------------
export async function register(payload: RegisterPayload): Promise<boolean> {
  try {

    await api.post('/register', payload, { withCredentials: true });

    toast.success('Registration successful!');
    return true;

  } catch (err: any) {
    let msg="";
    // Optional server error message
    if(err?.response?.data?.error?.validationErrors){
      msg= err.response.data.error.validationErrors[0];
    }else{
       msg= err.response.data.error.description;// 'Registration failed.';
    }
    toast.error(msg);

    return false;
  }
}

// Logout function
export async function logout(): Promise<void> {
  try {
    await api.post('/logout', {}, { withCredentials: true });
  } catch {
    console.warn('Logout request failed.');
  }

  const authStore = useAuthStore();
  authStore.clearUser();

  localStorage.removeItem('menu');

  // const menuStore = useMenuStore();
  // menuStore.clearMenus();
  
  // localStorage.removeItem('aT');

  // localStorage.removeItem('auth');

  // localStorage.removeItem('menu');
  // Hard redirect
  window.location.href = '/login';
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    await api.get('/auth-check', { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}

// Google OAuth redirect
export function redirectToGoogleLogin(): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(import.meta.env.VITE_GOOGLE_REDIRECT_URI);
  const scope = encodeURIComponent(import.meta.env.VITE_GOOGLE_SCOPE);

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;

  window.location.href = googleUrl;
}

// In auth.ts

export async function loginWithGoogle(code: string, router: any): Promise<boolean> {
  const toast = useToast();
  try {
    // Send the code to your backend
    const response = await api.post('/google-login', null, { params: { code }, withCredentials: true });

    const userData = response.data.data; // make sure backend returns { name, email }

    // Save in authStore (same as normal login)
    const authStore = useAuthStore();
    authStore.setUser({
      name: userData.name,
      email: userData.email,
    });

    toast.success('Welcome! Login successful!');
    location.href="/dashboard";
    return true;
  } catch (err) {
    console.error(err);
    toast.error('Google login failed! Please try again.');
    await router.push('/login');
    return false;
  }
}

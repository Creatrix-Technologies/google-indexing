import api from '../api';
import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';

const toast = useToast();

/* =========================
   Interfaces
========================= */

export interface Menu {
  id: number;
  title: string;
  path: string;
  component?: string;
  icon?: string;
  parentId?: number | null;
  sortOrder: number;
  children?: Menu[];
}

/* =========================
   Pinia Store
========================= */

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [] as Menu[],
    loaded: false,
  }),

  getters: {
    hasMenus: (state) => state.menus.length > 0,
  },

  actions: {
    setMenus(menus: Menu[]) {
      this.menus = menus;
      this.loaded = true;
    },

    clearMenus() {
      this.menus = [];
      this.loaded = false;
    },

    async fetchMenus(): Promise<boolean> {
      try {
        const response = await api.get('/menu', {
          withCredentials: true,
        });

        this.setMenus(response.data.data);
        return true;

      } catch (err) {
        console.error(err);
        toast.error('Failed to load menu');
        return false;
      }
    },
  },

  // optional but recommended
  persist: true,
});

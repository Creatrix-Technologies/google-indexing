import api from '../api';
import { defineStore } from 'pinia';
import { useToast } from 'vue-toastification';
const toast = useToast();
/* =========================
   Pinia Store
========================= */
export const useMenuStore = defineStore('menu', {
    state: () => ({
        menus: [],
        loaded: false,
    }),
    getters: {
        hasMenus: (state) => state.menus.length > 0,
    },
    actions: {
        setMenus(menus) {
            this.menus = menus;
            this.loaded = true;
        },
        clearMenus() {
            this.menus = [];
            this.loaded = false;
        },
        async fetchMenus() {
            try {
                const response = await api.get('/menu', {
                    withCredentials: true,
                });
                this.setMenus(response.data.data);
                return true;
            }
            catch (err) {
                console.error(err);
                toast.error('Failed to load menu');
                return false;
            }
        },
    },
    // optional but recommended
    persist: true,
});

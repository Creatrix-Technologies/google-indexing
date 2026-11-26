/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, defineAsyncComponent } from 'vue';
import { useMenuStore } from '../Store/menu';
const ADMIN_COMPONENTS = ['Users', 'plans', 'StripeKeys', 'GoogleKeys', 'EmailSettings'];
const TenantDashboard = defineAsyncComponent(() => import('./TenantDashboard.vue'));
const AdminDashboard = defineAsyncComponent(() => import('./AdminDashboard.vue'));
const menuStore = useMenuStore();
const flatMenus = computed(() => {
    const flat = [];
    const walk = (items) => {
        for (const item of items || []) {
            flat.push(item);
            if (item.children?.length)
                walk(item.children);
        }
    };
    walk(menuStore.menus);
    return flat;
});
const isAdmin = computed(() => flatMenus.value.some(m => m.component && ADMIN_COMPONENTS.includes(m.component)));
const dashboardComponent = computed(() => isAdmin.value ? AdminDashboard : TenantDashboard);
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    const __VLS_0 = (__VLS_unwrap(dashboardComponent, {}));
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore
    [dashboardComponent,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

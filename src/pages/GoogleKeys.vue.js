/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, ref, onMounted } from 'vue';
import api from '../api';
import { useToast } from 'vue-toastification';
import SettingsLayout from '../components/SettingsLayout.vue';
const showClientSecret = ref(false);
const toast = useToast();
const loading = ref(false);
const keys = reactive({
    clientId: '',
    clientSecret: '',
    redirectUri: ''
});
/* GET API */
const fetchKeys = async () => {
    loading.value = true;
    try {
        const res = await api.get('/settings/get-google-keys');
        const data = res.data?.data || res.data;
        if (data) {
            keys.clientId = data.clientId || '';
            keys.clientSecret = data.clientSecret || '';
            keys.redirectUri = data.redirectUri || '';
        }
    }
    catch (err) {
        toast.error('Failed to load Google keys');
    }
    finally {
        loading.value = false;
    }
};
/* POST API */
const updateKeys = async () => {
    loading.value = true;
    try {
        await api.post('/settings/update-google-keys', {
            clientId: keys.clientId,
            clientSecret: keys.clientSecret,
            redirectUri: keys.redirectUri
        });
        toast.success('Google keys updated successfully');
    }
    catch (err) {
        toast.error('Failed to update keys');
    }
    finally {
        loading.value = false;
    }
};
onMounted(() => {
    fetchKeys();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(keys, {});
    __VLS_withDotValue(showClientSecret, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle-password']} */ ;
    const __VLS_0 = SettingsLayout || SettingsLayout;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    // @ts-ignore
    }));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-content" },
    });
    /** @type {__VLS_StyleScopedClasses['page-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "grid" },
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    if (keys.value.clientId) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-box success" },
        });
        /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['success']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mono" },
        });
        /** @type {__VLS_StyleScopedClasses['mono']} */ ;
        (keys.value.clientId);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-box" },
        });
        /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "text",
        value: (keys.value.clientId),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "password-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: (showClientSecret.value ? 'text' : 'password'),
        placeholder: "Enter client secret",
    });
    (keys.value.clientSecret);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (showClientSecret.value = !showClientSecret.value);
                // @ts-ignore
                [keys, keys, keys, keys, showClientSecret, showClientSecret, showClientSecret,];
            } },
        type: "button",
        ...{ class: "toggle-password" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-password']} */ ;
    (showClientSecret.value ? 'Hide' : 'Show');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "text",
        value: (keys.value.redirectUri),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(updateKeys, {})) },
        ...{ class: "btn primary full" },
        disabled: (__VLS_unwrap(loading, {})),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['full']} */ ;
    // @ts-ignore
    [keys, showClientSecret, updateKeys, loading,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

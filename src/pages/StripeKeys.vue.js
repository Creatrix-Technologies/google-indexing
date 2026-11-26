/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, ref, onMounted, computed } from 'vue';
import api from '../api';
import { useToast } from 'vue-toastification';
import SettingsLayout from '../components/SettingsLayout.vue';
const showSecretKey = ref(false);
const showWebhookSecret = ref(false);
const toast = useToast();
const loading = ref(false);
const togglingMode = ref(false);
const activateAfterSave = ref(false);
// Current active mode (displayed in status panel)
const activeMode = ref('Sandbox');
// Which mode we're currently editing
const editingMode = ref('Sandbox');
// Keys for each mode
const sandboxKeys = reactive({
    publishableKey: '',
    secretKey: '',
    webHookSecret: ''
});
const liveKeys = reactive({
    publishableKey: '',
    secretKey: '',
    webHookSecret: ''
});
// Computed property for currently editing keys
const editingKeys = computed({
    get: () => editingMode.value === 'Sandbox' ? sandboxKeys : liveKeys,
    set: (val) => {
        if (editingMode.value === 'Sandbox') {
            Object.assign(sandboxKeys, val);
        }
        else {
            Object.assign(liveKeys, val);
        }
    }
});
// Computed property for active keys (based on activeMode)
const activeKeys = computed(() => {
    return activeMode.value === 'Sandbox' ? sandboxKeys : liveKeys;
});
// Can we switch to live mode?
const canSwitchToLive = computed(() => {
    return !!liveKeys.secretKey;
});
/* GET Stripe Keys */
const fetchKeys = async () => {
    loading.value = true;
    try {
        const res = await api.get('/settings/get-stripe-keys');
        const data = res.data?.data || res.data;
        if (data) {
            // Use activeModeName (string: "Live" or "Sandbox") if available, fallback to activeMode
            activeMode.value = data.activeModeName || data.activeMode?.toString() || 'Sandbox';
            // Populate Sandbox keys
            if (data.sandbox) {
                sandboxKeys.publishableKey = data.sandbox.publishableKey || '';
                sandboxKeys.secretKey = data.sandbox.secretKey || '';
                sandboxKeys.webHookSecret = data.sandbox.webHookSecret || '';
            }
            // Populate Live keys
            if (data.live) {
                liveKeys.publishableKey = data.live.publishableKey || '';
                liveKeys.secretKey = data.live.secretKey || '';
                liveKeys.webHookSecret = data.live.webHookSecret || '';
            }
            // Fallback: if only legacy keys exist, populate current editing mode
            if (!data.sandbox && !data.live && data.activeKeys) {
                editingKeys.value = {
                    publishableKey: data.activeKeys.publishableKey || '',
                    secretKey: data.activeKeys.secretKey || '',
                    webHookSecret: data.activeKeys.webHookSecret || ''
                };
            }
        }
    }
    catch {
        toast.error('Failed to load Stripe configuration');
    }
    finally {
        loading.value = false;
    }
};
/* TOGGLE Stripe Mode */
const toggleMode = async (mode) => {
    if (mode === activeMode.value)
        return;
    togglingMode.value = true;
    try {
        // 0 = Live, 1 = Sandbox (matches C# enum values)
        const modeValue = mode === 'Live' ? 0 : 1;
        await api.post('/settings/toggle-stripe-mode', {
            mode: modeValue
        });
        activeMode.value = mode;
        editingMode.value = mode; // Switch editing to the new mode too
        toast.success(`Switched to ${mode} mode`);
        // Reload to get fresh active keys
        await fetchKeys();
    }
    catch (err) {
        const msg = err.response?.data?.error?.description || `Failed to switch to ${mode} mode`;
        toast.error(msg);
    }
    finally {
        togglingMode.value = false;
    }
};
/* UPDATE Stripe Keys */
const updateKeys = async () => {
    loading.value = true;
    try {
        await api.post('/settings/update-stripe-keys', {
            mode: editingMode.value === 'Live' ? 0 : 1, // 0 = Live, 1 = Sandbox
            keys: {
                publishableKey: editingKeys.value.publishableKey,
                secretKey: editingKeys.value.secretKey,
                webHookSecret: editingKeys.value.webHookSecret
            },
            activateThisMode: activateAfterSave.value
        });
        toast.success(`${editingMode.value} keys saved successfully`);
        // If we activated this mode, update the active mode
        if (activateAfterSave.value) {
            activeMode.value = editingMode.value;
            activateAfterSave.value = false; // Reset checkbox
        }
        // Reload to get updated keys
        await fetchKeys();
    }
    catch {
        toast.error(`Failed to update ${editingMode.value} keys`);
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
    __VLS_withDotValue(activeMode, {});
    __VLS_withDotValue(togglingMode, {});
    __VLS_withDotValue(canSwitchToLive, {});
    __VLS_withDotValue(activeKeys, {});
    __VLS_withDotValue(editingMode, {});
    __VLS_withDotValue(editingKeys, {});
    __VLS_withDotValue(showSecretKey, {});
    __VLS_withDotValue(showWebhookSecret, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['field-hint']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['password-wrapper']} */ ;
    /** @type {__VLS_StyleScopedClasses['toggle-password']} */ ;
    /** @type {__VLS_StyleScopedClasses['mode-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['mode-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['mode-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['mode-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['mode-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['mode-hint']} */ ;
    /** @type {__VLS_StyleScopedClasses['key-tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['key-tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['activate-checkbox']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['warning']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mode-toggle-section" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-toggle-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "mode-label" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mode-toggle" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-toggle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(toggleMode, {})('Sandbox'));
                // @ts-ignore
                [toggleMode,];
            } },
        type: "button",
        ...{ class: "mode-btn" },
        ...{ class: ({ active: activeMode.value === 'Sandbox' }) },
        disabled: (togglingMode.value),
    });
    /** @type {__VLS_StyleScopedClasses['mode-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mode-badge sandbox" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['sandbox']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mode-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-desc']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(toggleMode, {})('Live'));
                // @ts-ignore
                [toggleMode, activeMode, togglingMode,];
            } },
        type: "button",
        ...{ class: "mode-btn" },
        ...{ class: ({ active: activeMode.value === 'Live' }) },
        disabled: (togglingMode.value || !canSwitchToLive.value),
    });
    /** @type {__VLS_StyleScopedClasses['mode-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mode-badge live" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-badge']} */ ;
    /** @type {__VLS_StyleScopedClasses['live']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "mode-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-desc']} */ ;
    if (!canSwitchToLive.value && activeMode.value === 'Sandbox') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "mode-hint warning" },
        });
        /** @type {__VLS_StyleScopedClasses['mode-hint']} */ ;
        /** @type {__VLS_StyleScopedClasses['warning']} */ ;
    }
    if (activeKeys.value.secretKey) {
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
        (activeKeys.value.secretKey);
    }
    if (activeKeys.value.publishableKey) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-box success" },
            ...{ style: {} },
        });
        /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['success']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "mono" },
        });
        /** @type {__VLS_StyleScopedClasses['mono']} */ ;
        (activeKeys.value.publishableKey);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-box warning" },
        });
        /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['warning']} */ ;
        (activeMode.value);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "key-mode-tabs" },
    });
    /** @type {__VLS_StyleScopedClasses['key-mode-tabs']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (editingMode.value = 'Sandbox');
                // @ts-ignore
                [activeMode, activeMode, activeMode, togglingMode, canSwitchToLive, canSwitchToLive, activeKeys, activeKeys, activeKeys, activeKeys, editingMode,];
            } },
        type: "button",
        ...{ class: "key-tab" },
        ...{ class: ({ active: editingMode.value === 'Sandbox' }) },
    });
    /** @type {__VLS_StyleScopedClasses['key-tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (editingMode.value = 'Live');
                // @ts-ignore
                [editingMode, editingMode,];
            } },
        type: "button",
        ...{ class: "key-tab" },
        ...{ class: ({ active: editingMode.value === 'Live' }) },
    });
    /** @type {__VLS_StyleScopedClasses['key-tab']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tab-content" },
    });
    /** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "field-hint mode-info" },
    });
    /** @type {__VLS_StyleScopedClasses['field-hint']} */ ;
    /** @type {__VLS_StyleScopedClasses['mode-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (editingMode.value);
    (editingMode.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "field-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['field-hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (editingKeys.value.publishableKey),
        type: "text",
        placeholder: (editingMode.value === 'Sandbox' ? 'pk_test_...' : 'pk_live_...'),
        autocomplete: "off",
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
        type: (showSecretKey.value ? 'text' : 'password'),
        placeholder: (editingMode.value === 'Sandbox' ? 'sk_test_...' : 'sk_live_...'),
    });
    (editingKeys.value.secretKey);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (showSecretKey.value = !showSecretKey.value);
                // @ts-ignore
                [editingMode, editingMode, editingMode, editingMode, editingMode, editingKeys, editingKeys, showSecretKey, showSecretKey, showSecretKey,];
            } },
        type: "button",
        ...{ class: "toggle-password" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-password']} */ ;
    (showSecretKey.value ? 'Hide' : 'Show');
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
        type: (showWebhookSecret.value ? 'text' : 'password'),
        placeholder: "Enter webhook secret",
    });
    (editingKeys.value.webHookSecret);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (showWebhookSecret.value = !showWebhookSecret.value);
                // @ts-ignore
                [editingKeys, showSecretKey, showWebhookSecret, showWebhookSecret, showWebhookSecret,];
            } },
        type: "button",
        ...{ class: "toggle-password" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-password']} */ ;
    (showWebhookSecret.value ? 'Hide' : 'Show');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(updateKeys, {})) },
        ...{ class: "btn primary full" },
        disabled: (__VLS_unwrap(loading, {})),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['full']} */ ;
    (editingMode.value);
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "activate-checkbox" },
    });
    /** @type {__VLS_StyleScopedClasses['activate-checkbox']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "checkbox",
    });
    (__VLS_unwrap(activateAfterSave, {}));
    (editingMode.value);
    // @ts-ignore
    [editingMode, editingMode, showWebhookSecret, updateKeys, loading, activateAfterSave,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

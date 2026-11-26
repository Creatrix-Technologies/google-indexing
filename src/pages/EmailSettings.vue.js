/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { reactive, ref, onMounted } from 'vue';
import api from '../api';
import { useToast } from 'vue-toastification';
import SettingsLayout from '../components/SettingsLayout.vue';
const toast = useToast();
const loading = ref(false);
const testSending = ref(false);
const testToEmail = ref('');
const passwordIsSet = ref(false);
const showPassword = ref(false);
const form = reactive({
    fromName: '',
    fromEmail: '',
    smtpServer: '',
    port: 587,
    username: '',
    password: ''
});
const load = async () => {
    loading.value = true;
    try {
        const res = await api.get('/settings/get-email-settings');
        const data = res.data?.data || res.data;
        if (!data)
            return;
        form.fromName = data.fromName ?? '';
        form.fromEmail = data.fromEmail ?? '';
        form.smtpServer = data.smtpServer ?? '';
        form.port = typeof data.port === 'number' && data.port > 0 ? data.port : 587;
        form.username = data.username ?? '';
        form.password = '';
        passwordIsSet.value = !!data.passwordIsSet;
    }
    catch {
        toast.error('Failed to load email settings');
    }
    finally {
        loading.value = false;
    }
};
const save = async () => {
    loading.value = true;
    try {
        await api.post('/settings/update-email-settings', {
            fromName: form.fromName,
            fromEmail: form.fromEmail,
            smtpServer: form.smtpServer,
            port: form.port || 587,
            username: form.username,
            password: form.password
        });
        toast.success('Email settings saved');
        form.password = '';
        await load();
    }
    catch {
        toast.error('Failed to save email settings');
    }
    finally {
        loading.value = false;
    }
};
const sendTest = async () => {
    if (!testToEmail.value?.trim()) {
        toast.error('Enter a recipient email');
        return;
    }
    testSending.value = true;
    try {
        const res = await api.post('/settings/send-test-email', {
            toEmail: testToEmail.value.trim(),
            fromName: form.fromName,
            fromEmail: form.fromEmail,
            smtpServer: form.smtpServer,
            port: form.port || 587,
            username: form.username,
            password: form.password ?? ''
        });
        const payload = res.data?.data ?? res.data;
        if (res.data?.isSuccess === false || payload?.isSuccess === false) {
            const desc = res.data?.error?.description ?? payload?.error?.description ?? 'Test send failed';
            toast.error(desc);
            return;
        }
        toast.success('Test email sent. Check the inbox.');
    }
    catch (e) {
        const ax = e;
        toast.error(ax.response?.data?.error?.description ?? 'Failed to send test email');
    }
    finally {
        testSending.value = false;
    }
};
onMounted(() => load());
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(form, {});
    __VLS_withDotValue(passwordIsSet, {});
    __VLS_withDotValue(showPassword, {});
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(testSending, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['secondary']} */ ;
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
    if (form.value.fromEmail) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "muted" },
        });
        /** @type {__VLS_StyleScopedClasses['muted']} */ ;
        (form.value.fromName);
        (form.value.fromEmail);
        (form.value.smtpServer);
        (form.value.port);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "muted" },
        });
        /** @type {__VLS_StyleScopedClasses['muted']} */ ;
    }
    if (passwordIsSet.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-box success" },
        });
        /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['success']} */ ;
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
        value: (form.value.fromName),
        type: "text",
        autocomplete: "off",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "email",
        autocomplete: "off",
    });
    (form.value.fromEmail);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (form.value.smtpServer),
        type: "text",
        autocomplete: "off",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-row" },
    });
    /** @type {__VLS_StyleScopedClasses['form-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "number",
        min: "1",
        max: "65535",
    });
    (form.value.port);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        value: (form.value.username),
        type: "text",
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
        type: (showPassword.value ? 'text' : 'password'),
        autocomplete: "new-password",
        placeholder: "Leave empty to keep unchanged",
    });
    (form.value.password);
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (showPassword.value = !showPassword.value);
                // @ts-ignore
                [form, form, form, form, form, form, form, form, form, form, form, passwordIsSet, showPassword, showPassword, showPassword,];
            } },
        type: "button",
        ...{ class: "toggle-password" },
    });
    /** @type {__VLS_StyleScopedClasses['toggle-password']} */ ;
    (showPassword.value ? 'Hide' : 'Show');
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(save, {})) },
        ...{ class: "btn primary full" },
        disabled: (loading.value),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "muted" },
    });
    /** @type {__VLS_StyleScopedClasses['muted']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "email",
        autocomplete: "off",
        placeholder: "you@example.com",
    });
    (__VLS_unwrap(testToEmail, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(sendTest, {})) },
        type: "button",
        ...{ class: "btn secondary full" },
        disabled: (loading.value || testSending.value),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['full']} */ ;
    (testSending.value ? 'Sending…' : 'Send test email');
    // @ts-ignore
    [showPassword, save, loading, loading, testToEmail, sendTest, testSending, testSending,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

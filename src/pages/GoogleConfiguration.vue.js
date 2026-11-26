/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import api from '../api';
import { useToast } from 'vue-toastification';
import { useGoogleConfigStore } from '../Shared/googleConfig';
import { useSubscriptionStore } from '../Shared/subscription';
import SettingsLayout from '../components/SettingsLayout.vue';
import GoogleSetupSteps from '../components/GoogleSetupSteps.vue';
const guideOpen = ref(false);
const fileInput = ref(null);
const googleConfigStore = useGoogleConfigStore();
const subscriptionStore = useSubscriptionStore();
const toast = useToast();
const loading = ref(false);
const selectedFile = ref(null);
const credentials = reactive({
    clientId: '',
    projectId: '',
    serviceAccountEmail: '',
    privateKey: '',
    privateKeyId: '',
    lastUpdated: ''
});
const fetchCredentials = async () => {
    loading.value = true;
    try {
        const res = await api.get('/google-config/get');
        const data = res.data?.data;
        if (data) {
            credentials.clientId = data.clientId || '';
            credentials.projectId = data.projectId || '';
            credentials.serviceAccountEmail = data.clientEmail || '';
            credentials.privateKey = data.privateKey || '';
            credentials.privateKeyId = data.privateKeyId || '';
            credentials.lastUpdated = data.lastUpdated || '';
        }
    }
    finally {
        loading.value = false;
    }
};
const verifying = ref(false);
const verifyResult = ref(null);
const verifyConnection = async () => {
    verifying.value = true;
    try {
        const res = await api.post('/google-config/verify');
        verifyResult.value = res.data?.data ?? null;
        if (verifyResult.value?.connected)
            await googleConfigStore.check();
    }
    catch (err) {
        toast.error(err?.response?.data?.error?.description || 'Verification failed');
    }
    finally {
        verifying.value = false;
    }
};
const copyServiceAccountEmail = async () => {
    try {
        await navigator.clipboard.writeText(credentials.serviceAccountEmail);
        toast.success('Service account email copied');
    }
    catch {
        toast.info(credentials.serviceAccountEmail);
    }
};
const handleFileChange = (e) => {
    const input = e.target;
    const file = input.files?.[0]; // safely get first file
    if (file) {
        selectedFile.value = file; // now TypeScript knows it's not undefined
    }
};
const clearFile = () => {
    selectedFile.value = null;
    if (fileInput.value) {
        fileInput.value.value = ''; // clears the <input type="file">
    }
};
const uploadKey = async () => {
    if (!selectedFile.value) {
        toast.error('Please select a JSON file');
        return;
    }
    loading.value = true;
    try {
        const fd = new FormData();
        fd.append('file', selectedFile.value);
        const response = await api.post('/google-config/upload', fd, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        // Check if API explicitly returned an error
        if (response.data?.isSuccess === false) {
            toast.error(response.data.error?.description || 'Failed to upload key');
            return;
        }
        toast.success(response.data?.message || 'Key uploaded successfully');
        fetchCredentials();
        await googleConfigStore.check();
    }
    catch (err) {
        // If request fails (network/server error), show a toast
        toast.error(err.response?.data?.error?.description || 'An error occurred while uploading');
    }
    finally {
        loading.value = false;
        clearFile();
    }
};
const removeCredentials = async () => {
    if (!confirm('Remove credentials?'))
        return;
    loading.value = true;
    try {
        await api.post('/google-config/remove');
        Object.assign(credentials, {
            clientId: '',
            projectId: '',
            serviceAccountEmail: '',
            privateKey: '',
            privateKeyId: ''
        });
        toast.success('Credentials removed');
    }
    finally {
        loading.value = false;
    }
};
const updateCredentials = async () => {
    loading.value = true;
    try {
        const response = await api.post('/google-config/update', {
            clientId: credentials.clientId,
            projectId: credentials.projectId,
            clientEmail: credentials.serviceAccountEmail,
            privateKey: credentials.privateKey,
            privateKeyId: credentials.privateKeyId
        });
        if (response.data?.isSuccess) {
            toast.success('Credentials updated');
        }
        else {
            // Handle validation errors from response
            const errors = response.data?.error?.validationErrors;
            if (errors && errors.length) {
                const cleanErrors = errors.map((e) => e.replace(/'/g, ""));
                toast.error(cleanErrors.join(', '));
            }
            else {
                const description = response.data?.error?.description?.replace(/'/g, "") || 'An unknown error occurred';
                toast.error(description);
            }
        }
    }
    catch (err) {
        // Network or unexpected errors
        const errors = err.response?.data?.error?.validationErrors;
        const description = err.response?.data?.error?.description;
        const msg = errors?.map((e) => e.replace(/'/g, "")).join(', ')
            || description?.replace(/'/g, "")
            || err.message
            || 'An unexpected error occurred';
        toast.error(msg);
    }
    finally {
        loading.value = false;
    }
};
onMounted(() => {
    fetchCredentials();
    subscriptionStore.checkSubscription();
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(credentials, {});
    __VLS_withDotValue(verifying, {});
    __VLS_withDotValue(verifyResult, {});
    __VLS_withDotValue(loading, {});
    __VLS_withDotValue(guideOpen, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['hint']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-box--success']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['danger']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    /** @type {__VLS_StyleScopedClasses['file-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['file-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['setup-guide__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['setup-guide__toggle']} */ ;
    /** @type {__VLS_StyleScopedClasses['setup-guide__hint']} */ ;
    /** @type {__VLS_StyleScopedClasses['setup-guide__body']} */ ;
    /** @type {__VLS_StyleScopedClasses['verify-email']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['verify-result']} */ ;
    /** @type {__VLS_StyleScopedClasses['verify-result']} */ ;
    /** @type {__VLS_StyleScopedClasses['verify-result__list']} */ ;
    /** @type {__VLS_StyleScopedClasses['verify-result__mark']} */ ;
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
        id: "upload-section",
    });
    /** @type {__VLS_StyleScopedClasses['grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "column" },
    });
    /** @type {__VLS_StyleScopedClasses['column']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    if (credentials.value.serviceAccountEmail) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-box status-box--success" },
        });
        /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
        /** @type {__VLS_StyleScopedClasses['status-box--success']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 16 16",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
            width: "15",
            height: "15",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "8",
            cy: "8",
            r: "7",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "5 8 7 10.5 11 5.5",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "mono" },
        });
        /** @type {__VLS_StyleScopedClasses['mono']} */ ;
        (credentials.value.serviceAccountEmail);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-box" },
        });
        /** @type {__VLS_StyleScopedClasses['status-box']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 16 16",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.75",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
            width: "15",
            height: "15",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "8",
            cy: "8",
            r: "7",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
            x1: "8",
            y1: "5.5",
            x2: "8",
            y2: "8.5",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "8",
            cy: "10.5",
            r: ".5",
            fill: "currentColor",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    if (credentials.value.serviceAccountEmail) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "actions" },
        });
        /** @type {__VLS_StyleScopedClasses['actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(removeCredentials, {})) },
            ...{ class: "btn danger" },
            disabled: (loading.value),
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['danger']} */ ;
    }
    if (credentials.value.serviceAccountEmail) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card" },
        });
        /** @type {__VLS_StyleScopedClasses['card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "hint" },
        });
        /** @type {__VLS_StyleScopedClasses['hint']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "verify-email" },
        });
        /** @type {__VLS_StyleScopedClasses['verify-email']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
        (credentials.value.serviceAccountEmail);
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(copyServiceAccountEmail, {})) },
            type: "button",
            ...{ class: "btn ghost small" },
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['ghost']} */ ;
        /** @type {__VLS_StyleScopedClasses['small']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "actions" },
        });
        /** @type {__VLS_StyleScopedClasses['actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(verifyConnection, {})) },
            ...{ class: "btn primary" },
            disabled: (verifying.value),
        });
        /** @type {__VLS_StyleScopedClasses['btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['primary']} */ ;
        (verifying.value ? 'Checking…' : 'Verify now');
        if (verifyResult.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "verify-result" },
                ...{ class: (verifyResult.value.connected && verifyResult.value.properties.some(p => p.isOwner) ? 'is-ok' : 'is-warn') },
            });
            /** @type {__VLS_StyleScopedClasses['verify-result']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "verify-result__message" },
            });
            /** @type {__VLS_StyleScopedClasses['verify-result__message']} */ ;
            (verifyResult.value.message);
            if (verifyResult.value.properties.length) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                    ...{ class: "verify-result__list" },
                });
                /** @type {__VLS_StyleScopedClasses['verify-result__list']} */ ;
                const __VLS_6 = __VLS_tryAsConstant((verifyResult.value.properties));
                for (const [p] of __VLS_vFor(__VLS_nonNull(__VLS_6))) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                        key: (p.siteUrl),
                        ...{ class: ({ 'is-owner': p.isOwner }) },
                    });
                    /** @type {__VLS_StyleScopedClasses['is-owner']} */ ;
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "verify-result__mark" },
                        'aria-hidden': "true",
                    });
                    /** @type {__VLS_StyleScopedClasses['verify-result__mark']} */ ;
                    (p.isOwner ? '✓' : '!');
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "verify-result__site" },
                    });
                    /** @type {__VLS_StyleScopedClasses['verify-result__site']} */ ;
                    (p.siteUrl);
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "verify-result__perm" },
                    });
                    /** @type {__VLS_StyleScopedClasses['verify-result__perm']} */ ;
                    (p.permissionLevel);
                    if (!p.isOwner) {
                        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                            ...{ class: "verify-result__hint" },
                        });
                        /** @type {__VLS_StyleScopedClasses['verify-result__hint']} */ ;
                        (p.hint);
                    }
                    // @ts-ignore
                    [credentials, credentials, credentials, credentials, credentials, removeCredentials, loading, copyServiceAccountEmail, verifyConnection, verifying, verifying, verifyResult, verifyResult, verifyResult, verifyResult, verifyResult, verifyResult,];
                }
            }
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "hint" },
    });
    /** @type {__VLS_StyleScopedClasses['hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.code, __VLS_intrinsics.code)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "file-row" },
    });
    /** @type {__VLS_StyleScopedClasses['file-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_unwrap(handleFileChange, {})) },
        type: "file",
        accept: ".json,application/json",
        ...{ class: "file-input" },
        ref: "fileInput",
    });
    /** @type {__VLS_StyleScopedClasses['file-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "actions" },
    });
    /** @type {__VLS_StyleScopedClasses['actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(uploadKey, {})) },
        ...{ class: "btn primary" },
        disabled: (loading.value),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    (loading.value ? 'Uploading...' : 'Upload Key');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "column" },
    });
    /** @type {__VLS_StyleScopedClasses['column']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "hint" },
    });
    /** @type {__VLS_StyleScopedClasses['hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "text",
        value: (credentials.value.clientId),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "text",
        value: (credentials.value.projectId),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "email",
    });
    (credentials.value.serviceAccountEmail);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        type: "text",
        value: (credentials.value.privateKeyId),
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-group" },
    });
    /** @type {__VLS_StyleScopedClasses['form-group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
        rows: "6",
        value: (credentials.value.privateKey),
        placeholder: "Stored securely and never shown. Leave empty to keep the existing private key.",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_unwrap(updateCredentials, {})) },
        ...{ class: "btn primary full" },
        disabled: (loading.value),
    });
    /** @type {__VLS_StyleScopedClasses['btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['full']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "setup-guide" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-guide']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (guideOpen.value = !guideOpen.value);
                // @ts-ignore
                [credentials, credentials, credentials, credentials, credentials, loading, loading, loading, handleFileChange, uploadKey, updateCredentials, guideOpen, guideOpen,];
            } },
        ...{ class: "setup-guide__toggle" },
        'aria-expanded': (guideOpen.value),
    });
    /** @type {__VLS_StyleScopedClasses['setup-guide__toggle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "setup-guide__toggle-left" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-guide__toggle-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 16 16",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.75",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
        width: "15",
        height: "15",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.rect)({
        x: "2",
        y: "2",
        width: "12",
        height: "12",
        rx: "1.5",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "5",
        y1: "6",
        x2: "11",
        y2: "6",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
        x1: "5",
        y1: "9",
        x2: "9",
        y2: "9",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "setup-guide__label" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-guide__label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "setup-guide__badge" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-guide__badge']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "setup-guide__toggle-right" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-guide__toggle-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "setup-guide__hint" },
    });
    /** @type {__VLS_StyleScopedClasses['setup-guide__hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "setup-guide__chevron" },
        ...{ class: ({ 'setup-guide__chevron--open': guideOpen.value }) },
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 12 12",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
        'aria-hidden': "true",
        width: "13",
        height: "13",
    });
    /** @type {__VLS_StyleScopedClasses['setup-guide__chevron']} */ ;
    /** @type {__VLS_StyleScopedClasses['setup-guide__chevron--open']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
        points: "2 4 6 8 10 4",
    });
    let __VLS_7;
    /** @ts-ignore @type { | typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
    Transition;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        // @ts-ignore
        name: "guide-expand",
    }));
    const __VLS_9 = __VLS_8({
        name: "guide-expand",
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    var __VLS_10;
    const { default: __VLS_12 } = __VLS_nonNull(__VLS_10.slots);
    if (guideOpen.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "setup-guide__body" },
        });
        /** @type {__VLS_StyleScopedClasses['setup-guide__body']} */ ;
        const __VLS_13 = GoogleSetupSteps;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
            // @ts-ignore
            allExpanded: (false), hideFinalCta: (true),
        }));
        const __VLS_15 = __VLS_14({
            allExpanded: (false),
            hideFinalCta: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    }
    // @ts-ignore
    [guideOpen, guideOpen, guideOpen,];
    // @ts-ignore
    [];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

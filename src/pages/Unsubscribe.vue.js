/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { refreshApi } from '../api';
const route = useRoute();
const title = ref('Unsubscribing…');
const message = ref('One moment.');
onMounted(async () => {
    const token = String(route.query.token ?? '');
    if (!token) {
        title.value = 'Link not valid';
        message.value = 'This unsubscribe link is incomplete. Open it again from the e-mail.';
        return;
    }
    try {
        await refreshApi.post('/register/unsubscribe', { token });
        title.value = "You're unsubscribed";
        message.value = "You won't get setup tips any more. Receipts and account e-mails still arrive as usual.";
    }
    catch {
        title.value = 'Link not valid';
        message.value = "We couldn't read this unsubscribe link. Reply to any of our e-mails and we'll take you off the list.";
    }
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    void {};
    /** @type {__VLS_StyleScopedClasses['unsub-page']} */ ;
    /** @type {__VLS_StyleScopedClasses['unsub-page']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "unsub-page" },
    });
    /** @type {__VLS_StyleScopedClasses['unsub-page']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    (__VLS_unwrap(title, {}));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_unwrap(message, {}));
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link'] | typeof __VLS_components.routerLink | typeof __VLS_components.RouterLink | typeof __VLS_components['router-link']} */
    routerLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        // @ts-ignore
        to: "/login", ...{ class: "unsub-link" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/login",
        ...{ class: "unsub-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['unsub-link']} */ ;
    var __VLS_3;
    const { default: __VLS_5 } = __VLS_nonNull(__VLS_3.slots);
    // @ts-ignore
    [title, message,];
    // @ts-ignore
    [];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

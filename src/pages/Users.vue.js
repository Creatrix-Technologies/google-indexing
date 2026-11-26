/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, watch } from 'vue';
import api from '../api';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
const toast = useToast();
const users = ref([]);
const roles = ref([]);
const usersLoading = ref(false);
let usersFetchSeq = 0;
const pageInfo = ref({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
});
// Header totals (all users, ignoring filters) come from the API
const summary = ref({ total: 0, active: 0, inactive: 0 });
// Search / filters / sort / page size
const searchInput = ref('');
const search = ref('');
const roleFilter = ref('');
const statusFilter = ref('');
const trialFilter = ref('');
const sortBy = ref('email');
const sortDir = ref('asc');
const pageSize = ref(10);
const hasActiveFilters = computed(() => !!(search.value || roleFilter.value || statusFilter.value || trialFilter.value));
let searchTimer;
watch(searchInput, (value) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { search.value = value.trim(); }, 300);
});
const clearFilters = () => {
    searchInput.value = '';
    search.value = '';
    roleFilter.value = '';
    statusFilter.value = '';
    trialFilter.value = '';
};
const toggleSort = (column) => {
    if (sortBy.value === column) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    }
    else {
        sortBy.value = column;
        sortDir.value = 'asc';
    }
};
const sortArrow = (column) => sortBy.value === column ? (sortDir.value === 'asc' ? '▲' : '▼') : '';
const ariaSort = (column) => sortBy.value === column ? (sortDir.value === 'asc' ? 'ascending' : 'descending') : 'none';
// Last server-confirmed role per user, so a cancelled or failed change can be reverted
const roleBaseline = new Map();
// Accordion state
const expandedUsers = ref(new Set());
const isExpanded = (userId) => expandedUsers.value.has(userId);
const toggle = (userId) => {
    if (expandedUsers.value.has(userId))
        expandedUsers.value.delete(userId);
    else
        expandedUsers.value.add(userId);
};
// Computed
const totalPages = computed(() => Math.ceil(pageInfo.value.totalCount / pageInfo.value.pageSize) || 1);
const rangeStart = computed(() => pageInfo.value.totalCount === 0
    ? 0
    : (pageInfo.value.page - 1) * pageInfo.value.pageSize + 1);
const rangeEnd = computed(() => Math.min(pageInfo.value.page * pageInfo.value.pageSize, pageInfo.value.totalCount));
// Avatar helpers (display-only)
const initials = (user) => {
    const source = (user.name && user.name.trim()) || user.email || '?';
    const parts = source.replace(/[^a-zA-Z0-9 ._-]/g, '').split(/[\s._-]+/).filter(Boolean);
    if (parts.length === 0)
        return '?';
    const firstPart = parts[0] ?? '';
    if (parts.length === 1)
        return firstPart.slice(0, 2).toUpperCase();
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || '?';
};
// Deterministic muted hue per user (display-only)
const avatarStyle = (user) => {
    const seed = (user.userId || user.email || user.name || '')
        .split('')
        .reduce((a, c) => a + c.charCodeAt(0), 0);
    const hue = seed % 360;
    return {
        background: `hsl(${hue} 60% 95%)`,
        color: `hsl(${hue} 38% 32%)`,
        borderColor: `hsl(${hue} 50% 88%)`,
    };
};
// Fetch users
const fetchUsers = async (page = 1) => {
    const seq = ++usersFetchSeq;
    usersLoading.value = true;
    try {
        const res = await api.get('/manage-users/list', {
            params: {
                pageNo: page,
                pageSize: pageSize.value,
                searchBy: search.value || undefined,
                role: roleFilter.value || undefined,
                status: statusFilter.value || undefined,
                trial: trialFilter.value || undefined,
                sortBy: sortBy.value,
                sortDir: sortDir.value,
            }
        });
        if (seq !== usersFetchSeq)
            return;
        if (res.data?.isSuccess) {
            users.value = res.data.data || [];
            roleBaseline.clear();
            users.value.forEach(u => roleBaseline.set(u.userId, u.role));
            const meta = res.data.meta;
            if (meta) {
                summary.value = {
                    total: Number(meta.total) || 0,
                    active: Number(meta.active) || 0,
                    inactive: Number(meta.inactive) || 0,
                };
            }
            const pi = res.data.pageInfo;
            pageInfo.value = {
                page: Number(pi?.page) || 1,
                pageSize: Number(pi?.pageSize) || 10,
                totalCount: Number(pi?.totalCount) || 0,
                hasNextPage: Boolean(pi?.hasNextPage),
                hasPreviousPage: Boolean(pi?.hasPreviousPage),
            };
        }
        else {
            toast.error('Failed to load users!');
        }
    }
    catch (err) {
        if (seq !== usersFetchSeq)
            return;
        console.error('Error fetching users', err);
        toast.error('Error fetching users!');
    }
    finally {
        if (seq === usersFetchSeq)
            usersLoading.value = false;
    }
};
// Fetch roles
const fetchRoles = async () => {
    try {
        const res = await api.get('/roles');
        if (res.data?.isSuccess) {
            roles.value = res.data.data || [];
        }
        else {
            toast.error('Failed to load roles!');
        }
    }
    catch (err) {
        console.error('Error fetching roles', err);
        toast.error('Error fetching roles!');
    }
};
// Update user role (asks first; reverts the dropdown if cancelled or failed)
const onRoleChange = async (user) => {
    const previous = roleBaseline.get(user.userId) ?? user.role;
    if (user.role === previous)
        return;
    const confirm = await Swal.fire({
        title: 'Change role?',
        text: `Change ${user.email || user.name} from ${previous} to ${user.role}?` +
            (user.role === 'Admin' ? ' Admins can manage all users and settings.' : ''),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Change role'
    });
    if (!confirm.isConfirmed) {
        user.role = previous;
        return;
    }
    try {
        const res = await api.post('/update-role', {
            userId: user.userId,
            role: user.role
        });
        if (res.data?.isSuccess) {
            roleBaseline.set(user.userId, user.role);
            toast.success(`${user.email || user.name} is now ${user.role}`);
        }
        else {
            user.role = previous;
            toast.error(res.data?.error?.description || 'Failed to update role');
        }
    }
    catch (err) {
        console.error('Error updating role', err);
        user.role = previous;
        toast.error('Error updating role');
    }
};
// Deactivating blocks sign-in, so ask first; activating needs no confirmation
const onStatusChange = async (user) => {
    if (!user.isActive) {
        const confirm = await Swal.fire({
            title: 'Deactivate user?',
            text: `${user.email || user.name} will no longer be able to sign in.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Deactivate'
        });
        if (!confirm.isConfirmed) {
            user.isActive = true;
            return;
        }
    }
    await updateUserStatus(user);
};
// Update user status
const updateUserStatus = async (user) => {
    try {
        const res = await api.post('/update-status', {
            userId: user.userId,
            isActive: user.isActive
        });
        if (res.data?.isSuccess) {
            toast.success(`${user.email || user.name} is now ${user.isActive ? 'active' : 'inactive'}`);
            await fetchUsers(pageInfo.value.page); // refresh header totals and any status filter
        }
        else {
            toast.error(res.data?.error?.description || 'Failed to update status');
            user.isActive = !user.isActive;
        }
    }
    catch (err) {
        console.error('Error updating status', err);
        toast.error('Error updating status');
        user.isActive = !user.isActive;
    }
};
// Reset free trial (100 indexing requests). userId null = the signed-in admin.
const resettingTrial = ref(null);
const resetTrial = async (userId, label) => {
    const confirm = await Swal.fire({
        title: 'Reset free trial?',
        text: `This gives ${label} a fresh 100 free indexing requests.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Reset trial'
    });
    if (!confirm.isConfirmed)
        return;
    resettingTrial.value = userId ?? 'self';
    try {
        const res = await api.post('/manage-users/reset-trial', { userId });
        if (res.data?.isSuccess) {
            toast.success('Free trial reset');
            await fetchUsers(pageInfo.value.page);
        }
        else {
            toast.error(res.data?.error?.description || 'Failed to reset trial');
        }
    }
    catch (err) {
        console.error('Error resetting trial', err);
        toast.error('Error resetting trial');
    }
    finally {
        resettingTrial.value = null;
    }
};
// Pagination handlers
const nextPage = () => {
    if (pageInfo.value.hasNextPage)
        pageInfo.value.page++;
};
const previousPage = () => {
    if (pageInfo.value.hasPreviousPage)
        pageInfo.value.page--;
};
onMounted(() => {
    fetchUsers();
    fetchRoles();
});
// Refetch when page changes
watch(() => pageInfo.value.page, (p) => void fetchUsers(p));
// Any filter / sort / page-size change goes back to page 1
watch([search, roleFilter, statusFilter, trialFilter, sortBy, sortDir, pageSize], () => {
    if (pageInfo.value.page === 1)
        void fetchUsers(1);
    else
        pageInfo.value.page = 1;
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
void __VLS_ctx, __VLS_components, __VLS_intrinsics, __VLS_directives;
const __VLS_template = () => {
    __VLS_withDotValue(summary, {});
    __VLS_withDotValue(resettingTrial, {});
    __VLS_withDotValue(hasActiveFilters, {});
    __VLS_withDotValue(usersLoading, {});
    __VLS_withDotValue(pageInfo, {});
    __VLS_withDotValue(users, {});
    void {};
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-expanded']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['toolbar-search']} */ ;
    /** @type {__VLS_StyleScopedClasses['toolbar-search']} */ ;
    /** @type {__VLS_StyleScopedClasses['toolbar-select']} */ ;
    /** @type {__VLS_StyleScopedClasses['toolbar-clear']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    /** @type {__VLS_StyleScopedClasses['sortable']} */ ;
    /** @type {__VLS_StyleScopedClasses['trial-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['trial-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['role-select']} */ ;
    /** @type {__VLS_StyleScopedClasses['role-select']} */ ;
    /** @type {__VLS_StyleScopedClasses['role-select']} */ ;
    /** @type {__VLS_StyleScopedClasses['switch']} */ ;
    /** @type {__VLS_StyleScopedClasses['slider']} */ ;
    /** @type {__VLS_StyleScopedClasses['slider']} */ ;
    /** @type {__VLS_StyleScopedClasses['slider']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['sites-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['is-open']} */ ;
    /** @type {__VLS_StyleScopedClasses['chev']} */ ;
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-visit']} */ ;
    /** @type {__VLS_StyleScopedClasses['site-visit']} */ ;
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    /** @type {__VLS_StyleScopedClasses['pagination-info']} */ ;
    /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-indicator']} */ ;
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['header-meta']} */ ;
    /** @type {__VLS_StyleScopedClasses['col-status']} */ ;
    /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
    /** @type {__VLS_StyleScopedClasses['detail-shell']} */ ;
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-container" },
    });
    /** @type {__VLS_StyleScopedClasses['page-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "page-header" },
    });
    /** @type {__VLS_StyleScopedClasses['page-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
    if (summary.value.total) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "header-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['header-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-dot meta-dot--active" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-dot--active']} */ ;
        (summary.value.active);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-dot meta-dot--inactive" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-dot']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-dot--inactive']} */ ;
        (summary.value.inactive);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-pill meta-pill--total" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-pill']} */ ;
        /** @type {__VLS_StyleScopedClasses['meta-pill--total']} */ ;
        (summary.value.total);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(resetTrial, {})(null, 'your own account'));
                // @ts-ignore
                [summary, summary, summary, summary, resetTrial,];
            } },
        ...{ class: "trial-btn" },
        disabled: (resettingTrial.value === 'self'),
    });
    /** @type {__VLS_StyleScopedClasses['trial-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toolbar" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "toolbar-search" },
        type: "search",
        placeholder: "Search by email or name",
        'aria-label': "Search users",
    });
    (__VLS_unwrap(searchInput, {}));
    /** @type {__VLS_StyleScopedClasses['toolbar-search']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_unwrap(roleFilter, {})),
        ...{ class: "toolbar-select" },
        'aria-label': "Filter by role",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-select']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    const __VLS_0 = __VLS_tryAsConstant((__VLS_unwrap(roles, {})));
    for (const [role] of __VLS_vFor(__VLS_nonNull(__VLS_0))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (role),
            value: (role),
        });
        (role);
        // @ts-ignore
        [resettingTrial, searchInput, roleFilter, roles,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_unwrap(statusFilter, {})),
        ...{ class: "toolbar-select" },
        'aria-label': "Filter by status",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-select']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "active",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "inactive",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_unwrap(trialFilter, {})),
        ...{ class: "toolbar-select" },
        'aria-label': "Filter by free trial",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-select']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "active",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        value: "used",
    });
    if (hasActiveFilters.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(clearFilters, {})) },
            ...{ class: "toolbar-clear" },
        });
        /** @type {__VLS_StyleScopedClasses['toolbar-clear']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "toolbar-spacer" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-spacer']} */ ;
    if (!usersLoading.value) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "toolbar-result" },
        });
        /** @type {__VLS_StyleScopedClasses['toolbar-result']} */ ;
        (hasActiveFilters.value ? `${pageInfo.value.totalCount} matching` : `${pageInfo.value.totalCount} users`);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        value: (__VLS_unwrap(pageSize, {})),
        ...{ class: "toolbar-select" },
        'aria-label': "Rows per page",
    });
    /** @type {__VLS_StyleScopedClasses['toolbar-select']} */ ;
    const __VLS_1 = __VLS_tryAsConstant(([10, 25, 50, 100]));
    for (const [n] of __VLS_vFor(__VLS_nonNull(__VLS_1))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (n),
            value: (n),
        });
        (n);
        // @ts-ignore
        [statusFilter, trialFilter, hasActiveFilters, hasActiveFilters, clearFilters, usersLoading, pageInfo, pageInfo, pageSize,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-card" },
    });
    /** @type {__VLS_StyleScopedClasses['table-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "table-scroll" },
    });
    /** @type {__VLS_StyleScopedClasses['table-scroll']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.table, __VLS_intrinsics.table)({
        ...{ class: "users-table" },
    });
    /** @type {__VLS_StyleScopedClasses['users-table']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.thead, __VLS_intrinsics.thead)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(toggleSort, {})('email'));
                // @ts-ignore
                [toggleSort,];
            } },
        ...{ class: "col-user sortable" },
        'aria-sort': (__VLS_unwrap(ariaSort, {})('email')),
    });
    /** @type {__VLS_StyleScopedClasses['col-user']} */ ;
    /** @type {__VLS_StyleScopedClasses['sortable']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "sort-arrow" },
    });
    /** @type {__VLS_StyleScopedClasses['sort-arrow']} */ ;
    (__VLS_unwrap(sortArrow, {})('email'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(toggleSort, {})('role'));
                // @ts-ignore
                [toggleSort, ariaSort, sortArrow,];
            } },
        ...{ class: "col-role sortable" },
        'aria-sort': (__VLS_unwrap(ariaSort, {})('role')),
    });
    /** @type {__VLS_StyleScopedClasses['col-role']} */ ;
    /** @type {__VLS_StyleScopedClasses['sortable']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "sort-arrow" },
    });
    /** @type {__VLS_StyleScopedClasses['sort-arrow']} */ ;
    (__VLS_unwrap(sortArrow, {})('role'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(toggleSort, {})('status'));
                // @ts-ignore
                [toggleSort, ariaSort, sortArrow,];
            } },
        ...{ class: "col-status sortable" },
        'aria-sort': (__VLS_unwrap(ariaSort, {})('status')),
    });
    /** @type {__VLS_StyleScopedClasses['col-status']} */ ;
    /** @type {__VLS_StyleScopedClasses['sortable']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "sort-arrow" },
    });
    /** @type {__VLS_StyleScopedClasses['sort-arrow']} */ ;
    (__VLS_unwrap(sortArrow, {})('status'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(toggleSort, {})('sites'));
                // @ts-ignore
                [toggleSort, ariaSort, sortArrow,];
            } },
        ...{ class: "col-sites sortable" },
        'aria-sort': (__VLS_unwrap(ariaSort, {})('sites')),
    });
    /** @type {__VLS_StyleScopedClasses['col-sites']} */ ;
    /** @type {__VLS_StyleScopedClasses['sortable']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "sort-arrow" },
    });
    /** @type {__VLS_StyleScopedClasses['sort-arrow']} */ ;
    (__VLS_unwrap(sortArrow, {})('sites'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.th, __VLS_intrinsics.th)({
        ...{ onClick: (...[$event]) => {
                void $event;
                return (__VLS_unwrap(toggleSort, {})('trial'));
                // @ts-ignore
                [toggleSort, ariaSort, sortArrow,];
            } },
        ...{ class: "col-trial sortable" },
        'aria-sort': (__VLS_unwrap(ariaSort, {})('trial')),
    });
    /** @type {__VLS_StyleScopedClasses['col-trial']} */ ;
    /** @type {__VLS_StyleScopedClasses['sortable']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "sort-arrow" },
    });
    /** @type {__VLS_StyleScopedClasses['sort-arrow']} */ ;
    (__VLS_unwrap(sortArrow, {})('trial'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.tbody, __VLS_intrinsics.tbody)({});
    const __VLS_2 = __VLS_tryAsConstant((users.value));
    for (const [user] of __VLS_vFor(__VLS_nonNull(__VLS_2))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.template)({
            key: (user.userId),
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
            ...{ class: ({ 'is-expanded': __VLS_unwrap(isExpanded, {})(user.userId) }) },
        });
        /** @type {__VLS_StyleScopedClasses['is-expanded']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-user" },
        });
        /** @type {__VLS_StyleScopedClasses['col-user']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "user-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['user-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "avatar" },
            ...{ style: (__VLS_unwrap(avatarStyle, {})(user)) },
        });
        /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
        (__VLS_unwrap(initials, {})(user));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "user-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['user-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "user-name" },
        });
        /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
        (user.name || user.email);
        if (user.email && user.email !== user.name) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "user-email" },
            });
            /** @type {__VLS_StyleScopedClasses['user-email']} */ ;
            (user.email);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-role" },
        });
        /** @type {__VLS_StyleScopedClasses['col-role']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "role-select" },
        });
        /** @type {__VLS_StyleScopedClasses['role-select']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            ...{ onChange: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(onRoleChange, {})(user));
                    // @ts-ignore
                    [ariaSort, sortArrow, users, isExpanded, avatarStyle, initials, onRoleChange,];
                } },
            value: (user.role),
        });
        const __VLS_3 = __VLS_tryAsConstant((__VLS_unwrap(roles, {})));
        for (const [role] of __VLS_vFor(__VLS_nonNull(__VLS_3))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (role),
                value: (role),
            });
            (role);
            // @ts-ignore
            [roles,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-status" },
        });
        /** @type {__VLS_StyleScopedClasses['col-status']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "status-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['status-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "switch" },
            title: (user.isActive ? 'Active' : 'Inactive'),
        });
        /** @type {__VLS_StyleScopedClasses['switch']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onChange: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(onStatusChange, {})(user));
                    // @ts-ignore
                    [onStatusChange,];
                } },
            type: "checkbox",
            'aria-label': (`Toggle status for ${user.name || user.email}`),
        });
        (user.isActive);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "slider" },
        });
        /** @type {__VLS_StyleScopedClasses['slider']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-pill" },
            ...{ class: (user.isActive ? 'status-pill--active' : 'status-pill--inactive') },
        });
        /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-dot" },
        });
        /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
        (user.isActive ? 'Active' : 'Inactive');
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-sites" },
        });
        /** @type {__VLS_StyleScopedClasses['col-sites']} */ ;
        if (user.sites.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        void $event;
                        if (!(user.sites.length))
                            throw 0;
                        return (__VLS_unwrap(toggle, {})(user.userId));
                        // @ts-ignore
                        [toggle,];
                    } },
                ...{ class: "sites-btn" },
                ...{ class: ({ 'is-open': __VLS_unwrap(isExpanded, {})(user.userId) }) },
                'aria-expanded': (__VLS_unwrap(isExpanded, {})(user.userId)),
            });
            /** @type {__VLS_StyleScopedClasses['sites-btn']} */ ;
            /** @type {__VLS_StyleScopedClasses['is-open']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "sites-count" },
            });
            /** @type {__VLS_StyleScopedClasses['sites-count']} */ ;
            (user.siteCount);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "sites-label" },
            });
            /** @type {__VLS_StyleScopedClasses['sites-label']} */ ;
            (user.siteCount === 1 ? 'site' : 'sites');
            __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                ...{ class: "chev" },
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 24 24",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['chev']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                points: "6 9 12 15 18 9",
            });
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "sites-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['sites-empty']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            ...{ class: "col-trial" },
        });
        /** @type {__VLS_StyleScopedClasses['col-trial']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "trial-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['trial-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-pill" },
            ...{ class: (user.trialActive ? 'status-pill--active' : 'status-pill--inactive') },
        });
        /** @type {__VLS_StyleScopedClasses['status-pill']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-dot" },
        });
        /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
        (user.trialActive ? 'Active' : 'Used');
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    void $event;
                    return (__VLS_unwrap(resetTrial, {})(user.userId, user.email || user.name));
                    // @ts-ignore
                    [resetTrial, isExpanded, isExpanded,];
                } },
            ...{ class: "trial-btn" },
            disabled: (resettingTrial.value === user.userId),
        });
        /** @type {__VLS_StyleScopedClasses['trial-btn']} */ ;
        if (user.sites.length && __VLS_unwrap(isExpanded, {})(user.userId)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({
                ...{ class: "detail-row" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
                colspan: "5",
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "detail-shell" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-shell']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "detail-header" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "detail-title" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-title']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "detail-count" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-count']} */ ;
            (user.sites.length);
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
                ...{ class: "site-list" },
            });
            /** @type {__VLS_StyleScopedClasses['site-list']} */ ;
            const __VLS_4 = __VLS_tryAsConstant((user.sites));
            for (const [site] of __VLS_vFor(__VLS_nonNull(__VLS_4))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (site.url),
                    ...{ class: "site-item" },
                });
                /** @type {__VLS_StyleScopedClasses['site-item']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "site-icon" },
                    'aria-hidden': "true",
                });
                /** @type {__VLS_StyleScopedClasses['site-icon']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
                    cx: "12",
                    cy: "12",
                    r: "10",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.line)({
                    x1: "2",
                    y1: "12",
                    x2: "22",
                    y2: "12",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "site-meta" },
                });
                /** @type {__VLS_StyleScopedClasses['site-meta']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "site-name" },
                });
                /** @type {__VLS_StyleScopedClasses['site-name']} */ ;
                (site.siteName);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "site-type" },
                });
                /** @type {__VLS_StyleScopedClasses['site-type']} */ ;
                (site.siteType);
                __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                    href: (site.url),
                    target: "_blank",
                    rel: "noopener",
                    ...{ class: "site-visit" },
                });
                /** @type {__VLS_StyleScopedClasses['site-visit']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    'stroke-linecap': "round",
                    'stroke-linejoin': "round",
                    'aria-hidden': "true",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
                    d: "M7 17L17 7",
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
                    points: "7 7 17 7 17 17",
                });
                // @ts-ignore
                [resettingTrial, isExpanded,];
            }
        }
        // @ts-ignore
        [];
    }
    if (users.value.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.tr, __VLS_intrinsics.tr)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.td, __VLS_intrinsics.td)({
            colspan: "5",
            ...{ class: "empty-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-state" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
            cx: "9",
            cy: "7",
            r: "4",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M23 21v-2a4 4 0 0 0-3-3.87",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M16 3.13a4 4 0 0 1 0 7.75",
        });
        if (hasActiveFilters.value) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "empty-title" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "empty-desc" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-desc']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_unwrap(clearFilters, {})) },
                ...{ class: "toolbar-clear" },
            });
            /** @type {__VLS_StyleScopedClasses['toolbar-clear']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "empty-title" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "empty-desc" },
            });
            /** @type {__VLS_StyleScopedClasses['empty-desc']} */ ;
        }
    }
    if (pageInfo.value.totalCount > pageInfo.value.pageSize) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pagination" },
        });
        /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pagination-info" },
        });
        /** @type {__VLS_StyleScopedClasses['pagination-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_unwrap(rangeStart, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_unwrap(rangeEnd, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (pageInfo.value.totalCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "pagination-controls" },
        });
        /** @type {__VLS_StyleScopedClasses['pagination-controls']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(previousPage, {})) },
            ...{ class: "pagination-btn" },
            disabled: (usersLoading.value || !pageInfo.value.hasPreviousPage),
            'aria-label': "Previous page",
        });
        /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "15 18 9 12 15 6",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "page-indicator" },
        });
        /** @type {__VLS_StyleScopedClasses['page-indicator']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (pageInfo.value.page);
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_unwrap(totalPages, {}));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_unwrap(nextPage, {})) },
            ...{ class: "pagination-btn" },
            disabled: (usersLoading.value || !pageInfo.value.hasNextPage),
            'aria-label': "Next page",
        });
        /** @type {__VLS_StyleScopedClasses['pagination-btn']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.polyline)({
            points: "9 18 15 12 9 6",
        });
    }
    // @ts-ignore
    [hasActiveFilters, clearFilters, usersLoading, usersLoading, pageInfo, pageInfo, pageInfo, pageInfo, pageInfo, pageInfo, users, rangeStart, rangeEnd, previousPage, totalPages, nextPage,];
    return {};
};
void [__VLS_template];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};

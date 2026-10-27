<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Users</h1>
        <p class="subtitle">
          Manage application users — view roles, status, and connected sites.
        </p>
      </div>

      <div class="header-meta" v-if="summary.total">
        <span class="meta-pill">
          <span class="meta-dot meta-dot--active"></span>
          {{ summary.active }} active
        </span>
        <span class="meta-pill">
          <span class="meta-dot meta-dot--inactive"></span>
          {{ summary.inactive }} inactive
        </span>
        <span class="meta-pill meta-pill--total">
          {{ summary.total }} total
        </span>
      </div>

      <button
        class="trial-btn"
        :disabled="resettingTrial === 'self'"
        @click="resetTrial(null, 'your own account')"
      >
        Reset my trial
      </button>
    </div>

    <!-- Toolbar: search, filters, page size -->
    <div class="toolbar">
      <input
        v-model="searchInput"
        class="toolbar-search"
        type="search"
        placeholder="Search by email or name"
        aria-label="Search users"
      />

      <select v-model="roleFilter" class="toolbar-select" aria-label="Filter by role">
        <option value="">All roles</option>
        <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
      </select>

      <select v-model="statusFilter" class="toolbar-select" aria-label="Filter by status">
        <option value="">Any status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <select v-model="trialFilter" class="toolbar-select" aria-label="Filter by free trial">
        <option value="">Any trial state</option>
        <option value="active">Trial available</option>
        <option value="used">Trial used</option>
      </select>

      <button v-if="hasActiveFilters" class="toolbar-clear" @click="clearFilters">Clear filters</button>

      <span class="toolbar-spacer"></span>

      <span class="toolbar-result" v-if="!usersLoading">
        {{ hasActiveFilters ? `${pageInfo.totalCount} matching` : `${pageInfo.totalCount} users` }}
      </span>

      <select v-model.number="pageSize" class="toolbar-select" aria-label="Rows per page">
        <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">{{ n }} / page</option>
      </select>
    </div>

    <!-- User List Table -->
    <div class="table-card">
      <div class="table-scroll">
        <table class="users-table">
          <thead>
            <tr>
              <th class="col-user sortable" :aria-sort="ariaSort('email')" @click="toggleSort('email')">
                User <span class="sort-arrow">{{ sortArrow('email') }}</span>
              </th>
              <th class="col-role sortable" :aria-sort="ariaSort('role')" @click="toggleSort('role')">
                Role <span class="sort-arrow">{{ sortArrow('role') }}</span>
              </th>
              <th class="col-status sortable" :aria-sort="ariaSort('status')" @click="toggleSort('status')">
                Status <span class="sort-arrow">{{ sortArrow('status') }}</span>
              </th>
              <th class="col-sites sortable" :aria-sort="ariaSort('sites')" @click="toggleSort('sites')">
                Sites <span class="sort-arrow">{{ sortArrow('sites') }}</span>
              </th>
              <th class="col-trial sortable" :aria-sort="ariaSort('trial')" @click="toggleSort('trial')">
                Free trial <span class="sort-arrow">{{ sortArrow('trial') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="user in users" :key="user.userId">
              <tr :class="{ 'is-expanded': isExpanded(user.userId) }">
                <!-- Identity -->
                <td class="col-user">
                  <div class="user-cell">
                    <div class="avatar" :style="avatarStyle(user)">
                      {{ initials(user) }}
                    </div>
                    <div class="user-meta">
                      <span class="user-name">{{ user.name || user.email }}</span>
                      <span class="user-email" v-if="user.email && user.email !== user.name">
                        {{ user.email }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Role -->
                <td class="col-role">
                  <div class="role-select">
                    <select v-model="user.role" @change="onRoleChange(user)">
                      <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                    </select>
                  </div>
                </td>

                <!-- Status -->
                <td class="col-status">
                  <div class="status-cell">
                    <label class="switch" :title="user.isActive ? 'Active' : 'Inactive'">
                      <input
                        type="checkbox"
                        v-model="user.isActive"
                        :aria-label="`Toggle status for ${user.name || user.email}`"
                        @change="onStatusChange(user)"
                      />
                      <span class="slider"></span>
                    </label>
                    <span
                      class="status-pill"
                      :class="user.isActive ? 'status-pill--active' : 'status-pill--inactive'"
                    >
                      <span class="status-dot"></span>
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </td>

                <!-- Sites summary -->
                <td class="col-sites">
                  <button
                    v-if="user.sites.length"
                    class="sites-btn"
                    :class="{ 'is-open': isExpanded(user.userId) }"
                    :aria-expanded="isExpanded(user.userId)"
                    @click="toggle(user.userId)"
                  >
                    <span class="sites-count">{{ user.siteCount }}</span>
                    <span class="sites-label">{{ user.siteCount === 1 ? 'site' : 'sites' }}</span>
                    <svg class="chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <span v-else class="sites-empty">— no sites</span>
                </td>

                <!-- Free trial -->
                <td class="col-trial">
                  <div class="trial-cell">
                    <span
                      class="status-pill"
                      :class="user.trialActive ? 'status-pill--active' : 'status-pill--inactive'"
                    >
                      <span class="status-dot"></span>
                      {{ user.trialActive ? 'Active' : 'Used' }}
                    </span>
                    <button
                      class="trial-btn"
                      :disabled="resettingTrial === user.userId"
                      @click="resetTrial(user.userId, user.email || user.name)"
                    >
                      Reset
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Expanded sites detail row -->
              <tr
                v-if="user.sites.length && isExpanded(user.userId)"
                class="detail-row"
              >
                <td colspan="5">
                  <div class="detail-shell">
                    <div class="detail-header">
                      <span class="detail-title">Connected sites</span>
                      <span class="detail-count">{{ user.sites.length }}</span>
                    </div>
                    <ul class="site-list">
                      <li v-for="site in user.sites" :key="site.url" class="site-item">
                        <div class="site-icon" aria-hidden="true">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        </div>
                        <div class="site-meta">
                          <span class="site-name">{{ site.siteName }}</span>
                          <span class="site-type">{{ site.siteType }}</span>
                        </div>
                        <a :href="site.url" target="_blank" rel="noopener" class="site-visit">
                          Visit
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M7 17L17 7" />
                            <polyline points="7 7 17 7 17 17" />
                          </svg>
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <tr v-if="users.length === 0">
              <td colspan="5" class="empty-cell">
                <div class="empty-state">
                  <div class="empty-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <template v-if="hasActiveFilters">
                    <p class="empty-title">No users match your filters</p>
                    <p class="empty-desc">
                      <button class="toolbar-clear" @click="clearFilters">Clear filters</button>
                    </p>
                  </template>
                  <template v-else>
                    <p class="empty-title">No users yet</p>
                    <p class="empty-desc">Users will appear here once they sign up.</p>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="pageInfo.totalCount > pageInfo.pageSize">
        <div class="pagination-info">
          Showing
          <strong>{{ rangeStart }}</strong>
          –
          <strong>{{ rangeEnd }}</strong>
          of
          <strong>{{ pageInfo.totalCount }}</strong>
          users
        </div>

        <div class="pagination-controls">
          <button
            class="pagination-btn"
            :disabled="usersLoading || !pageInfo.hasPreviousPage"
            @click="previousPage"
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </button>

          <span class="page-indicator">
            Page <strong>{{ pageInfo.page }}</strong> of <strong>{{ totalPages }}</strong>
          </span>

          <button
            class="pagination-btn"
            :disabled="usersLoading || !pageInfo.hasNextPage"
            @click="nextPage"
            aria-label="Next page"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import api from '../api'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'

const toast = useToast()

interface Site {
  url: string
  siteName: string
  siteType: string
}

interface User {
  userId: string
  name: string
  email: string
  role: string
  isActive: boolean,
  siteCount: number,
  sites: Site[],
  trialActive: boolean
}

interface PageInfo {
  page: number
  pageSize: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

const users = ref<User[]>([])
const roles = ref<string[]>([])
const usersLoading = ref(false)
let usersFetchSeq = 0

const pageInfo = ref<PageInfo>({
  page: 1,
  pageSize: 10,
  totalCount: 0,
  hasNextPage: false,
  hasPreviousPage: false
})

// Header totals (all users, ignoring filters) come from the API
const summary = ref({ total: 0, active: 0, inactive: 0 })

// Search / filters / sort / page size
const searchInput = ref('')
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const trialFilter = ref('')
const sortBy = ref('email')
const sortDir = ref<'asc' | 'desc'>('asc')
const pageSize = ref(10)

const hasActiveFilters = computed(
  () => !!(search.value || roleFilter.value || statusFilter.value || trialFilter.value)
)

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { search.value = value.trim() }, 300)
})

const clearFilters = () => {
  searchInput.value = ''
  search.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  trialFilter.value = ''
}

const toggleSort = (column: string) => {
  if (sortBy.value === column) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortDir.value = 'asc'
  }
}
const sortArrow = (column: string) =>
  sortBy.value === column ? (sortDir.value === 'asc' ? '▲' : '▼') : ''
const ariaSort = (column: string) =>
  sortBy.value === column ? (sortDir.value === 'asc' ? 'ascending' : 'descending') : 'none'

// Last server-confirmed role per user, so a cancelled or failed change can be reverted
const roleBaseline = new Map<string, string>()

// Accordion state
const expandedUsers = ref<Set<string>>(new Set())
const isExpanded = (userId: string) => expandedUsers.value.has(userId)
const toggle = (userId: string) => {
  if (expandedUsers.value.has(userId)) expandedUsers.value.delete(userId)
  else expandedUsers.value.add(userId)
}

// Computed
const totalPages = computed(() => Math.ceil(pageInfo.value.totalCount / pageInfo.value.pageSize) || 1)

const rangeStart = computed(() =>
  pageInfo.value.totalCount === 0
    ? 0
    : (pageInfo.value.page - 1) * pageInfo.value.pageSize + 1
)
const rangeEnd = computed(() =>
  Math.min(pageInfo.value.page * pageInfo.value.pageSize, pageInfo.value.totalCount)
)

// Avatar helpers (display-only)
const initials = (user: User) => {
  const source = (user.name && user.name.trim()) || user.email || '?'
  const parts = source.replace(/[^a-zA-Z0-9 ._-]/g, '').split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const firstPart = parts[0] ?? ''
  if (parts.length === 1) return firstPart.slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || '?'
}

// Deterministic muted hue per user (display-only)
const avatarStyle = (user: User) => {
  const seed = (user.userId || user.email || user.name || '')
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = seed % 360
  return {
    background: `hsl(${hue} 60% 95%)`,
    color: `hsl(${hue} 38% 32%)`,
    borderColor: `hsl(${hue} 50% 88%)`,
  }
}

// Fetch users
const fetchUsers = async (page = 1) => {
  const seq = ++usersFetchSeq
  usersLoading.value = true
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
    })
    if (seq !== usersFetchSeq) return
    if (res.data?.isSuccess) {
      users.value = res.data.data || []
      roleBaseline.clear()
      users.value.forEach(u => roleBaseline.set(u.userId, u.role))
      const meta = res.data.meta
      if (meta) {
        summary.value = {
          total: Number(meta.total) || 0,
          active: Number(meta.active) || 0,
          inactive: Number(meta.inactive) || 0,
        }
      }
      const pi = res.data.pageInfo
      pageInfo.value = {
        page: Number(pi?.page) || 1,
        pageSize: Number(pi?.pageSize) || 10,
        totalCount: Number(pi?.totalCount) || 0,
        hasNextPage: Boolean(pi?.hasNextPage),
        hasPreviousPage: Boolean(pi?.hasPreviousPage),
      }
    } else {
      toast.error('Failed to load users!')
    }
  } catch (err) {
    if (seq !== usersFetchSeq) return
    console.error('Error fetching users', err)
    toast.error('Error fetching users!')
  } finally {
    if (seq === usersFetchSeq) usersLoading.value = false
  }
}

// Fetch roles
const fetchRoles = async () => {
  try {
    const res = await api.get('/roles')
    if (res.data?.isSuccess) {
      roles.value = res.data.data || []
    } else {
      toast.error('Failed to load roles!')
    }
  } catch (err) {
    console.error('Error fetching roles', err)
    toast.error('Error fetching roles!')
  }
}

// Update user role (asks first; reverts the dropdown if cancelled or failed)
const onRoleChange = async (user: User) => {
  const previous = roleBaseline.get(user.userId) ?? user.role
  if (user.role === previous) return

  const confirm = await Swal.fire({
    title: 'Change role?',
    text: `Change ${user.email || user.name} from ${previous} to ${user.role}?` +
      (user.role === 'Admin' ? ' Admins can manage all users and settings.' : ''),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Change role'
  })
  if (!confirm.isConfirmed) {
    user.role = previous
    return
  }

  try {
    const res = await api.post('/update-role', {
      userId: user.userId,
      role: user.role
    })
    if (res.data?.isSuccess) {
      roleBaseline.set(user.userId, user.role)
      toast.success(`${user.email || user.name} is now ${user.role}`)
    } else {
      user.role = previous
      toast.error(res.data?.error?.description || 'Failed to update role')
    }
  } catch (err) {
    console.error('Error updating role', err)
    user.role = previous
    toast.error('Error updating role')
  }
}

// Deactivating blocks sign-in, so ask first; activating needs no confirmation
const onStatusChange = async (user: User) => {
  if (!user.isActive) {
    const confirm = await Swal.fire({
      title: 'Deactivate user?',
      text: `${user.email || user.name} will no longer be able to sign in.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Deactivate'
    })
    if (!confirm.isConfirmed) {
      user.isActive = true
      return
    }
  }
  await updateUserStatus(user)
}

// Update user status
const updateUserStatus = async (user: User) => {
  try {
    const res = await api.post('/update-status', {
      userId: user.userId,
      isActive: user.isActive
    })
    if (res.data?.isSuccess) {
      toast.success(`${user.email || user.name} is now ${user.isActive ? 'active' : 'inactive'}`)
      await fetchUsers(pageInfo.value.page) // refresh header totals and any status filter
    } else {
      toast.error(res.data?.error?.description || 'Failed to update status')
      user.isActive = !user.isActive
    }
  } catch (err) {
    console.error('Error updating status', err)
    toast.error('Error updating status')
    user.isActive = !user.isActive
  }
}

// Reset free trial (100 indexing requests). userId null = the signed-in admin.
const resettingTrial = ref<string | null>(null)
const resetTrial = async (userId: string | null, label: string) => {
  const confirm = await Swal.fire({
    title: 'Reset free trial?',
    text: `This gives ${label} a fresh 100 free indexing requests.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Reset trial'
  })
  if (!confirm.isConfirmed) return

  resettingTrial.value = userId ?? 'self'
  try {
    const res = await api.post('/manage-users/reset-trial', { userId })
    if (res.data?.isSuccess) {
      toast.success('Free trial reset')
      await fetchUsers(pageInfo.value.page)
    } else {
      toast.error(res.data?.error?.description || 'Failed to reset trial')
    }
  } catch (err) {
    console.error('Error resetting trial', err)
    toast.error('Error resetting trial')
  } finally {
    resettingTrial.value = null
  }
}

// Pagination handlers
const nextPage = () => {
  if (pageInfo.value.hasNextPage) pageInfo.value.page++
}
const previousPage = () => {
  if (pageInfo.value.hasPreviousPage) pageInfo.value.page--
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})

// Refetch when page changes
watch(() => pageInfo.value.page, (p) => void fetchUsers(p))

// Any filter / sort / page-size change goes back to page 1
watch([search, roleFilter, statusFilter, trialFilter, sortBy, sortDir, pageSize], () => {
  if (pageInfo.value.page === 1) void fetchUsers(1)
  else pageInfo.value.page = 1
})
</script>

<style scoped>
.page-container {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background: var(--color-background);
  font-family: var(--font-family);
}

/* ----------------- Header ----------------- */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: var(--fs-2xl);
  color: var(--color-text);
  margin: 0 0 4px 0;
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  line-height: 1.15;
}

.subtitle {
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 56ch;
}

.header-meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.meta-pill--total {
  background: var(--neutral-50);
  color: var(--color-text);
}
.meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.meta-dot--active   { background: var(--color-success); }
.meta-dot--inactive { background: var(--neutral-400); }

/* ----------------- Card ----------------- */
.table-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}
.table-scroll { overflow-x: auto; }

/* ----------------- Table ----------------- */
.users-table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
  min-width: 720px;
}

.users-table thead {
  background: var(--neutral-50);
  border-bottom: 1px solid var(--color-border);
}

.users-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--fw-medium);
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.users-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  font-size: var(--fs-base);
  color: var(--color-text);
  vertical-align: middle;
}
.users-table tbody tr {
  transition: background 120ms ease;
}
.users-table tbody tr:hover:not(.detail-row) {
  background: var(--neutral-50);
}
.users-table tbody tr.is-expanded {
  background: var(--neutral-50);
}
.users-table tbody tr.is-expanded td {
  border-bottom-color: transparent;
}
.users-table tbody tr.detail-row:hover { background: transparent; }

.col-user   { min-width: 240px; }
.col-role   { width: 160px; }
.col-status { width: 200px; }
.col-sites  { width: 180px; white-space: nowrap; }
.col-trial  { width: 200px; white-space: nowrap; }

/* ----------------- Toolbar ----------------- */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}
.toolbar-search,
.toolbar-select {
  padding: 7px 10px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--fs-sm);
}
.toolbar-search { flex: 1 1 240px; min-width: 200px; max-width: 360px; }
.toolbar-search:focus,
.toolbar-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}
.toolbar-clear {
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: var(--color-accent);
  font-family: inherit;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
}
.toolbar-clear:hover { text-decoration: underline; }
.toolbar-spacer { flex: 1 1 auto; }
.toolbar-result {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* Sortable headers */
.users-table th.sortable {
  cursor: pointer;
  user-select: none;
}
.users-table th.sortable:hover { color: var(--color-text); }
.sort-arrow {
  display: inline-block;
  min-width: 10px;
  font-size: 9px;
  margin-left: 2px;
}

/* ----------------- Free trial ----------------- */
.trial-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.trial-btn {
  padding: 4px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}
.trial-btn:hover:not(:disabled) {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}
.trial-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ----------------- User cell ----------------- */
.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semi);
  letter-spacing: 0.02em;
  border: 1px solid var(--color-border);
  user-select: none;
}

.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}
.user-name {
  font-weight: var(--fw-medium);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-email {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ----------------- Role select ----------------- */
.role-select {
  display: inline-block;
  position: relative;
}
.role-select select {
  padding: 6px 28px 6px 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  font-size: var(--fs-sm);
  font-family: inherit;
  font-weight: var(--fw-medium);
  color: var(--color-text);
  background-color: var(--color-card-bg);
  cursor: pointer;
  transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748b' stroke-width='1.5'/%3E%3C/svg%3E%0A");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 10px 6px;
  min-width: 110px;
}
.role-select select:hover {
  border-color: var(--neutral-400);
  background-color: var(--color-surface-2);
}
.role-select select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}

/* ----------------- Status cell ----------------- */
.status-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
  flex-shrink: 0;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--neutral-300);
  transition: background-color 200ms ease;
  border-radius: var(--radius-pill);
}
.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: #fff;
  transition: transform 200ms ease;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.20);
}
input:checked + .slider { background-color: var(--color-accent); }
input:checked + .slider:before { transform: translateX(14px); }

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  letter-spacing: 0.005em;
  border: 1px solid transparent;
}
.status-pill--active {
  background: var(--success-50);
  color: var(--success-700);
  border-color: var(--success-100);
}
.status-pill--inactive {
  background: var(--neutral-100);
  color: var(--neutral-600);
  border-color: var(--color-border);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
}

/* ----------------- Sites button ----------------- */
.sites-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px 5px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}
.sites-btn:hover {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}
.sites-btn:focus-visible {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}
.sites-btn.is-open {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}
.sites-count {
  font-variant-numeric: tabular-nums;
  font-weight: var(--fw-semi);
  color: var(--color-text);
}
.sites-label {
  color: var(--color-text-secondary);
  font-weight: var(--fw-regular);
}
.chev {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  color: var(--color-text-secondary);
  transition: transform 180ms ease;
}
.sites-btn.is-open .chev { transform: rotate(180deg); }

.sites-empty {
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
}

/* ----------------- Detail (expanded) row ----------------- */
.detail-row td {
  padding: 0 var(--space-4) var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  background: var(--neutral-50);
}

.detail-shell {
  margin-left: 52px;        /* aligns under user-meta column */
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--space-3);
}
.detail-title {
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.detail-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.site-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-2);
}

.site-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  transition: border-color 140ms ease, background 140ms ease;
}
.site-item:hover {
  border-color: var(--neutral-300);
  background: var(--neutral-50);
}

.site-icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-500);
}
.site-icon svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}

.site-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.25;
}
.site-name {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.site-type {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
}

.site-visit {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid transparent;
  text-decoration: none;
  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
}
.site-visit:hover {
  background: var(--neutral-100);
  color: var(--color-text);
  border-color: var(--color-border);
}
.site-visit svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

/* ----------------- Empty state ----------------- */
.empty-cell {
  border-bottom: none !important;
  padding: 0 !important;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-7) var(--space-5);
  text-align: center;
  color: var(--color-text-secondary);
}
.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  margin-bottom: var(--space-3);
  color: var(--neutral-500);
}
.empty-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}
.empty-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: var(--fw-semi);
  color: var(--color-text);
}
.empty-desc {
  margin: 4px 0 0 0;
  font-size: var(--fs-sm);
}

/* ----------------- Pagination ----------------- */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--neutral-50);
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.pagination-info {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.pagination-info strong {
  color: var(--color-text);
  font-weight: var(--fw-medium);
}

.pagination-controls {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}
.pagination-btn svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.pagination-btn:hover:not(:disabled) {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}
.pagination-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-indicator {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  padding: 0 var(--space-2);
}
.page-indicator strong {
  color: var(--color-text);
  font-weight: var(--fw-medium);
}

/* ----------------- Responsive ----------------- */
@media (max-width: 640px) {
  .page-header { align-items: flex-start; }
  .header-meta { width: 100%; }
  .col-status { width: auto; }
  .status-pill { display: none; }
  .detail-shell { margin-left: 0; }
  .pagination { justify-content: center; }
}
</style>

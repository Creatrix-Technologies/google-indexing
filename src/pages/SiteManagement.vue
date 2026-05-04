<template>
  <div class="page-container">
    <!-- Sync overlay -->
    <div v-if="loading" class="page-loader" role="status" aria-live="polite">
      <div class="loader-box">
        <span class="spinner" aria-hidden="true"></span>
        <p>Syncing sites from Google…</p>
      </div>
    </div>

    <!-- ============ HEADER ============ -->
    <div class="page-header">
      <div>
        <h1>Sites</h1>
        <p class="subtitle">
          Manage and configure the websites connected to your account.
        </p>
      </div>

      <div class="header-actions">
        <div class="header-meta" v-if="sites.length">
          <span class="meta-pill">
            <span class="meta-dot meta-dot--active"></span>
            {{ activeCount }} active
          </span>
          <span class="meta-pill" v-if="inactiveCount">
            <span class="meta-dot meta-dot--inactive"></span>
            {{ inactiveCount }} inactive
          </span>
          <span class="meta-pill meta-pill--total">{{ sites.length }} total</span>
        </div>

        <button
          v-if="googleConfigStore.isValid"
          class="btn-primary"
          @click="syncsites"
          :disabled="loading || !entitlementsStore.canUsePaidFeatures || entitlementsStore.isChecking"
          :title="paidActionTitle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="{ 'is-spinning': loading }">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {{ loading ? 'Syncing…' : 'Sync sites' }}
        </button>
      </div>
    </div>

    <!-- ============ TABLE ============ -->
    <div class="table-card">
      <div class="grid-toolbar">
        <span class="grid-toolbar__total">
          <strong>{{ sites.length }}</strong>
          {{ sites.length === 1 ? 'site' : 'sites' }}
        </span>
      </div>

      <div class="table-scroll">
        <table class="sites-table">
          <thead>
            <tr>
              <th class="col-site">Site</th>
              <th class="col-type">Type</th>
              <th class="col-status">Status</th>
              <th class="col-robots">Robots.txt</th>
              <th class="col-date">Created</th>
              <th class="col-actions"></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="site in sites" :key="site.id">
              <!-- Site identity -->
              <td class="col-site">
                <div class="site-cell">
                  <span class="site-chip" aria-hidden="true">{{ siteInitial(site) }}</span>
                  <div class="site-meta">
                    <span class="site-name">{{ site.name || hostname(site.url) }}</span>
                    <a
                      :href="site.url"
                      target="_blank"
                      rel="noopener"
                      class="site-url"
                      :title="site.url"
                    >
                      {{ site.url }}
                    </a>
                  </div>
                </div>
              </td>

              <!-- Type -->
              <td class="col-type">
                <span class="type-pill" v-if="site.type">{{ site.type }}</span>
                <span class="muted" v-else>—</span>
              </td>

              <!-- Status -->
              <td class="col-status">
                <span
                  class="status-badge"
                  :class="site.activeStatus.toLowerCase()"
                >
                  <span class="dot"></span>
                  {{ site.activeStatus }}
                </span>
              </td>

              <!-- Robots.txt -->
              <td class="col-robots">
                <span
                  class="robots-pill"
                  :class="site.ignoreRobotTxt ? 'robots-pill--ignored' : 'robots-pill--followed'"
                  :title="site.ignoreRobotTxt
                    ? 'Crawling ignores robots.txt directives'
                    : 'Crawling respects robots.txt directives'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <template v-if="site.ignoreRobotTxt">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </template>
                    <template v-else>
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </template>
                  </svg>
                  {{ site.ignoreRobotTxt ? 'Ignored' : 'Followed' }}
                </span>
              </td>

              <!-- Created -->
              <td class="col-date">
                <span :title="absoluteDate(site.created)">
                  {{ relativeDate(site.created) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="col-actions">
                <div class="action-cell">
                  <button
                    class="action-btn"
                    @click="editSite(site)"
                    :title="`Edit ${site.name || site.url}`"
                    :aria-label="`Edit ${site.name || site.url}`"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="sites.length === 0">
              <td colspan="6" class="empty-cell">
                <div class="empty-state">
                  <div class="empty-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <p class="empty-title">No sites yet</p>
                  <p class="empty-desc">
                    <template v-if="googleConfigStore.isValid">
                      Click <strong>Sync sites</strong> to import properties from your Google Search Console account.
                    </template>
                    <template v-else>
                      Configure your Google Service Account to start importing sites.
                    </template>
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box modal-box--lg" @click.stop role="dialog" aria-modal="true">
        <header class="modal-header">
          <div>
            <h2 class="modal-title">{{ isEditing ? 'Edit site' : 'Add new site' }}</h2>
            <p class="modal-subtitle">
              {{ isEditing ? 'Update site details and indexing preferences.' : 'Connect a Google Search Console property to start indexing.' }}
            </p>
          </div>
          <button type="button" class="modal-close" aria-label="Close" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <form @submit.prevent="saveSite">
          <div class="modal-body">
            <div class="form-group">
              <label>Site Name *</label>
              <input v-model="formData.name" required />
            </div>

            <div class="form-group">
              <label>Google Console Sites *</label>
              <select v-model="formData.url" required>
                <option value="" disabled>
                  {{ isLoadingUrls ? 'Loading URLs...' : 'Select URL' }}
                </option>
                <option v-for="url in availableUrls" :key="url" :value="url">
                  {{ url }}
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Site Type *</label>
                <select v-model="formData.type" required>
                  <option value="">Select Type</option>
                  <option>E-commerce</option>
                  <option>Blog</option>
                  <option>Portfolio</option>
                  <option>Corporate</option>
                  <option>SaaS</option>
                  <option>Other</option>
                </select>
              </div>

              <div class="form-group">
                <label>Status</label>
                <div class="toggle-container">
                  <input
                    v-model="formData.activeStatus"
                    type="checkbox"
                    id="status-toggle"
                    :true-value="'Active'"
                    :false-value="'Inactive'"
                    class="toggle-input"
                  />
                  <label for="status-toggle" class="toggle-label">
                    <span class="toggle-switch"></span>
                    <span class="toggle-text">
                      {{ formData.activeStatus }}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Ignore robots.txt</label>
              <div class="toggle-container">
                <input
                  v-model="formData.ignoreRobotTxt"
                  type="checkbox"
                  id="robots-toggle"
                  class="toggle-input"
                />
                <label for="robots-toggle" class="toggle-label">
                  <span class="toggle-switch"></span>
                  <span class="toggle-text">
                    {{ formData.ignoreRobotTxt ? 'Yes (Ignore)' : 'No (Follow)' }}
                  </span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="formData.description" rows="3" />
            </div>
          </div>

          <footer class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="!entitlementsStore.canUsePaidFeatures || entitlementsStore.isChecking" :title="paidActionTitle">
              {{ isEditing ? 'Update Site' : 'Add Site' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useToast } from 'vue-toastification'
import { useGoogleConfigStore } from '../Shared/googleConfig'
import { useSubscriptionStore } from '../Shared/subscription'
import { useEntitlementsStore } from '../Shared/entitlements'
import Swal from 'sweetalert2'

const loading = ref(false)

const toast = useToast()
const googleConfigStore = useGoogleConfigStore()
const subscriptionStore = useSubscriptionStore()
const entitlementsStore = useEntitlementsStore()
const paidActionTitle = computed(() => entitlementsStore.canUsePaidFeatures ? '' : entitlementsStore.blockingReason)

const ensurePaidAccess = async () => {
  await entitlementsStore.refresh()
  if (entitlementsStore.canUsePaidFeatures) return true
  await Swal.fire('Subscription required', entitlementsStore.blockingReason, 'warning')
  return false
}

interface Site {
  id: number
  name: string
  url: string
  type: string
  activeStatus: 'Active' | 'Inactive'
  description: string
  created: Date
  ignoreRobotTxt: boolean
}

interface FormData {
  name: string
  url: string
  type: string
  activeStatus: 'Active' | 'Inactive'
  description: string
  ignoreRobotTxt: boolean
}

const sites = ref<Site[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const formData = ref<FormData>({
  name: '',
  url: '',
  type: '',
  activeStatus: 'Active',
  description: '',
  ignoreRobotTxt: false
})

/* ---------- derived (display only) ---------- */
const activeCount = computed(() => sites.value.filter(s => s.activeStatus === 'Active').length)
const inactiveCount = computed(() => sites.value.filter(s => s.activeStatus === 'Inactive').length)

const fetchSites = async () => {
  const res = await api.get('/site?PageNo=1&PageSize=10')
  sites.value = (res.data.data || []).map((i: any) => ({
    id: i.webSiteId,
    name: i.siteName,
    url: i.url,
    type: i.siteType,
    activeStatus: i.activeStatus ? 'Active' : 'Inactive',
    description: i.description || '',
    created: new Date(i.createdDate),
    ignoreRobotTxt: i.ignoreRobotTxt ?? false
  }))
}



const syncsites = async () => {
  if (!(await ensurePaidAccess())) return
  const result = await Swal.fire({
    text: 'This will sync all available sites from your Google account.',
    title: `Do you want to continue?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  })

  if (!result.isConfirmed) return

  loading.value = true

  try {
    const response = await api.post('site/sync', {})

    if (response.data?.isSuccess === false) {
      toast.error(response.data.error?.description || 'Failed to sync Google Sites')
      return
    }

    toast.success(response.data?.message || 'Google Sites synced successfully.')
    await fetchSites()

  } catch (err: any) {
    toast.error(
      err?.response?.data?.error?.description ||
      err?.response?.data?.message ||
      err?.message ||
      'An error occurred while syncing'
    )
  } finally {
    loading.value = false
  }
}

const saveSite = async () => {
  if (!(await ensurePaidAccess())) return
  try {
    await api.post('/site', {
      siteName: formData.value.name,
      url: formData.value.url,
      siteType: formData.value.type,
      description: formData.value.description,
      isActivated: formData.value.activeStatus === 'Active',
      ignoreRobotTxt: formData.value.ignoreRobotTxt,
      webSiteId: editingId.value
    })

    toast.success('Site saved successfully')
    fetchSites()
    closeModal()
  } catch {
    toast.error('Failed to save site')
  }
}

// const openAddModal = async () => {
//   isEditing.value = false
//   editingId.value = null
//   formData.value = {
//     name: '',
//     url: '',
//     type: '',
//     activeStatus: 'Active',
//     description: '',
//     ignoreRobotTxt: false
//   }
//   showModal.value = true
//   fetchAvailableUrls()
// }

const editSite = async (site: Site) => {
  isEditing.value = true
  editingId.value = site.id
  formData.value = { ...site }
  showModal.value = true
  fetchAvailableUrls()
}

const closeModal = () => (showModal.value = false)

/* ---------- display helpers (UI only) ---------- */
const hostname = (url: string) => {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
}

const siteInitial = (site: Site) => {
  const source = (site.name && site.name.trim()) || hostname(site.url) || '?'
  return source.charAt(0).toUpperCase() || '?'
}

const absoluteDate = (date?: Date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const relativeDate = (date?: Date) => {
  if (!date) return '—'
  const now = Date.now()
  const ts = new Date(date).getTime()
  const diff = Math.max(0, now - ts)
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'Just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} ${hr === 1 ? 'hour' : 'hours'} ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ${day === 1 ? 'day' : 'days'} ago`
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const availableUrls = ref<string[]>([])
const isLoadingUrls = ref(false)

const fetchAvailableUrls = async () => {
  try {
    isLoadingUrls.value = true
    const res = await api.get('/site/google-sites')
    availableUrls.value = res.data.data || []
  } finally {
    isLoadingUrls.value = false
  }
}

onMounted(() => {
  fetchSites()
  googleConfigStore.check()
  subscriptionStore.checkSubscription()
  entitlementsStore.refresh()
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

/* ============ Header ============ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-5);
  gap: var(--space-4);
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

.header-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
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
}
.meta-dot--active   { background: var(--color-success); }
.meta-dot--inactive { background: var(--neutral-400); }

/* ============ Buttons ============ */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--color-accent);
  color: var(--color-accent-fg);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  font-size: var(--fs-base);
  cursor: pointer;
  transition: background 140ms ease, box-shadow 140ms ease;
  letter-spacing: -0.005em;
  font-family: inherit;
}
.btn-primary svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.btn-primary svg.is-spinning { animation: spin 900ms linear infinite; }
.btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--ring-accent);
}
.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 8px 14px;
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  font-size: var(--fs-base);
  cursor: pointer;
  font-family: inherit;
  transition: background 140ms ease, border-color 140ms ease;
}
.btn-secondary:hover {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}

/* ============ Table card ============ */
.table-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}

.grid-toolbar {
  padding: 10px var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  background: var(--neutral-50);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.grid-toolbar__total {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.grid-toolbar__total strong {
  color: var(--color-text);
  font-weight: var(--fw-semi);
  margin-right: 4px;
}

.table-scroll { overflow-x: auto; }

.sites-table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
  min-width: 880px;
}
.sites-table thead {
  background: var(--neutral-50);
  border-bottom: 1px solid var(--color-border);
}
.sites-table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--fw-medium);
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.sites-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  font-size: var(--fs-base);
  color: var(--color-text);
  vertical-align: middle;
}
.sites-table tbody tr {
  transition: background 120ms ease;
}
.sites-table tbody tr:hover {
  background: var(--neutral-50);
}
.sites-table tbody tr:last-child td {
  border-bottom: none;
}

.col-site    { min-width: 320px; }
.col-type    { width: 140px; }
.col-status  { width: 130px; }
.col-robots  { width: 150px; }
.col-date    { width: 160px; white-space: nowrap; color: var(--color-text-secondary); font-size: var(--fs-sm); }
.col-actions { width: 90px; }

/* ============ Site cell ============ */
.site-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.site-chip {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semi);
  color: var(--color-text);
}
.site-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}
.site-name {
  font-weight: var(--fw-medium);
  color: var(--color-text);
  font-size: var(--fs-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.site-url {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 360px;
}
.site-url:hover {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ============ Type pill ============ */
.type-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  color: var(--neutral-700);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  letter-spacing: 0.01em;
}
.muted { color: var(--color-text-secondary); }

/* ============ Status badges ============ */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  background: var(--success-50);
  color: var(--success-700);
  border: 1px solid var(--success-100);
  letter-spacing: 0.005em;
}
.status-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
}
.status-badge.inactive,
.status-badge.failed {
  background: var(--neutral-100);
  color: var(--neutral-600);
  border-color: var(--color-border);
}
.status-badge.success {
  background: var(--success-50);
  color: var(--success-700);
  border-color: var(--success-100);
}

/* ============ Robots.txt pill ============ */
.robots-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  border: 1px solid transparent;
  letter-spacing: 0.005em;
  cursor: help;
}
.robots-pill svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.robots-pill--followed {
  background: var(--info-50);
  color: var(--info-700);
  border-color: var(--info-100);
}
.robots-pill--ignored {
  background: var(--warning-50);
  color: var(--warning-700);
  border-color: var(--warning-100);
}

/* ============ Action button ============ */
.action-cell {
  display: inline-flex;
  gap: 6px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
  font-family: inherit;
}
.action-btn svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.action-btn:hover {
  background: var(--neutral-50);
  border-color: var(--neutral-400);
}

/* ============ Empty state ============ */
.empty-cell {
  border-bottom: none !important;
  padding: 0 !important;
  background: transparent;
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
  max-width: 44ch;
}
.empty-desc strong {
  color: var(--color-text);
  font-weight: var(--fw-medium);
}

/* ============ Modal: anatomy in theme.css ============ */
.form-group { margin-bottom: var(--space-4); }
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: var(--fw-medium);
  color: var(--color-text);
  font-size: var(--fs-sm);
  letter-spacing: -0.005em;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 11px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  font-family: inherit;
  background: var(--color-card-bg);
  color: var(--color-text);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--color-placeholder);
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}

/* Toggle */
.toggle-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.toggle-input { display: none; }
.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  user-select: none;
}
.toggle-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background: var(--neutral-300);
  border-radius: var(--radius-pill);
  transition: background 200ms ease;
  display: block;
}
.toggle-switch::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: left 200ms ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.20);
}
.toggle-input:checked + .toggle-label .toggle-switch {
  background: var(--color-accent);
}
.toggle-input:checked + .toggle-label .toggle-switch::after { left: 18px; }
.toggle-text {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
}

/* ============ Responsive ============ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  .site-url { max-width: 220px; }
  .form-row { grid-template-columns: 1fr; }
  .modal-box.modal-box--lg {
    width: 95%;
    max-height: 95vh;
  }
}

/* ============ Page loader ============ */
.page-loader {
  position: fixed;
  inset: 0;
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.loader-box {
  background: var(--color-card-bg);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  box-shadow: var(--shadow-md);
  font-size: var(--fs-base);
  color: var(--color-text);
}
.spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--neutral-200);
  border-top-color: var(--color-accent);
  display: inline-block;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

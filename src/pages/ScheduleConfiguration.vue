<template>
  <div class="page-container">
    <!-- ======================== Header ======================== -->
    <div class="page-header">
      <div>
        <h1>Schedules</h1>
        <p class="subtitle">
          Automate crawl cadence and daily URL quotas per site.
        </p>
      </div>

      <div class="header-meta" v-if="schedules.length">
        <span class="meta-pill meta-pill--success">
          <span class="meta-dot"></span>
          {{ activeCount }} active
        </span>
        <span class="meta-pill meta-pill--muted">
          <span class="meta-dot"></span>
          {{ inactiveCount }} inactive
        </span>
        <span class="meta-pill">{{ schedules.length }} total</span>
      </div>
    </div>

    <!-- ======================== Table ======================== -->
    <div class="table-card">
      <div class="grid-toolbar" v-if="schedules.length">
        <div class="grid-toolbar__left">
          <span class="grid-toolbar__count">{{ schedules.length }} {{ schedules.length === 1 ? 'site' : 'sites' }}</span>
        </div>
      </div>

      <div class="table-scroll">
        <table class="sites-table">
          <thead>
            <tr>
              <th class="th-site">Site</th>
              <th>Status</th>
              <th>Type</th>
              <th>Frequency</th>
              <th>Window</th>
              <th class="th-num">Daily quota</th>
              <th>Queue progress</th>
              <th class="th-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in schedules" :key="item.websiteId">
              <!-- Site -->
              <td class="site-cell">
                <span class="url-chip">{{ siteInitial(item.url) }}</span>
                <span class="url-link" :title="item.url">{{ item.url }}</span>
              </td>

              <!-- Status -->
              <td>
                <span
                  class="status-pill"
                  :class="item.isActive ? 'status-pill--success' : 'status-pill--muted'"
                >
                  <span class="status-dot"></span>
                  {{ item.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Type -->
              <td>
                <span class="type-pill">{{ item.type || '—' }}</span>
              </td>

              <!-- Frequency -->
              <td class="frequency-cell">
                {{ formatFrequency(item.frequency) || '—' }}
              </td>

              <!-- Window -->
              <td class="window-cell">
                {{ formatWindow(item.startTime, item.endTime) }}
              </td>

              <!-- Daily quota -->
              <td class="num-cell">
                <span class="num-strong">{{ formatNumber(item.maxUrls) }}</span>
                <span class="num-suffix">URLs</span>
              </td>

              <!-- Queue progress -->
              <td class="queue-cell">
                <template v-if="hasLiveProgress(item.websiteId)">
                  <div class="queue-stack">
                    <div class="queue-meta">
                      <span class="queue-meta__count">
                        {{ formatNumber(getProgress(item.websiteId)!.completed) }}
                        <span class="queue-meta__total">/ {{ formatNumber(getProgress(item.websiteId)!.total) }}</span>
                      </span>
                      <span class="queue-meta__pct">{{ getProgressPercent(item.websiteId) }}%</span>
                    </div>
                    <div class="progress-track" role="progressbar" :aria-valuenow="getProgressPercent(item.websiteId)" aria-valuemin="0" aria-valuemax="100">
                      <div class="progress-fill" :style="{ width: getProgressPercent(item.websiteId) + '%' }"></div>
                    </div>
                  </div>
                </template>

                <template v-else-if="item.queued > 0">
                  <div class="queue-stack">
                    <div class="queue-meta">
                      <span class="queue-meta__count">
                        {{ formatNumber(item.queueCompleted) }}
                        <span class="queue-meta__total">/ {{ formatNumber(item.queued) }}</span>
                      </span>
                      <span class="queue-meta__pct queue-meta__pct--muted">{{ historicalPercent(item) }}%</span>
                    </div>
                    <div class="progress-track">
                      <div class="progress-fill progress-fill--muted" :style="{ width: historicalPercent(item) + '%' }"></div>
                    </div>
                  </div>
                </template>

                <span v-else class="queue-empty">Idle</span>
              </td>

              <!-- Actions -->
              <td class="action-cell">
                <button class="action-btn" @click="openEdit(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span>Edit</span>
                </button>

                <button
                  class="action-btn action-btn--accent"
                  @click="bulkrun(item.websiteId)"
                  :disabled="isRunActionDisabled(item)"
                  :title="runActionLabel(item)"
                >
                  <template v-if="isItemRunning(item)">
                    <span class="spinner" aria-hidden="true"></span>
                    <span>Running</span>
                  </template>
                  <template v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>
                    </svg>
                    <span>Run now</span>
                  </template>
                </button>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="!schedules.length">
              <td colspan="8" class="empty-cell">
                <div class="empty-state">
                  <div class="empty-state__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <circle cx="12" cy="15" r="2"/>
                    </svg>
                  </div>
                  <div class="empty-state__title">No schedules yet</div>
                  <div class="empty-state__desc">Schedules are created automatically when you add a site. Add a site to start automating crawls.</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ======================== Edit Modal ======================== -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box modal-box--schedule" @click.stop role="dialog" aria-modal="true">
        <header class="modal-header">
          <div>
            <h2 class="modal-title">Update schedule</h2>
            <p class="modal-subtitle">Adjust crawl cadence and daily URL quota.</p>
          </div>
          <button type="button" class="modal-close" aria-label="Close" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <form @submit.prevent="saveSchedule">
          <div class="modal-body">
            <div class="site-info">{{ selectedUrl }}</div>

            <div class="form-group">
              <label>Frequency</label>
              <select v-model="formData.frequency" required>
                <option value="">Select</option>
                <option value="1">Daily</option>
                <option value="7">Weekly</option>
                <option value="30">Monthly</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Start Time</label>
                <input type="time" v-model="formData.startTime" required />
              </div>

              <div class="form-group">
                <label>End Time</label>
                <input type="time" v-model="formData.endTime" required />
              </div>
            </div>

            <div class="form-group">
              <label>Max URLs</label>
              <input type="number" v-model.number="formData.maxUrls" min="1" max="200" required />
            </div>

            <div class="form-group">
              <label>Status</label>
              <div class="status-row">
                <label class="switch">
                  <input type="checkbox" v-model="formData.isActive" />
                  <span class="slider"></span>
                </label>
                <span :class="formData.isActive ? 'status-active' : 'status-inactive'">
                  {{ formData.isActive ? 'Active' : 'Not Active' }}
                </span>
              </div>
            </div>
          </div>

          <footer class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary">Save changes</button>
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
import Swal from 'sweetalert2'

const toast = useToast()

interface Schedule {
  websiteId: number
  url: string
  type: string
  frequency: number
  startTime: string | null
  endTime: string | null
  maxUrls: number
  queued: number
  isRunning: boolean
  isPickByJob: boolean,
  queueCompleted:number,
  isActive: boolean
}

interface Progress {
  total: number
  completed: number
  failed: number
}

const schedules = ref<Schedule[]>([])
const progressMap = ref<Record<number, Progress | undefined>>({})
const eventSources = new Map<number, EventSource>()

const showModal = ref(false)
const editingId = ref<number | null>(null)
const selectedUrl = ref('')

const formData = ref({
  frequency: '',
  startTime: '',
  endTime: '',
  maxUrls: 1,
  isActive: true 
})

/* ================= SSE LISTENER ================= */
const listenToProgress = (websiteId: number) => {
  if (eventSources.has(websiteId)) return

  const source = new EventSource(
    `${import.meta.env.VITE_API_BASE_URL}/crawl/bulk-run/${websiteId}`
  )

  eventSources.set(websiteId, source)

  source.onmessage = (e) => {
    const data = JSON.parse(e.data)

    progressMap.value[websiteId] = {
      total: data.Total ?? progressMap.value[websiteId]?.total ?? 0,
      completed: data.Completed ?? progressMap.value[websiteId]?.completed ?? 0,
      failed: data.Failed ?? progressMap.value[websiteId]?.failed ?? 0
    }

    if (data.status === 'completed') {
      toast.success('Queue process completed')
      source.close()
      eventSources.delete(websiteId)
      fetchSchedules()
    }
  }

  source.onerror = () => {
    source.close()
    eventSources.delete(websiteId)
  }
}

/* ================= API ================= */
const fetchSchedules = async () => {
  const res = await api.get('/schedule/get')

  schedules.value = (res.data.data || []).map((i: any) => ({
    websiteId: i.websiteId,
    url: i.url,
    type: i.type,
    frequency: i.frequency,
    startTime: i.startTime,
    endTime: i.endTime,
    maxUrls: i.maxUrls,
    queued: i.totalQueued,
    isRunning: i.isRunning,
    isPickByJob: i.isPickByJob,
    queueCompleted: i.queueCompleted,
    isActive: i.isActive 
  }))

  // resume listeners for running items
  schedules.value.forEach(i => {
    if (i.isRunning || i.isPickByJob) listenToProgress(i.websiteId)
  })
}

const bulkrun = async (websiteId: number) => {

  const confirm = await Swal.fire({
    title: 'Run Instantly?',
    text: 'The queue will begin processing right away.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Run Now',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#22c55e'
  })

  if (!confirm.isConfirmed) return

  progressMap.value[websiteId] = { total: 0, completed: 0, failed: 0 }
  listenToProgress(websiteId)

  try {
    await api.post('/crawl/index-bulk', { websiteId })
  } catch (err: any) {
    fetchSchedules()
    const apiError = err?.response?.data?.error
    if (apiError?.description) {
      toast.error(apiError.description)
    } else {
      toast.error('Failed to start queue process')
    }
    delete progressMap.value[websiteId]
  }
}

/* ================= UI HELPERS ================= */
const openEdit = (item: Schedule) => {
  editingId.value = item.websiteId
  selectedUrl.value = item.url
  formData.value = {
    frequency: String(item.frequency),
    startTime: item.startTime || '',
    endTime: item.endTime || '',
    maxUrls: item.maxUrls,
    isActive: item.isActive 
  }
  showModal.value = true
}

const saveSchedule = async () => {
  if (!editingId.value) return

  try {
    const now = new Date()
    const utcDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    const dateOnlyUtc = utcDate.toISOString().split('T')[0] // "yyyy-MM-dd" in UTC

    const response = await api.post('/schedule/update', {
      websiteId: editingId.value,
      frequency: Number(formData.value.frequency),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      maxUrls: formData.value.maxUrls,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      date: dateOnlyUtc
    })

    if (response.data?.isSuccess) {
      toast.success('Schedule updated')
      showModal.value = false
      fetchSchedules()
    } else {
      // Handle validation errors from API
      const errors = response.data?.error?.validationErrors
      if (errors && errors.length) {
        const cleanErrors = errors.map((e: string) => e.replace(/'/g, ""))        
        toast.error(cleanErrors.join(', '))
      } else {
        const description = response.data?.error?.description?.replace(/'/g, "") || 'Failed to update schedule'
        toast.error(description)
      }
    }
  } catch (err: any) {
    // Handle network or unexpected errors
    const errors = err.response?.data?.error?.validationErrors
    const description = err.response?.data?.error?.description
    const msg = errors?.map((e: string) => e.replace(/'/g, "")).join(', ') 
                || description?.replace(/'/g, "") 
                || err.message 
                || 'Failed to update schedule'
    toast.error(msg)
  }
}

const closeModal = () => (showModal.value = false)

const formatTime = (t?: string | null) => {
  if (!t) return '-'
  const [h, m = '00'] = t.split(':')
  const hr = Number(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

const formatFrequency = (v: number) =>
  v === 1 ? 'Daily' : v === 7 ? 'Weekly' : v === 30 ? 'Monthly' : ''

/* ================= COMPUTED HELPERS ================= */
const getProgress = (websiteId: number) => progressMap.value[websiteId]

const getProgressPercent = (websiteId: number) => {
  const p = progressMap.value[websiteId]
  if (!p || p.total === 0) return 0
  return Math.round((p.completed / p.total) * 100)
}

/* ================= DISPLAY-ONLY HELPERS ================= */
const activeCount = computed(() => schedules.value.filter(s => s.isActive).length)
const inactiveCount = computed(() => schedules.value.filter(s => !s.isActive).length)

const siteInitial = (url: string): string => {
  if (!url) return '–'
  try {
    const cleaned = url.replace(/^https?:\/\//, '').replace(/^www\./, '')
    return cleaned.charAt(0).toUpperCase()
  } catch {
    return '–'
  }
}

const formatWindow = (start: string | null, end: string | null) => {
  if (!start && !end) return '—'
  return `${formatTime(start)} → ${formatTime(end)}`
}

const formatNumber = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return '0'
  return Number(n).toLocaleString('en-US')
}

const hasLiveProgress = (websiteId: number): boolean => {
  const p = progressMap.value[websiteId]
  return !!(p && p.total > 0)
}

const historicalPercent = (item: Schedule): number => {
  if (!item.queued || item.queued === 0) return 0
  return Math.round(((item.queueCompleted || 0) / item.queued) * 100)
}

const isItemRunning = (item: Schedule): boolean => {
  if (item.isRunning || item.isPickByJob) return true
  const p = progressMap.value[item.websiteId]
  if (p && p.total > 0 && p.completed < p.total) return true
  return false
}

const isRunActionDisabled = (item: Schedule): boolean => isItemRunning(item)

const runActionLabel = (item: Schedule): string => {
  if (isItemRunning(item)) return 'Already running'
  return 'Run instantly'
}

onMounted(fetchSchedules)
</script>

<style scoped>
/* ============ Layout ============ */
.page-container {
  flex: 1;
  padding: 0;
  background: var(--color-background);
  font-family: var(--font-family);
}

/* ============ Header ============ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
  flex-wrap: wrap;
}
.page-header h1 {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  color: var(--color-text);
  margin: 0 0 4px 0;
  line-height: 1.15;
}
.subtitle {
  font-size: var(--fs-base);
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 64ch;
}

.header-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.meta-pill--success {
  background: var(--success-50);
  border-color: var(--success-100);
  color: var(--success-700);
}
.meta-pill--muted {
  background: var(--neutral-50);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}
.meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  background: var(--color-card-bg);
}
.grid-toolbar__count {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-weight: var(--fw-medium);
  font-variant-numeric: tabular-nums;
}

.table-scroll {
  overflow-x: auto;
}

/* ============ Table ============ */
.sites-table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
  min-width: 980px;
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
.th-num { text-align: right; }
.th-actions { text-align: right; }
.sites-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-divider);
  font-size: var(--fs-sm);
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

/* ============ Site cell ============ */
.site-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 240px;
  max-width: 360px;
}
.url-chip {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  flex-shrink: 0;
}
.url-link {
  font-size: var(--fs-sm);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: var(--fw-medium);
  letter-spacing: -0.005em;
}

/* ============ Status pill ============ */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  border: 1px solid transparent;
  white-space: nowrap;
}
.status-pill--success {
  background: var(--success-50);
  color: var(--success-700);
  border-color: var(--success-100);
}
.status-pill--muted {
  background: var(--neutral-50);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* ============ Type pill ============ */
.type-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--neutral-50);
  border: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  letter-spacing: 0.005em;
  white-space: nowrap;
}

/* ============ Misc cells ============ */
.frequency-cell,
.window-cell {
  white-space: nowrap;
  color: var(--color-text);
  font-weight: var(--fw-regular);
}

.num-cell {
  text-align: right;
  white-space: nowrap;
}
.num-strong {
  font-weight: var(--fw-semi);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.num-suffix {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  margin-left: 4px;
}

/* ============ Queue progress ============ */
.queue-cell {
  min-width: 200px;
}
.queue-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 220px;
}
.queue-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.queue-meta__count {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semi);
  color: var(--color-text);
}
.queue-meta__total {
  font-weight: var(--fw-regular);
  color: var(--color-text-secondary);
}
.queue-meta__pct {
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--success-700);
  font-variant-numeric: tabular-nums;
}
.queue-meta__pct--muted {
  color: var(--color-text-secondary);
}
.progress-track {
  width: 100%;
  height: 6px;
  background: var(--neutral-100);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--color-success);
  border-radius: inherit;
  transition: width 280ms ease;
}
.progress-fill--muted {
  background: var(--neutral-300);
}
.queue-empty {
  display: inline-flex;
  align-items: center;
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background: var(--neutral-50);
  border: 1px solid var(--color-border);
}

/* ============ Action buttons ============ */
.action-cell {
  text-align: right;
  white-space: nowrap;
}
.action-cell > * + * { margin-left: 6px; }

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  font-family: inherit;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
}
.action-btn svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}
.action-btn:hover:not(:disabled) {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}
.action-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.action-btn--accent {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-accent-fg);
}
.action-btn--accent:hover:not(:disabled) {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  color: var(--color-accent-fg);
}
.action-btn--accent:disabled {
  background: var(--neutral-100);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
  opacity: 1;
}

.spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  animation: spin 720ms linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============ Empty state ============ */
.empty-cell {
  padding: 0 !important;
  border-bottom: none !important;
}
.empty-state {
  padding: var(--space-7) var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
  color: var(--color-text-secondary);
}
.empty-state__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--neutral-50);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-500);
}
.empty-state__icon svg {
  width: 22px;
  height: 22px;
}
.empty-state__title {
  font-size: var(--fs-base);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: -0.005em;
}
.empty-state__desc {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  max-width: 44ch;
  line-height: 1.5;
}

/* ============ Modal ============ */
form { padding: 0; }

.site-info {
  background: var(--neutral-50);
  border: 1px solid var(--color-border);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  text-align: center;
  font-weight: var(--fw-medium);
  font-size: var(--fs-sm);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.form-row .form-group { margin-bottom: var(--space-4); }

.form-group { margin-bottom: var(--space-4); }
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: var(--fw-medium);
  font-size: var(--fs-sm);
  color: var(--color-text);
}
.form-group input,
.form-group select {
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
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-primary {
  padding: 8px 14px;
  background: var(--color-accent);
  color: var(--color-accent-fg);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  cursor: pointer;
  font-size: var(--fs-base);
  font-family: inherit;
  transition: background 140ms ease;
}
.btn-primary:hover { background: var(--color-accent-hover); }

.btn-secondary {
  padding: 8px 14px;
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  cursor: pointer;
  font-size: var(--fs-base);
  font-family: inherit;
  transition: background 140ms ease, border-color 140ms ease;
}
.btn-secondary:hover {
  background: var(--color-surface-2);
  border-color: var(--neutral-400);
}

/* ============ Toggle ============ */
.switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
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
  content: "";
  position: absolute;
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: #fff;
  transition: transform 200ms ease;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.20);
}
input:checked + .slider {
  background-color: var(--color-accent);
}
input:checked + .slider:before {
  transform: translateX(14px);
}

.status-active {
  color: var(--success-700);
  font-weight: var(--fw-medium);
  font-size: var(--fs-sm);
}
.status-inactive {
  color: var(--color-danger);
  font-weight: var(--fw-medium);
  font-size: var(--fs-sm);
}

/* ============ Responsive ============ */
@media (max-width: 768px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .header-meta { width: 100%; }
}
</style>

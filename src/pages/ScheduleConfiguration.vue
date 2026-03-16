<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Schedule Configuration</h1>
        <p class="subtitle">Manage index schedules</p>
      </div>
    </div>

    <div class="table-card">
      <table class="sites-table">
        <thead>
          <tr>
            <th>Website</th>
            <th>Status</th>
            <th>Type</th>
            <th>Frequency</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Max Url</th>
            <th>Queue Completed</th>
            <th>Total Queued</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in schedules" :key="item.websiteId">
            <td class="site-name-cell">
              <div class="site-icon">{{ item.url.charAt(0).toUpperCase() }}</div>
              <span>{{ item.url }}</span>
            </td>
            <td>
  <span
    :class="item.isActive ? 'status-active' : 'status-inactive'"
  >
    {{ item.isActive ? 'Active' : 'Not Active' }}
  </span>
</td>
            <td>{{ item.type }}</td>

            <td>
              <span class="status-badge">
                {{ formatFrequency(item.frequency) }}
              </span>
            </td>

            <td>{{ formatTime(item.startTime) }}</td>
            <td>{{ formatTime(item.endTime) }}</td>
            <td>{{ item.maxUrls }}</td>
            <td>{{ item.queueCompleted }}</td>
            <!-- Progress -->
            <td>
              <div style="display:flex;align-items:center;gap:6px;">
                <span>{{ item.queued }}</span>

                <div
                  v-if="getProgress(item.websiteId)?.total"
                  style="flex:1;"
                >
                  <div style="background:#e5e7eb;height:10px;border-radius:4px;overflow:hidden;">
                    <div
                      :style="{
                        width: getProgressPercent(item.websiteId) + '%',
                        background:'#10b981',
                        height:'100%',
                        transition:'width .3s'
                      }"
                    ></div>
                  </div>
                </div>

                <span
                  v-if="getProgress(item.websiteId)?.total"
                  style="font-size:12px;"
                >
                  {{ getProgressPercent(item.websiteId) }}%
                </span>
              </div>
            </td>

            <!-- Actions -->
            <td class="action-cell">
              <button class="action-btn" @click="openEdit(item)">Update</button>

              <button
                class="action-btn"
                title="Run Instantly"
                @click="bulkrun(item.websiteId)"
                :disabled="!!item.isRunning || !!item.isPickByJob || !!(
                  getProgress(item.websiteId) &&
                  getProgress(item.websiteId)!.completed < getProgress(item.websiteId)!.total
                )"
              >
                Run Now
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Update Schedule</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <form @submit.prevent="saveSchedule">
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

          <div class="form-group">
            <label>Start Time</label>
            <input type="time" v-model="formData.startTime" required />
          </div>

          <div class="form-group">
            <label>End Time</label>
            <input type="time" v-model="formData.endTime" required />
          </div>

          <div class="form-group">
            <label>Max URLs</label>
            <input type="number" v-model.number="formData.maxUrls" min="1" max="200" required />
          </div>

          <div class="form-group">
    <label>Status</label>

    <div style="display:flex;align-items:center;gap:10px;">
      <label class="switch">
        <input type="checkbox" v-model="formData.isActive" />
        <span class="slider"></span>
      </label>

      <span :class="formData.isActive ? 'status-active' : 'status-inactive'">
        {{ formData.isActive ? 'Active' : 'Not Active' }}
      </span>
    </div>
  </div>

          <div class="modal-footer">
            <button type="submit" class="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
    confirmButtonColor: '#10b981'
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

  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dateOnlyUtc = utcDate.toISOString().split('T')[0]; // "yyyy-MM-dd" in UTC

  await api.post('/schedule/update', {
    websiteId: editingId.value,
    frequency: Number(formData.value.frequency),
    startTime: formData.value.startTime,
    endTime: formData.value.endTime,
    maxUrls: formData.value.maxUrls,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    date: dateOnlyUtc
  })

  toast.success('Schedule updated')
  showModal.value = false
  fetchSchedules()
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

onMounted(fetchSchedules)
</script>

<style scoped>
.page-container { flex: 1; padding: 30px; overflow-y:auto; background:var(--color-bg); }
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; }
.page-header h1 { font-size:32px; color:var(--color-text); margin:0 0 10px 0; font-weight:700; }
.subtitle { font-size:14px; color:var(--color-text-muted); margin:0; }
.table-card { background:var(--color-card); border-radius:12px; border:1px solid var(--color-border); overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.05); }
.sites-table { width:100%; border-collapse:collapse; }
.sites-table thead { background:var(--color-slate-50); border-bottom:1px solid var(--color-border); }
.sites-table th { padding:15px; text-align:left; font-weight:600; font-size:13px; color:var(--color-text-secondary); text-transform:uppercase; letter-spacing:0.5px; }
.sites-table td { padding:15px; border-bottom:1px solid var(--color-border); font-size:14px; color:var(--color-text); }
.sites-table tbody tr:last-child td { border-bottom:none; }
.site-name-cell { display:flex; align-items:center; gap:10px; }
.site-icon { width:40px; height:40px; background:linear-gradient(135deg,var(--color-success) 0%,var(--color-success-hover) 100%); border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--color-card); font-weight:600; font-size:16px; flex-shrink:0; }
.status-badge { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:500; background:rgba(16, 185, 129, 0.15); color:var(--color-success); }
.action-cell { display:flex; gap:8px; align-items:center; }
.action-btn { padding:6px 12px; background:var(--color-slate-50); border:1px solid var(--color-border); border-radius:6px; color:var(--color-text-secondary); font-size:12px; cursor:pointer; transition:all 0.2s; }
.action-btn:hover { background:var(--color-success); border-color:var(--color-success); color:var(--color-card); }
.modal-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; }
.modal-content { background:var(--color-card); border-radius:12px; width:90%; max-width:450px; }
.modal-header { display:flex; justify-content:space-between; padding:20px; border-bottom:1px solid var(--color-border); }
.close-btn { background:none; border:none; font-size:26px; cursor:pointer; color:var(--color-text-muted); }
.close-btn:hover { color:var(--color-text); }
form { padding:20px; }
.site-info { background:rgba(59, 130, 246, 0.1); padding:10px; border-radius:8px; margin-bottom:16px; text-align:center; font-weight:600; color:var(--color-primary); }
.form-group { margin-bottom:20px; }
.form-group label { display:block; margin-bottom:8px; font-weight:600; }
.form-group input, .form-group select { width:100%; padding:10px 12px; border:1px solid var(--color-border); border-radius:6px; }
.modal-footer { display:flex; justify-content:flex-end; }
.btn-primary { padding:10px 20px; background:var(--color-success); color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer; }
.btn-primary:hover { background:var(--color-success-hover); }

.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
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
  background-color: #ccc;
  transition: .3s;
  border-radius: 22px;
}

.slider:before {
  content: "";
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-success);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.status-active {
  color: var(--color-success-hover);
  font-weight: 600;
  font-size: 13px;
}

.status-inactive {
  color: var(--color-error);
  font-weight: 600;
  font-size: 13px;
}
</style>

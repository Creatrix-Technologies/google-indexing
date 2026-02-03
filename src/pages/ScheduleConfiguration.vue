<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Schedule Configuration</h1>
        <p class="subtitle">Manage index schedules</p>
      </div>
    </div>

    <!-- Schedule List Table -->
    <div class="table-card">
      <table class="sites-table">
        <thead>
          <tr>
            <th>Website</th>
            <th>Type</th>
            <th>Frequency</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Max Url</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in schedules" :key="item.websiteId">
            <td class="site-name-cell">
              <div class="site-icon">{{ item.url.charAt(0).toUpperCase() }}</div>
              <span>{{ item.url }}</span>
            </td>

            <td>{{ item.type }}</td>

            <td>
              <span class="status-badge">
                {{ formatFrequency(item.frequency) }}
              </span>
            </td>

            <td>
              {{ formatTime(item.startTime) }}
            </td>

            <td>
              {{ formatTime(item.endTime) }}
            </td>

            <td>
              {{ item.maxUrls }}
            </td>
            <td class="action-cell">
              <button class="action-btn" @click="openEdit(item)">Update</button>
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
          <div class="site-info">
            {{ selectedUrl }}
          </div>

          <div class="form-group">
            <label>Frequency</label>
            <select v-model="formData.frequency" required>
              <option value="">Select Frequency</option>
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
      <input
    type="number"
    v-model.number="formData.maxUrls"
    min="1"
    max="200"
    placeholder="Enter max URLs (1-200)"
    @input="validateMaxUrls"
    required
  />
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

const toast = useToast()

interface Schedule {
  websiteId: number
  url: string
  type: string
  frequency: number
  startTime: string | null
  endTime: string | null,
  maxUrls:number
}

const validateMaxUrls = () => {
  if (formData.value.maxUrls > 200) formData.value.maxUrls = 200
  if (formData.value.maxUrls < 1) formData.value.maxUrls = 1
}

const schedules = ref<Schedule[]>([])
const showModal = ref(false)

const editingId = ref<number | null>(null)
const selectedUrl = ref('')

const formData = ref({
  frequency: '',
  startTime: '',
  endTime: '',
  maxUrls:0
})

const fetchSchedules = async () => {
  const res = await api.get('/schedule/get')
  schedules.value = (res.data.data || []).map((i: any) => ({
    websiteId: i.websiteId,
    url: i.url,
    type: i.type,
    frequency: i.frequency,
    startTime: i.startTime,
    endTime: i.endTime,
    maxUrls:i.maxUrls
  }))
}

const openEdit = (item: Schedule) => {
  editingId.value = item.websiteId
  selectedUrl.value = item.url

  formData.value = {
    frequency: item.frequency ? String(item.frequency) : '',
    startTime: item.startTime || '',
    endTime: item.endTime || '',
    maxUrls:item.maxUrls
  }

  showModal.value = true
}

const saveSchedule = async () => {
  try {
    await api.post('/schedule/update', {
      websiteId: editingId.value,
      frequency: Number(formData.value.frequency),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      maxUrls: formData.value.maxUrls
    })

    toast.success('Schedule updated')
    showModal.value = false
    fetchSchedules()

  } catch (err: any) {
    const apiError = err?.response?.data?.error

    if (
      apiError?.code === 'Validation.Error' &&
      Array.isArray(apiError.validationErrors) &&
      apiError.validationErrors.length > 0
    ) {
      // 👇 Validation error → show first message
      toast.error(apiError.validationErrors[0])
    } else if (apiError?.description) {
      // 👇 Other API error → show description
      toast.error(apiError.description)
    } else {
      // 👇 Fallback
      toast.error('Something went wrong')
    }
  }
}


const closeModal = () => (showModal.value = false)

const formatTime = (time: string | null) => {
  if (!time) return '-'
  const [h, m] = time.split(':')
  if (!h || !m) return '-'
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${ampm}`
}


const formatFrequency = (val: number) => {
  if(!val) return '-'
  if (val === 1) return 'Daily'
  if (val === 7) return 'Weekly'
  if (val === 30) return 'Monthly'
  return val + ' days'
}

onMounted(fetchSchedules)
</script>

<style scoped>
/* EXACT SAME STYLE AS SITE PAGE */

.page-container {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: #f9f9f9;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.table-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.sites-table {
  width: 100%;
  border-collapse: collapse;
}

.sites-table thead {
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
}

.sites-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sites-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
}

/* Remove border from last row */
.sites-table tbody tr:last-child td {
  border-bottom: none;
}

.site-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.site-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: #e8f5e9;
  color: #22c55e;
}

.action-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #22c55e;
  border-color: #22c55e;
  color: #ffffff;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.close-btn {
  background: none;
  border: none;
  font-size: 26px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

form {
  padding: 20px;
}

.site-info {
  background: #eff6ff;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 600;
  color: #1d4ed8;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  padding: 10px 20px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: #16a34a;
}
</style>

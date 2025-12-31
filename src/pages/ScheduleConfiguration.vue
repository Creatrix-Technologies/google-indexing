<template>
  <div class="page-container">
    <!-- Schedule Settings -->
    <div class="card">
      <div class="card-header">
        <span class="icon green">⏰</span>
        <div>
          <h3>Schedule Settings</h3>
          <p>Configure when and how URLs should be processed for indexing</p>
        </div>
      </div>
      <div>
          <!-- Hang Fire Button -->
          <button class="btn hangfire hangfire-btn" @click="goToHangfire" title="Hangfire Dashboard">Jobs</button>
        </div>
      <!-- Form -->
      <div v-if="loading">
        <p>Loading schedule...</p>
      </div>
      <div class="form-grid" v-else>
        <div class="form-group">
          <label>Frequency</label>
          <select v-model="frequencyLabel">
            <option value="Hourly">Hourly</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
          </select>
          <small>How often the queue should be processed</small>
        </div>

        <div class="form-group">
          <label>Maximum URLs Per Run</label>
          <input type="number" v-model.number="maxUrls" />
          <small>Maximum number of URLs per run</small>
        </div>

        <div class="form-group">
          <label>Start Time</label>
          <input type="time" v-model="startTime" />
          <small>Time of day to start processing</small>
        </div>

        <div class="form-group">
          <label>End Time</label>
          <input type="time" v-model="endTime" />
          <small>Time of day to stop processing</small>
        </div>
      </div>

      <!-- Save Button -->
      <div style="margin-top: 20px;">
        <button class="btn primary" :disabled="saving" @click="saveConfig">
          {{ saving ? 'Saving...' : '💾 Save Configuration' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api' // adjust this import to your project
import { useToast } from 'vue-toastification'
const toast = useToast()

// Reactive fields
const frequencyLabel = ref('Daily')
const maxUrls = ref(50)
const startTime = ref('08:00')
const endTime = ref('20:00')

// Loading and saving states
const loading = ref(false)
const saving = ref(false)

// Frequency mapping between API numeric value and UI label
const freqMap: Record<number, string> = { 1: 'Hourly', 7: 'Daily', 30: 'Weekly' }
const reverseFreqMap: Record<string, number> = { 'Hourly': 1, 'Daily': 7, 'Weekly': 30 }

// Load schedule from API
const loadConfig = async () => {
  loading.value = true
  try {
    const res = await api.get('/schedule/get')
    const data = res.data?.data
    if (data) {
      frequencyLabel.value = freqMap[data.frequency] || 'Daily'
      maxUrls.value = data.minUrls
      startTime.value = data.startTime.slice(0, 5)
      endTime.value = data.endTime.slice(0, 5)
    }
  } catch (err) {
    console.error('Error fetching schedule:', err)
    alert('Failed to load schedule')
  } finally {
    loading.value = false
  }
}

// Save schedule via API
const saveConfig = async () => {
  saving.value = true
  try {
    const payload = {
      frequency: reverseFreqMap[frequencyLabel.value],
      minUrls: maxUrls.value,
      startTime: startTime.value,
      endTime: endTime.value
    }

    const res = await api.post('/schedule/update', payload)
    if (res.data?.isSuccess) {
      toast.success('Schedule saved successfully!')
    } else {
      toast.error('Failed to save schedule')
    }
  } catch (err) {
    console.error('Error saving schedule:', err)
    toast.error('Error saving schedule')
  } finally {
    saving.value = false
  }
}

// Load schedule when component mounts
onMounted(() => {
  loadConfig()
})

const goToHangfire = () => {
  window.open(import.meta.env.VITE_API_BASE_URL+'/hangfire', '_blank') // opens in a new tab
}
</script>

<style scoped>
.page-container {
  padding: 28px;
  background: #f9fafb;
}

/* Card */
.card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 20px;
}

/* Card Header */
.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.card-header p {
  font-size: 13px;
  color: #6b7280;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon.green { background: #dcfce7; }

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

input,
select {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

small {
  font-size: 12px;
  color: #6b7280;
}

/* Button */
.btn {
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn.primary {
  background: #2563eb;
  color: #fff;
  border: none;
}

/* Hangfire button */
.btn.hangfire {
  background: #f59e0b;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn.hangfire:hover {
  background: #d97706;
}

.card {
  position: relative; /* make card the reference for absolute positioning */
}

.btn.hangfire.hangfire-btn {
  position: absolute;
  top: 20px; /* distance from top of card */
  right: 20px; /* distance from right of card */
}

</style>

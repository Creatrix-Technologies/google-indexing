<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '../api'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const toast = useToast()

interface Plan {
  id: number
  name: string
  description: string
  amount: number
  currency: string
  isActive: boolean
  durationId?: number
}

interface Duration {
  id: number
  name: string
}

const plans = ref<Plan[]>([])
const durations = ref<Duration[]>([])
const isLoading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const form = ref({
  planId: 0,
  name: '',
  description: '',
  amount: 0,
  durationId: 3,
  isActive: true
})

const errors = ref({
  name: '',
  amount: '',
  durationId: ''
})

const validateForm = () => {
  errors.value = { name: '', amount: '', durationId: '' }
  let valid = true

  if (!form.value.name.trim()) {
    errors.value.name = 'Plan name is required'
    valid = false
  }

  if (!form.value.amount || form.value.amount <= 0) {
    errors.value.amount = 'Amount must be greater than 0'
    valid = false
  }

  if (!form.value.durationId) {
    errors.value.durationId = 'Duration is required'
    valid = false
  }

  return valid
}

const fetchPlans = async () => {
  try {
    isLoading.value = true
    const res = await api.get('/payments/stripe-manage-subscription-plans')
    plans.value = res.data.data || []
  } catch {
    toast.error('Failed to load plans')
  } finally {
    isLoading.value = false
  }
}

const fetchDurations = async () => {
  try {
    const res = await api.get('/durations')
    durations.value = res.data.data || []
  } catch {
    toast.error('Failed to load durations')
  }
}

const addPlan = () => {
  isEditing.value = false
  showModal.value = true
  form.value = {
    planId: 0,
    name: '',
    description: '',
    amount: 0,
    durationId: 3,
    isActive: true
  }
  errors.value = { name: '', amount: '', durationId: '' }
}

const editPlan = (plan: Plan) => {
  isEditing.value = true
  showModal.value = true
  form.value = {
    planId: plan.id,
    name: plan.name,
    description: plan.description,
    amount: plan.amount,
    durationId: plan.durationId || 3,
    isActive: plan.isActive
  }
  errors.value = { name: '', amount: '', durationId: '' }
}

const savePlan = async () => {
  if (!validateForm()) return

  try {
    await api.post('/payments/update-plans', form.value)
    toast.success(form.value.planId === 0 ? 'Plan created' : 'Plan updated')
    showModal.value = false
    fetchPlans()
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to save plan.')
  }
}

onMounted(() => {
  fetchPlans()
  fetchDurations()
})
</script>

<template>
  <div class="page-container">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Subscription Plans</h1>
        <p class="subtitle">Manage your plans</p>
      </div>

      <button class="add-btn" @click="addPlan">Add New Plan</button>
    </div>

    <div v-if="isLoading" class="loading">Loading plans...</div>

    <!-- PLANS GRID -->
    <div v-else class="plans-grid">
      <div
        v-for="p in plans"
        :key="p.id"
        class="plan-card"
        @click="editPlan(p)"
        :class="{ inactive: !p.isActive }"
      >
        <div class="card-header">
          <h3>{{ p.name }}</h3>
          <span class="status" :class="{ active: p.isActive, inactive: !p.isActive }">
            {{ p.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div class="description" v-html="p.description"></div>
        <div class="amount">${{ p.amount }}</div>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-box">

        <h3>{{ isEditing ? 'Edit Plan' : 'Add New Plan' }}</h3>

        <div class="form-row">
          <label>Plan Name</label>
          <input v-model="form.name" placeholder="Enter plan name" />
          <span class="error" v-if="errors.name">{{ errors.name }}</span>
        </div>

        <div class="form-row">
          <label>Description</label>
          <div class="editor">
            <QuillEditor
              theme="snow"
              v-model:content="form.description"
              contentType="html"
            />
          </div>
        </div>

        <div class="form-row">
          <label>Amount ($)</label>
          <input type="number" v-model.number="form.amount" />
          <span class="error" v-if="errors.amount">{{ errors.amount }}</span>
        </div>

        <div class="form-row">
          <label>Duration</label>
          <select v-model="form.durationId">
            <option disabled value="">Select duration</option>
            <option v-for="d in durations" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
          <span class="error" v-if="errors.durationId">{{ errors.durationId }}</span>
        </div>

        <div class="form-row checkbox-row">
          <input type="checkbox" v-model="form.isActive" />
          <label>Active</label>
        </div>

        <div class="actions">
          <button class="save" @click="savePlan">Save</button>
          <button class="cancel" @click="showModal = false">Cancel</button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px 32px;
  background: var(--color-bg);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-header h1 {
  margin: 0 0 6px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
}

.add-btn {
  background: var(--color-primary);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background var(--transition-base), transform var(--transition-fast);
}

.add-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.loading {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.plan-card {
  background: var(--color-card);
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--box-shadow);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform var(--transition-slow), box-shadow var(--transition-slow);
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-hover);
}

.plan-card.inactive {
  opacity: 0.6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status.active {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.status.inactive {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}

.description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.description :deep(*) {
  color: inherit !important;
}

.amount {
  margin-top: auto;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-box {
  background: var(--color-card);
  padding: 28px;
  width: 560px;
  max-width: 95vw;
  border-radius: var(--radius-lg);
  box-shadow: var(--box-shadow-hover);
  border: 1px solid var(--color-border);
}

.modal-box h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

.form-row label {
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

input, select {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-size: 14px;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--color-input-focus);
  box-shadow: 0 0 0 2px var(--color-input-focus-ring);
}

.error {
  color: var(--color-error);
  font-size: 12px;
  margin-top: 4px;
}

.editor {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.editor :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.editor :deep(.ql-container) {
  border: none;
}

.editor :deep(.ql-editor) {
  min-height: 200px;
  font-size: 14px;
}

.checkbox-row {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.checkbox-row input {
  width: auto;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

button.save {
  background: var(--color-primary);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  cursor: pointer;
}

button.save:hover {
  background: var(--color-primary-hover);
}

button.cancel {
  background: var(--color-slate-200);
  color: var(--color-text-secondary);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
}

button.cancel:hover {
  background: var(--color-slate-400);
  color: var(--color-slate-50);
}
</style>

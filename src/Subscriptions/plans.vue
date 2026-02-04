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

      <button class="add-btn" @click="addPlan">➕ Add New Plan</button>
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
  padding: 32px;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

/* HEADER */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.add-btn {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  padding: 10px 22px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;   /* ✅ pointer */
}

/* GRID */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
}

/* ❗ CARD CSS NOT CHANGED */
.plan-card {
  background: white;
  padding: 18px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}
.plan-card.inactive {
  opacity: 0.6;
}

/* MODAL */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-box {
  background: white;
  padding: 28px;
  width: 560px;
  border-radius: 16px;
  box-shadow: 0 10px 35px rgba(0,0,0,0.2);
}

/* FORM */
.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

input, select {
  padding: 11px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

/* ERROR */
.error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
}

/* EDITOR */
.editor {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #d1d5db;
}

.editor :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 12px 12px 0 0;
}

.editor :deep(.ql-container) {
  border: none;
}

.editor :deep(.ql-editor) {
  min-height: 260px;
  font-size: 14px;
}

/* CHECKBOX */
.checkbox-row {
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

/* ACTIONS */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

button.save {
  background: #22c55e;
  color: white;
  padding: 10px 22px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;  /* ✅ pointer */
}

button.cancel {
  background: #9ca3af;
  color: white;
  padding: 10px 22px;
  border-radius: 10px;
  border: none;
  cursor: pointer;  /* ✅ pointer */
}

.loading {
  font-weight: 600;
}

/* CARD */
.plan-card {
  background: #0f766e; /* teal green */
  padding: 22px;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(0,0,0,0.15);
  color: #ffffff; /* all text white */
  display: flex;
  flex-direction: column;
  gap: 14px; /* ✅ correct spacing */
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.2);
}

.plan-card.inactive {
  opacity: 0.6;
}

/* HEADER INSIDE CARD */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

/* STATUS */
.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: rgba(255,255,255,0.2);
}

/* DESCRIPTION */
.description {
  font-size: 14px;
  line-height: 1.6;
  color: white;
}

.plan-card .description * {
  color: #ffffff !important;
}

/* AMOUNT */
.amount {
  margin-top: auto;
  font-size: 20px;
  font-weight: 700;
  color: white;
}

</style>

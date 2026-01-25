<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '../api'

const toast = useToast()

interface Plan {
  id: number
  name: string
  description: string
  amount: number
  currency: string
  isActive: boolean
}

const plans = ref<Plan[]>([])
const isLoading = ref(false)

const form = ref({
  planId: 0,
  name: '',
  description: '',
  amount: 0,
  durationInDays: 30,
  isActive: true
})

const isEditing = ref(false)

/* ---------------- FETCH ---------------- */
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

/* ---------------- EDIT ---------------- */
const editPlan = (plan: Plan) => {
  isEditing.value = true
  form.value = {
    planId: plan.id,
    name: plan.name,
    description: plan.description,
    amount: plan.amount,
    durationInDays: plan.name.toLowerCase().includes('year') ? 365 : 30,
    isActive: plan.isActive
  }
}

/* ---------------- RESET ---------------- */
const resetForm = () => {
  isEditing.value = false
  form.value = {
    planId: 0,
    name: '',
    description: '',
    amount: 0,
    durationInDays: 30,
    isActive: true
  }
}

/* ---------------- SAVE ---------------- */
const savePlan = async () => {
  try {
    await api.post('/payments/update-plans', form.value)
    toast.success(form.value.planId === 0 ? 'Plan created' : 'Plan updated')
    resetForm()
    fetchPlans()
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to save plan.')
  }
}

onMounted(fetchPlans)
</script>

<template>
  <div class="page-container">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Subscription Plans</h1>
        <p class="subtitle">Manage your Subscription plans</p>
      </div>

      <button class="add-btn" @click="resetForm">
        ➕ Add New Plan
      </button>
    </div>

    <!-- LOADER -->
    <div v-if="isLoading" class="loading">Loading plans...</div>

    <!-- PLANS GRID -->
    <div v-else class="plans-grid">
      <div
        v-for="p in plans"
        :key="p.id"
        class="plan-card"
        @click="editPlan(p)"
        :class="{ active: form.planId === p.id, inactive: !p.isActive }"
      >
        <div class="card-header">
          <h3>{{ p.name }}</h3>
          <span class="status" :class="{ active: p.isActive, inactive: !p.isActive }">
            {{ p.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <p class="description">{{ p.description }}</p>
        <div class="amount">${{ p.amount }}</div>
      </div>
    </div>

    <!-- FORM -->
    <div class="form-box">
      <h3>{{ isEditing ? 'Edit Plan' : 'Add New Plan' }}</h3>

      <div class="form-row">
        <label for="name">Plan Name</label>
        <input id="name" v-model="form.name" placeholder="Enter plan name" />
      </div>

      <div class="form-row">
        <label for="description">Description</label>
        <input id="description" v-model="form.description" placeholder="Enter plan description" />
      </div>

      <div class="form-row">
        <label for="amount">Amount ($)</label>
        <input id="amount" v-model.number="form.amount" type="number" placeholder="Enter amount" />
      </div>

      <div class="form-row">
        <label for="duration">Duration (days)</label>
        <input id="duration" v-model.number="form.durationInDays" type="number" placeholder="Enter duration" />
      </div>

      <div class="form-row checkbox-row">
        <input type="checkbox" id="isActive" v-model="form.isActive" />
        <label for="isActive">Active</label>
      </div>

      <div class="actions">
        <button class="save" @click="savePlan">Save</button>
        <button v-if="isEditing" @click="resetForm" class="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 30px;
  background: #f0f2f5;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* HEADER */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.add-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.add-btn:hover {
  background: #2563eb;
}

/* GRID */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.plan-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 2px solid transparent;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.plan-card.active {
  border-color: #22c55e;
}

.plan-card.inactive {
  opacity: 0.6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.status.active {
  background: #d1fae5;
  color: #065f46;
}

.status.inactive {
  background: #fee2e2;
  color: #b91c1c;
}

.description {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 10px;
}

.amount {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

/* FORM */
.form-box {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  margin-top: 20px;
}

.form-box h3 {
  margin-bottom: 20px;
  font-size: 22px;
  color: #111827;
}

/* Form row styling */
.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

.form-row label {
  font-size: 14px;
  color: #374151;
  margin-bottom: 6px;
  font-weight: 500;
}

input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}


/* Checkbox styling */
.checkbox-row {
  flex-direction: row;
  align-items: center;
}
.checkbox-row input[type="checkbox"] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  accent-color: #22c55e;
}

/* Buttons */
.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

button.save {
  background: #22c55e;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
button.save:hover {
  background: #16a34a;
  transform: translateY(-2px);
}

button.cancel {
  background: #9ca3af;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
button.cancel:hover {
  background: #6b7280;
  transform: translateY(-2px);
}

.loading {
  padding: 20px;
  font-weight: 600;
  color: #374151;
}
</style>

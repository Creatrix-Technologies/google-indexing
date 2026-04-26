<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

/* ---------- display helpers (UI only) ---------- */
const activeCount = computed(() => plans.value.filter(p => p.isActive).length)
const inactiveCount = computed(() => plans.value.filter(p => !p.isActive).length)

const durationName = (id?: number) => {
  if (!id) return ''
  const found = durations.value.find(d => d.id === id)
  return found?.name || ''
}

const periodSuffix = (id?: number) => {
  const name = durationName(id).toLowerCase()
  if (!name) return ''
  if (/year|annual|annually/.test(name)) return 'year'
  if (/month/.test(name)) return 'month'
  if (/week/.test(name)) return 'week'
  if (/day/.test(name)) return 'day'
  return name
}

const formatAmount = (n: number, currency = 'USD') => {
  if (n === null || n === undefined) return '—'
  const symbol = currency === 'USD' ? '$' : ''
  const value = Number(n)
  if (Number.isNaN(value)) return '—'
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2
  })}`
}

const sortedPlans = computed(() => {
  return [...plans.value].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return (a.amount || 0) - (b.amount || 0)
  })
})

onMounted(() => {
  fetchPlans()
  fetchDurations()
})
</script>

<template>
  <div class="page-container">

    <!-- ============ HEADER ============ -->
    <div class="page-header">
      <div>
        <h1>Subscription plans</h1>
        <p class="subtitle">
          Define the pricing tiers offered to your customers.
        </p>
      </div>

      <div class="header-actions">
        <div class="header-meta" v-if="plans.length">
          <span class="meta-pill">
            <span class="meta-dot meta-dot--active"></span>
            {{ activeCount }} active
          </span>
          <span class="meta-pill" v-if="inactiveCount">
            <span class="meta-dot meta-dot--inactive"></span>
            {{ inactiveCount }} inactive
          </span>
          <span class="meta-pill meta-pill--total">{{ plans.length }} total</span>
        </div>

        <button class="btn-primary" @click="addPlan">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add plan
        </button>
      </div>
    </div>

    <!-- ============ LOADING SKELETON ============ -->
    <div v-if="isLoading" class="plans-grid">
      <div v-for="i in 3" :key="`skel-${i}`" class="plan-card plan-card--skeleton" aria-hidden="true">
        <div class="skel skel--title"></div>
        <div class="skel skel--line"></div>
        <div class="skel skel--line skel--short"></div>
        <div class="skel skel--price"></div>
      </div>
    </div>

    <!-- ============ EMPTY STATE ============ -->
    <div v-else-if="plans.length === 0" class="empty-card">
      <div class="empty-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      </div>
      <p class="empty-title">No plans yet</p>
      <p class="empty-desc">
        Create your first subscription plan to start offering paid tiers to customers.
      </p>
      <button class="btn-primary empty-cta" @click="addPlan">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create your first plan
      </button>
    </div>

    <!-- ============ PLANS GRID ============ -->
    <div v-else class="plans-grid">
      <div
        v-for="p in sortedPlans"
        :key="p.id"
        class="plan-card"
        :class="{
          'plan-card--inactive': !p.isActive,
          'plan-card--active': p.isActive
        }"
        @click="editPlan(p)"
        role="button"
        :aria-label="`Edit plan ${p.name}`"
        tabindex="0"
        @keydown.enter="editPlan(p)"
      >
        <div class="plan-card__head">
          <h3 class="plan-card__name">{{ p.name || 'Untitled plan' }}</h3>
          <span
            class="status-pill"
            :class="p.isActive ? 'status-pill--active' : 'status-pill--inactive'"
          >
            <span class="status-dot"></span>
            {{ p.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div
          v-if="p.description"
          class="plan-card__desc"
          v-html="p.description"
        ></div>
        <div v-else class="plan-card__desc plan-card__desc--placeholder">
          No description.
        </div>

        <div class="plan-card__divider"></div>

        <div class="plan-card__foot">
          <div class="plan-card__price">
            <span class="plan-card__amount">{{ formatAmount(p.amount, p.currency || 'USD') }}</span>
            <span v-if="periodSuffix(p.durationId)" class="plan-card__period">
              / {{ periodSuffix(p.durationId) }}
            </span>
          </div>
          <button
            class="plan-card__edit"
            type="button"
            @click.stop="editPlan(p)"
            :aria-label="`Edit ${p.name}`"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL (anatomy: theme.css) -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-box modal-box--lg" @click.stop role="dialog" aria-modal="true">
        <header class="modal-header">
          <div>
            <h3 class="modal-title">{{ isEditing ? 'Edit plan' : 'Add new plan' }}</h3>
            <p class="modal-subtitle">
              {{ isEditing ? 'Update pricing, billing duration, and plan availability.' : 'Create a new subscription plan with pricing and duration.' }}
            </p>
          </div>
          <button type="button" class="modal-close" aria-label="Close" @click="showModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div class="modal-body">
          <div class="form-row">
            <label>Plan name</label>
            <input v-model="form.name" placeholder="e.g. Pro" />
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

          <div class="form-grid">
            <div class="form-row">
              <label>Amount ($)</label>
              <input type="number" v-model.number="form.amount" placeholder="0.00" />
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
          </div>

          <div class="form-row checkbox-row">
            <input type="checkbox" id="plan-active" v-model="form.isActive" />
            <label for="plan-active">Plan is active and visible to users</label>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="showModal = false">Cancel</button>
          <button type="button" class="btn-primary" @click="savePlan">
            {{ isEditing ? 'Save changes' : 'Create plan' }}
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 0;
  background: var(--color-background);
  min-height: 100%;
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
  background: var(--color-accent);
  color: var(--color-accent-fg);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  border: 1px solid transparent;
  font-weight: var(--fw-medium);
  cursor: pointer;
  font-family: inherit;
  transition: background 140ms ease, box-shadow 140ms ease;
}
.btn-primary svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.btn-primary:hover { background: var(--color-accent-hover); }
.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--ring-accent);
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

/* ============ Plans grid ============ */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-4);
}

/* ============ Plan card ============ */
.plan-card {
  position: relative;
  background: var(--color-card-bg);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  cursor: pointer;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
  overflow: hidden;
}
.plan-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--color-accent);
  opacity: 0;
  transition: opacity 160ms ease;
}
.plan-card--active::before { opacity: 0.85; }

.plan-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.plan-card:focus-visible {
  outline: none;
  box-shadow: var(--ring-accent);
  border-color: var(--color-accent);
}

.plan-card--inactive {
  background: var(--neutral-50);
}
.plan-card--inactive .plan-card__name,
.plan-card--inactive .plan-card__amount,
.plan-card--inactive .plan-card__period {
  color: var(--color-text-secondary);
}

/* Card head */
.plan-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.plan-card__name {
  margin: 0;
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  letter-spacing: var(--letter-tight);
  word-break: break-word;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  border: 1px solid transparent;
  letter-spacing: 0.005em;
  flex-shrink: 0;
}
.status-pill .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
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

/* Description */
.plan-card__desc {
  font-size: var(--fs-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}
.plan-card__desc :deep(*) {
  color: var(--color-text-secondary) !important;
  margin: 0 0 4px 0;
}
.plan-card__desc :deep(p) { margin: 0 0 4px 0; }
.plan-card__desc :deep(ul),
.plan-card__desc :deep(ol) {
  padding-left: 18px;
  margin: 0;
}
.plan-card__desc--placeholder {
  font-style: italic;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.plan-card__divider {
  height: 1px;
  background: var(--color-divider);
  margin: 4px -4px;
}

/* Foot (price + edit) */
.plan-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: auto;
}
.plan-card__price {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
}
.plan-card__amount {
  font-size: 24px;
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  color: var(--color-text);
  line-height: 1.1;
}
.plan-card__period {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-weight: var(--fw-regular);
}

.plan-card__edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  font-family: inherit;
  transition: background 140ms ease, border-color 140ms ease;
}
.plan-card__edit svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.plan-card__edit:hover {
  background: var(--neutral-50);
  border-color: var(--neutral-400);
}

/* ============ Skeleton ============ */
.plan-card--skeleton {
  cursor: default;
  pointer-events: none;
}
.plan-card--skeleton::before { display: none; }
.plan-card--skeleton:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-xs);
  transform: none;
}
.skel {
  background: linear-gradient(
    90deg,
    var(--neutral-100) 0%,
    var(--neutral-50) 50%,
    var(--neutral-100) 100%
  );
  background-size: 200% 100%;
  animation: skel-shimmer 1400ms ease-in-out infinite;
  border-radius: 6px;
}
.skel--title { width: 50%; height: 18px; }
.skel--line  { width: 100%; height: 12px; }
.skel--short { width: 70%; }
.skel--price { width: 40%; height: 24px; margin-top: auto; }

@keyframes skel-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ============ Empty state ============ */
.empty-card {
  background: var(--color-card-bg);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-7) var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  margin-bottom: var(--space-3);
  color: var(--neutral-500);
}
.empty-icon svg {
  width: 22px;
  height: 22px;
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
  margin: 4px 0 var(--space-4) 0;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  max-width: 44ch;
}
.empty-cta { margin-top: 4px; }

/* ============ Form (modal) ============ */
.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-4);
}
.form-row label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text);
  margin-bottom: 6px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.form-grid .form-row { margin-bottom: var(--space-4); }

input, select {
  padding: 8px 11px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background: var(--color-card-bg);
  color: var(--color-text);
  font-size: var(--fs-base);
  font-family: inherit;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
input::placeholder { color: var(--color-placeholder); }
input:focus,
select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}

.error {
  color: var(--color-danger);
  font-size: var(--fs-xs);
  margin-top: 4px;
  font-weight: var(--fw-medium);
}

.editor {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
}
.editor :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: var(--neutral-50);
}
.editor :deep(.ql-container) { border: none; }
.editor :deep(.ql-editor) {
  min-height: 180px;
  font-size: var(--fs-base);
  font-family: var(--font-family);
}

.checkbox-row {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
}
.checkbox-row label {
  margin-bottom: 0;
  font-weight: var(--fw-regular);
  color: var(--color-text-secondary);
  cursor: pointer;
}
.checkbox-row input[type="checkbox"] {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

@media (max-width: 540px) {
  .form-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

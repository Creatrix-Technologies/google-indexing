<template>
  <div class="panel funnel">
    <div class="panel__head">
      <div class="panel__title">
        <h3>Signup funnel</h3>
        <p class="panel__subtitle">People who signed up in the period (admins excluded), and how far they got</p>
      </div>
      <div class="range" role="group" aria-label="Period">
        <button v-for="d in [7, 30, 90]" :key="d" type="button" :class="{ active: days === d }" @click="load(d)">{{ d }} days</button>
      </div>
    </div>

    <div v-if="error" class="panel__empty">{{ error }}</div>
    <div v-else-if="data" class="panel__body">
      <ol class="steps">
        <li v-for="(s, i) in data.steps" :key="s.key" class="step" :title="`${s.label}: ${s.count} (${s.percentOfSignups}% of signups)`">
          <span class="step__label">{{ s.label }}</span>
          <span class="step__track">
            <span class="step__bar" :style="{ width: barWidth(s.count) }"></span>
          </span>
          <span class="step__value">
            <strong>{{ s.count.toLocaleString() }}</strong>
            <span v-if="i > 0" class="step__pct">{{ s.percentOfSignups }}%</span>
          </span>
        </li>
      </ol>

      <div class="daily">
        <figure class="mini">
          <figcaption>Signups per day <strong>{{ totalSignups.toLocaleString() }}</strong></figcaption>
          <div class="mini__bars" role="img" :aria-label="`Signups per day, ${totalSignups} in total`">
            <span
              v-for="d in data.daily"
              :key="'s' + d.date"
              class="mini__bar"
              :style="{ height: miniHeight(d.signups, maxSignups) }"
              :title="`${d.date}: ${d.signups} signup${d.signups === 1 ? '' : 's'}`"
            ></span>
          </div>
        </figure>
        <figure class="mini">
          <figcaption>Free checker runs per day <strong>{{ data.toolChecks.total.toLocaleString() }}</strong></figcaption>
          <div class="mini__bars" role="img" :aria-label="`Checker runs per day, ${data.toolChecks.total} in total`">
            <span
              v-for="d in data.daily"
              :key="'c' + d.date"
              class="mini__bar"
              :style="{ height: miniHeight(d.toolChecks, maxChecks) }"
              :title="`${d.date}: ${d.toolChecks} check${d.toolChecks === 1 ? '' : 's'}`"
            ></span>
          </div>
          <p class="mini__note" v-if="data.toolChecks.total">
            Results: {{ data.toolChecks.indexable }} indexable · {{ data.toolChecks.issues }} with issues · {{ data.toolChecks.blocked }} blocked
          </p>
        </figure>
      </div>
    </div>
    <div v-else class="panel__empty">Loading…</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../../api'

interface Step { key: string; label: string; count: number; percentOfSignups: number }
interface Day { date: string; signups: number; toolChecks: number }
interface Funnel {
  days: number
  steps: Step[]
  toolChecks: { total: number; indexable: number; issues: number; blocked: number }
  daily: Day[]
}

const days = ref(30)
const data = ref<Funnel | null>(null)
const error = ref('')

const top = computed(() => Math.max(1, data.value?.steps[0]?.count ?? 1))
const barWidth = (n: number) => `${n === 0 ? 0 : Math.max(1.5, (100 * n) / top.value)}%`
const totalSignups = computed(() => data.value?.daily.reduce((a, d) => a + d.signups, 0) ?? 0)
const maxSignups = computed(() => Math.max(1, ...(data.value?.daily.map(d => d.signups) ?? [1])))
const maxChecks = computed(() => Math.max(1, ...(data.value?.daily.map(d => d.toolChecks) ?? [1])))
const miniHeight = (n: number, max: number) => (n === 0 ? '0px' : `${Math.max(6, (100 * n) / max)}%`)

async function load(d = days.value) {
  days.value = d
  error.value = ''
  try {
    const res = await api.get('/admin/funnel', { params: { days: d } })
    data.value = res.data?.data ?? null
  } catch {
    error.value = 'Could not load the funnel.'
  }
}

onMounted(() => load())
</script>

<style scoped>
.panel {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  margin-bottom: var(--space-5);
}
.panel__head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3);
  padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-divider); flex-wrap: wrap;
}
.panel__title h3 { margin: 0; font-size: var(--fs-md); font-weight: var(--fw-semi); color: var(--color-text); }
.panel__subtitle { margin: 4px 0 0; font-size: var(--fs-sm); color: var(--color-text-secondary); }
.panel__body { padding: var(--space-4) var(--space-5) var(--space-5); }
.panel__empty { padding: var(--space-5); color: var(--color-text-secondary); font-size: var(--fs-sm); }

.range { display: inline-flex; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.range button {
  border: none; background: transparent; padding: 6px 12px; font: inherit; font-size: var(--fs-sm);
  color: var(--color-text-secondary); cursor: pointer;
}
.range button.active { background: var(--color-primary); color: #fff; }

.steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.step { display: grid; grid-template-columns: 150px 1fr 110px; align-items: center; gap: 12px; }
.step__label { font-size: var(--fs-sm); color: var(--color-text); }
.step__track { height: 18px; border-radius: 4px; background: var(--color-divider); overflow: hidden; }
.step__bar { display: block; height: 100%; border-radius: 0 4px 4px 0; background: var(--color-primary); }
.step__value { font-size: var(--fs-sm); color: var(--color-text); font-variant-numeric: tabular-nums; text-align: right; }
.step__pct { margin-left: 8px; color: var(--color-text-secondary); }

.daily { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-5); margin-top: var(--space-5); }
.mini { margin: 0; }
.mini figcaption { font-size: var(--fs-sm); color: var(--color-text-secondary); margin-bottom: 8px; display: flex; justify-content: space-between; }
.mini figcaption strong { color: var(--color-text); font-variant-numeric: tabular-nums; }
.mini__bars { display: flex; align-items: flex-end; gap: 2px; height: 64px; border-bottom: 1px solid var(--color-divider); }
.mini__bar { flex: 1; min-width: 2px; background: var(--color-primary); border-radius: 2px 2px 0 0; }
.mini__bar:hover { opacity: 0.7; }
.mini__note { margin: 8px 0 0; font-size: var(--fs-xs, 12px); color: var(--color-text-secondary); }

@media (max-width: 640px) {
  .step { grid-template-columns: 1fr 90px; }
  .step__track { grid-column: 1 / -1; grid-row: 2; }
}
</style>

<template>
  <div class="pipe" role="group" aria-label="Example indexing run">
    <div class="pipe__head">
      <div class="pipe__site">
        <span class="pipe__favicon" aria-hidden="true">e</span>
        <div>
          <p class="pipe__site-name">example-store.com</p>
          <p class="pipe__site-meta">Scheduled recrawl · {{ urls.length }} URLs</p>
        </div>
      </div>
      <span class="pipe__live" :class="{ 'pipe__live--done': done }">
        <span class="pipe__live-dot" aria-hidden="true"></span>
        {{ done ? 'Run complete' : 'Running' }}
      </span>
    </div>

    <div class="pipe__progress">
      <div class="pipe__progress-row">
        <span class="pipe__progress-label">{{ done ? 'All URLs processed' : stageLabel }}</span>
        <span class="pipe__progress-pct">{{ percent }}%</span>
      </div>
      <div class="pipe__bar" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
        <div class="pipe__bar-fill" :style="{ width: percent + '%' }"></div>
      </div>
    </div>

    <ol class="pipe__stages" aria-label="Pipeline stages">
      <li v-for="s in stages" :key="s.key" class="pipe__stage" :class="{ 'pipe__stage--active': (counts[s.key] ?? 0) > 0 }">
        <span class="pipe__stage-count">{{ counts[s.key] ?? 0 }}</span>
        <span class="pipe__stage-name">{{ s.label }}</span>
      </li>
    </ol>

    <ul class="pipe__urls">
      <li v-for="u in urls" :key="u.path" class="pipe__url">
        <span class="pipe__url-path">{{ u.path }}</span>
        <span class="pipe__chip" :class="`pipe__chip--${u.state}`">
          <svg v-if="u.state === 'indexed'" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
          <svg v-else-if="u.state === 'submitted'" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M9 4.5L12.5 8 9 11.5" /></svg>
          <svg v-else-if="u.state === 'crawled'" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4" /><path d="M10 10l3 3" /></svg>
          <svg v-else-if="u.state === 'crawling'" class="pipe__spin" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5a5.5 5.5 0 1 1-5.2 3.7" /></svg>
          <svg v-else viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></svg>
          {{ chipLabel(u.state) }}
        </span>
      </li>
    </ul>

    <p class="pipe__foot">Illustrative run with sample URLs. Your dashboard shows this for every crawl, live.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

type State = 'queued' | 'crawling' | 'crawled' | 'submitted' | 'indexed'

const stages = [
  { key: 'queued', label: 'Queued' },
  { key: 'crawled', label: 'Crawled' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'indexed', label: 'Indexed' },
] as const

const urls = reactive<{ path: string; state: State }[]>([
  { path: '/collections/new-arrivals', state: 'queued' },
  { path: '/products/trail-runner-v2', state: 'queued' },
  { path: '/blog/sizing-guide-2026', state: 'queued' },
  { path: '/products/merino-base-layer', state: 'queued' },
  { path: '/pages/shipping-returns', state: 'queued' },
])

const order: State[] = ['queued', 'crawling', 'crawled', 'submitted', 'indexed']

/** Scripted timeline: [tick, url index, state]. Staggered so several rows move at once. */
const script: [number, number, State][] = [
  [1, 0, 'crawling'], [2, 1, 'crawling'], [3, 0, 'crawled'], [4, 2, 'crawling'],
  [5, 1, 'crawled'], [5, 0, 'submitted'], [7, 3, 'crawling'], [7, 2, 'crawled'],
  [8, 1, 'submitted'], [9, 4, 'crawling'], [10, 3, 'crawled'], [10, 2, 'submitted'],
  [11, 0, 'indexed'], [12, 4, 'crawled'], [13, 3, 'submitted'], [14, 1, 'indexed'],
  [15, 4, 'submitted'], [16, 2, 'indexed'], [18, 3, 'indexed'], [20, 4, 'indexed'],
]
const lastTick = script[script.length - 1]![0]

const tick = ref(0)
let timer: number | null = null
let reduced = false

const counts = computed(() => {
  const c: Record<string, number> = { queued: 0, crawled: 0, submitted: 0, indexed: 0 }
  for (const u of urls) {
    if (u.state === 'queued' || u.state === 'crawling') c.queued!++
    else if (u.state === 'crawled') c.crawled!++
    else if (u.state === 'submitted') c.submitted!++
    else c.indexed!++
  }
  return c
})

const percent = computed(() => {
  const max = urls.length * (order.length - 1)
  const score = urls.reduce((acc, u) => acc + order.indexOf(u.state), 0)
  return Math.round((score / max) * 100)
})

const done = computed(() => urls.every((u) => u.state === 'indexed'))

const stageLabel = computed(() => {
  if (urls.some((u) => u.state === 'crawling')) return 'Crawling pages in a headless browser'
  if (urls.some((u) => u.state === 'submitted')) return 'Waiting for Google to confirm'
  if (urls.some((u) => u.state === 'crawled')) return 'Submitting to the Indexing API'
  return 'Queued for the next run'
})

const chipLabel = (s: State) => {
  switch (s) {
    case 'crawling': return 'Crawling'
    case 'crawled': return 'Crawled'
    case 'submitted': return 'Notify accepted'
    case 'indexed': return 'Indexed'
    default: return 'Queued'
  }
}

const applyTick = (t: number) => {
  for (const [at, i, state] of script) {
    if (at === t) urls[i]!.state = state
  }
}

const reset = () => {
  for (const u of urls) u.state = 'queued'
  tick.value = 0
}

const step = () => {
  tick.value += 1
  applyTick(tick.value)
  if (tick.value >= lastTick + 6) reset()
}

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    // Static, finished state for readers who opt out of motion.
    for (let t = 1; t <= lastTick; t++) applyTick(t)
    return
  }
  timer = window.setInterval(step, 650)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style scoped>
.pipe {
  --ink: #0a0a0c;
  --muted: #5f6368;
  --line: rgba(10, 10, 12, 0.07);
  --accent: #4285f4;
  --good: #1e8e3e;
  --good-soft: #e6f4ea;
  --accent-soft: #e8f0fe;
  --warm: #b45309;
  --warm-soft: #fff4e5;

  width: 100%;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 24px 60px -16px rgba(50, 50, 93, 0.18);
  padding: 1.25rem 1.25rem 1rem;
  text-align: left;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  color: var(--ink);
}

.pipe__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.pipe__site {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.pipe__favicon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--ink);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pipe__site-name {
  margin: 0;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.2;
}

.pipe__site-meta {
  margin: 2px 0 0;
  font-size: 0.76rem;
  color: var(--muted);
}

.pipe__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: 100px;
  padding: 4px 10px;
  white-space: nowrap;
}

.pipe__live--done {
  color: var(--good);
  background: var(--good-soft);
}

.pipe__live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: pipe-pulse 1.4s ease-in-out infinite;
}

.pipe__live--done .pipe__live-dot {
  animation: none;
}

.pipe__progress {
  margin-bottom: 1rem;
}

.pipe__progress-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 6px;
}

.pipe__progress-label {
  font-size: 0.8rem;
  color: var(--muted);
}

.pipe__progress-pct {
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.pipe__bar {
  height: 8px;
  border-radius: 100px;
  background: var(--accent-soft);
  overflow: hidden;
}

.pipe__bar-fill {
  height: 100%;
  border-radius: 100px;
  background: linear-gradient(90deg, #4285f4, #34a853);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.pipe__stages {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.pipe__stage {
  background: rgba(10, 10, 12, 0.03);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0.6rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: border-color 0.3s ease, background 0.3s ease;
}

.pipe__stage--active {
  background: #fff;
  border-color: rgba(66, 133, 244, 0.25);
}

.pipe__stage-count {
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1;
}

.pipe__stage-name {
  font-size: 0.72rem;
  color: var(--muted);
  letter-spacing: 0.02em;
}

.pipe__urls {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid var(--line);
}

.pipe__url {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--line);
}

.pipe__url-path {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 0.78rem;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.pipe__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 9px 3px 7px;
  border-radius: 100px;
  white-space: nowrap;
  flex-shrink: 0;
  background: rgba(10, 10, 12, 0.05);
  color: var(--muted);
  transition: background 0.3s ease, color 0.3s ease;
}

.pipe__chip svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.pipe__chip--crawling,
.pipe__chip--crawled {
  background: var(--accent-soft);
  color: #1a56c4;
}

.pipe__chip--submitted {
  background: var(--warm-soft);
  color: var(--warm);
}

.pipe__chip--indexed {
  background: var(--good-soft);
  color: var(--good);
}

.pipe__spin {
  animation: pipe-spin 0.9s linear infinite;
}

.pipe__foot {
  margin: 0.85rem 0 0;
  font-size: 0.72rem;
  color: var(--muted);
}

@keyframes pipe-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.8); }
}

@keyframes pipe-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .pipe__live-dot,
  .pipe__spin {
    animation: none;
  }
  .pipe__bar-fill {
    transition: none;
  }
}

@media (max-width: 480px) {
  .pipe {
    padding: 1rem 1rem 0.85rem;
    border-radius: 20px;
  }
  .pipe__stages {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

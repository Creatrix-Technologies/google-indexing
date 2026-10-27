<template>
  <div class="cov">
    <div class="cov__top">
      <div>
        <p class="cov__title">Share of submitted URLs indexed by Google</p>
        <p class="cov__sub">Days since publishing · illustrative curve based on typical ranges</p>
      </div>
      <div class="cov__legend" aria-label="Series">
        <span class="cov__key"><i class="cov__swatch cov__swatch--api" aria-hidden="true"></i>With Indexing API</span>
        <span class="cov__key"><i class="cov__swatch cov__swatch--map" aria-hidden="true"></i>Sitemap only</span>
        <button type="button" class="cov__toggle" :aria-pressed="showTable" @click="showTable = !showTable">
          {{ showTable ? 'Show chart' : 'Show as table' }}
        </button>
      </div>
    </div>

    <div v-show="!showTable" class="cov__plot" ref="plotEl">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        class="cov__svg"
        role="img"
        aria-label="Line chart: with the Indexing API about 68% of URLs are indexed by day 2 and 87% by day 6; sitemap-only reaches 50% around day 7 and 80% by day 14."
        tabindex="0"
        @pointermove="onPointer"
        @pointerleave="hoverDay = null"
        @keydown="onKey"
        @focus="hoverDay = hoverDay ?? 2"
        @blur="hoverDay = null"
      >
        <defs>
          <linearGradient id="covApiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2f6fdb" stop-opacity="0.16" />
            <stop offset="1" stop-color="#2f6fdb" stop-opacity="0.02" />
          </linearGradient>
          <linearGradient id="covMapFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#b45309" stop-opacity="0.12" />
            <stop offset="1" stop-color="#b45309" stop-opacity="0.01" />
          </linearGradient>
        </defs>

        <!-- grid -->
        <g class="cov__grid">
          <line v-for="t in yTicks" :key="t" :x1="PL" :x2="W - PR" :y1="y(t)" :y2="y(t)" />
        </g>
        <g class="cov__axis-text">
          <text v-for="t in yTicks" :key="'y' + t" :x="PL - 8" :y="y(t) + 4" text-anchor="end">{{ t }}%</text>
          <text v-for="d in xTicks" :key="'x' + d" :x="x(d)" :y="H - 10" text-anchor="middle">
            {{ d === 0 ? 'Publish' : 'Day ' + d }}
          </text>
        </g>

        <!-- areas -->
        <path :d="areaPath(sitemap)" fill="url(#covMapFill)" />
        <path :d="areaPath(api)" fill="url(#covApiFill)" />

        <!-- lines -->
        <path :d="linePath(sitemap)" class="cov__line cov__line--map" />
        <path :d="linePath(api)" class="cov__line cov__line--api" :style="apiLineStyle" />

        <!-- annotation: the headline point -->
        <g class="cov__note">
          <line :x1="x(2)" :x2="x(2)" :y1="y(api[2]!)" :y2="y(api[2]!) - 34" />
          <circle :cx="x(2)" :cy="y(api[2]!)" r="4" class="cov__dot cov__dot--api" />
          <text :x="x(2) + 6" :y="y(api[2]!) - 38">{{ compact ? '68% by day 2' : '68% indexed by day 2' }}</text>
        </g>

        <!-- end markers + direct labels -->
        <circle :cx="x(14)" :cy="y(api[14]!)" r="4" class="cov__dot cov__dot--api" />
        <circle :cx="x(14)" :cy="y(sitemap[14]!)" r="4" class="cov__dot cov__dot--map" />
        <text :x="x(14) + 10" :y="y(api[14]!) + 4" class="cov__end">
          <tspan class="cov__end-val">87%</tspan><template v-if="!compact"> Indexing API</template>
        </text>
        <text :x="x(14) + 10" :y="y(sitemap[14]!) + 4" class="cov__end">
          <tspan class="cov__end-val">80%</tspan><template v-if="!compact"> Sitemap only</template>
        </text>

        <!-- hover layer -->
        <g v-if="hoverDay !== null" class="cov__hover">
          <line :x1="x(hoverDay)" :x2="x(hoverDay)" :y1="PT" :y2="H - PB" />
          <circle :cx="x(hoverDay)" :cy="y(sitemap[hoverDay]!)" r="5" class="cov__dot cov__dot--map" />
          <circle :cx="x(hoverDay)" :cy="y(api[hoverDay]!)" r="5" class="cov__dot cov__dot--api" />
        </g>
      </svg>

      <div
        v-if="hoverDay !== null"
        class="cov__tip"
        :style="tipStyle"
        role="status"
        aria-live="polite"
      >
        <p class="cov__tip-head">{{ hoverDay === 0 ? 'At publish' : `Day ${hoverDay}` }}</p>
        <p class="cov__tip-row"><i class="cov__swatch cov__swatch--api" aria-hidden="true"></i><strong>{{ api[hoverDay] }}%</strong><span>Indexing API</span></p>
        <p class="cov__tip-row"><i class="cov__swatch cov__swatch--map" aria-hidden="true"></i><strong>{{ sitemap[hoverDay] }}%</strong><span>Sitemap only</span></p>
      </div>
    </div>

    <div v-if="showTable" class="cov__table-wrap">
      <table class="cov__table">
        <caption class="sr-only">Share of submitted URLs indexed, by day</caption>
        <thead>
          <tr><th scope="col">Day</th><th scope="col">With Indexing API</th><th scope="col">Sitemap only</th></tr>
        </thead>
        <tbody>
          <tr v-for="d in days" :key="d">
            <th scope="row">{{ d }}</th>
            <td>{{ api[d] }}%</td>
            <td>{{ sitemap[d] }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/* Illustrative daily coverage, % of submitted URLs indexed. Index = day. */
const api = [0, 42, 68, 80, 84, 86, 87, 87, 87, 87, 87, 87, 87, 87, 87]
const sitemap = [0, 2, 6, 12, 20, 30, 40, 50, 57, 63, 68, 72, 75, 78, 80]
const days = Array.from({ length: 15 }, (_, i) => i)

/* The SVG coordinate system tracks the rendered width so text stays at CSS-pixel size on phones. */
const width = ref(760)
const compact = computed(() => width.value < 560)

const W = computed(() => Math.max(300, Math.round(width.value)))
const H = computed(() => (compact.value ? 240 : 300))
const PL = computed(() => (compact.value ? 38 : 44))
const PR = computed(() => (compact.value ? 52 : 128))
const PT = 44
const PB = 32

const x = (d: number) => PL.value + (d / 14) * (W.value - PL.value - PR.value)
const y = (v: number) => PT + (1 - v / 100) * (H.value - PT - PB)

const yTicks = [0, 25, 50, 75, 100]
const xTicks = [0, 3, 7, 14]

const linePath = (s: number[]) => s.map((v, d) => `${d === 0 ? 'M' : 'L'} ${x(d).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
const areaPath = (s: number[]) => `${linePath(s)} L ${x(14).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`

const hoverDay = ref<number | null>(null)
const showTable = ref(false)
const plotEl = ref<HTMLElement | null>(null)
const drawn = ref(false)

const apiLineStyle = computed(() => (drawn.value ? { strokeDashoffset: 0 } : {}))

const onPointer = (e: PointerEvent) => {
  const svg = e.currentTarget as SVGSVGElement
  const rect = svg.getBoundingClientRect()
  const px = ((e.clientX - rect.left) / rect.width) * W.value
  const d = Math.round(((px - PL.value) / (W.value - PL.value - PR.value)) * 14)
  hoverDay.value = Math.min(14, Math.max(0, d))
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') { hoverDay.value = Math.min(14, (hoverDay.value ?? 0) + 1); e.preventDefault() }
  if (e.key === 'ArrowLeft') { hoverDay.value = Math.max(0, (hoverDay.value ?? 0) - 1); e.preventDefault() }
  if (e.key === 'Home') { hoverDay.value = 0; e.preventDefault() }
  if (e.key === 'End') { hoverDay.value = 14; e.preventDefault() }
}

const tipStyle = computed(() => {
  if (hoverDay.value === null) return {}
  const leftPct = (x(hoverDay.value) / W.value) * 100
  const flip = leftPct > 58
  return {
    left: `${leftPct}%`,
    top: `${(PT / H.value) * 100}%`,
    transform: flip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
  }
})

let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

onMounted(() => {
  const el = plotEl.value
  if (el) {
    width.value = el.clientWidth || 760
    ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) width.value = w
    })
    ro.observe(el)
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !el) { drawn.value = true; return }
  io = new IntersectionObserver((entries) => {
    if (entries.some((en) => en.isIntersecting)) { drawn.value = true; io?.disconnect() }
  }, { threshold: 0.3 })
  io.observe(el)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  io?.disconnect()
})
</script>

<style scoped>
.cov {
  --ink: #0a0a0c;
  --muted: #5f6368;
  --faint: #9aa0a6;
  --grid: #e9ebee;
  --api: #2f6fdb;
  --map: #b45309;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  text-align: left;
}

.cov__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.cov__title {
  margin: 0;
  font-weight: 600;
  color: var(--ink);
  font-size: 0.95rem;
}

.cov__sub {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: var(--muted);
}

.cov__legend {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: var(--muted);
}

.cov__key {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.cov__swatch {
  display: inline-block;
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: var(--faint);
}

.cov__swatch--api { background: var(--api); }
.cov__swatch--map { background: var(--map); }

.cov__toggle {
  font: inherit;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(10, 10, 12, 0.12);
  border-radius: 100px;
  padding: 4px 10px;
  cursor: pointer;
}

.cov__toggle:hover {
  border-color: rgba(10, 10, 12, 0.3);
}

.cov__plot {
  position: relative;
  width: 100%;
}

.cov__svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
  outline: none;
  touch-action: pan-y;
}

.cov__svg:focus-visible {
  box-shadow: 0 0 0 3px rgba(47, 111, 219, 0.25);
  border-radius: 8px;
}

.cov__grid line {
  stroke: var(--grid);
  stroke-width: 1;
}

.cov__axis-text text {
  font-size: 11px;
  fill: var(--muted);
  font-weight: 500;
}

.cov__line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.cov__line--map { stroke: var(--map); }

.cov__line--api {
  stroke: var(--api);
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  transition: stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.cov__dot {
  stroke: #fff;
  stroke-width: 2;
}

.cov__dot--api { fill: var(--api); }
.cov__dot--map { fill: var(--map); }

.cov__note line {
  stroke: rgba(10, 10, 12, 0.25);
  stroke-width: 1;
}

.cov__note text {
  font-size: 11.5px;
  font-weight: 600;
  fill: var(--ink);
}

.cov__end {
  font-size: 11.5px;
  fill: var(--muted);
  font-weight: 500;
}

.cov__end-val {
  fill: var(--ink);
  font-weight: 700;
}

.cov__hover line {
  stroke: rgba(10, 10, 12, 0.22);
  stroke-width: 1;
}

.cov__tip {
  position: absolute;
  pointer-events: none;
  background: #0a0a0c;
  color: #fff;
  border-radius: 10px;
  padding: 8px 10px;
  min-width: 150px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.cov__tip-head {
  margin: 0 0 4px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.cov__tip-row {
  margin: 2px 0;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
}

.cov__tip-row strong {
  font-weight: 700;
  min-width: 36px;
}

.cov__tip-row span {
  color: rgba(255, 255, 255, 0.75);
}

.cov__table-wrap {
  overflow-x: auto;
}

.cov__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.cov__table th,
.cov__table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--grid);
  text-align: right;
}

.cov__table th:first-child,
.cov__table td:first-child {
  text-align: left;
}

.cov__table thead th {
  color: var(--muted);
  font-weight: 500;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .cov__line--api {
    transition: none;
    stroke-dashoffset: 0;
  }
}
</style>

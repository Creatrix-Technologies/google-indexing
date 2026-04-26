<template>
  <div class="stat-card">
    <div class="stat-icon" :style="{ background: iconBg }">
      <svg v-if="iconType === 'users'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <svg v-else-if="iconType === 'building'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M3 12h18"/>
        <path d="M12 3a14 14 0 0 1 0 18"/>
        <path d="M12 3a14 14 0 0 0 0 18"/>
      </svg>
      <svg v-else-if="iconType === 'trending'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 7 13.5 15.5 8.5 10.5 2 17"/>
        <path d="M16 7h6v6"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12h4l3-8 4 16 3-8h4"/>
      </svg>
    </div>
    <div class="stat-content">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-meta" :class="metaClass">{{ meta }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  label: string
  value: string | number
  meta: string
  iconBg?: string
  iconType?: 'users' | 'building' | 'trending' | 'default'
  metaClass?: string
}>()
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  transition: border-color 160ms ease, box-shadow 160ms ease,
              transform 160ms ease;
}

.stat-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--neutral-100);
  color: var(--neutral-600);
  border: 1px solid var(--color-border);
}

.stat-card:hover .stat-icon {
  color: var(--color-text);
  border-color: var(--color-border-strong);
}

.stat-icon svg {
  width: 18px;
  height: 18px;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  font-weight: var(--fw-medium);
  letter-spacing: 0.06em;
  margin-bottom: 6px;
  text-transform: uppercase;
  line-height: 1;
}

.stat-value {
  font-size: 26px;
  color: var(--color-text);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  margin-bottom: 4px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
}

.stat-meta {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-weight: var(--fw-regular);
  font-variant-numeric: tabular-nums;
}

.stat-meta.positive { color: var(--color-success); font-weight: var(--fw-medium); }
.stat-meta.negative { color: var(--color-danger);  font-weight: var(--fw-medium); }
.stat-meta.muted    { color: var(--color-muted); }

@media (max-width: 768px) {
  .stat-card {
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-value {
    font-size: 22px;
  }
}
</style>

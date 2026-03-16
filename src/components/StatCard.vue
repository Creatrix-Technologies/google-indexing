<template>
  <div class="stat-card">
    <div class="stat-icon" :style="{ background: iconBg }">
      <svg v-if="iconType === 'users'" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
      <svg v-else-if="iconType === 'building'" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      </svg>
      <svg v-else-if="iconType === 'trending'" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12v-6z"/>
      </svg>
      <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
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
  gap: 20px;
  padding: 24px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--box-shadow);
  transition: transform var(--transition-slow), box-shadow var(--transition-slow);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--box-shadow-card);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: #ffffff;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 28px;
  color: var(--color-text);
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-meta {
  font-size: 13px;
  color: var(--color-success);
  font-weight: 500;
}

.stat-meta.negative {
  color: var(--color-error);
}

@media (max-width: 768px) {
  .stat-card {
    gap: 15px;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>

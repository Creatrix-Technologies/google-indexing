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
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 28px;
  color: #333;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-meta {
  font-size: 13px;
  color: #22c55e;
  font-weight: 500;
}

.stat-meta.negative {
  color: #ef4444;
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

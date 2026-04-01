<template>
  <div class="icons page-container">
    <div class="icons-card">
      <h3>Icon Set</h3>
      <p class="subtitle">A beautiful collection of commonly used icons</p>
      
      <div class="icons-grid">
        <div class="icon-item" v-for="icon in icons" :key="icon">
          <span class="icon">{{ icon }}</span>
          <p class="icon-name">Icon</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const icons = ref([
  '📊', '👤', '📋', '📝', '✦', '📍', '🔔', '⚙️',
  '🔍', '📦', '✕', '⭕', '🔧', '👥', '💰', '📈',
  '🎯', '🏆', '💎', '🚀', '⭐', '❤️', '🌟', '💫',
  '📱', '💻', '⌚', '🖥️', '📷', '🎮', '🎨', '🎭'
])
</script>

<style scoped>
.page-container {
  padding: 0;
  overflow-y: auto;
}

.icons-card {
  background: white;
  padding: 16px 18px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.icons-card h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
  color: #333;
}

.subtitle {
  margin: 0 0 16px 0;
  color: #999;
  font-size: 13px;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 10px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 10px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  background: white;
  border-color: #51cbce;
  box-shadow: 0 2px 8px rgba(81, 203, 206, 0.15);
}

.icon {
  font-size: 26px;
  margin-bottom: 6px;
}

.icon-name {
  margin: 0;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>

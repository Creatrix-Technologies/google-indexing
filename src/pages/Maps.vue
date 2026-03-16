<template>
  <div class="maps page-container">
    <div class="maps-card">
      <h3>Maps</h3>
      <p class="subtitle">Display a map in your dashboard</p>
      
      <div class="map-placeholder">
        <div class="map-content">
          <span class="map-icon">🗺️</span>
          <h4>Map Placeholder</h4>
          <p>Integrate Google Maps or any other mapping library here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page-container {
  padding: 20px 30px;
  overflow-y: auto;
}

.maps-card {
  background: white;
  padding: 30px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.maps-card h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: var(--color-text);
}

.subtitle {
  margin: 0 0 30px 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.map-placeholder {
  height: 500px;
  background: linear-gradient(135deg, var(--color-slate-50) 0%, var(--color-border) 100%);
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-content {
  text-align: center;
}

.map-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.map-content h4 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: var(--color-text);
}

.map-content p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>

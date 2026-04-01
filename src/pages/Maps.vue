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
  padding: 0;
  overflow-y: auto;
}

.maps-card {
  background: white;
  padding: 16px 18px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.maps-card h3 {
  margin: 0 0 6px 0;
  font-size: 20px;
  color: #333;
}

.subtitle {
  margin: 0 0 16px 0;
  color: #999;
  font-size: 13px;
}

.map-placeholder {
  height: 420px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
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
  color: #333;
}

.map-content p {
  margin: 0;
  color: #999;
  font-size: 14px;
}
</style>

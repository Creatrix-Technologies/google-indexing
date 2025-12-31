<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Welcome to your new CRM dashboard</p>
    </div>

    <div class="stats-grid">
      <StatCard
        label="Total Indexed Sites"
        value="20"
        meta="+12% from last month"
        iconType="users"
        iconBg="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
      />

      <StatCard
        label="Total Successful Crawls"
        value="44,525"
        meta="+12% from last month"
        iconType="users"
        iconBg="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
      />
      <!-- <StatCard
        label="Companies"
        value="456"
        meta="+8% from last month"
        iconType="building"
        iconBg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
      /> -->
      <StatCard
        label="Active Sites"
        value="45"
        meta="+23% from last month"
        iconType="trending"
        iconBg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
      />
      <StatCard
        label="In Active Sites"
        value="10"
        meta=""
        iconType="default"
        iconBg="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
      />
    </div>

    <div class="charts-container">
      <div class="chart-card">
        <div class="card-header">
          <h3>Test Charts</h3>
          <div class="chart-controls">
            <button v-for="month in ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']" :key="month" class="chart-btn">
              {{ month }}
            </button>
          </div>
        </div>
        <div class="chart-content">
          <svg viewBox="0 0 600 300" class="revenue-chart">
            <defs>
              <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.2" />
                <stop offset="100%" style="stop-color:#22c55e;stop-opacity:0" />
              </linearGradient>
            </defs>
            <!-- Grid -->
            <line x1="60" y1="30" x2="60" y2="250" stroke="#e8e8e8" stroke-width="1" />
            <line x1="60" y1="250" x2="580" y2="250" stroke="#e8e8e8" stroke-width="1" />
            
            <!-- Horizontal grid lines -->
            <line x1="60" y1="100" x2="580" y2="100" stroke="#f0f0f0" stroke-width="1" />
            <line x1="60" y1="150" x2="580" y2="150" stroke="#f0f0f0" stroke-width="1" />
            <line x1="60" y1="200" x2="580" y2="200" stroke="#f0f0f0" stroke-width="1" />

            <!-- Area chart -->
            <polygon points="60,200 130,150 200,120 270,140 340,100 410,80 480,110 550,90" 
                     fill="url(#chartGrad)" />
            
            <!-- Line -->
            <polyline points="60,200 130,150 200,120 270,140 340,100 410,80 480,110 550,90" 
                      fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" />
            
            <!-- Data points -->
            <circle cx="60" cy="200" r="4" fill="#22c55e" />
            <circle cx="130" cy="150" r="4" fill="#22c55e" />
            <circle cx="200" cy="120" r="4" fill="#22c55e" />
            <circle cx="270" cy="140" r="4" fill="#22c55e" />
            <circle cx="340" cy="100" r="4" fill="#22c55e" />
            <circle cx="410" cy="80" r="4" fill="#22c55e" />
            <circle cx="480" cy="110" r="4" fill="#22c55e" />
            <circle cx="550" cy="90" r="4" fill="#22c55e" />

            <!-- Y-axis labels -->
            <text x="40" y="35" font-size="12" fill="#999" text-anchor="end">$250k</text>
            <text x="40" y="105" font-size="12" fill="#999" text-anchor="end">$200k</text>
            <text x="40" y="155" font-size="12" fill="#999" text-anchor="end">$150k</text>
            <text x="40" y="205" font-size="12" fill="#999" text-anchor="end">$100k</text>
            <text x="40" y="255" font-size="12" fill="#999" text-anchor="end">$50k</text>

            <!-- X-axis labels -->
            <text x="60" y="270" font-size="12" fill="#999" text-anchor="middle">Jan</text>
            <text x="130" y="270" font-size="12" fill="#999" text-anchor="middle">Feb</text>
            <text x="200" y="270" font-size="12" fill="#999" text-anchor="middle">Mar</text>
            <text x="270" y="270" font-size="12" fill="#999" text-anchor="middle">Apr</text>
            <text x="340" y="270" font-size="12" fill="#999" text-anchor="middle">May</text>
            <text x="410" y="270" font-size="12" fill="#999" text-anchor="middle">Jun</text>
            <text x="480" y="270" font-size="12" fill="#999" text-anchor="middle">Jul</text>
            <text x="550" y="270" font-size="12" fill="#999" text-anchor="middle">Aug</text>
          </svg>
        </div>
      </div>

      <div class="card-row">
        <div class="info-card">
          <h3>Recent Activity</h3>
          <div class="activity-list">
            <div class="activity-item">
              <span class="activity-dot"></span>
              <div class="activity-text">
                <p class="activity-title">Site: ABC Crawled..</p>
                <p class="activity-time">2 hours ago</p>
              </div>
            </div>
            <div class="activity-item">
              <span class="activity-dot"></span>
              <div class="activity-text">
                <p class="activity-title">Site XYZ queued for Indexing..</p>
                <p class="activity-time">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

    
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatCard from '../components/StatCard.vue'
</script>

<style scoped>
.dashboard {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: #f9f9f9;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.card-header h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.chart-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  color: #666;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.chart-btn:hover {
  background: #22c55e;
  color: #ffffff;
  border-color: #22c55e;
}

.chart-content {
  width: 100%;
  height: 300px;
}

.revenue-chart {
  width: 100%;
  height: 100%;
}

.card-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-card h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.activity-dot {
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

.activity-text p {
  margin: 0;
}

.activity-title {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 13px;
}

.task-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-text {
  flex: 1;
  color: #333;
  font-weight: 500;
}

.task-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card-row {
    grid-template-columns: 1fr;
  }
}
</style>

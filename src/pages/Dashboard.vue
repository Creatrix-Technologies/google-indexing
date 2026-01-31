<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Welcome to your new CRM dashboard</p>
    </div>

    <!-- Stat Cards (unchanged) -->
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

    <!-- Highcharts Chart -->
    <div class="charts-container">
      <div class="chart-card">
        <div class="card-header">
          <h3>Index Success vs Failed (Last 12 Months)</h3>
        </div>

        <div class="chart-content">
          <highcharts
            :constructor-type="'chart'"
            :options="chartOptions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import StatCard from "../components/StatCard.vue"
import { useGoogleConfigStore } from "../Shared/googleConfig"
import { useSubscriptionStore } from "../Shared/subscription"

const subscriptionStore = useSubscriptionStore()

const chartOptions = ref<any>({
  chart: { type: "area", height: 320 },
  title: { text: "" },
  xAxis: { categories: [] },
  yAxis: { title: { text: "Index Count" } },
  tooltip: { shared: true },
  series: []
})

onMounted(() => {
  // Check config and subscription (your existing logic)
  useGoogleConfigStore().check()
  subscriptionStore.checkSubscription()

  // Example JSON data (replace with API response later)
  const jsonData = [
    { date: "2025-01-01", failedindexcount: 10, successindexcount: 120 },
    { date: "2025-02-01", failedindexcount: 5, successindexcount: 150 },
    { date: "2025-03-01", failedindexcount: 8, successindexcount: 170 },
    { date: "2025-04-01", failedindexcount: 3, successindexcount: 200 },
    { date: "2025-05-01", failedindexcount: 12, successindexcount: 180 },
    { date: "2025-06-01", failedindexcount: 7, successindexcount: 210 },
    { date: "2025-07-01", failedindexcount: 9, successindexcount: 220 },
    { date: "2025-08-01", failedindexcount: 4, successindexcount: 240 },
    { date: "2025-09-01", failedindexcount: 6, successindexcount: 260 },
    { date: "2025-10-01", failedindexcount: 11, successindexcount: 230 },
    { date: "2025-11-01", failedindexcount: 2, successindexcount: 280 },
    { date: "2025-12-01", failedindexcount: 5, successindexcount: 300 },
    { date: "2026-01-01", failedindexcount: 3, successindexcount: 320 }
  ]

  // ✅ Step 1: Sort by date
  const sorted = jsonData.sort(
    (a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // ✅ Step 2: Take last 12 months
  const last12Months = sorted.slice(-12)

  // ✅ Step 3: Map categories & series
  const categories = last12Months.map(x =>
    new Date(x.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  )
  const success = last12Months.map(x => Number(x.successindexcount) || 0)
  const failed = last12Months.map(x => Number(x.failedindexcount) || 0)

  // ✅ Step 4: Update chart
  chartOptions.value = {
    chart: { type: "area", height: 320 },
    title: { text: "" },
    xAxis: { categories },
    yAxis: { title: { text: "Index Count" } },
    tooltip: { shared: true },
    series: [
      { name: "Success Index", data: success, color: "#22c55e", fillOpacity: 0.15 },
      { name: "Failed Index", data: failed, color: "#ef4444", fillOpacity: 0.15 }
    ]
  }
})
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
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  padding: 20px;
}

.chart-content {
  width: 100%;
  height: 350px;
}
</style>

<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Dashboard</h1>
      <p class="subtitle">{{ greeting }}</p>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid">
      <template v-if="cards.length">
        <StatCard
          v-for="card in cards"
          :key="card.title"
          :label="card.title"
          :value="card.value"
          meta=""
          iconType="users"
          :iconBg="getCardColor(card.title)"
        />
      </template>
      <p v-else class="empty-message">No dashboard cards available</p>
    </div>

    <!-- Charts -->
    <div class="charts-container">
      <div class="chart-card" v-if="charts.length">
        <div class="card-header">
          <h3>Index Summary (Last 12 Months)</h3>
        </div>

        <div class="chart-content">
          <highcharts :constructor-type="'chart'" :options="chartOptions" />
        </div>
      </div>
      <p v-else class="empty-message">No chart data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import api from "../api"
import StatCard from "../components/StatCard.vue"
import { useGoogleConfigStore } from "../Shared/googleConfig"
import { useSubscriptionStore } from "../Shared/subscription"

/* =======================
   Greeting
======================= */
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning ☀️"
  if (hour < 17) return "Good Afternoon 🌤️"
  return "Good Evening 🌙"
})

/* =======================
   Types
======================= */
interface DashboardCard {
  title: string
  value: number
  order: number
}

interface DashboardChart {
  date: string
  successIndex: number
  successDeIndex: number
  failedIndex: number
}

/* =======================
   State
======================= */
const cards = ref<DashboardCard[]>([])
const charts = ref<DashboardChart[]>([])

const chartOptions = ref<any>({
  chart: { type: "area", height: 320 },
  title: { text: "" },
  xAxis: { categories: [] },
  yAxis: { title: { text: "Index Count" } },
  tooltip: { shared: true },
  series: []
})

/* =======================
   API Call
======================= */
const fetchDashboard = async () => {
  try {
    const res = await api.get("/dashboard")

    if (res.data?.isSuccess) {
      cards.value = res.data.data.cards.sort(
        (a: any, b: any) => a.order - b.order
      )
      charts.value = res.data.data.charts || []
      buildChart()
    } else {
      // Handle no data (Result.NotFound) or other errors
      cards.value = []
      charts.value = []
    }
  } catch (err) {
    console.error("Dashboard API error", err)
    cards.value = []
    charts.value = []
  }
}

/* =======================
   Chart Builder
======================= */
const buildChart = () => {
  if (!charts.value.length) return

  // sort by date
  const sorted = [...charts.value].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // take last 12 months
  const last12 = sorted.slice(-12)

  const categories = last12.map(x =>
    new Date(x.date).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit"
    })
  )

  const success = last12.map(x => x.successIndex || 0)
  const deIndex = last12.map(x => x.successDeIndex || 0)
  const failed = last12.map(x => x.failedIndex || 0)

  chartOptions.value = {
    chart: { type: "area", height: 320 },
    title: { text: "" },
    xAxis: { categories },
    yAxis: { title: { text: "Index Count" } },
    tooltip: { shared: true },
    series: [
      {
        name: "Index",
        data: success,
        color: "#22c55e",
        fillOpacity: 0.15
      },
      {
        name: "DeIndex",
        data: deIndex,
        color: "#3b82f6",
        fillOpacity: 0.15
      },
      {
        name: "Failed",
        data: failed,
        color: "#ef4444",
        fillOpacity: 0.15
      }
    ]
  }
}

/* =======================
   Helpers
======================= */
const getCardColor = (title: string) => {
  if (title == "Active Sites")
    return "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"

  if (title == "Total Failed Indexed")
    return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"

  if (title == "In Active Sites")
    return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"

  if (title.includes("Crawled"))
    return "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"

  return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
}

/* =======================
   Lifecycle
======================= */
onMounted(() => {
  useGoogleConfigStore().check()
  useSubscriptionStore().checkSubscription()
  fetchDashboard()
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

.empty-message {
  text-align: center;
  color: #666;
  font-size: 16px;
  padding: 30px 0;
}
</style>

<!-- <template>
  <div class="app-container" v-if="$route.path !== '/login'">
    <Sidebar />
    <div class="main-content">
      <Header />
      <router-view />
    </div>
  </div> -->

  <!-- LOGIN PAGE (No layout) -->
  <!-- <div v-else>
    <router-view />
  </div>
</template> -->

<template>
  <router-view />
  <PublicSalesAssistant v-if="showPublicAssistant" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";

const PublicSalesAssistant = defineAsyncComponent(() =>
  import("./components/PublicSalesAssistant.vue")
);

const route = useRoute();
const showPublicAssistant = computed(() => route.path === "/" || route.path === "/pricing");
</script>




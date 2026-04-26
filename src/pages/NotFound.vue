<template>
  <div class="error-page">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist or the URL is incorrect.</p>
    <div class="button-group">
    <router-link to="/dashboard" class="btn">Go Back To Dashboard</router-link>
  </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  text-align: center;
  color: var(--color-text);
  font-family: var(--font-family);
  padding: var(--space-6);
}

.error-page h1 {
  font-size: 32px;
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tighter);
  margin: 0 0 var(--space-3) 0;
  color: var(--color-text);
  line-height: 1.1;
}

.error-page p {
  font-size: var(--fs-md);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-6) 0;
  max-width: 420px;
  line-height: 1.55;
}

.button-group {
  display: flex;
  gap: var(--space-2);
}

.error-page .btn {
  display: inline-flex;
  align-items: center;
  padding: 9px 14px;
  background: var(--neutral-900);
  color: #ffffff;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
  font-size: var(--fs-base);
  cursor: pointer;
  transition: background 140ms ease;
}

.error-page .btn:hover {
  background: var(--neutral-800);
}
</style>

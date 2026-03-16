<template>
  <div class="error-page">
    <div class="error-illustration">
      <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="50" width="120" height="60" rx="8" stroke="var(--color-border)" stroke-width="2"/>
        <path d="M70 80 L90 60 L110 75 L130 55 L150 70" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
        <circle cx="100" cy="40" r="12" fill="var(--color-slate-200)"/>
      </svg>
    </div>
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
  height: 80vh;
  text-align: center;
  color: var(--color-text);
}

.error-illustration {
  margin-bottom: 24px;
  opacity: 0.9;
}

.error-illustration svg {
  width: 160px;
  height: 96px;
}

.error-page h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
}

.error-page p {
  font-size: 18px;
  margin-bottom: 30px;
}

.error-page .btn {
  padding: 10px 20px;
  background-color: var(--color-primary);
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
}

.error-page .btn:hover {
  background-color: var(--color-primary-hover);
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  margin: 0 10px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn:first-of-type {
  background-color: var(--color-primary);
  color: #fff;
}

.btn:first-of-type:hover {
  background-color: var(--color-primary-hover);
}

.btn:last-of-type {
  background-color: var(--color-slate-200);
  color: var(--color-text);
}

.btn:last-of-type:hover {
  background-color: var(--color-slate-400);
  color: var(--color-slate-50);
}
</style>

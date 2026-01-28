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
  height: 80vh;
  text-align: center;
  color: #333;
}

.error-page h1 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
}

.error-page p {
  font-size: 18px;
  margin-bottom: 30px;
}

.error-page .btn {
  padding: 10px 20px;
  background-color: #4c6fff;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
}

.error-page .btn:hover {
  background-color: #3f5ae0;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  margin: 0 10px;         /* space between buttons */
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

/* Primary button - Login */
.btn:first-of-type {
  background-color: #4c6fff;
  color: #fff;
}

.btn:first-of-type:hover {
  background-color: #3f5ae0;
}

/* Secondary button - Home */
.btn:last-of-type {
  background-color: #e5e7eb;
  color: #1f2937;
}

.btn:last-of-type:hover {
  background-color: #d1d5db;
}
</style>

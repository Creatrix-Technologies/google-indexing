<template>
    <div class="error-page">
      <h1>401 - Unauthorized</h1>
      <p>You are not authorized to access this page. Please login again.</p>
      <button @click="goLogin">Go to Login</button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  const router = useRouter();
  
  const goLogin = () => {
    router.push('/login');
  };
  </script>
  
  <style scoped>
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    text-align: center;
    font-family: var(--font-family);
    padding: var(--space-6);
  }

  .error-page h1 {
    font-size: 32px;
    font-weight: var(--fw-semi);
    letter-spacing: var(--letter-tighter);
    margin: 0 0 var(--space-3) 0;
    color: var(--color-danger);
    line-height: 1.1;
  }

  .error-page p {
    font-size: var(--fs-md);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-5) 0;
    max-width: 440px;
    line-height: 1.55;
  }

  .error-page button {
    padding: 9px 14px;
    background: var(--neutral-900);
    color: #ffffff;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font-size: var(--fs-base);
    font-weight: var(--fw-medium);
    cursor: pointer;
    font-family: inherit;
    transition: background 140ms ease;
  }

  .error-page button:hover {
    background: var(--neutral-800);
  }
  </style>
  
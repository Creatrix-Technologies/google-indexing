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
    height: 80vh;
    text-align: center;
  }
  
  .error-page h1 {
    font-size: 36px;
    margin-bottom: 12px;
    color: #e74c3c;
  }
  
  .error-page p {
    font-size: 15px;
    margin-bottom: 16px;
  }
  
  .error-page button {
    padding: 8px 16px;
    background: #4c6fff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .error-page button:hover {
    background: #3f5ae0;
  }
  </style>
  
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
    font-size: 48px;
    margin-bottom: 20px;
    color: #e74c3c;
  }
  
  .error-page p {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .error-page button {
    padding: 10px 20px;
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
  
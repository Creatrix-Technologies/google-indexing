<template>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1>Google Application Keys</h1>
        <p class="subtitle">
          Configure Google OAuth Client credentials used for authentication
        </p>
      </div>
  
      <!-- Scrollable Content -->
      <div class="page-content">
        <div class="grid">
          
          <!-- Status Card -->
          <div class="card">
            <h3>Current Configuration</h3>
  
            <div v-if="keys.clientId" class="status-box success">
              <div>
                <strong>Client ID:</strong>
                <div class="mono">{{ keys.clientId }}</div>
              </div>
            </div>
  
            <div v-else class="status-box">
              No Google application keys configured
            </div>
          </div>
  
          <!-- Configuration Form -->
          <div class="card">
            <h3>Update Google OAuth Keys</h3>
  
            <div class="form-group">
              <label>Client ID</label>
              <input type="text" v-model="keys.clientId" />
            </div>
  
            <div class="form-group">
              <label>Client Secret</label>
              <input type="text" v-model="keys.clientSecret" />
            </div>
  
            <div class="form-group">
              <label>Redirect URI</label>
              <input type="text" v-model="keys.redirectUri" />
            </div>
  
            <button
              class="btn primary full"
              @click="updateKeys"
              :disabled="loading"
            >
              Save Keys
            </button>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue'
  import api from '../api'
  import { useToast } from 'vue-toastification'
  
  const toast = useToast()
  const loading = ref(false)
  
  const keys = reactive({
    clientId: '',
    clientSecret: '',
    redirectUri: ''
  })
  
  /* GET API */
  const fetchKeys = async () => {
    loading.value = true
    try {
      const res = await api.get('/settings/get-google-keys')
  
      const data = res.data?.data || res.data
  
      if (data) {
        keys.clientId = data.clientId || ''
        keys.clientSecret = data.clientSecret || ''
        keys.redirectUri = data.redirectUri || ''
      }
  
    } catch (err) {
      toast.error('Failed to load Google keys')
    }
    finally {
      loading.value = false
    }
  }
  
  /* POST API */
  const updateKeys = async () => {
    loading.value = true
  
    try {
  
      await api.post('/settings/update-google-keys', {
        clientId: keys.clientId,
        clientSecret: keys.clientSecret,
        redirectUri: keys.redirectUri
      })
  
      toast.success('Google keys updated successfully')
  
    } catch (err) {
      toast.error('Failed to update keys')
    }
    finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    fetchKeys()
  })
  </script>
  
  <style scoped>
  
  .page-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f6f8;
  }
  
  .page-header {
    padding: 30px;
  }
  
  .page-header h1 {
    font-size: 28px;
    font-weight: 700;
  }
  
  .subtitle {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
  
  .page-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 30px 30px;
  }
  
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  .card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #e5e7eb;
  }
  
  .status-box {
    padding: 12px;
    border-radius: 6px;
  }
  
  .status-box.success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
  }
  
  .mono {
    font-family: monospace;
    word-break: break-all;
  }
  
  .form-group {
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
  }
  
  input {
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
  }
  
  .btn {
    padding: 10px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
  }
  
  .btn.primary {
    background: #2563eb;
    color: white;
  }
  
  .btn.full {
    width: 100%;
  }
  
  @media (max-width: 1024px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  
  </style>
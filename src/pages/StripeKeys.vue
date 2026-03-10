<template>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1>Stripe Configuration</h1>
        <p class="subtitle">
          Configure Stripe API credentials for payment processing
        </p>
      </div>
  
      <!-- Scrollable Content -->
      <div class="page-content">
        <div class="grid">
  
          <!-- Current Status -->
          <div class="card">
            <h3>Current Configuration</h3>
  
            <div v-if="keys.secretKey" class="status-box success">
              <div>
                <strong>Secret Key:</strong>
                <div class="mono">{{ keys.secretKey }}</div>
              </div>
            </div>
  
            <div v-else class="status-box">
              No Stripe keys configured
            </div>
          </div>
  
          <!-- Form -->
          <div class="card">
            <h3>Update Stripe Keys</h3>
  
            <div class="form-group">
              <label>Secret Key</label>
              <input type="text" v-model="keys.secretKey" />
            </div>
  
            <div class="form-group">
              <label>Webhook Secret</label>
              <input type="text" v-model="keys.webHookSecret" />
            </div>
  
            <button
              class="btn primary full"
              @click="updateKeys"
              :disabled="loading"
            >
              Save Stripe Keys
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
    secretKey: '',
    webHookSecret: ''
  })
  
  /* GET Stripe Keys */
  const fetchKeys = async () => {
    loading.value = true
    try {
  
      const res = await api.get('/settings/get-stripe-keys')
      const data = res.data?.data || res.data
  
      if (data) {
        keys.secretKey = data.secretKey || ''
        keys.webHookSecret = data.webHookSecret || ''
      }
  
    } catch {
      toast.error('Failed to load Stripe configuration')
    }
    finally {
      loading.value = false
    }
  }
  
  /* UPDATE Stripe Keys */
  const updateKeys = async () => {
  
    loading.value = true
  
    try {
  
      await api.post('/settings/update-stripe-keys', {
        secretKey: keys.secretKey,
        webHookSecret: keys.webHookSecret
      })
  
      toast.success('Stripe configuration updated')
  
    } catch {
      toast.error('Failed to update Stripe configuration')
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
  
  /* Layout */
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
    color: #666;
  }
  
  .page-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 30px 30px;
  }
  
  /* Grid */
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  /* Card */
  .card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #e5e7eb;
  }
  
  /* Status */
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
  
  /* Form */
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
  
  /* Button */
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
  
  /* Responsive */
  @media (max-width: 1024px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  
  </style>
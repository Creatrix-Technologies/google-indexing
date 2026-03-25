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

  <div class="password-wrapper">
    <input
      v-model="keys.secretKey"
      :type="showSecretKey ? 'text' : 'password'"
      placeholder="Enter secret key"
    />

    <button
      type="button"
      class="toggle-password"
      @click="showSecretKey = !showSecretKey"
    >
      {{ showSecretKey ? 'Hide' : 'Show' }}
    </button>
  </div>
</div>
  
<div class="form-group">
  <label>Webhook Secret</label>

  <div class="password-wrapper">
    <input
      v-model="keys.webHookSecret"
      :type="showWebhookSecret ? 'text' : 'password'"
      placeholder="Enter webhook secret"
    />

    <button
      type="button"
      class="toggle-password"
      @click="showWebhookSecret = !showWebhookSecret"
    >
      {{ showWebhookSecret ? 'Hide' : 'Show' }}
    </button>
  </div>
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
  const showSecretKey = ref(false)
const showWebhookSecret = ref(false)
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
  /* Input base */
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #4c6fff;
  box-shadow: 0 0 0 2px rgba(76, 111, 255, 0.15);
}

/* Password wrapper (shared for both fields) */
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

/* Input inside wrapper */
.password-wrapper input {
  width: 100%;
  padding-right: 70px; /* space for button */
}

/* Show/Hide button */
.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  font-size: 13px;
  color: #4c6fff;
  cursor: pointer;
  font-weight: 500;
}

.toggle-password:hover {
  text-decoration: underline;
}
  /* Responsive */
  @media (max-width: 1024px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  
  </style>
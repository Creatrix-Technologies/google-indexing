<template>
    <SettingsLayout>
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

  <div class="password-wrapper">
    <input
      v-model="keys.clientSecret"
      :type="showClientSecret ? 'text' : 'password'"
      placeholder="Enter client secret"
    />

    <button
      type="button"
      class="toggle-password"
      @click="showClientSecret = !showClientSecret"
    >
      {{ showClientSecret ? 'Hide' : 'Show' }}
    </button>
  </div>
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
    </SettingsLayout>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref, onMounted } from 'vue'
  import api from '../api'
  import { useToast } from 'vue-toastification'
  import SettingsLayout from '../components/SettingsLayout.vue'
  const showClientSecret = ref(false)
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
.page-content {
  flex: 1;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: var(--space-4);
}

.card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
}
.card h3 {
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tight);
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text);
}

.status-box {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--neutral-50);
  border: 1px solid var(--color-border);
  font-size: var(--fs-sm);
  color: var(--color-text);
}
.status-box.success {
  background: var(--success-50);
  border-color: var(--success-100);
  color: var(--success-700);
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
  word-break: break-all;
}

.form-group {
  margin-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text);
  margin-bottom: 6px;
}

.btn {
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  font-family: inherit;
  transition: background 140ms ease;
}
.btn.primary {
  background: var(--color-accent);
  color: var(--color-accent-fg);
}
.btn.primary:hover { background: var(--color-accent-hover); }
.btn.full { width: 100%; }

.form-group input {
  width: 100%;
  padding: 8px 11px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  font-family: inherit;
  background: var(--color-card-bg);
  color: var(--color-text);
  outline: none;
  transition: border-color 140ms ease, box-shadow 140ms ease;
  box-sizing: border-box;
}
.form-group input::placeholder {
  color: var(--color-placeholder);
}
.form-group input:focus {
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}
.password-wrapper input {
  width: 100%;
  padding-right: 70px;
}

.toggle-password {
  position: absolute;
  right: 8px;
  background: transparent;
  border: 1px solid transparent;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semi);
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 140ms ease, background 140ms ease;
}
.toggle-password:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

  </style>
<template>
  <SettingsLayout>
    <div class="page-content">

      <!-- Upload + Status row -->
      <div class="grid" id="upload-section">
        <!-- Left Column -->
        <div class="column">
          <!-- Current Status -->
          <div class="card">
            <h3>Current Status</h3>

            <div class="status-box status-box--success" v-if="credentials.serviceAccountEmail">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="15" height="15">
                <circle cx="8" cy="8" r="7"/><polyline points="5 8 7 10.5 11 5.5"/>
              </svg>
              <div>
                <strong>Connected</strong><br />
                <span class="mono">{{ credentials.serviceAccountEmail }}</span>
              </div>
            </div>

            <div class="status-box" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="15" height="15">
                <circle cx="8" cy="8" r="7"/><line x1="8" y1="5.5" x2="8" y2="8.5"/><circle cx="8" cy="10.5" r=".5" fill="currentColor"/>
              </svg>
              <span>No credentials uploaded yet</span>
            </div>

            <div class="actions" v-if="credentials.serviceAccountEmail">
              <button class="btn danger" @click="removeCredentials" :disabled="loading">
                Remove Credentials
              </button>
            </div>
          </div>

          <!-- Upload JSON -->
          <div class="card">
            <h3>Upload Service Account Key</h3>
            <p class="hint">
              Upload the <code>.json</code> key file downloaded from Google Cloud IAM to enable URL indexing.
              Not sure where to get it? See the setup guide below.
            </p>

            <div class="file-row">
              <input
                type="file"
                accept=".json,application/json"
                class="file-input"
                ref="fileInput"
                @change="handleFileChange"
              />
            </div>

            <div class="actions">
              <button class="btn primary" @click="uploadKey" :disabled="loading">
                {{ loading ? 'Uploading...' : 'Upload Key' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="card">
            <h3>Manual Credentials Entry</h3>
            <p class="hint">Paste the individual fields from your JSON key file if you prefer not to upload the file directly.</p>

            <div class="form-group">
              <label>Client ID</label>
              <input type="text" v-model="credentials.clientId" />
            </div>

            <div class="form-group">
              <label>Project ID</label>
              <input type="text" v-model="credentials.projectId" />
            </div>

            <div class="form-group">
              <label>Service Account Email</label>
              <input type="email" v-model="credentials.serviceAccountEmail" />
            </div>

            <div class="form-group">
              <label>Private Key ID</label>
              <input type="text" v-model="credentials.privateKeyId" />
            </div>

            <div class="form-group">
              <label>Private Key</label>
              <textarea rows="6" v-model="credentials.privateKey"></textarea>
            </div>

            <button class="btn primary full" @click="updateCredentials" :disabled="loading">
              Update Credentials
            </button>
          </div>
        </div>
      </div>

      <!-- Setup Guide accordion -->
      <div class="setup-guide">
        <button
          class="setup-guide__toggle"
          :aria-expanded="guideOpen"
          @click="guideOpen = !guideOpen"
        >
          <span class="setup-guide__toggle-left">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="15" height="15">
              <rect x="2" y="2" width="12" height="12" rx="1.5"/>
              <line x1="5" y1="6" x2="11" y2="6"/>
              <line x1="5" y1="9" x2="9" y2="9"/>
            </svg>
            <span class="setup-guide__label">Setup Guide</span>
            <span class="setup-guide__badge">6 steps</span>
          </span>
          <span class="setup-guide__toggle-right">
            <span class="setup-guide__hint">How do I get a service account JSON key?</span>
            <svg
              class="setup-guide__chevron"
              :class="{ 'setup-guide__chevron--open': guideOpen }"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13"
            >
              <polyline points="2 4 6 8 10 4"/>
            </svg>
          </span>
        </button>

        <Transition name="guide-expand">
          <div v-if="guideOpen" class="setup-guide__body">
            <GoogleSetupSteps :all-expanded="false" :hide-final-cta="true" />
          </div>
        </Transition>
      </div>

    </div>
  </SettingsLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '../api'
import { useToast } from 'vue-toastification'
import { useGoogleConfigStore } from '../Shared/googleConfig'
import { useSubscriptionStore } from '../Shared/subscription'
import SettingsLayout from '../components/SettingsLayout.vue'
import GoogleSetupSteps from '../components/GoogleSetupSteps.vue'

const guideOpen = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const googleConfigStore = useGoogleConfigStore()
const subscriptionStore = useSubscriptionStore()

const toast = useToast()
const loading = ref(false)
const selectedFile = ref<File | null>(null)

const credentials = reactive({
  clientId: '',
  projectId: '',
  serviceAccountEmail: '',
  privateKey: '',
  privateKeyId: '',
  lastUpdated: ''
})

const fetchCredentials = async () => {
  loading.value = true
  try {
    const res = await api.get('/google-config/get')
    const data = res.data?.data
    if (data) {
      credentials.clientId = data.clientId || ''
      credentials.projectId = data.projectId || ''
      credentials.serviceAccountEmail = data.clientEmail || ''
      credentials.privateKey = data.privateKey || ''
      credentials.privateKeyId = data.privateKeyId || ''
      credentials.lastUpdated = data.lastUpdated || ''
    }
  } finally {
    loading.value = false
  }
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0]; // safely get first file
  if (file) {
    selectedFile.value = file; // now TypeScript knows it's not undefined
  }
};

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''  // clears the <input type="file">
  }
}

const uploadKey = async () => {
  if (!selectedFile.value) {
    toast.error('Please select a JSON file')
    return
  }

  loading.value = true
  try {
    const fd = new FormData()
    fd.append('file', selectedFile.value)

    const response = await api.post('/google-config/upload', fd, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Check if API explicitly returned an error
    if (response.data?.isSuccess === false) {
      toast.error(response.data.error?.description || 'Failed to upload key')
      return
    }

    toast.success('Key uploaded successfully')
    fetchCredentials()
    await googleConfigStore.check()
    
  } catch (err: any) {
    // If request fails (network/server error), show a toast
    toast.error(err.response?.data?.error?.description || 'An error occurred while uploading')
  } finally {
    loading.value = false
    clearFile()
  }
}
const removeCredentials = async () => {
  if (!confirm('Remove credentials?')) return
  loading.value = true
  try {
    await api.post('/google-config/remove')
    Object.assign(credentials, {
      clientId: '',
      projectId: '',
      serviceAccountEmail: '',
      privateKey: '',
      privateKeyId: ''
    })
    toast.success('Credentials removed')
  } finally {
    loading.value = false
  }
}

const updateCredentials = async () => {
  loading.value = true
  try {
    const response = await api.post('/google-config/update', {
      clientId: credentials.clientId,
      projectId: credentials.projectId,
      clientEmail: credentials.serviceAccountEmail,
      privateKey: credentials.privateKey,
      privateKeyId: credentials.privateKeyId
    })

    if (response.data?.isSuccess) {
      toast.success('Credentials updated')
    } else {
      // Handle validation errors from response
      const errors = response.data?.error?.validationErrors
      if (errors && errors.length) {
        const cleanErrors = errors.map((e: string) => e.replace(/'/g, ""))
        toast.error(cleanErrors.join(', '))
      } else {
        const description = response.data?.error?.description?.replace(/'/g, "") || 'An unknown error occurred'
        toast.error(description)
      }
    }
  } catch (err: any) {
    // Network or unexpected errors
    const errors = err.response?.data?.error?.validationErrors
    const description = err.response?.data?.error?.description
    const msg = errors?.map((e: string) => e.replace(/'/g, "")).join(', ') 
                || description?.replace(/'/g, "") 
                || err.message 
                || 'An unexpected error occurred'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCredentials()
  subscriptionStore.checkSubscription()
})

</script>

<style scoped>
.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: var(--space-4);
}

.column {
  display: flex;
  flex-direction: column;
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
  color: var(--color-text);
  margin: 0 0 var(--space-4) 0;
}

.hint {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-3);
  line-height: 1.55;
}
.hint :deep(code) {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 1px 5px;
  color: var(--neutral-700);
}

/* Status box */
.status-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--neutral-50);
  border: 1px solid var(--color-border);
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  line-height: 1.55;
}
.status-box svg { flex-shrink: 0; margin-top: 1px; }

.status-box--success {
  background: var(--success-50);
  border-color: var(--success-100);
  color: var(--success-700);
}
.status-box--success strong { color: var(--success-700); }

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
  word-break: break-all;
  color: var(--color-text);
}

.file-row { margin-bottom: var(--space-1); }

.actions {
  margin-top: var(--space-4);
  display: flex;
  gap: var(--space-2);
}

.btn {
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  transition: background 140ms ease, border-color 140ms ease;
}
.btn.primary { background: var(--color-accent); color: var(--color-accent-fg); }
.btn.primary:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn.danger { background: var(--color-card-bg); color: var(--color-danger); border-color: var(--danger-100); }
.btn.danger:hover:not(:disabled) { background: var(--danger-50); border-color: var(--color-danger); }
.btn.full { width: 100%; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

input, textarea {
  padding: 8px 11px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  font-size: var(--fs-base);
  font-family: inherit;
  background: var(--color-card-bg);
  color: var(--color-text);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
textarea { font-family: var(--font-mono); font-size: 12px; resize: vertical; }
input:focus, textarea:focus { outline: none; border-color: var(--color-accent); box-shadow: var(--ring-accent); }

.file-input { font-family: inherit; font-size: var(--fs-sm); }
.file-input::file-selector-button {
  margin-right: var(--space-3);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-strong);
  background: var(--color-card-bg);
  color: var(--color-text);
  font-weight: var(--fw-medium);
  cursor: pointer;
}
.file-input::file-selector-button:hover { background: var(--color-surface-2); }

/* ============ Setup Guide accordion ============ */
.setup-guide {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}

.setup-guide__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-4) var(--space-5);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 140ms ease;
}
.setup-guide__toggle:hover { background: var(--neutral-50); }
.setup-guide__toggle:focus-visible { outline: none; box-shadow: var(--ring-neutral) inset; }

.setup-guide__toggle-left {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text);
}

.setup-guide__label {
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  letter-spacing: var(--letter-tight);
}

.setup-guide__badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
}

.setup-guide__toggle-right {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}

.setup-guide__hint {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
}

.setup-guide__chevron {
  color: var(--color-muted);
  transition: transform 220ms ease;
  flex-shrink: 0;
}
.setup-guide__chevron--open { transform: rotate(180deg); }

.setup-guide__body {
  padding: var(--space-5) var(--space-6);
  border-top: 1px solid var(--color-divider);
}

/* Accordion transition */
.guide-expand-enter-active { transition: opacity 220ms ease, transform 220ms ease; }
.guide-expand-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.guide-expand-enter-from,
.guide-expand-leave-to    { opacity: 0; transform: translateY(-8px); }

@media (max-width: 640px) {
  .setup-guide__hint { display: none; }
  .setup-guide__body { padding: var(--space-4); }
}
</style>

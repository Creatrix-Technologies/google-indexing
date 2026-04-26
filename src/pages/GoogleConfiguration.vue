<template>
  <SettingsLayout>
    <div class="page-content">
      <div class="grid">
        <!-- Left Column -->
        <div class="column">
          <!-- Current Status -->
          <div class="card">
            <h3>Current Status</h3>

            <div class="status-box success" v-if="credentials.serviceAccountEmail">
              <div>
                <strong>Service Account:</strong><br />
                <span class="mono">{{ credentials.serviceAccountEmail }}</span>
              </div>
            </div>

            <div class="status-box" v-else>
              <span>No credentials uploaded</span>
            </div>

            <div class="actions" v-if="credentials.serviceAccountEmail">
              <button
                class="btn danger"
                @click="removeCredentials"
                :disabled="loading"
              >
                Remove Credentials
              </button>
            </div>
          </div>

          <!-- Upload JSON -->
          <div class="card">
            <h3>Upload Service Account Key</h3>
            <p class="hint">
              Upload a Google service account JSON key file to enable URL
              indexing functionality.
            </p>

            <input
              type="file"
              class="file-input"
              ref="fileInput"
              @change="handleFileChange"
            />

            <div class="actions">
              <button
                class="btn primary"
                @click="uploadKey"
                :disabled="loading"
              >
                Upload Key
              </button>
            </div>

            <div class="info">
              <h4>How to get a service account key?</h4>
              <ol>
                <li>Go to Google Cloud Console</li>
                <li>Create or select a service account</li>
                <li>Go to “Keys” → “Add Key”</li>
                <li>Create a new JSON key</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="card">
            <h3>Manual Credentials Entry</h3>

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

            <button
              class="btn primary full"
              @click="updateCredentials"
              :disabled="loading"
            >
              Update Credentials
            </button>
          </div>
        </div>
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

.status-box {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--neutral-50);
  border: 1px solid var(--color-border);
  font-size: var(--fs-sm);
  color: var(--color-text);
  line-height: 1.55;
}

.status-box strong {
  font-weight: var(--fw-semi);
  color: var(--color-text);
}

.status-box.success {
  background: var(--success-50);
  border: 1px solid var(--success-100);
  color: var(--success-700);
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
  word-break: break-all;
  color: var(--color-text);
}

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

.btn.primary {
  background: var(--color-accent);
  color: var(--color-accent-fg);
}
.btn.primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.btn.danger {
  background: var(--color-card-bg);
  color: var(--color-danger);
  border-color: var(--danger-100);
}
.btn.danger:hover:not(:disabled) {
  background: var(--danger-50);
  border-color: var(--color-danger);
}

.btn.full {
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

input,
textarea {
  padding: 8px 11px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  font-size: var(--fs-base);
  font-family: inherit;
  background: var(--color-card-bg);
  color: var(--color-text);
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
textarea {
  font-family: var(--font-mono);
  font-size: 12px;
  resize: vertical;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: var(--ring-accent);
}

.file-input {
  font-family: inherit;
  font-size: var(--fs-sm);
}
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
.file-input::file-selector-button:hover {
  background: var(--color-surface-2);
}

.info {
  margin-top: var(--space-5);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--info-50);
  border: 1px solid var(--info-100);
}
.info h4 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--fs-sm);
  color: var(--info-700);
  font-weight: var(--fw-semi);
}
.info ol {
  margin: 0;
  padding-left: 18px;
  font-size: var(--fs-sm);
  color: var(--info-700);
  line-height: 1.7;
}

</style>

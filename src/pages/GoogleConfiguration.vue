<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Google Configuration</h1>
      <p class="subtitle">
        Configure credentials for Google Search Console and Indexing API
      </p>
    </div>

    <!-- Scrollable Content -->
    <div class="page-content">
      <div class="grid">
        <!-- Left Column -->
        <div class="column">
          <!-- Current Status -->
          <div class="card">
            <h3 class="card-title">Current Status</h3>
            <div class="status-box success" v-if="credentials.serviceAccountEmail">
              <span class="status-label">Service Account</span>
              <span class="mono">{{ credentials.serviceAccountEmail }}</span>
            </div>
            <div class="status-box empty" v-else>
              <span>No credentials configured</span>
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
            <h3 class="card-title">Upload Service Account Key</h3>
            <p class="hint">
              Upload a Google service account JSON key file to enable URL indexing.
            </p>
            <div class="file-zone">
              <input
                type="file"
                accept=".json"
                class="file-input"
                @change="handleFileChange"
              />
              <span class="file-label">{{ selectedFile ? selectedFile.name : 'Choose JSON file' }}</span>
            </div>
            <div class="actions">
              <button
                class="btn primary"
                @click="uploadKey"
                :disabled="loading || !selectedFile"
              >
                Upload Key
              </button>
            </div>
            <div class="info-box">
              <h4>How to get a service account key</h4>
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
            <h3 class="card-title">Manual Credentials Entry</h3>
            <p class="hint">Enter credentials directly if you prefer not to upload a file.</p>
            <div class="form-group">
              <label>Client ID</label>
              <input type="text" v-model="credentials.clientId" placeholder="Client ID" />
            </div>
            <div class="form-group">
              <label>Project ID</label>
              <input type="text" v-model="credentials.projectId" placeholder="Project ID" />
            </div>
            <div class="form-group">
              <label>Service Account Email</label>
              <input type="email" v-model="credentials.serviceAccountEmail" placeholder="Service account email" />
            </div>
            <div class="form-group">
              <label>Private Key ID</label>
              <input type="text" v-model="credentials.privateKeyId" placeholder="Private key ID" />
            </div>
            <div class="form-group">
              <label>Private Key</label>
              <textarea rows="5" v-model="credentials.privateKey" placeholder="Paste private key (-----BEGIN PRIVATE KEY-----...)" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '../api'
import { useToast } from 'vue-toastification'
import { useGoogleConfigStore } from '../Shared/googleConfig'
import { useSubscriptionStore } from '../Shared/subscription'

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
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  selectedFile.value = file || null
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
    await api.post('/google-config/upload', fd,{
      headers: {
      'Content-Type': 'multipart/form-data'
    }
    })
    toast.success('Key uploaded successfully')
    fetchCredentials()

    await googleConfigStore.check()
  } finally {
    loading.value = false
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
    await api.post('/google-config/update', {
      clientId: credentials.clientId,
      projectId: credentials.projectId,
      clientEmail: credentials.serviceAccountEmail,
      privateKey: credentials.privateKey,
      privateKeyId: credentials.privateKeyId
    })
    toast.success('Credentials updated')
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
.page-container {
  padding: 0;
  background: var(--color-bg);
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 6px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
}

.page-content {
  padding: 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid var(--color-border);
  box-shadow: var(--box-shadow);
}

.card-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.hint {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.status-box {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
}

.status-box.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.status-box.success .status-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-success);
  margin-bottom: 4px;
}

.status-box.empty {
  background: var(--color-slate-50);
  border: 1px dashed var(--color-border);
  color: var(--color-text-muted);
}

.mono {
  font-family: ui-monospace, monospace;
  font-size: 13px;
  word-break: break-all;
}

.file-zone {
  position: relative;
  padding: 16px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-slate-50);
  cursor: pointer;
  transition: border-color var(--transition-base), background var(--transition-base);
  margin-bottom: 16px;
}

.file-zone:hover {
  border-color: var(--color-accent);
  background: rgba(59, 130, 246, 0.05);
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.file-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-box {
  margin-top: 20px;
  padding: 16px;
  background: var(--color-slate-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.info-box h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.info-box ol {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background var(--transition-base), opacity var(--transition-base);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--color-primary);
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn.danger {
  background: var(--color-error);
  color: white;
}

.btn.danger:hover:not(:disabled) {
  background: var(--color-error-hover);
}

.btn.full {
  width: 100%;
  margin-top: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

input, textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-size: 14px;
  font-family: inherit;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--color-input-focus);
  box-shadow: 0 0 0 2px var(--color-input-focus-ring);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

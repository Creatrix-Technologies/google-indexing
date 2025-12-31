<template>
  <div class="page-container">
    <!-- Header (Fixed) -->
    <div class="page-header">
      <h1>Welcome back!</h1>
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

            <div class="actions">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '../api'
import { useToast } from 'vue-toastification'

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

onMounted(fetchCredentials)
</script>

<style scoped>
/* ===== Layout ===== */
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f6f8;
}

/* Header */
.page-header {
  padding: 30px;
  flex-shrink: 0;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

/* Scroll Area */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 30px 30px;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
}

.column {
  display: flex;
  flex-direction: column;
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

/* Buttons */
.actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.btn.primary {
  background: #2563eb;
  color: white;
}

.btn.danger {
  background: #dc2626;
  color: white;
}

.btn.full {
  width: 100%;
}

/* Forms */
.form-group {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
}

input,
textarea {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

/* Responsive */
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

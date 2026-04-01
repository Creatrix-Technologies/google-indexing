<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Site Management</h1>
        <p class="subtitle">Manage and configure your sites</p>
      </div>
      
      <!-- <button v-if="googleConfigStore.isValid" class="btn-primary" @click="openAddModal">+ Add Site</button> -->
    </div>

    <!-- Site List Table -->
    <div class="table-card">
      <table class="sites-table">
        <thead>
          <tr>
            <!-- <th>Site Name</th> -->
            <th>URL</th>
            <th>Type</th>
            <th>Status</th>
            <th>Robots.txt</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="site in sites" :key="site.id">
            <!-- <td class="site-name-cell">
              <div class="site-icon">{{ site.name.charAt(0).toUpperCase() }}</div>
              <span>{{ site.name }}</span>
            </td> -->

            <td>{{ site.url }}</td>
            <td>{{ site.type }}</td>

            <td>
              <span
                class="status-badge"
                :class="site.activeStatus.toLowerCase()"
              >
                {{ site.activeStatus }}
              </span>
            </td>

            <td>
              <span
                class="status-badge"
                :class="site.ignoreRobotTxt ? 'success' : 'inactive'"
              >
                {{ site.ignoreRobotTxt ? 'Ignored' : 'Followed' }}
              </span>
            </td>

            <td>{{ formatDate(site.created) }}</td>

            <td class="action-cell">
              <button class="action-btn" @click="editSite(site)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box modal-box--lg" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Site' : 'Add New Site' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="saveSite">
          <div class="form-group">
            <label>Site Name *</label>
            <input v-model="formData.name" required />
          </div>

          <div class="form-group">
            <label>Google Console Sites *</label>
            <select v-model="formData.url" required>
              <option value="" disabled>
                {{ isLoadingUrls ? 'Loading URLs...' : 'Select URL' }}
              </option>
              <option v-for="url in availableUrls" :key="url" :value="url">
                {{ url }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Site Type *</label>
              <select v-model="formData.type" required>
                <option value="">Select Type</option>
                <option>E-commerce</option>
                <option>Blog</option>
                <option>Portfolio</option>
                <option>Corporate</option>
                <option>SaaS</option>
                <option>Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Status</label>
              <div class="toggle-container">
                <input
                  v-model="formData.activeStatus"
                  type="checkbox"
                  id="status-toggle"
                  :true-value="'Active'"
                  :false-value="'Inactive'"
                  class="toggle-input"
                />
                <label for="status-toggle" class="toggle-label">
                  <span class="toggle-switch"></span>
                  <span class="toggle-text">
                    {{ formData.activeStatus }}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Ignore Robots.txt -->
          <div class="form-group">
            <label>Ignore robots.txt</label>
            <div class="toggle-container">
              <input
                v-model="formData.ignoreRobotTxt"
                type="checkbox"
                id="robots-toggle"
                class="toggle-input"
              />
              <label for="robots-toggle" class="toggle-label">
                <span class="toggle-switch"></span>
                <span class="toggle-text">
                  {{ formData.ignoreRobotTxt ? 'Yes (Ignore)' : 'No (Follow)' }}
                </span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="formData.description" rows="3" />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              {{ isEditing ? 'Update Site' : 'Add Site' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api'
import { useToast } from 'vue-toastification'
import { useGoogleConfigStore } from '../Shared/googleConfig'
import { useSubscriptionStore } from '../Shared/subscription'

const toast = useToast()
const googleConfigStore = useGoogleConfigStore()
const subscriptionStore = useSubscriptionStore()

interface Site {
  id: number
  name: string
  url: string
  type: string
  activeStatus: 'Active' | 'Inactive'
  description: string
  created: Date
  ignoreRobotTxt: boolean
}

interface FormData {
  name: string
  url: string
  type: string
  activeStatus: 'Active' | 'Inactive'
  description: string
  ignoreRobotTxt: boolean
}

const sites = ref<Site[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const formData = ref<FormData>({
  name: '',
  url: '',
  type: '',
  activeStatus: 'Active',
  description: '',
  ignoreRobotTxt: false
})

const fetchSites = async () => {
  const res = await api.get('/site?PageNo=1&PageSize=10')
  sites.value = (res.data.data || []).map((i: any) => ({
    id: i.webSiteId,
    name: i.siteName,
    url: i.url,
    type: i.siteType,
    activeStatus: i.activeStatus ? 'Active' : 'Inactive',
    description: i.description || '',
    created: new Date(i.createdDate),
    ignoreRobotTxt: i.ignoreRobotTxt ?? false
  }))
}

const saveSite = async () => {
  try {
    await api.post('/site', {
      siteName: formData.value.name,
      url: formData.value.url,
      siteType: formData.value.type,
      description: formData.value.description,
      isActivated: formData.value.activeStatus === 'Active',
      ignoreRobotTxt: formData.value.ignoreRobotTxt,
      webSiteId: editingId.value
    })

    toast.success('Site saved successfully')
    fetchSites()
    closeModal()
  } catch {
    toast.error('Failed to save site')
  }
}

// const openAddModal = async () => {
//   isEditing.value = false
//   editingId.value = null
//   formData.value = {
//     name: '',
//     url: '',
//     type: '',
//     activeStatus: 'Active',
//     description: '',
//     ignoreRobotTxt: false
//   }
//   showModal.value = true
//   fetchAvailableUrls()
// }

const editSite = async (site: Site) => {
  isEditing.value = true
  editingId.value = site.id
  formData.value = { ...site }
  showModal.value = true
  fetchAvailableUrls()
}

const closeModal = () => (showModal.value = false)

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

const availableUrls = ref<string[]>([])
const isLoadingUrls = ref(false)

const fetchAvailableUrls = async () => {
  try {
    isLoadingUrls.value = true
    const res = await api.get('/site/google-sites')
    availableUrls.value = res.data.data || []
  } finally {
    isLoadingUrls.value = false
  }
}

onMounted(() => {
  fetchSites()
  googleConfigStore.check()
  subscriptionStore.checkSubscription()
})
</script>

  
    <style scoped>
      .page-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f9f9f9;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0 0 6px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.btn-primary {
  padding: 8px 16px;
  background: #22c55e;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #16a34a;
}

.btn-secondary {
  padding: 8px 16px;
  background: #e8e8e8;
  color: #333;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.table-card {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sites-table {
  width: 100%;
  border-collapse: collapse;
}

.sites-table thead {
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
}

.sites-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sites-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #333;
}

/* Remove border from the last row */
.sites-table tbody tr:last-child td {
  border-bottom: none;
}

.site-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.site-icon {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: #e8f5e9;
  color: #22c55e;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #ef4444;
}

.action-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #22c55e;
  border-color: #22c55e;
  color: #ffffff;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}

/* Modal — shell from theme.css; header/footer local */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid #e8e8e8;
  background: #f9f9f9;
}

form {
  padding: 16px 18px;
}

.form-group {
  margin-bottom: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
  font-size: 13px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* Toggle Switch Styles */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-input {
  display: none;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: #e8e8e8;
  border-radius: 12px;
  transition: background 0.3s;
  display: block;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 10px;
  top: 2px;
  left: 2px;
  transition: left 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-label .toggle-switch {
  background: #22c55e;
}

.toggle-input:checked + .toggle-label .toggle-switch::after {
  left: 22px;
}

.toggle-text {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

@media (max-width: 768px) {
  .page-container {
    padding: 14px;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .sites-table {
    font-size: 13px;
  }

  .sites-table th,
  .sites-table td {
    padding: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-box.modal-box--lg {
    width: 95%;
    max-height: 95vh;
  }
}

    </style>
  
 
  
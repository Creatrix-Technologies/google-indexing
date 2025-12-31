<template>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Site Management</h1>
          <p class="subtitle">Manage and configure your sites</p>
        </div>
        <button class="btn-primary" @click="openAddModal">+ Add Site</button>
      </div>
  
      <!-- Site List Table -->
      <div class="table-card">
        <table class="sites-table">
          <thead>
            <tr>
              <th>Site Name</th>
              <th>URL</th>
              <th>Type</th>
              <th>Status</th>
              <th>Indexable</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="site in sites" :key="site.id">
              <td class="site-name-cell">
                <div class="site-icon">{{ site.name.charAt(0).toUpperCase() }}</div>
                <span>{{ site.name }}</span>
              </td>
              <td>{{ site.url }}</td>
              <td>{{ site.type }}</td>
              <td>
                <span class="status-badge" :class="site.activeStatus.toLowerCase()">{{ site.activeStatus === 'Active' ? 'Active' : 'Inactive' }}</span>
              </td>
              <td>{{ site.isIndexable }}</td>
              <td>{{ formatDate(site.created) }}</td>
              <td class="action-cell">
                <button class="action-btn" @click="editSite(site)">Edit</button>
                <!-- <button class="action-btn delete" @click="toggleSiteStatus(site.id)">{{ site.activeStatus === 'Active' ? 'Deactivate' : 'Activate' }}</button> -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Add/Edit Site Modal -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ isEditing ? 'Edit Site' : 'Add New Site' }}</h2>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>
  
          <form @submit.prevent="saveSite">
            <div class="form-group">
              <label>Site Name *</label>
              <input v-model="formData.name" type="text" placeholder="Enter site name" required />
            </div>
  
            <div class="form-group">
              <label>Full URL *</label>
              <input v-model="formData.url" type="url" placeholder="e.g., https://example.com" required />
            </div>
  
            <div class="form-row">
              <div class="form-group">
                <label>Site Type *</label>
                <select v-model="formData.type" required>
                  <option value="">Select Type</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Blog">Blog</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Corporate">Corporate</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <!-- Replaced status dropdown with toggle switch for Active/Inactive -->
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
                    <span class="toggle-text">{{ formData.activeStatus === 'Active' ? 'Active' : 'Inactive' }}</span>
                  </label>
                </div>
              </div>
            </div>
  
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="formData.description" placeholder="Enter site description" rows="4"></textarea>
            </div>
  
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary">{{ isEditing ? 'Update Site' : 'Add Site' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  

  <script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import api from '../api' // your axios instance with token/refresh
    import { useToast } from 'vue-toastification';
    const toast = useToast();

    interface Site {
      id: number
      name: string
      url: string
      type: string
      activeStatus: 'Active' | 'Inactive'
      description: string
      created: Date,
      isIndexable:'Yes' | 'No'
    }
    
    interface FormData {
      name: string
      url: string
      type: string
      activeStatus: 'Active' | 'Inactive'
      description: string
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
      description: ''
    })
    
    /* ============================
       GET SITES
    ============================ */
    const fetchSites = async () => {
  try {
    const res = await api.get('/site?PageNo=1&PageSize=10')
    const items = res.data?.data || []

    sites.value = items.map((item: any) => ({
      id: item.webSiteId,
      name: item.siteName,
      url: item.url,
      type: item.siteType,
      activeStatus: item.activeStatus ? 'Active' : 'Inactive', // fix here
      description: item.description || '',
      created: new Date(item.createdDate ?? new Date()),
      isIndexable: item.isIndexable ? 'Yes' : 'No',
    }))
  } catch (err) {
    console.error('Failed to load sites', err)
  }
}

    
    /* ============================
       ADD / UPDATE SITE
    ============================ */
    const saveSite = async () => {
      const payload = {
        siteName: formData.value.name,
        url: formData.value.url,
        siteType: formData.value.type,
        description: formData.value.description,
        isActivated: formData.value.activeStatus === 'Active',
        webSiteId: editingId.value,
      }
    
      try {
        await api.post('/site', payload)
        await fetchSites()
        closeModal()
        toast.success('Site updated successfully!');
      } catch (err) {
        toast.error('Failed to save site!');
      }
    }
    
    /* ============================
       UI HELPERS
    ============================ */
    const openAddModal = () => {
      isEditing.value = false
      editingId.value = null
      formData.value = {
        name: '',
        url: '',
        type: '',
        activeStatus: 'Active',
        description: '',
      }
      showModal.value = true
    }
    
    const editSite = (site: Site) => {
      isEditing.value = true
      editingId.value = site.id
      formData.value = {
        name: site.name,
        url: site.url,
        type: site.type,
        activeStatus: site.activeStatus,
        description: site.description,
      }
      showModal.value = true
    }

    
    
    // const toggleSiteStatus = async (id: number) => {
    //   const site = sites.value.find((s) => s.id === id)
    //   if (!site) return
    
    //   site.activeStatus = site.activeStatus === 'Active' ? 'Inactive' : 'Active'
    
    //   try {
    //     await api.post('/site', {
    //       siteName: site.name,
    //       url: site.url,
    //       siteType: site.type,
    //       description: site.description,
    //       isActivated: site.activeStatus === 'Active',
    //       webSiteId: site.id,
    //     })
    //   } catch (err) {
    //     console.error(err)
    //   }
    // }
    
    const closeModal = () => {
      showModal.value = false
    }
    
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
    
    onMounted(fetchSites)
    </script>
    
  
    <style scoped>
      .page-container {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: #f9f9f9;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.btn-primary {
  padding: 10px 20px;
  background: #22c55e;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #16a34a;
}

.btn-secondary {
  padding: 10px 20px;
  background: #e8e8e8;
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.table-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  padding: 15px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sites-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
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
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
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
  gap: 10px;
  padding: 20px 25px;
  border-top: 1px solid #e8e8e8;
  background: #f9f9f9;
}

form {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 14px;
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
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

@media (max-width: 768px) {
  .page-container {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
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

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
}

    </style>
  
 
  
<template>
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Users Management</h1>
          <p class="subtitle">Manage your application users</p>
        </div>
      </div>
  
      <!-- User List Table -->
      <div class="table-card">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Total Sites</th>
              <th>Sites</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.userId">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
  
              <!-- Role Dropdown -->
              <td>
                <select v-model="user.role" @change="updateUserRole(user)">
                  <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                </select>
              </td>
  
              <!-- Status Toggle -->
              <td>
                <label class="switch">
                  <input type="checkbox" v-model="user.isActive" @change="updateUserStatus(user)" />
                  <span class="slider"></span>
                </label>
              </td>

              <td>{{ user.siteCount }}</td>
  
              <!-- Sites Accordion -->
              <td>
                <div v-if="user.sites.length">
                  <button class="accordion-btn" @click="toggle(user.userId)">
                    {{ isExpanded(user.userId) ? 'Hide Sites ▲' : 'View Sites ▼' }}
                  </button>
                  <div v-show="isExpanded(user.userId)" class="accordion-content">
                    <div v-for="site in user.sites" :key="site.url" class="site-item">
                      <strong>{{ site.siteName }}</strong> ({{ site.siteType }})
                      <a :href="site.url" target="_blank" class="site-link">Visit</a>
                    </div>
                  </div>
                </div>
                <span v-else class="no-sites">No Sites</span>
              </td>
            </tr>
  
            <tr v-if="users.length === 0">
              <td colspan="5" style="text-align:center; padding:20px">
                No users found
              </td>
            </tr>
          </tbody>
        </table>
  
        <!-- Pagination -->
        <div class="pagination" v-if="pageInfo.totalCount > pageInfo.pageSize">
          <button class="pagination-btn" :disabled="!pageInfo.hasPreviousPage" @click="previousPage">
            Previous
          </button>
  
          <div class="pagination-info">
            Page {{ pageInfo.page }} of {{ totalPages }}
          </div>
  
          <button class="pagination-btn" :disabled="!pageInfo.hasNextPage" @click="nextPage">
            Next
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import api from '../api'
  import { useToast } from 'vue-toastification'
  
  const toast = useToast()
  
  interface Site {
    url: string
    siteName: string
    siteType: string
  }
  
  interface User {
    userId: string
    name: string
    email: string
    role: string
    isActive: boolean,
    siteCount: number,
    sites: Site[]
  }
  
  interface PageInfo {
    page: number
    pageSize: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  
  const users = ref<User[]>([])
  const roles = ref<string[]>([])
  
  const pageInfo = ref<PageInfo>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  
  // Accordion state
  const expandedUsers = ref<Set<string>>(new Set())
  const isExpanded = (userId: string) => expandedUsers.value.has(userId)
  const toggle = (userId: string) => {
    if (expandedUsers.value.has(userId)) expandedUsers.value.delete(userId)
    else expandedUsers.value.add(userId)
  }
  
  // Computed total pages
  const totalPages = computed(() => Math.ceil(pageInfo.value.totalCount / pageInfo.value.pageSize))
  
  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      const res = await api.get('/manage-users/list', { params: { page } })
      if (res.data?.isSuccess) {
        users.value = res.data.data || []
        pageInfo.value = res.data.pageInfo
      } else {
        toast.error('Failed to load users!')
      }
    } catch (err) {
      console.error('Error fetching users', err)
      toast.error('Error fetching users!')
    }
  }
  
  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles')
      if (res.data?.isSuccess) {
        roles.value = res.data.data || []
      } else {
        toast.error('Failed to load roles!')
      }
    } catch (err) {
      console.error('Error fetching roles', err)
      toast.error('Error fetching roles!')
    }
  }
  
  // Update user role
  const updateUserRole = async (user: User) => {
    try {
      const res = await api.post('/update-role', {
        userId: user.userId,
        role: user.role
      })
      if (res.data?.isSuccess) toast.success('Role updated successfully')
      else toast.error('Failed to update role')
    } catch (err) {
      console.error('Error updating role', err)
      toast.error('Error updating role')
    }
  }
  
  // Update user status
  const updateUserStatus = async (user: User) => {
    try {
      const res = await api.post('/update-status', {
        userId: user.userId,
        isActive: user.isActive
      })
      if (res.data?.isSuccess) toast.success('Status updated successfully')
      else {
        toast.error('Failed to update status')
        user.isActive = !user.isActive
      }
    } catch (err) {
      console.error('Error updating status', err)
      toast.error('Error updating status')
      user.isActive = !user.isActive
    }
  }
  
  // Pagination handlers
  const nextPage = () => {
    if (pageInfo.value.hasNextPage) pageInfo.value.page++
  }
  const previousPage = () => {
    if (pageInfo.value.hasPreviousPage) pageInfo.value.page--
  }
  
  onMounted(() => {
    fetchUsers()
    fetchRoles()
  })
  
  // Refetch when page changes
  watch(() => pageInfo.value.page, fetchUsers)
  </script>
  
  <style scoped>
  .page-container {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
    background: #f9f9f9;
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
  }
  
  .table-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e8e8e8;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    margin-bottom: 20px;
  }
  
  .users-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .users-table th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
    color: #666;
    background: #f5f5f5;
    text-transform: uppercase;
  }
  
  .users-table td {
    padding: 15px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #333;
    vertical-align: top;
  }
  
  /* Status Toggle Switch */
  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }
  
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 20px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #22c55e;
  }
  
  input:checked + .slider:before {
    transform: translateX(20px);
  }
  
  /* Role Dropdown */
  .users-table select {
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    font-size: 13px;
    color: #333;
    background-color: #fff;
    cursor: pointer;
    transition: border 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding-right: 25px;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666' stroke-width='1.5'/%3E%3C/svg%3E%0A");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 10px 6px;
  }
  
  .users-table select:hover {
    border-color: #3b82f6;
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.3);
  }
  
  .users-table select:focus {
    outline: none;
    border-color: #22c55e;
    box-shadow: 0 0 4px rgba(34, 197, 94, 0.4);
  }
  
  /* Accordion */
  .accordion-btn {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }
  
  .accordion-content {
    padding: 8px 0;
    margin-top: 5px;
    border-left: 2px solid #3b82f6;
    padding-left: 10px;
  }
  
  .site-item {
    margin-bottom: 5px;
    font-size: 13px;
  }
  
  .site-link {
    margin-left: 5px;
    color: #2563eb;
    text-decoration: underline;
  }
  
  .no-sites {
    color: #999;
    font-style: italic;
  }
  
  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #f9f9f9;
    border-top: 1px solid #e8e8e8;
  }
  
  .pagination-btn {
    padding: 8px 16px;
    background: #f5f5f5;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .pagination-btn:hover:not(:disabled) {
    background: #22c55e;
    border-color: #22c55e;
    color: #ffffff;
  }
  
  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination-info {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
  </style>
  
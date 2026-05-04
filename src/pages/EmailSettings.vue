<template>
    <SettingsLayout>
      <div class="page-content">
        <div class="grid">

          <div class="card">
            <h3>Current configuration</h3>
            <p v-if="form.fromEmail" class="muted">
              Outgoing sender: {{ form.fromName }} &lt;{{ form.fromEmail }}&gt; via {{ form.smtpServer }}:{{ form.port }}
            </p>
            <p class="muted" v-else>Load settings to preview.</p>
            <div v-if="passwordIsSet" class="status-box success">
              SMTP password stored. Leave blank on save to keep it.
            </div>
          </div>

          <div class="card">
            <h3>SMTP settings</h3>

            <div class="form-group">
              <label>From display name</label>
              <input v-model="form.fromName" type="text" autocomplete="off" />
            </div>
            <div class="form-group">
              <label>From email</label>
              <input v-model="form.fromEmail" type="email" autocomplete="off" />
            </div>
            <div class="form-group">
              <label>SMTP host</label>
              <input v-model="form.smtpServer" type="text" autocomplete="off" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Port</label>
                <input v-model.number="form.port" type="number" min="1" max="65535" />
              </div>
            </div>
            <div class="form-group">
              <label>Username</label>
              <input v-model="form.username" type="text" autocomplete="off" />
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="password-wrapper">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Leave empty to keep unchanged"
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <button class="btn primary full" @click="save" :disabled="loading">
              Save SMTP settings
            </button>
          </div>

          <div class="card">
            <h3>Send test email</h3>
            <p class="muted">
              Uses the SMTP fields above. If password is blank, your saved password from the database (or appsettings) is used.
            </p>
            <div class="form-group">
              <label>Recipient email</label>
              <input v-model="testToEmail" type="email" autocomplete="off" placeholder="you@example.com" />
            </div>
            <button type="button" class="btn secondary full" @click="sendTest" :disabled="loading || testSending">
              {{ testSending ? 'Sending…' : 'Send test email' }}
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

  const toast = useToast()
  const loading = ref(false)
  const testSending = ref(false)
  const testToEmail = ref('')
  const passwordIsSet = ref(false)
  const showPassword = ref(false)

  const form = reactive({
    fromName: '',
    fromEmail: '',
    smtpServer: '',
    port: 587,
    username: '',
    password: ''
  })

  const load = async () => {
    loading.value = true
    try {
      const res = await api.get('/settings/get-email-settings')
      const data = res.data?.data || res.data
      if (!data) return
      form.fromName = data.fromName ?? ''
      form.fromEmail = data.fromEmail ?? ''
      form.smtpServer = data.smtpServer ?? ''
      form.port = typeof data.port === 'number' && data.port > 0 ? data.port : 587
      form.username = data.username ?? ''
      form.password = ''
      passwordIsSet.value = !!data.passwordIsSet
    } catch {
      toast.error('Failed to load email settings')
    } finally {
      loading.value = false
    }
  }

  const save = async () => {
    loading.value = true
    try {
      await api.post('/settings/update-email-settings', {
        fromName: form.fromName,
        fromEmail: form.fromEmail,
        smtpServer: form.smtpServer,
        port: form.port || 587,
        username: form.username,
        password: form.password
      })
      toast.success('Email settings saved')
      form.password = ''
      await load()
    } catch {
      toast.error('Failed to save email settings')
    } finally {
      loading.value = false
    }
  }

  const sendTest = async () => {
    if (!testToEmail.value?.trim()) {
      toast.error('Enter a recipient email')
      return
    }
    testSending.value = true
    try {
      const res = await api.post('/settings/send-test-email', {
        toEmail: testToEmail.value.trim(),
        fromName: form.fromName,
        fromEmail: form.fromEmail,
        smtpServer: form.smtpServer,
        port: form.port || 587,
        username: form.username,
        password: form.password ?? ''
      })
      const payload = res.data?.data ?? res.data
      if (res.data?.isSuccess === false || payload?.isSuccess === false) {
        const desc = res.data?.error?.description ?? payload?.error?.description ?? 'Test send failed'
        toast.error(desc)
        return
      }
      toast.success('Test email sent. Check the inbox.')
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { error?: { description?: string } } } }
      toast.error(ax.response?.data?.error?.description ?? 'Failed to send test email')
    } finally {
      testSending.value = false
    }
  }

  onMounted(() => load())
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

.muted {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-3) 0;
  line-height: 1.5;
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

.form-row {
  display: flex;
  gap: var(--space-3);
}

.form-row .form-group {
  flex: 1;
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
.btn.secondary {
  background: var(--color-surface-2);
  color: var(--color-text);
  border-color: var(--color-border-strong);
}
.btn.secondary:hover:not(:disabled) {
  background: var(--neutral-100);
}
.btn.secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
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

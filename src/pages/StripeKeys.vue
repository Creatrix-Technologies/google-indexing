<template>
    <SettingsLayout>
      <div class="page-content">
        <div class="grid">

          <!-- Current Status & Mode Toggle -->
          <div class="card">
            <h3>Current Configuration</h3>

            <!-- Mode Toggle -->
            <div class="mode-toggle-section">
              <label class="mode-label">Active Mode</label>
              <div class="mode-toggle">
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ active: activeMode === 'Sandbox' }"
                  @click="toggleMode('Sandbox')"
                  :disabled="togglingMode"
                >
                  <span class="mode-badge sandbox">Sandbox</span>
                  <span class="mode-desc">Test payments</span>
                </button>
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ active: activeMode === 'Live' }"
                  @click="toggleMode('Live')"
                  :disabled="togglingMode || !canSwitchToLive"
                >
                  <span class="mode-badge live">Live</span>
                  <span class="mode-desc">Real payments</span>
                </button>
              </div>
              <p v-if="!canSwitchToLive && activeMode === 'Sandbox'" class="mode-hint warning">
                Configure Live keys below to enable Live mode
              </p>
            </div>

            <div v-if="activeKeys.secretKey" class="status-box success">
              <div>
                <strong>Active Secret Key:</strong>
                <div class="mono">{{ activeKeys.secretKey }}</div>
              </div>
            </div>

            <div v-if="activeKeys.publishableKey" class="status-box success" style="margin-top: var(--space-3)">
              <div>
                <strong>Active Publishable Key:</strong>
                <div class="mono">{{ activeKeys.publishableKey }}</div>
              </div>
            </div>

            <div v-else class="status-box warning">
              No active Stripe keys configured for {{ activeMode }} mode
            </div>
          </div>

          <!-- Form -->
          <div class="card">
            <div class="key-mode-tabs">
              <button
                type="button"
                class="key-tab"
                :class="{ active: editingMode === 'Sandbox' }"
                @click="editingMode = 'Sandbox'"
              >
                Sandbox Keys
              </button>
              <button
                type="button"
                class="key-tab"
                :class="{ active: editingMode === 'Live' }"
                @click="editingMode = 'Live'"
              >
                Live Keys
              </button>
            </div>

            <div class="tab-content">
              <p class="field-hint mode-info">
                Editing <strong>{{ editingMode }}</strong> keys. These will be used when {{ editingMode }} mode is active.
              </p>

              <div class="form-group">
                <label>Publishable key</label>
                <p class="field-hint">
                  From Stripe Dashboard → Developers → API keys. Must be the <code>pk_test_</code> / <code>pk_live_</code> pair for the same account as the secret.
                </p>
                <input
                  v-model="editingKeys.publishableKey"
                  type="text"
                  :placeholder="editingMode === 'Sandbox' ? 'pk_test_...' : 'pk_live_...'"
                  autocomplete="off"
                />
              </div>

              <div class="form-group">
                <label>Secret Key</label>
                <div class="password-wrapper">
                  <input
                    v-model="editingKeys.secretKey"
                    :type="showSecretKey ? 'text' : 'password'"
                    :placeholder="editingMode === 'Sandbox' ? 'sk_test_...' : 'sk_live_...'"
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
                    v-model="editingKeys.webHookSecret"
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

              <div class="form-actions">
                <button
                  class="btn primary full"
                  @click="updateKeys"
                  :disabled="loading"
                >
                  Save {{ editingMode }} Keys
                </button>
                <label class="activate-checkbox">
                  <input
                    type="checkbox"
                    v-model="activateAfterSave"
                  />
                  Switch to {{ editingMode }} mode after saving
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </SettingsLayout>
  </template>
  
  <script setup lang="ts">
  import { reactive, ref, onMounted, computed } from 'vue'
  import api from '../api'
  import { useToast } from 'vue-toastification'
  import SettingsLayout from '../components/SettingsLayout.vue'

  const showSecretKey = ref(false)
  const showWebhookSecret = ref(false)
  const toast = useToast()
  const loading = ref(false)
  const togglingMode = ref(false)
  const activateAfterSave = ref(false)

  // Current active mode (displayed in status panel)
  const activeMode = ref('Sandbox')

  // Which mode we're currently editing
  const editingMode = ref('Sandbox')

  // Keys for each mode
  const sandboxKeys = reactive({
    publishableKey: '',
    secretKey: '',
    webHookSecret: ''
  })

  const liveKeys = reactive({
    publishableKey: '',
    secretKey: '',
    webHookSecret: ''
  })

  // Computed property for currently editing keys
  const editingKeys = computed({
    get: () => editingMode.value === 'Sandbox' ? sandboxKeys : liveKeys,
    set: (val) => {
      if (editingMode.value === 'Sandbox') {
        Object.assign(sandboxKeys, val)
      } else {
        Object.assign(liveKeys, val)
      }
    }
  })

  // Computed property for active keys (based on activeMode)
  const activeKeys = computed(() => {
    return activeMode.value === 'Sandbox' ? sandboxKeys : liveKeys
  })

  // Can we switch to live mode?
  const canSwitchToLive = computed(() => {
    return !!liveKeys.secretKey
  })

  /* GET Stripe Keys */
  const fetchKeys = async () => {
    loading.value = true
    try {
      const res = await api.get('/settings/get-stripe-keys')
      const data = res.data?.data || res.data

      if (data) {
        // Use activeModeName (string: "Live" or "Sandbox") if available, fallback to activeMode
        activeMode.value = data.activeModeName || data.activeMode?.toString() || 'Sandbox'

        // Populate Sandbox keys
        if (data.sandbox) {
          sandboxKeys.publishableKey = data.sandbox.publishableKey || ''
          sandboxKeys.secretKey = data.sandbox.secretKey || ''
          sandboxKeys.webHookSecret = data.sandbox.webHookSecret || ''
        }

        // Populate Live keys
        if (data.live) {
          liveKeys.publishableKey = data.live.publishableKey || ''
          liveKeys.secretKey = data.live.secretKey || ''
          liveKeys.webHookSecret = data.live.webHookSecret || ''
        }

        // Fallback: if only legacy keys exist, populate current editing mode
        if (!data.sandbox && !data.live && data.activeKeys) {
          editingKeys.value = {
            publishableKey: data.activeKeys.publishableKey || '',
            secretKey: data.activeKeys.secretKey || '',
            webHookSecret: data.activeKeys.webHookSecret || ''
          }
        }
      }
    } catch {
      toast.error('Failed to load Stripe configuration')
    } finally {
      loading.value = false
    }
  }

  /* TOGGLE Stripe Mode */
  const toggleMode = async (mode: string) => {
    if (mode === activeMode.value) return

    togglingMode.value = true
    try {
      // 0 = Live, 1 = Sandbox (matches C# enum values)
      const modeValue = mode === 'Live' ? 0 : 1
      await api.post('/settings/toggle-stripe-mode', {
        mode: modeValue
      })

      activeMode.value = mode
      editingMode.value = mode  // Switch editing to the new mode too
      toast.success(`Switched to ${mode} mode`)

      // Reload to get fresh active keys
      await fetchKeys()
    } catch (err: any) {
      const msg = err.response?.data?.error?.description || `Failed to switch to ${mode} mode`
      toast.error(msg)
    } finally {
      togglingMode.value = false
    }
  }

  /* UPDATE Stripe Keys */
  const updateKeys = async () => {
    loading.value = true

    try {
      await api.post('/settings/update-stripe-keys', {
        mode: editingMode.value === 'Live' ? 0 : 1,  // 0 = Live, 1 = Sandbox
        keys: {
          publishableKey: editingKeys.value.publishableKey,
          secretKey: editingKeys.value.secretKey,
          webHookSecret: editingKeys.value.webHookSecret
        },
        activateThisMode: activateAfterSave.value
      })

      toast.success(`${editingMode.value} keys saved successfully`)

      // If we activated this mode, update the active mode
      if (activateAfterSave.value) {
        activeMode.value = editingMode.value
        activateAfterSave.value = false  // Reset checkbox
      }

      // Reload to get updated keys
      await fetchKeys()
    } catch {
      toast.error(`Failed to update ${editingMode.value} keys`)
    } finally {
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
.field-hint {
  margin: 0 0 8px 0;
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  line-height: 1.45;
}
.field-hint code {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--neutral-100);
  padding: 1px 5px;
  border-radius: 4px;
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

/* Mode Toggle Styles */
.mode-toggle-section {
  margin-bottom: var(--space-4);
}

.mode-label {
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
  display: block;
}

.mode-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  cursor: pointer;
  transition: all 140ms ease;
}

.mode-btn:hover:not(:disabled) {
  border-color: var(--color-border-strong);
  background: var(--neutral-50);
}

.mode-btn.active {
  border-color: var(--color-accent);
  background: rgba(99, 102, 241, 0.08);
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-badge {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semi);
  padding: 2px 10px;
  border-radius: var(--radius-pill);
}

.mode-badge.sandbox {
  background: var(--warning-100);
  color: var(--warning-700);
}

.mode-badge.live {
  background: var(--success-100);
  color: var(--success-700);
}

.mode-desc {
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
}

.mode-hint {
  margin: 8px 0 0 0;
  font-size: var(--fs-xs);
}

.mode-hint.warning {
  color: var(--warning-600);
}

/* Key Mode Tabs */
.key-mode-tabs {
  display: flex;
  gap: 0;
  margin: calc(-1 * var(--space-5)) calc(-1 * var(--space-5)) var(--space-4);
  padding: 0;
  border-bottom: 1px solid var(--color-border);
}

.key-tab {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 140ms ease;
}

.key-tab:hover {
  color: var(--color-text);
  background: var(--neutral-50);
}

.key-tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  font-weight: var(--fw-semi);
}

.tab-content {
  padding-top: var(--space-2);
}

.mode-info {
  background: var(--info-50);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--info-100);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: var(--space-4);
}

.activate-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.activate-checkbox input {
  accent-color: var(--color-accent);
}

.status-box.warning {
  background: var(--warning-50);
  border-color: var(--warning-100);
  color: var(--warning-700);
}

  </style>
<template>
  <section class="setup-checklist" aria-label="Setup progress">
    <div class="setup-checklist__head">
      <h3 class="setup-checklist__title">Getting started</h3>
      <span class="setup-checklist__count">{{ doneCount }} of {{ steps.length }} done</span>
    </div>
    <ol class="setup-checklist__list">
      <li v-for="step in steps" :key="step.key" class="setup-checklist__item" :class="{ 'is-done': step.done }">
        <span class="setup-checklist__mark" aria-hidden="true">{{ step.done ? '✓' : '' }}</span>
        <div class="setup-checklist__body">
          <span class="setup-checklist__label">{{ step.label }}</span>
          <span v-if="!step.done && step.hint" class="setup-checklist__hint">{{ step.hint }}</span>
        </div>
        <router-link v-if="!step.done && step.to" :to="step.to" class="setup-checklist__link">{{ step.cta }}</router-link>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../api'
import { useEntitlementsStore } from '../Shared/entitlements'
import { useGoogleConfigStore } from '../Shared/googleConfig'

/**
 * Live first-run checklist: account → key uploaded → Owner verified → site synced → first URL submitted.
 * Each tick is derived from real state, not from a stored flag.
 */
const entitlements = useEntitlementsStore()
const googleConfig = useGoogleConfigStore()

const ownerVerified = ref<boolean | null>(null)
const publishUsed = ref(0)

onMounted(async () => {
  void entitlements.refresh()
  try {
    const v = await api.post('/google-config/verify')
    const props = (v.data?.data?.properties ?? []) as Array<{ isOwner: boolean }>
    ownerVerified.value = props.some(p => p.isOwner)
  } catch {
    ownerVerified.value = false
  }
  try {
    const q = await api.get('/crawl/quota')
    publishUsed.value = Number(q.data?.data?.publishUsed ?? 0)
  } catch { /* quota is optional here */ }
})

const steps = computed(() => [
  { key: 'account', label: 'Create your account', done: true, hint: '', to: '', cta: '' },
  { key: 'key', label: 'Upload your Google service account key', done: googleConfig.hasCredentials,
    hint: 'A JSON key from Google Cloud with the Indexing API enabled.', to: '/settings/google-configuration', cta: 'Upload key' },
  { key: 'owner', label: 'Make the service account an Owner in Search Console', done: ownerVerified.value === true,
    hint: 'Settings → Users and permissions → add the service account email as Owner (Full access is not enough).', to: '/settings/google-configuration', cta: 'Verify' },
  { key: 'site', label: 'Sync or add a site', done: entitlements.data.sitesUsed > 0,
    hint: 'Your Search Console properties appear automatically once the key is verified.', to: '/sites', cta: 'Open sites' },
  { key: 'submit', label: 'Submit your first URL to Google', done: publishUsed.value > 0 || entitlements.data.urlsSubmittedThisMonth > 0 || entitlements.data.trialUrlsUsed > 0,
    hint: 'Crawl a site, pick URLs and click Index now, or let the daily schedule send them.', to: '/crawl-index-management', cta: 'Crawl & index' },
])

const doneCount = computed(() => steps.value.filter(s => s.done).length)
</script>

<style scoped>
.setup-checklist { border: 1px solid var(--color-border, #e2e8f0); border-radius: 12px; padding: 16px 18px; background: var(--color-surface, #fff); margin-bottom: 20px; }
.setup-checklist__head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.setup-checklist__title { margin: 0; font-size: 15px; font-weight: 700; }
.setup-checklist__count { font-size: 12px; color: #64748b; }
.setup-checklist__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.setup-checklist__item { display: grid; grid-template-columns: 22px 1fr auto; gap: 10px; align-items: start; }
.setup-checklist__mark { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #cbd5e1; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; }
.is-done .setup-checklist__mark { background: #16a34a; border-color: #16a34a; }
.setup-checklist__body { display: flex; flex-direction: column; gap: 2px; }
.setup-checklist__label { font-size: 14px; }
.is-done .setup-checklist__label { color: #64748b; text-decoration: line-through; }
.setup-checklist__hint { font-size: 12px; color: #64748b; }
.setup-checklist__link { font-size: 12px; font-weight: 600; color: #2563eb; white-space: nowrap; }
@media (max-width: 640px) { .setup-checklist__item { grid-template-columns: 22px 1fr; } .setup-checklist__link { grid-column: 2; } }
</style>

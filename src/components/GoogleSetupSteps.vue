<template>
  <div class="og-stepper">
    <div
      v-for="(step, idx) in setupSteps"
      :key="step.n"
      class="og-step"
      :class="{ 'og-step--final': step.isFinal }"
    >
      <div class="og-step__gutter">
        <div class="og-step__badge">
          <svg v-if="step.isFinal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="12" height="12">
            <polyline points="2 7 5.5 10.5 12 4"/>
          </svg>
          <span v-else>{{ step.n }}</span>
        </div>
        <div v-if="idx < setupSteps.length - 1" class="og-step__connector"></div>
      </div>

      <div class="og-step__content">
        <button
          class="og-step__toggle"
          :aria-expanded="isExpanded(step.n)"
          @click="toggleStep(step.n)"
        >
          <span class="og-step__title">{{ step.title }}</span>
          <span class="og-step__toggle-right">
            <a
              v-if="step.link"
              :href="step.link"
              target="_blank"
              rel="noopener noreferrer"
              class="og-ext-link"
              @click.stop
            >
              {{ step.linkLabel }}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="10" height="10">
                <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7"/>
                <polyline points="8 1 11 1 11 4"/><line x1="6" y1="6" x2="11" y2="1"/>
              </svg>
            </a>
            <svg
              class="og-chevron"
              :class="{ 'og-chevron--open': isExpanded(step.n) }"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="12" height="12"
            >
              <polyline points="2 4 6 8 10 4"/>
            </svg>
          </span>
        </button>

        <Transition name="step-expand">
          <div v-if="isExpanded(step.n)" class="og-step__body">
            <p class="og-step__desc">{{ step.desc }}</p>

            <ol v-if="step.instructions" class="og-step__list">
              <li v-for="(inst, i) in step.instructions" :key="i" v-html="inst"></li>
            </ol>

            <div v-if="step.tip" class="og-step__tip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13">
                <circle cx="7" cy="7" r="6"/><line x1="7" y1="5" x2="7" y2="7"/><circle cx="7" cy="9.5" r=".5" fill="currentColor"/>
              </svg>
              <span v-html="step.tip"></span>
            </div>

            <router-link
              v-if="step.cta && !props.hideFinalCta"
              to="/settings/google-configuration"
              class="og-final-cta"
            >
              {{ step.cta }}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13">
                <line x1="3" y1="8" x2="13" y2="8"/><polyline points="8 3 13 8 8 13"/>
              </svg>
            </router-link>
            <a
              v-if="step.cta && props.hideFinalCta"
              href="#upload-section"
              class="og-final-cta"
            >
              Jump to upload form
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="13" height="13">
                <line x1="8" y1="13" x2="8" y2="3"/><polyline points="3 8 8 3 13 8"/>
              </svg>
            </a>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SetupStep {
  n: number
  title: string
  desc: string
  link?: string
  linkLabel?: string
  instructions?: string[]
  tip?: string
  cta?: string
  isFinal?: boolean
}

const setupSteps: SetupStep[] = [
  {
    n: 1,
    title: 'Create a Google Cloud Project',
    desc: 'A Google Cloud project is the container for your APIs and service account credentials.',
    link: 'https://console.cloud.google.com/projectcreate',
    linkLabel: 'Open Cloud Console',
    instructions: [
      'Sign in to <a href="https://console.cloud.google.com" target="_blank" rel="noopener">console.cloud.google.com</a>.',
      'Click the <strong>project selector</strong> dropdown in the top navigation bar.',
      'Select <strong>New Project</strong>, enter a name (e.g. <code>url-indexing</code>), and click <strong>Create</strong>.'
    ]
  },
  {
    n: 2,
    title: 'Enable Required APIs',
    desc: 'Two APIs are needed: the Indexing API for submitting URLs, and the Search Console API for reading site data.',
    link: 'https://console.cloud.google.com/apis/library',
    linkLabel: 'Open API Library',
    instructions: [
      'In your project, go to <strong>APIs &amp; Services → Library</strong>.',
      'Search for <strong>Web Search Indexing API</strong> → open it → click <strong>Enable</strong>.',
      'Search for <strong>Google Search Console API</strong> → open it → click <strong>Enable</strong>.'
    ]
  },
  {
    n: 3,
    title: 'Create a Service Account',
    desc: 'A service account is a server-side identity that lets this app call Google APIs on your behalf without user login.',
    link: 'https://console.cloud.google.com/iam-admin/serviceaccounts',
    linkLabel: 'Open IAM & Admin',
    instructions: [
      'Navigate to <strong>IAM &amp; Admin → Service Accounts</strong> in your project.',
      'Click <strong>+ Create Service Account</strong>.',
      'Enter a name (e.g. <code>indexing-service</code>) and a description, then click <strong>Create and Continue</strong>.',
      'Skip the optional role and user access steps — click <strong>Continue</strong> then <strong>Done</strong>.'
    ]
  },
  {
    n: 4,
    title: 'Download the JSON Key File',
    desc: 'Generate a JSON private key for the service account. This is the file you will upload to connect your Google account.',
    instructions: [
      'In the Service Accounts list, click the <strong>email address</strong> of the account you created.',
      'Select the <strong>Keys</strong> tab at the top of the page.',
      'Click <strong>Add Key → Create new key</strong>.',
      'Choose <strong>JSON</strong> as the key type and click <strong>Create</strong>.',
      'A <code>.json</code> file downloads automatically — store it securely.'
    ],
    tip: 'The JSON file contains a <code>"client_email"</code> field (e.g. <code>my-service@project.iam.gserviceaccount.com</code>). You will need this address in the next step.'
  },
  {
    n: 5,
    title: 'Add Service Account to Search Console',
    desc: 'Grant the service account Owner access to your Search Console property so the app can read and submit indexing data.',
    link: 'https://search.google.com/search-console',
    linkLabel: 'Open Search Console',
    instructions: [
      'Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener">search.google.com/search-console</a>.',
      'Select the property (website) you want to manage.',
      'Click <strong>Settings</strong> (gear icon) → <strong>Users and permissions</strong>.',
      'Click <strong>Add User</strong> and paste the <code>client_email</code> address from your JSON file.',
      'Set the permission level to <strong>Owner</strong> and click <strong>Add</strong>.'
    ]
  },
  {
    n: 6,
    title: 'Upload the JSON Key File',
    desc: 'Upload the JSON key file in Settings → Google Configuration. Your dashboard will start populating once the connection is verified.',
    isFinal: true,
    cta: 'Jump to upload form ↑'
  }
]

const props = withDefaults(
  defineProps<{ allExpanded?: boolean; hideFinalCta?: boolean }>(),
  { allExpanded: true, hideFinalCta: false }
)

const expandedSteps = ref<Record<number, boolean>>(
  Object.fromEntries(setupSteps.map(s => [s.n, props.allExpanded]))
)

const isExpanded = (n: number) => expandedSteps.value[n] ?? props.allExpanded

const toggleStep = (n: number) => {
  expandedSteps.value[n] = !expandedSteps.value[n]
}
</script>

<style scoped>
.og-stepper {
  display: flex;
  flex-direction: column;
}

.og-step {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 0 var(--space-4);
}

.og-step__gutter {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.og-step__badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--neutral-100);
  border: 1.5px solid var(--color-border);
  color: var(--neutral-600);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semi);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.og-step--final .og-step__badge {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.og-step__connector {
  width: 1px;
  flex: 1;
  min-height: 18px;
  background: var(--color-border);
  margin: 5px 0;
}

.og-step__content {
  padding-bottom: var(--space-6);
}

.og-step:last-child .og-step__content {
  padding-bottom: 0;
}

/* Toggle button */
.og-step__toggle {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  min-height: 28px;
  background: none;
  border: none;
  padding: 3px 4px 3px 0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  border-radius: var(--radius-sm);
  transition: background 120ms ease;
  margin-bottom: var(--space-1);
}
.og-step__toggle:hover {
  background: var(--neutral-50);
}
.og-step__toggle:focus-visible {
  outline: none;
  box-shadow: var(--ring-neutral);
}

.og-step__toggle-right {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
  padding-top: 3px;
}

.og-chevron {
  color: var(--color-muted);
  transition: transform 220ms ease, color 120ms ease;
  flex-shrink: 0;
}
.og-chevron--open { transform: rotate(180deg); }
.og-step__toggle:hover .og-chevron { color: var(--color-text-secondary); }

.og-step__title {
  font-size: var(--fs-md);
  font-weight: var(--fw-semi);
  color: var(--color-text);
  margin: 0;
  letter-spacing: var(--letter-tight);
  line-height: 1.3;
  padding-top: 3px;
}

.og-step--final .og-step__title { color: var(--color-accent); }

.og-ext-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-card-bg);
  color: var(--color-text-secondary);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  text-decoration: none;
  white-space: nowrap;
  transition: border-color 140ms, color 140ms, background 140ms;
}
.og-ext-link:hover {
  border-color: var(--neutral-400);
  color: var(--color-text);
  background: var(--neutral-50);
}

/* Step body + transition */
.og-step__body { padding-top: var(--space-2); }

.step-expand-enter-active { transition: opacity 200ms ease, transform 200ms ease; }
.step-expand-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.step-expand-enter-from,
.step-expand-leave-to    { opacity: 0; transform: translateY(-6px); }

.og-step__desc {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.og-step__list {
  margin: 0 0 var(--space-3);
  padding-left: 18px;
  font-size: var(--fs-sm);
  color: var(--color-text);
  line-height: 1.7;
}
.og-step__list li + li { margin-top: 5px; }
.og-step__list a { color: var(--color-accent); text-decoration: none; }
.og-step__list a:hover { text-decoration: underline; }

.og-step__list :deep(code),
.og-step__desc :deep(code),
.og-step__tip  :deep(code) {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--neutral-100);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 1px 5px;
  color: var(--neutral-700);
}

.og-step__tip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  background: var(--info-50);
  border: 1px solid var(--info-100);
  font-size: var(--fs-xs);
  color: var(--info-700);
  line-height: 1.55;
  margin-bottom: var(--space-3);
}
.og-step__tip svg { flex-shrink: 0; margin-top: 1px; color: var(--info-600); }

.og-final-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-3);
  padding: 9px 16px;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-accent-fg);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semi);
  text-decoration: none;
  transition: background 140ms ease;
  letter-spacing: -0.005em;
}
.og-final-cta:hover { background: var(--color-accent-hover); }

@media (max-width: 640px) {
  .og-step {
    grid-template-columns: 30px 1fr;
    gap: 0 var(--space-3);
  }
  .og-step__toggle {
    flex-direction: column;
    gap: var(--space-2);
    align-items: flex-start;
  }
  .og-step__toggle-right { padding-top: 0; }
}
</style>

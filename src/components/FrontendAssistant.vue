<template>
  <div class="assistant-root">
    <button
      v-if="!isOpen"
      class="assistant-fab"
      type="button"
      aria-label="Open assistant"
      @click="openAssistant"
    >
      ?
    </button>

    <section v-else class="assistant-panel" role="dialog" aria-label="Assistant">
      <header class="assistant-head">
        <div>
          <p class="assistant-title">Assistant</p>
          <p class="assistant-subtitle">{{ contextSummary }}</p>
        </div>
        <button class="assistant-close" type="button" aria-label="Close assistant" @click="isOpen = false">×</button>
      </header>

      <div class="assistant-quick">
        <button
          v-for="item in quickPrompts"
          :key="item"
          type="button"
          class="quick-chip"
          @click="submitQuestion(item)"
        >
          {{ item }}
        </button>
      </div>

      <div class="assistant-messages">
        <article v-for="msg in messages" :key="msg.id" class="message" :class="msg.role">
          <p>{{ msg.text }}</p>
        </article>
      </div>

      <form class="assistant-input-row" @submit.prevent="submitQuestion(inputValue)">
        <input
          v-model.trim="inputValue"
          type="text"
          placeholder="Ask about this page..."
        />
        <button type="submit" :disabled="!inputValue">Send</button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMenuStore } from "../Store/menu";
import { useSubscriptionStore } from "../Shared/subscription";
import { useGoogleConfigStore } from "../Shared/googleConfig";

type MsgRole = "user" | "assistant";
interface ChatMessage {
  id: number;
  role: MsgRole;
  text: string;
}

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const subscriptionStore = useSubscriptionStore();
const googleConfigStore = useGoogleConfigStore();

const isOpen = ref(false);
const inputValue = ref("");
const nextId = ref(1);
const storageKey = "frontend-assistant-history-v1";

const messages = ref<ChatMessage[]>(loadHistory());

const quickPrompts = computed(() => [
  "What can I do on this page?",
  "How do I start crawling?",
  "How do I connect Google?",
  "Why is indexing blocked?"
]);

const contextSummary = computed(() => {
  const title = pageTitle(route.path);
  return `${title} • ${route.path}`;
});

watch(
  messages,
  () => {
    localStorage.setItem(storageKey, JSON.stringify(messages.value.slice(-30)));
  },
  { deep: true }
);

function clearPersistedAssistantState() {
  messages.value = [];
  nextId.value = 1;
  inputValue.value = "";
  isOpen.value = false;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}

function handlePageShow(ev: PageTransitionEvent) {
  if (ev.persisted) {
    clearPersistedAssistantState();
  }
}

onMounted(() => {
  window.addEventListener("pageshow", handlePageShow);
});

onUnmounted(() => {
  window.removeEventListener("pageshow", handlePageShow);
});

function openAssistant() {
  isOpen.value = true;
  if (messages.value.length === 0) {
    pushAssistantMessage(
      `You are on ${contextSummary.value}. Ask for steps and I will use your current page context.`
    );
  }
}

function submitQuestion(raw: string) {
  const q = raw.trim();
  if (!q) return;
  inputValue.value = "";
  pushUserMessage(q);
  const reply = generateReply(q);
  pushAssistantMessage(reply);
}

function pushUserMessage(text: string) {
  messages.value.push({ id: nextId.value++, role: "user", text });
}

function pushAssistantMessage(text: string) {
  messages.value.push({ id: nextId.value++, role: "assistant", text });
}

function generateReply(question: string): string {
  const q = question.toLowerCase();
  const path = route.path.toLowerCase();
  const hasMenus = menuStore.menus.length > 0;

  if (q.includes("what can i do") || q.includes("this page")) {
    return pageHelp(path);
  }

  if (q.includes("crawl")) {
    if (!googleConfigStore.isValid) {
      return "Crawling requires Google setup first. Open Settings > Google configuration, connect Search Console, then return to Crawl pages.";
    }
    return "Go to Crawl Management, add or select a website, run crawl, review URLs in Crawl details, then send selected URLs to index.";
  }

  if (q.includes("connect google") || q.includes("google setup")) {
    router.push("/settings/google-configuration");
    return "Opened Google configuration. Complete credentials and connect Search Console. When valid, indexing and crawl flows unlock.";
  }

  if (q.includes("indexing blocked") || q.includes("blocked")) {
    if (!subscriptionStore.isValid) {
      return "Indexing is usually blocked without an active subscription or available trial quota. Check Subscription page and trial limits.";
    }
    if (!googleConfigStore.isValid) {
      return "Indexing is blocked because Google configuration is incomplete. Finish setup in Settings > Google configuration.";
    }
    return "If subscription and Google setup are valid, check page-level crawl details: robots, canonical mismatch, noindex, fetch state, and queue status.";
  }

  if (q.includes("menu")) {
    return hasMenus
      ? `Available menu areas: ${menuStore.menus.map((m) => cleanLabel(m.title)).slice(0, 8).join(", ")}.`
      : "Menu is still loading. Refresh or sign in again if it remains empty.";
  }

  return `Context: ${contextSummary.value}. I can help with navigation, crawl/index workflow, Google setup, and subscription gating.`;
}

function pageHelp(path: string): string {
  if (path.includes("crawl")) {
    return "This area manages website crawling and URL index status. Typical flow: crawl site -> inspect URL states -> submit/queue indexing.";
  }
  if (path.includes("subscription")) {
    return "This area manages plan, card, and billing history. You can subscribe, update payment method, or cancel.";
  }
  if (path.includes("google-configuration")) {
    return "This page links Search Console credentials. Complete this setup before crawl and index operations.";
  }
  if (path.includes("dashboard")) {
    return "Dashboard summarizes crawl/index health, usage, and account status. Use sidebar to drill into specific modules.";
  }
  if (path.includes("users")) {
    return "Users page manages roles, active status, and site assignments. Expand rows to inspect connected sites.";
  }
  return "Use sidebar to navigate modules. If something is blocked, check subscription state and Google configuration first.";
}

function pageTitle(path: string): string {
  if (path.includes("crawl")) return "Crawl";
  if (path.includes("subscription")) return "Subscription";
  if (path.includes("google-configuration")) return "Google Configuration";
  if (path.includes("dashboard")) return "Dashboard";
  if (path.includes("users")) return "Users";
  return "App";
}

function cleanLabel(v: string) {
  return (v || "").replace(/[^\w\s.-]/g, "").trim();
}

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-30);
  } catch {
    return [];
  }
}
</script>

<style scoped>
.assistant-root {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 1000;
}

.assistant-fab {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-accent);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.assistant-panel {
  width: min(360px, calc(100vw - 28px));
  height: min(560px, calc(100vh - 32px));
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.assistant-head {
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.assistant-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
}

.assistant-subtitle {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.assistant-close {
  border: 0;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.assistant-quick {
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-chip {
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface-2);
  color: var(--color-text);
  cursor: pointer;
}

.assistant-messages {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  max-width: 88%;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.45;
  border: 1px solid var(--color-border);
}

.message p { margin: 0; white-space: pre-wrap; }

.message.user {
  align-self: flex-end;
  background: var(--accent-50);
  border-color: var(--accent-200);
  color: var(--neutral-900);
}

.message.assistant {
  align-self: flex-start;
  background: var(--neutral-50);
  color: var(--color-text);
}

.assistant-input-row {
  border-top: 1px solid var(--color-divider);
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.assistant-input-row input {
  min-width: 0;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-card-bg);
  color: var(--color-text);
}

.assistant-input-row button {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-accent-fg);
  cursor: pointer;
  font-weight: 600;
}

.assistant-input-row button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .assistant-root {
    right: 10px;
    bottom: 10px;
  }
}
</style>

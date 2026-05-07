<template>
  <div class="sales-assistant-root">
    <button
      v-if="!isOpen"
      class="sales-fab"
      type="button"
      aria-label="Open product assistant"
      @click="openPanel"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 10h8M8 14h5" />
        <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 3v-6.5A8.5 8.5 0 1 1 21 12Z" />
      </svg>
    </button>

    <section v-else class="sales-panel" role="dialog" aria-label="Product assistant">
      <header class="sales-head">
        <div class="sales-head__main">
          <div class="sales-head__dot" aria-hidden="true"></div>
          <div>
            <p class="sales-title">GoogleIndexing.com</p>
            <p class="sales-subtitle">{{ contextLabel }}</p>
          </div>
        </div>
        <button class="sales-close" type="button" aria-label="Close assistant" @click="isOpen = false">×</button>
      </header>

      <div class="sales-chips">
        <button v-for="chip in chips" :key="chip" type="button" class="chip" @click="ask(chip)">
          {{ chip }}
        </button>
      </div>

      <div class="sales-thread" ref="threadEl">
        <article v-for="m in messages" :key="m.id" class="bubble" :class="m.role">
          <p v-if="m.text" class="bubble__text">{{ m.text }}</p>

          <ul v-if="m.bullets && m.bullets.length" class="bubble__list">
            <li v-for="(b, i) in m.bullets" :key="i">{{ b }}</li>
          </ul>

          <div v-if="m.actions && m.actions.length" class="bubble__actions">
            <button
              v-for="(a, ai) in m.actions"
              :key="`${m.id}-${ai}-${a.label}-${a.to ?? ''}-${a.href ?? ''}`"
              type="button"
              class="bubble-cta"
              :class="{ 'bubble-cta--primary': a.primary }"
              @click="runAction(a)"
            >
              {{ a.label }}
            </button>
          </div>
        </article>

        <article v-if="isThinking" class="bubble assistant">
          <p class="typing"><span></span><span></span><span></span></p>
        </article>
      </div>

      <form class="sales-input" @submit.prevent="ask(input)">
        <input v-model.trim="input" type="text" placeholder="Ask about plans, ROI, setup, security..." />
        <button type="submit" :disabled="!input">Send</button>
      </form>

      <p class="sales-foot">
        Answers are rule-based on this device. Sales follow-ups use the site contact form (HTTPS POST).
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

type Role = "user" | "assistant";
interface Action {
  label: string;
  to?: string;
  href?: string;
  primary?: boolean;
}
interface Message {
  id: number;
  role: Role;
  text?: string;
  bullets?: string[];
  actions?: Action[];
}

const route = useRoute();
const router = useRouter();

const isOpen = ref(false);
const input = ref("");
const id = ref(1);
const isThinking = ref(false);
const threadEl = ref<HTMLElement | null>(null);

const storageKey = "public-sales-assistant-v4";
const messages = ref<Message[]>(loadSaved());

const PRODUCT = {
  trialRequests: 100,
  monthlyQuotaPerProject: 6000,
  pricing: { solo: 17, pro: 47, team: 88 },
  sites: { trial: 1, solo: 3, pro: 10, team: 30 },
  teamSeats: { team: 8 },
  apiHardCap: 200, // per-day per Google Cloud project
  typicalIndexDays: { api: "1-3 days", sitemap: "3-14 days" },
  successRate: "~87%",
  speedMultiple: "3-5x faster"
};

const contextLabel = computed(() => {
  if (route.path === "/pricing") return "On Pricing - I can help you pick a plan";
  if (route.path === "/") return "On Home - I can explain the product";
  return "Public site assistant";
});

const chips = computed(() => {
  if (route.path === "/pricing") {
    return [
      "Which plan fits me?",
      "Solo vs Pro",
      "Free trial limits",
      "Contact sales",
      "Annual billing",
      "Refund policy"
    ];
  }
  return [
    "What does this do?",
    "How fast is indexing?",
    "Pricing overview",
    "Contact sales",
    "How do I start?",
    "Is it Google official?"
  ];
});

watch(messages, () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(messages.value.slice(-30)));
  } catch {
    // local storage unavailable - non-fatal
  }
}, { deep: true });

watch(messages, () => {
  nextTick(() => {
    if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight;
  });
}, { deep: true });

function openPanel() {
  isOpen.value = true;
  if (messages.value.length === 0) {
    if (route.path === "/pricing") {
      pushAssistant({
        text:
          "You are on Pricing — compare Solo / Pro / Team, trial limits, and quotas below. Contact sales jumps to the form on this page.",
        bullets: [
          `${PRODUCT.typicalIndexDays.api} typical via API vs ${PRODUCT.typicalIndexDays.sitemap} via sitemap`,
          `${PRODUCT.successRate} success rate, ${PRODUCT.speedMultiple} average uplift`,
          `Trial: ${PRODUCT.trialRequests} indexing requests, ${PRODUCT.sites.trial} site`
        ],
        actions: [
          { label: "Contact sales", to: "/pricing#pricing-contact", primary: true },
          { label: "Start free trial", to: "/login?plan=trial" }
        ]
      });
      return;
    }

    pushAssistant({
      text: "Hi — I explain GoogleIndexing.com, plans, setup, and safety. Chips route faster than guessing prompts.",
      bullets: [
        `${PRODUCT.typicalIndexDays.api} typical via API vs ${PRODUCT.typicalIndexDays.sitemap} via standard sitemap`,
        `${PRODUCT.successRate} success rate, ${PRODUCT.speedMultiple} on average`,
        `Trial: ${PRODUCT.trialRequests} requests free`
      ],
      actions: [
        { label: "See pricing", to: "/pricing", primary: true },
        { label: "Start free trial", to: "/login?plan=trial" },
        { label: "Contact sales", to: contactSalesDestination(), primary: false }
      ]
    });
  }
}

function ask(raw: string) {
  const q = raw.trim();
  if (!q) return;
  input.value = "";
  pushUser(q);
  isThinking.value = true;
  // small delay to feel responsive without server work
  window.setTimeout(() => {
    const reply = respond(q.toLowerCase());
    isThinking.value = false;
    pushAssistant(reply);
  }, 220);
}

function pushUser(text: string) {
  messages.value.push({ id: id.value++, role: "user", text });
}

function pushAssistant(payload: Omit<Message, "id" | "role">) {
  messages.value.push({ id: id.value++, role: "assistant", ...payload });
}

/** Home → #contact; elsewhere (Pricing when assistant is shown) → pricing contact block */
function contactSalesDestination(): string {
  return route.path === "/" ? "/#contact" : "/pricing#pricing-contact";
}

function scrollToAnchor(anchorId: string) {
  nextTick(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(anchorId);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  });
}

function navigateTo(to: string) {
  const hashIdx = to.indexOf("#");
  const rawPath = hashIdx >= 0 ? to.slice(0, hashIdx) : to;
  const path = rawPath === "" ? "/" : rawPath;
  const hash = hashIdx >= 0 ? to.slice(hashIdx + 1) : "";

  if (route.path === path) {
    if (hash) scrollToAnchor(hash);
    return;
  }

  router
    .push({ path, hash: hash ? `#${hash}` : undefined })
    .then(() => {
      if (hash) scrollToAnchor(hash);
    })
    .catch(() => {});
}

function runAction(a: Action) {
  if (a.to) {
    navigateTo(a.to);
    isOpen.value = false;
    return;
  }
  if (a.href) window.open(a.href, "_blank", "noopener");
}

function respond(q: string): Omit<Message, "id" | "role"> {
  // Human / sales / demo
  if (
    matches(q, [
      "contact sales",
      "talk to sales",
      "sales team",
      "speak to someone",
      "human",
      "representative",
      "schedule demo",
      "book demo",
      "sales demo",
      "contact us",
      "get in touch",
      "reach out"
    ])
  ) {
    return {
      text: "Tap Contact sales to jump to the site contact form (Home contact section or Pricing contact block).",
      actions: [
        { label: "Contact sales", to: contactSalesDestination(), primary: true },
        { label: "Pricing page", to: "/pricing" }
      ]
    };
  }

  // Enterprise / partner / volume (before generic plan recommendation)
  if (
    matches(q, [
      "enterprise",
      "custom plan",
      "volume discount",
      "bulk pricing",
      "partner",
      "partnership",
      "reseller",
      "agency discount",
      "white label"
    ])
  ) {
    return {
      text:
        "Team is the self-serve ceiling on this page. For consolidated billing, MSAs, or bespoke limits, send details through Contact sales.",
      actions: [
        { label: "Contact sales", to: contactSalesDestination(), primary: true },
        { label: "Compare plans", to: "/pricing" }
      ]
    };
  }

  // Billing paperwork
  if (
    matches(q, [
      "invoice",
      "vat",
      "tax id",
      "receipt",
      "billing",
      "billing question",
      "purchase order",
      "po number"
    ])
  ) {
    return {
      text:
        "Stripe receipts are in your account after payment. For formal invoices, tax IDs, or procurement paperwork, use Contact sales.",
      actions: [
        { label: "Contact sales", to: contactSalesDestination(), primary: true },
        { label: "Sign in", to: "/login" }
      ]
    };
  }

  // Plan recommendation
  if (matches(q, ["which plan", "plan fit", "recommend", "best plan", "choose", "fit me"])) {
    return {
      text: "Plan recommendation in 4 lines:",
      bullets: [
        "Trial: evaluating fit, 1 site, 100 requests",
        "Solo $17/mo: 1-3 sites, no team",
        "Pro $47/mo: up to 10 sites, priority support, alerts",
        "Team $88/mo: up to 30 sites, 8 team seats, custom onboarding"
      ],
      actions: [
        { label: "Start with Pro", to: "/signup?plan=pro", primary: true },
        { label: "Compare on Pricing", to: "/pricing" }
      ]
    };
  }

  if (matches(q, ["solo vs pro", "pro vs solo", "difference between solo and pro"])) {
    return {
      text: "Solo vs Pro:",
      bullets: [
        "Solo: 1-3 sites, basic support, $17/mo",
        "Pro: up to 10 sites, priority support, alerts, $47/mo",
        "Pick Pro if you manage multiple sites, run frequent updates, or need alerts"
      ],
      actions: [
        { label: "Choose Solo", to: "/signup?plan=solo" },
        { label: "Choose Pro", to: "/signup?plan=pro", primary: true }
      ]
    };
  }

  if (matches(q, ["pro vs team", "team vs pro"])) {
    return {
      text: "Pro vs Team:",
      bullets: [
        "Pro: 10 sites, single operator workflows",
        "Team: 30 sites, up to 8 seats, custom onboarding",
        "Pick Team if multiple people manage SEO across many properties"
      ],
      actions: [
        { label: "Choose Pro", to: "/signup?plan=pro" },
        { label: "Choose Team", to: "/signup?plan=team", primary: true }
      ]
    };
  }

  // Trial
  if (matches(q, ["trial", "free trial", "try it", "free"])) {
    return {
      text: `Trial includes ${PRODUCT.trialRequests} indexing requests on 1 site, no card required.`,
      bullets: [
        "Best for evaluating speed-to-index and dashboard fit",
        "When you exceed the trial, you can upgrade to a paid plan in seconds"
      ],
      actions: [
        { label: "Start free trial", to: "/login?plan=trial", primary: true },
        { label: "See full pricing", to: "/pricing" }
      ]
    };
  }

  // Pricing / cost
  if (matches(q, ["pricing", "price", "cost", "how much"])) {
    return {
      text: "Monthly pricing:",
      bullets: [
        "Solo: $17/mo",
        "Pro: $47/mo (most popular)",
        "Team: $88/mo",
        "Annual billing available (saves 2 months)"
      ],
      actions: [
        { label: "Contact sales", to: contactSalesDestination(), primary: true },
        { label: "Open pricing page", to: "/pricing" }
      ]
    };
  }

  // ROI / speed
  if (matches(q, ["roi", "value", "speed", "fast", "how fast", "improve indexing", "ranking"])) {
    return {
      text: "Indexing speed and value:",
      bullets: [
        `API typical time: ${PRODUCT.typicalIndexDays.api}`,
        `Sitemap typical time: ${PRODUCT.typicalIndexDays.sitemap}`,
        `${PRODUCT.speedMultiple} on average, ${PRODUCT.successRate} success rate`,
        "Strongest gains: frequently updated content, large catalogs, recent migrations"
      ],
      actions: [{ label: "Start free", to: "/login?plan=trial", primary: true }]
    };
  }

  // Setup / onboarding
  if (matches(q, ["setup", "start", "onboarding", "begin", "get started", "how do i start"])) {
    return {
      text: "5-step start:",
      bullets: [
        "Create an account",
        "Verify email",
        "Connect Google Search Console",
        "Add your site, run a crawl",
        "Submit URLs to indexing and monitor coverage"
      ],
      actions: [
        { label: "Create account", to: "/signup", primary: true },
        { label: "Already have an account", to: "/login" }
      ]
    };
  }

  // Limits / quota
  if (matches(q, ["quota", "limit", "200 per day", "200/day", "how many"])) {
    return {
      text: "Quota explained:",
      bullets: [
        `Google enforces ${PRODUCT.apiHardCap} requests/day per Google Cloud project`,
        "All paid plans give you the full Google quota",
        `Plans are differentiated by sites and seats, not by Google's hard cap`
      ],
      actions: [{ label: "See plans", to: "/pricing", primary: true }]
    };
  }

  // Compatibility
  if (matches(q, ["wordpress", "shopify", "next", "next.js", "nopcommerce", "support", "compatible", "platform"])) {
    return {
      text: "Works with any public site:",
      bullets: ["WordPress, Shopify, nopCommerce, Next.js", "Corporate sites and custom builds", "Anything with public, crawlable URLs"]
    };
  }

  // Security / official
  if (matches(q, ["official", "google official", "affiliate", "affiliated"])) {
    return {
      text: "Independent service that uses Google's official Indexing API. Not affiliated with Google Inc."
    };
  }
  if (matches(q, ["secure", "security", "privacy", "data"])) {
    return {
      text: "Security posture:",
      bullets: [
        "Auth via standard email/password or Google OAuth",
        "Stripe handles payments; card data never touches our database",
        "Crawl results stay tied to your account/team only"
      ]
    };
  }

  // Refund / cancel
  if (matches(q, ["refund", "cancel", "money back"])) {
    return {
      text:
        "Cancel anytime from Subscription in the app. Refunds are evaluated case-by-case — submit account email and invoice details via Contact sales.",
      actions: [
        { label: "Contact sales", to: contactSalesDestination(), primary: true },
        { label: "Sign in to subscription", to: "/login" }
      ]
    };
  }

  // Annual
  if (matches(q, ["annual", "yearly", "year"])) {
    return {
      text:
        "Annual billing saves about two months versus monthly. Request a switch via Contact sales (include the Google account email on the workspace).",
      actions: [
        { label: "Contact sales", to: contactSalesDestination(), primary: true },
        { label: "See pricing", to: "/pricing" }
      ]
    };
  }

  // Direct buy
  if (matches(q, ["buy", "subscribe", "checkout", "pay"])) {
    return {
      text: "Default conversion path is Pro - it covers most teams managing multiple sites.",
      actions: [
        { label: "Start with Pro", to: "/signup?plan=pro", primary: true },
        { label: "See all plans", to: "/pricing" }
      ]
    };
  }

  // Take me / navigate
  if (matches(q, ["take me", "open pricing", "show pricing", "go to pricing"])) {
    return { text: "Opening pricing.", actions: [{ label: "Pricing", to: "/pricing", primary: true }] };
  }

  // Sign in
  if (matches(q, ["sign in", "login"])) {
    return { text: "Use existing account or start free.", actions: [{ label: "Sign in", to: "/login", primary: true }] };
  }

  // Fallback
  return {
    text: "Try one of these topics:",
    bullets: [
      "Plan fit (Solo / Pro / Team)",
      "Trial and quota limits",
      "Pricing and annual billing",
      "Setup steps and onboarding",
      "Security and indexing API (official Google surface)"
    ],
    actions: [
      { label: "See pricing", to: "/pricing", primary: true },
      { label: "Start free trial", to: "/login?plan=trial" },
      { label: "Contact sales", to: contactSalesDestination(), primary: false }
    ]
  };
}

function matches(q: string, keys: string[]): boolean {
  return keys.some((k) => q.includes(k));
}

function loadSaved(): Message[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Message[];
    return Array.isArray(parsed) ? parsed.slice(-30) : [];
  } catch {
    return [];
  }
}
</script>

<style scoped>
.sales-assistant-root {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
}

.sales-fab {
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #111827;
  color: #fff;
  border-radius: 999px;
  width: 46px;
  height: 46px;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.18);
}
.sales-fab svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sales-panel {
  width: min(380px, calc(100vw - 24px));
  height: min(620px, calc(100vh - 28px));
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(17, 24, 39, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sales-head {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.sales-head__main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.sales-head__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
  flex-shrink: 0;
}
.sales-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0a0a0c;
}
.sales-subtitle {
  margin: 2px 0 0;
  font-size: 11px;
  color: #6b7280;
}
.sales-close {
  border: 0;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
}

.sales-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}
.chip {
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 5px 10px;
  background: #fff;
  font-size: 11px;
  color: #111827;
  cursor: pointer;
  transition: background 140ms, border-color 140ms;
}
.chip:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.sales-thread {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #ffffff;
}
.bubble {
  max-width: 92%;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
  border: 1px solid #e5e7eb;
}
.bubble__text {
  margin: 0;
  white-space: pre-wrap;
}
.bubble__list {
  margin: 8px 0 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #374151;
}
.bubble__actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.bubble.user {
  align-self: flex-end;
  background: #eef2ff;
  border-color: #c7d2fe;
}
.bubble.assistant {
  align-self: flex-start;
  background: #f8fafc;
}
.bubble-cta {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 140ms, border-color 140ms;
}
.bubble-cta:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}
.bubble-cta--primary {
  background: #111827;
  color: #fff;
  border-color: #111827;
}
.bubble-cta--primary:hover {
  background: #2a2a2a;
  border-color: #2a2a2a;
}

.typing {
  display: inline-flex;
  gap: 4px;
  margin: 0;
}
.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9ca3af;
  animation: blink 1s infinite ease-in-out;
}
.typing span:nth-child(2) {
  animation-delay: 0.15s;
}
.typing span:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes blink {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}

.sales-input {
  border-top: 1px solid #f1f5f9;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
.sales-input input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 9px 11px;
  min-width: 0;
  font-size: 13px;
  color: #111827;
}
.sales-input input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}
.sales-input button {
  border: 1px solid #111827;
  background: #111827;
  color: #fff;
  border-radius: 8px;
  padding: 9px 12px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}
.sales-input button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.sales-foot {
  margin: 0;
  padding: 6px 10px 8px;
  font-size: 10.5px;
  color: #9ca3af;
  text-align: center;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}
</style>

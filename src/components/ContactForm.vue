<template>
  <form class="contact-form" novalidate @submit.prevent="submit">
    <div class="contact-form__row">
      <label class="contact-field" :class="{ 'is-error': errors.name }">
        <span class="contact-field__label">Your name</span>
        <input
          v-model.trim="form.name"
          type="text"
          name="name"
          autocomplete="name"
          placeholder="Jane Doe"
          maxlength="120"
          :disabled="isSubmitting"
          @blur="validateField('name')"
        />
        <span v-if="errors.name" class="contact-field__error">{{ errors.name }}</span>
      </label>

      <label class="contact-field" :class="{ 'is-error': errors.email }">
        <span class="contact-field__label">Work email</span>
        <input
          v-model.trim="form.email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder="you@company.com"
          maxlength="200"
          :disabled="isSubmitting"
          @blur="validateField('email')"
        />
        <span v-if="errors.email" class="contact-field__error">{{ errors.email }}</span>
      </label>
    </div>

    <div class="contact-form__row">
      <label class="contact-field">
        <span class="contact-field__label">
          Company <span class="contact-field__hint">(optional)</span>
        </span>
        <input
          v-model.trim="form.company"
          type="text"
          name="company"
          autocomplete="organization"
          placeholder="Acme Inc."
          maxlength="160"
          :disabled="isSubmitting"
        />
      </label>

      <label class="contact-field">
        <span class="contact-field__label">
          Phone <span class="contact-field__hint">(optional)</span>
        </span>
        <input
          v-model.trim="form.phone"
          type="tel"
          name="phone"
          autocomplete="tel"
          placeholder="+1 555 123 4567"
          maxlength="40"
          :disabled="isSubmitting"
        />
      </label>
    </div>

    <div class="contact-form__row">
      <label class="contact-field" :class="{ 'is-error': errors.subject }">
        <span class="contact-field__label">Subject</span>
        <input
          v-model.trim="form.subject"
          type="text"
          name="subject"
          placeholder="Indexing for our 12k product pages"
          maxlength="160"
          :disabled="isSubmitting"
          @blur="validateField('subject')"
        />
        <span v-if="errors.subject" class="contact-field__error">{{ errors.subject }}</span>
      </label>

      <label class="contact-field">
        <span class="contact-field__label">Plan interest</span>
        <div class="contact-select">
          <select
            v-model="form.planInterest"
            name="planInterest"
            :disabled="isSubmitting"
          >
            <option value="">Not sure yet</option>
            <option value="trial">Free trial</option>
            <option value="solo">Solo — $17/mo</option>
            <option value="pro">Pro — $47/mo</option>
            <option value="team">Team — $88/mo</option>
            <option value="custom">Custom / Enterprise</option>
          </select>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </label>
    </div>

    <label class="contact-field contact-field--full" :class="{ 'is-error': errors.message }">
      <span class="contact-field__label">How can we help?</span>
      <textarea
        v-model.trim="form.message"
        name="message"
        rows="5"
        maxlength="4000"
        placeholder="Sites, current SEO setup, what you want to achieve..."
        :disabled="isSubmitting"
        @blur="validateField('message')"
      ></textarea>
      <div class="contact-field__meta">
        <span v-if="errors.message" class="contact-field__error">{{ errors.message }}</span>
        <span v-else class="contact-field__counter">{{ form.message.length }}/4000</span>
      </div>
    </label>

    <!-- honeypot: hidden from real users, visible to most bots -->
    <div class="contact-honeypot" aria-hidden="true">
      <label>
        Website
        <input
          v-model="form.website"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
        />
      </label>
    </div>

    <div class="contact-form__footer">
      <p class="contact-consent">
        By sending this you agree to be contacted about your inquiry. We never share your details.
      </p>
      <button
        type="submit"
        class="contact-submit"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="contact-submit__spinner" aria-hidden="true"></span>
        <span>{{ isSubmitting ? 'Sending...' : 'Send message' }}</span>
        <svg v-if="!isSubmitting" viewBox="0 0 24 24" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>

    <transition name="contact-fade">
      <div v-if="status === 'success'" class="contact-banner contact-banner--success" role="status">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="7 12 10.5 15.5 17 8.5" />
        </svg>
        <div>
          <strong>Message sent.</strong>
          <span>We typically reply within one business day. A copy was sent to your inbox.</span>
        </div>
      </div>
    </transition>

    <transition name="contact-fade">
      <div v-if="status === 'error'" class="contact-banner contact-banner--error" role="alert">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <strong>Couldn't send your message.</strong>
          <span>{{ errorBanner }} Or email <a href="mailto:sales@nopbooster.com">sales@nopbooster.com</a> directly.</span>
        </div>
      </div>
    </transition>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute } from "vue-router";
import api from "../api";

interface ContactPayload {
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
  planInterest: string;
  website: string;
  sourcePage: string;
}

const props = withDefaults(
  defineProps<{
    defaultSubject?: string;
    defaultPlanInterest?: string;
  }>(),
  {
    defaultSubject: "",
    defaultPlanInterest: ""
  }
);

const route = useRoute();

const form = reactive<ContactPayload>({
  name: "",
  email: "",
  company: "",
  phone: "",
  subject: props.defaultSubject,
  message: "",
  planInterest: props.defaultPlanInterest,
  website: "",
  sourcePage: ""
});

type FieldKey = "name" | "email" | "subject" | "message";
const errors = reactive<Record<FieldKey, string>>({
  name: "",
  email: "",
  subject: "",
  message: ""
});

const isSubmitting = ref(false);
const status = ref<"idle" | "success" | "error">("idle");
const errorBanner = ref("Please try again in a moment.");

function validateField(key: FieldKey): boolean {
  const value = (form[key] || "").trim();
  switch (key) {
    case "name":
      errors.name = value.length === 0
        ? "Please enter your name."
        : value.length > 120 ? "Name is too long." : "";
      break;
    case "email":
      if (!value) errors.email = "Please enter your email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = "Enter a valid email address.";
      else errors.email = "";
      break;
    case "subject":
      errors.subject = value.length === 0
        ? "Please add a subject."
        : value.length > 160 ? "Subject is too long." : "";
      break;
    case "message":
      if (value.length === 0) errors.message = "Please write a short message.";
      else if (value.length < 10) errors.message = "Tell us a bit more — at least 10 characters.";
      else if (value.length > 4000) errors.message = "Message is too long.";
      else errors.message = "";
      break;
  }
  return errors[key].length === 0;
}

function validateAll(): boolean {
  const keys: FieldKey[] = ["name", "email", "subject", "message"];
  return keys.map(validateField).every(Boolean);
}

async function submit() {
  status.value = "idle";
  if (!validateAll()) return;

  isSubmitting.value = true;
  try {
    form.sourcePage = typeof window !== "undefined"
      ? `${window.location.origin}${route.fullPath}`
      : route.fullPath;

    await api.post("/contact", {
      name: form.name,
      email: form.email,
      company: form.company,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
      planInterest: form.planInterest,
      website: form.website, // honeypot
      sourcePage: form.sourcePage
    });

    status.value = "success";
    form.name = "";
    form.email = "";
    form.company = "";
    form.phone = "";
    form.subject = props.defaultSubject;
    form.message = "";
    form.planInterest = props.defaultPlanInterest;
    form.website = "";
  } catch (err: any) {
    const d = err?.response?.data
    const message =
      d?.error?.description
      || d?.error?.message
      || d?.message
      || d?.meta
      || err?.message
      || ""
    errorBanner.value = message ? String(message).replace(/\.$/, "") + "." : "Please try again in a moment."
    status.value = "error"
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.contact-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.contact-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.contact-field--full {
  grid-column: 1 / -1;
}

.contact-field__label {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #1f2937;
}

.contact-field__hint {
  font-weight: 400;
  color: #9ca3af;
  margin-left: 4px;
}

.contact-field input,
.contact-field textarea,
.contact-field select {
  width: 100%;
  padding: 11px 13px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: #0a0a0c;
  font: inherit;
  font-size: 0.94rem;
  line-height: 1.5;
  transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
  box-sizing: border-box;
}

.contact-field textarea {
  resize: vertical;
  min-height: 120px;
}

.contact-field input::placeholder,
.contact-field textarea::placeholder {
  color: #9aa0a6;
}

.contact-field input:focus,
.contact-field textarea:focus,
.contact-field select:focus {
  outline: none;
  border-color: #4285F4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.18);
  background: #ffffff;
}

.contact-field.is-error input,
.contact-field.is-error textarea {
  border-color: rgba(234, 67, 53, 0.55);
  box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.12);
}

.contact-field input:disabled,
.contact-field textarea:disabled,
.contact-field select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.contact-field__error {
  font-size: 0.78rem;
  color: #c5221f;
  font-weight: 500;
}

.contact-field__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-height: 16px;
}

.contact-field__counter {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-left: auto;
}

.contact-select {
  position: relative;
}
.contact-select select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 36px;
  cursor: pointer;
}
.contact-select svg {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  fill: none;
  stroke: #5f6368;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
}

.contact-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.contact-form__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.contact-consent {
  margin: 0;
  font-size: 0.74rem;
  color: #6b7280;
  max-width: 60%;
  line-height: 1.5;
}

.contact-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border: none;
  border-radius: 100px;
  background: #0a0a0c;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 150ms ease, transform 80ms ease, box-shadow 150ms ease;
}
.contact-submit svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.contact-submit:hover:not(:disabled) {
  background: #2a2a2a;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);
  transform: translateY(-1px);
}
.contact-submit:active:not(:disabled) { transform: translateY(0); }
.contact-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.contact-submit__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: contact-spin 0.7s linear infinite;
}
@keyframes contact-spin { to { transform: rotate(360deg); } }

.contact-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  line-height: 1.55;
}
.contact-banner svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  margin-top: 1px;
}
.contact-banner div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.contact-banner strong { font-weight: 600; }
.contact-banner a { color: inherit; text-decoration: underline; }

.contact-banner--success {
  background: rgba(52, 168, 83, 0.08);
  border: 1px solid rgba(52, 168, 83, 0.25);
  color: #1a7f40;
}

.contact-banner--error {
  background: rgba(234, 67, 53, 0.07);
  border: 1px solid rgba(234, 67, 53, 0.22);
  color: #c5221f;
}

.contact-fade-enter-active,
.contact-fade-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.contact-fade-enter-from,
.contact-fade-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (max-width: 640px) {
  .contact-form__row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .contact-consent {
    max-width: 100%;
  }
  .contact-form__footer {
    justify-content: stretch;
  }
  .contact-submit {
    width: 100%;
    justify-content: center;
  }
}
</style>

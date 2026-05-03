<script setup lang="ts">
/** Brand SVGs via Simple Icons (CC0): https://github.com/simple-icons/simple-icons */

withDefaults(
  defineProps<{
    variant?: 'full' | 'compact' | 'footer-bar' | 'inline'
    showWallets?: boolean
  }>(),
  { variant: 'full', showWallets: true }
)

function brandHref(name: string) {
  const base = import.meta.env.BASE_URL || '/'
  const root = base.endsWith('/') ? base.slice(0, -1) : base
  return `${root}/payment-brands/${name}`
}
</script>

<template>
  <!-- Inline: all marks + Stripe on one horizontal line -->
  <div
    v-if="variant === 'inline'"
    class="payment-inline"
    aria-label="Secured checkout with Stripe"
  >
    <img class="payment-inline__img" :src="brandHref('visa.svg')" alt="Visa" width="34" height="22" decoding="async" />
    <img class="payment-inline__img payment-inline__img--mastercard" :src="brandHref('mastercard.svg')" alt="Mastercard" width="28" height="22" decoding="async" />
    <img class="payment-inline__img payment-inline__img--amex" :src="brandHref('americanexpress.svg')" alt="Amex" width="40" height="22" decoding="async" />
    <img class="payment-inline__img" :src="brandHref('discover.svg')" alt="Discover" width="34" height="22" decoding="async" />
    <template v-if="showWallets">
      <img class="payment-inline__img" :src="brandHref('applepay.svg')" alt="Apple Pay" width="32" height="20" decoding="async" />
      <img class="payment-inline__img" :src="brandHref('googlepay.svg')" alt="Google Pay" width="36" height="20" decoding="async" />
    </template>
    <span class="payment-inline__rule" aria-hidden="true" />
    <img class="payment-inline__stripe-mark" :src="brandHref('stripe-mark.svg')" alt="" width="16" height="16" decoding="async" />
    <span class="payment-inline__stripe-label">Stripe</span>
  </div>

  <!-- E‑commerce footer strip: divider + single line of marks -->
  <section
    v-else-if="variant === 'footer-bar'"
    class="payment-footer-bar"
    aria-label="Accepted payment methods; processed with Stripe where available."
  >
    <span class="payment-trust__sr-only">
      Payments processed with Stripe where enabled; cards and wallets shown may vary by region.
    </span>
    <div class="payment-footer-bar__strip" aria-hidden="true">
      <img class="payment-footer-bar__img payment-footer-bar__img--visa" :src="brandHref('visa.svg')" alt="" width="40" height="24" decoding="async" />
      <img class="payment-footer-bar__img payment-footer-bar__img--mastercard" :src="brandHref('mastercard.svg')" alt="" width="32" height="24" decoding="async" />
      <img class="payment-footer-bar__img payment-footer-bar__img--amex" :src="brandHref('americanexpress.svg')" alt="" width="48" height="24" decoding="async" />
      <img class="payment-footer-bar__img" :src="brandHref('discover.svg')" alt="" width="40" height="24" decoding="async" />
      <template v-if="showWallets">
        <img class="payment-footer-bar__img payment-footer-bar__img--wallet" :src="brandHref('applepay.svg')" alt="" width="36" height="22" decoding="async" />
        <img class="payment-footer-bar__img payment-footer-bar__img--wallet" :src="brandHref('googlepay.svg')" alt="" width="40" height="22" decoding="async" />
      </template>
      <span class="payment-footer-bar__rule" />
      <span class="payment-footer-bar__processor">
        <img class="payment-footer-bar__stripe-icon" :src="brandHref('stripe-mark.svg')" alt="" width="22" height="22" decoding="async" />
        <span class="payment-footer-bar__stripe-label">Stripe</span>
      </span>
    </div>
  </section>

  <section
    v-else
    class="payment-trust"
    :class="[`payment-trust--${variant}`]"
    aria-label="Accepted payment methods and processor"
  >
    <span class="payment-trust__sr-only">
      Payments processed with Stripe; major cards and digital wallets accepted where Stripe enables them for your region.
    </span>

    <p v-if="variant === 'full'" class="payment-trust__eyebrow">
      Accepted payment methods • PCI-aware checkout via Stripe
    </p>
    <p v-else class="payment-trust__eyebrow payment-trust__eyebrow--compact">
      Secured checkout with Stripe
    </p>

    <div class="payment-trust__row payment-trust__row--cards" aria-hidden="true">
      <img class="payment-trust__icon payment-trust__icon--visa" :src="brandHref('visa.svg')" alt="" width="56" height="36" decoding="async" />
      <img class="payment-trust__icon payment-trust__icon--mastercard" :src="brandHref('mastercard.svg')" alt="" width="42" height="36" decoding="async" />
      <img class="payment-trust__icon payment-trust__icon--amex" :src="brandHref('americanexpress.svg')" alt="" width="72" height="36" decoding="async" />
      <img class="payment-trust__icon payment-trust__icon--discover" :src="brandHref('discover.svg')" alt="" width="56" height="36" decoding="async" />
    </div>

    <div v-if="showWallets" class="payment-trust__row payment-trust__row--wallets" aria-hidden="true">
      <img class="payment-trust__icon payment-trust__icon--wallet" :src="brandHref('applepay.svg')" alt="" width="48" height="32" decoding="async" />
      <img class="payment-trust__icon payment-trust__icon--wallet" :src="brandHref('googlepay.svg')" alt="" width="52" height="32" decoding="async" />
    </div>

    <div class="payment-trust__stripe" aria-hidden="true">
      <img class="payment-trust__stripe-mark" :src="brandHref('stripe-mark.svg')" alt="" width="38" height="38" decoding="async" />
      <div class="payment-trust__stripe-copy">
        <span class="payment-trust__stripe-powered">Powered by</span>
        <span class="payment-trust__stripe-name">Stripe</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ========== Inline (single row) ========== */
.payment-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: nowrap;
}

.payment-inline__img {
  display: block;
  height: 1.25rem;
  width: auto;
  object-fit: contain;
  opacity: 0.5;
  flex-shrink: 0;
}

.payment-inline__img--amex {
  height: 1.05rem;
}

.payment-inline__rule {
  display: inline-block;
  width: 1px;
  height: 1rem;
  background: rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  margin: 0 0.1rem;
}

.payment-inline__stripe-mark {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  opacity: 0.7;
}

.payment-inline__stripe-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #635bff;
  line-height: 1;
}

/* --- Shared sr-only --- */
.payment-trust__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ========== Footer bar (store-style) ========== */
.payment-footer-bar {
  margin-top: 1.35rem;
  padding-top: 1.1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.payment-footer-bar__strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(0.65rem, 2.5vw, 1rem);
}

.payment-footer-bar__img {
  display: block;
  height: 1.375rem;
  width: auto;
  max-height: 1.375rem;
  object-fit: contain;
  opacity: 0.5;
}

.payment-footer-bar__img--visa {
  min-height: 1.25rem;
}

.payment-footer-bar__img--amex {
  height: 1.15rem;
  max-height: 1.15rem;
}

.payment-footer-bar__img--wallet {
  height: 1.35rem;
  max-height: 1.35rem;
}

.payment-footer-bar__rule {
  display: inline-block;
  width: 1px;
  height: 1.125rem;
  margin: 0 0.05rem;
  background: rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.payment-footer-bar__processor {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.payment-footer-bar__stripe-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  opacity: 0.72;
}

.payment-footer-bar__stripe-label {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #635bff;
}

/* ========== Marketing blocks (dashboard / inset) ========== */
.payment-trust {
  margin: 1.75rem auto 0;
  max-width: 52rem;
  text-align: center;
}

.payment-trust--compact {
  margin-top: 1.35rem;
  max-width: 40rem;
}

.payment-trust__eyebrow {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-secondary, #5f6368);
  margin: 0 0 1rem;
  line-height: 1.4;
}

.payment-trust--compact .payment-trust__eyebrow--compact {
  font-size: 0.72rem;
  margin-bottom: 0.85rem;
  letter-spacing: 0.1em;
}

.payment-trust__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(0.65rem, 3vw, 1.35rem);
  margin-bottom: 1rem;
}

.payment-trust--compact .payment-trust__row {
  gap: clamp(0.45rem, 2vw, 1rem);
  margin-bottom: 0.75rem;
}

.payment-trust__icon {
  display: block;
  height: 2rem;
  width: auto;
  max-height: 2rem;
  object-fit: contain;
  opacity: 0.62;
  filter: grayscale(0.05);
  transition: opacity 0.25s ease;
}

.payment-trust--compact .payment-trust__icon {
  height: 1.65rem;
  max-height: 1.65rem;
  opacity: 0.56;
}

.payment-trust__row:hover .payment-trust__icon,
.payment-trust__stripe:hover .payment-trust__stripe-mark {
  opacity: 0.92;
}

.payment-trust__icon--visa {
  min-width: 3.15rem;
}

.payment-trust__icon--mastercard {
  min-width: 2.35rem;
}

.payment-trust__icon--amex {
  height: 1.55rem;
  max-height: 1.55rem;
  min-width: 4.25rem;
}

.payment-trust--compact .payment-trust__icon--amex {
  height: 1.35rem;
  max-height: 1.35rem;
  min-width: 3.85rem;
}

.payment-trust__icon--wallet {
  height: 1.75rem;
  max-height: 1.75rem;
}

.payment-trust--compact .payment-trust__icon--wallet {
  height: 1.45rem;
  max-height: 1.45rem;
}

.payment-trust__stripe {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.55rem 1rem;
  margin-top: 0.35rem;
  border-radius: 999px;
  background: rgba(99, 91, 255, 0.07);
  border: 1px solid rgba(99, 91, 255, 0.22);
}

.payment-trust--compact .payment-trust__stripe {
  padding: 0.42rem 0.85rem;
  gap: 0.5rem;
}

.payment-trust__stripe-mark {
  width: 1.85rem;
  height: 1.85rem;
  flex-shrink: 0;
  opacity: 0.78;
}

.payment-trust--compact .payment-trust__stripe-mark {
  width: 1.55rem;
  height: 1.55rem;
}

.payment-trust__stripe-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.05;
}

.payment-trust__stripe-powered {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary, #5f6368);
}

.payment-trust__stripe-name {
  font-family: 'Syne', 'Inter', system-ui, sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #635bff;
}

.payment-trust--compact .payment-trust__stripe-name {
  font-size: 1.02rem;
}

@media (prefers-reduced-motion: reduce) {
  .payment-trust__icon {
    transition: none;
  }
}
</style>

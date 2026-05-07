<template>
  <footer class="marketing-site-footer">
    <div class="marketing-site-footer__inner">
      <p class="marketing-site-footer__line">
        &copy; 2026 GoogleIndexing.com &mdash; Powered by
        <a href="https://nopbooster.com" target="_blank" rel="noopener">Nopbooster</a>
      </p>
      <p class="marketing-site-footer__note">
        <router-link to="/pricing">Pricing</router-link>
        &middot;
        <router-link to="/terms">Terms</router-link>
        &middot;
        <router-link to="/privacy">Privacy</router-link>
        &middot;
        <router-link :to="{ path: '/', hash: '#contact' }">Contact</router-link>
        &middot;
        Not affiliated with Google Inc. Contact:
        <a href="mailto:sales@nopbooster.com">sales@nopbooster.com</a>
      </p>
    </div>
    <PaymentTrustBadges variant="footer-bar" />
  </footer>
</template>

<script setup lang="ts">
import PaymentTrustBadges from './PaymentTrustBadges.vue'
</script>

<style scoped>
.marketing-site-footer {
  padding: 3rem 0 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.marketing-site-footer__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: #5f6368;
  font-size: 0.88rem;
  position: relative;
  z-index: 2;
}

.marketing-site-footer__inner :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.8;
}

.marketing-site-footer__inner :deep(a:hover) {
  opacity: 1;
}

.marketing-site-footer__note {
  opacity: 0.75;
}

@media (max-width: 600px) {
  .marketing-site-footer__inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>

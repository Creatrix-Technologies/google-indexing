<template>
  <MarketingLegalShell>
    <article class="legal-prose">
      <h1>Privacy Policy</h1>
      <p class="legal-prose__meta">Effective date: 7 May 2026 · Last updated: 7 May 2026</p>

      <p>
        This Privacy Policy describes how GoogleIndexing.com (“we”, “us”) collects, uses, and shares personal data when you visit our marketing pages, create an account, pay for a subscription, or use
        our indexing automation features.
      </p>

      <h2>1. Who we are</h2>
      <p>
        The Service is operated in connection with GoogleIndexing.com. For privacy inquiries contact
        <a href="mailto:sales@nopbooster.com">sales@nopbooster.com</a>.
      </p>

      <h2>2. Data we collect</h2>
      <ul>
        <li><strong>Account data:</strong> email address, username, password hash, verification status, team/workspace identifiers as applicable.</li>
        <li><strong>Billing data:</strong> processed by our payment provider (e.g. Stripe); we typically receive limited billing metadata (customer id, subscription status, receipt references), not full card numbers.</li>
        <li><strong>Site &amp; technical data:</strong> URLs you submit or crawl, crawl/index logs shown in the product, API usage tied to your projects, configuration you save for integrations (including tokens where you choose to store them under our security model).</li>
        <li><strong>Usage &amp; diagnostics:</strong> IP address, device/browser type, timestamps, and error logs needed for security and reliability.</li>
        <li><strong>Contact form:</strong> information you send via our website contact form (name, email, message content).</li>
      </ul>

      <h2>3. How we use data</h2>
      <ul>
        <li>Provide, secure, and improve the Service;</li>
        <li>Authenticate users, enforce quotas, and prevent abuse;</li>
        <li>Communicate about accounts, billing, security, and product updates;</li>
        <li>Meet legal obligations and resolve disputes.</li>
      </ul>

      <h2>4. Legal bases (EEA/UK)</h2>
      <p>
        Where GDPR applies, we rely on performance of a contract (providing the Service), legitimate interests (security, analytics at aggregate level, product improvement), consent where required
        (e.g. certain cookies or marketing where opted in), and legal obligation where applicable.
      </p>

      <h2>5. Sharing</h2>
      <p>
        We use subprocessors such as hosting, email, analytics as configured, Google APIs when you connect them, and payment processors. We do not sell your personal data. We may disclose information if
        required by law or to protect rights and safety.
      </p>

      <h2>6. International transfers</h2>
      <p>
        Your data may be processed in countries outside your own. Where required, we use appropriate safeguards such as standard contractual clauses.
      </p>

      <h2>7. Retention</h2>
      <p>
        We retain data while your account is active and for a limited period afterward for backups, legal compliance, and dispute resolution. Crawl and indexing logs may be retained according to product
        settings and operational needs.
      </p>

      <h2>8. Security</h2>
      <p>
        We implement technical and organizational measures appropriate to the Service. No method of transmission or storage is completely secure.
      </p>

      <h2>9. Your rights</h2>
      <p>
        Depending on your location you may have rights to access, rectify, erase, restrict processing, object, data portability, and withdraw consent. To exercise rights, email us at the address above.
        You may lodge a complaint with your supervisory authority.
      </p>

      <h2>10. Children</h2>
      <p>The Service is not directed at children under 16, and we do not knowingly collect their personal data.</p>

      <h2>11. Cookies</h2>
      <p>
        We use cookies and similar technologies for session/auth where applicable and for preferences. Third-party tools may set their own cookies according to their policies.
      </p>

      <h2>12. Changes</h2>
      <p>We may update this Policy with a new effective date posted on this page.</p>
    </article>
  </MarketingLegalShell>
</template>

<script setup lang="ts">
import MarketingLegalShell from "../components/MarketingLegalShell.vue";
</script>

<style scoped>
.legal-prose {
  max-width: 42rem;
  margin-inline: auto;
  text-align: left;
}

.legal-prose h1 {
  font-family: "Syne", "Inter", sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0 0 0.75rem;
  color: #0a0a0c;
  text-align: center;
}

.legal-prose__meta {
  font-size: 0.85rem;
  color: #5f6368;
  margin: 0 0 1.75rem;
  text-align: center;
}

.legal-prose h2 {
  font-family: "Syne", "Inter", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 2rem 0 0.65rem;
  color: #111827;
}

.legal-prose p,
.legal-prose li {
  font-size: 0.94rem;
  line-height: 1.65;
  color: #374151;
}

.legal-prose p {
  margin: 0 0 1rem;
}

.legal-prose ul {
  margin: 0 0 1rem;
  padding-left: 1.25rem;
}

.legal-prose li {
  margin-bottom: 0.45rem;
}

.legal-prose a {
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
}

.legal-prose a:hover {
  text-decoration: underline;
}
</style>

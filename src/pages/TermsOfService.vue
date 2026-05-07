<template>
  <MarketingLegalShell>
    <article class="legal-prose">
      <h1>Terms of Service</h1>
      <p class="legal-prose__meta">Effective date: 7 May 2026 · Last updated: 7 May 2026</p>

      <p>
        These Terms of Service (“Terms”) govern access to and use of GoogleIndexing.com (the “Service”), operated on behalf of the site operator (“we”, “us”). By creating an account, subscribing,
        or using the Service, you agree to these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        GoogleIndexing.com provides tools to crawl URLs, submit indexing signals through Google’s official Indexing API where configured and permitted, monitor crawl/index-related signals shown in
        our dashboard, and automate workflows tied to your connected sites. We are <strong>not affiliated with Google LLC</strong>. Google may change or discontinue APIs, quotas, and Search Console
        behaviour at any time.
      </p>

      <h2>2. Eligibility and accounts</h2>
      <p>
        You must provide accurate registration information and keep credentials confidential. You are responsible for activity under your account. You must have authority to connect domains,
        Search Console properties, and Google Cloud projects you configure with the Service.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate applicable law or third-party rights;</li>
        <li>Probe, disrupt, or overload our systems, or circumvent technical limits;</li>
        <li>Use the Service to spam URLs, manipulate rankings through deceptive means, or submit URLs you do not control without authorization;</li>
        <li>Reverse engineer or resell the Service except as expressly permitted in writing.</li>
      </ul>

      <h2>4. Third-party services</h2>
      <p>
        The Service relies on Google APIs, Search Console, hosting providers, email delivery, analytics as configured, and payment processing (e.g. Stripe). Those providers have separate terms and
        privacy notices; your use of their services is between you and them.
      </p>

      <h2>5. Fees and billing</h2>
      <p>
        Paid plans and trials are described on our Pricing page. Fees are charged according to the checkout flow and invoices/receipts issued by our payment processor. Taxes may apply based on your
        location. Failure to pay may result in suspension or termination of access.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        We retain rights in the Service, branding, and documentation. You retain rights in your content and data; you grant us a limited licence to host, process, and display it as needed to operate
        the Service for you.
      </p>

      <h2>7. Disclaimer</h2>
      <p>
        The Service is provided “as is” without warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee search rankings, indexing outcomes, crawl
        frequency, or quota availability from Google.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or loss of profits, data, or goodwill. Our aggregate
        liability arising out of these Terms or the Service is limited to the greater of (a) amounts you paid us for the Service in the twelve months before the claim or (b) fifty euros (€50), except
        where liability cannot be limited under mandatory law.
      </p>

      <h2>9. Indemnity</h2>
      <p>
        You will defend and indemnify us against claims arising from your misuse of the Service, your content, or your violation of these Terms, subject to applicable law.
      </p>

      <h2>10. Suspension and termination</h2>
      <p>
        We may suspend or terminate access for breach of these Terms, risk to security or abuse, or legal requirements. You may cancel your subscription according to in-product billing controls.
        Provisions that by nature should survive will survive termination.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these Terms by posting a revised version with a new effective date. Continued use after the effective date constitutes acceptance of the updated Terms where permitted by law.
      </p>

      <h2>12. Contact</h2>
      <p>
        For legal or contractual questions: <a href="mailto:sales@nopbooster.com">sales@nopbooster.com</a>.
      </p>
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
  margin-bottom: 0.35rem;
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

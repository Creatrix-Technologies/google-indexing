<template>
  <section id="reliability" class="rel">
    <div class="rel__header">
      <span class="rel__eyebrow">Built to keep running</span>
      <h2>Robust by design, not by luck</h2>
      <p>
        Indexing runs in the background for weeks at a time. Every stage of the pipeline is
        guarded so a flaky page, a quota day, or a dropped connection never silently loses a URL.
      </p>
    </div>

    <div class="rel__grid">
      <article v-for="item in items" :key="item.title" class="rel__card">
        <span class="rel__icon" aria-hidden="true" v-html="item.icon"></span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.body }}</p>
        <span class="rel__tag">{{ item.tag }}</span>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const svg = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`

const items = [
  {
    title: 'Automatic retries with backoff',
    body: 'Page fetches retry three times with exponential backoff, and every background job gets three attempts before it is marked failed with a reason you can read.',
    tag: 'No silent drops',
    icon: svg('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'),
  },
  {
    title: 'Locked, non-overlapping runs',
    body: 'A site that is already crawling cannot be queued twice. Each run holds a lock until it completes, so parallel schedules never collide or double-submit.',
    tag: 'Safe concurrency',
    icon: svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  },
  {
    title: 'Quota-aware queue',
    body: 'Google allows 200 Indexing API requests per project per day. We track usage against Google\'s Pacific-time reset, warn you before you hit it, and hold the rest for the next window.',
    tag: '200/day, handled',
    icon: svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  },
  {
    title: 'Live progress streams',
    body: 'Crawls, bulk submissions and status syncs stream progress to your dashboard as they happen, with automatic reconnect if the connection drops.',
    tag: 'Real time',
    icon: svg('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'),
  },
  {
    title: 'Verified against Google',
    body: '"Indexed" means Google says so. Status sync pulls coverage and indexing state per URL from Google\'s URL Inspection, not from a guess.',
    tag: 'Source of truth',
    icon: svg('<path d="M9 12l2 2 4-4"/><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6z"/>'),
  },
  {
    title: 'Real-browser, robots-aware crawling',
    body: 'Pages render in a headless Chromium so JavaScript-driven sites are read correctly. Sitemaps are parsed and robots.txt rules are respected on every crawl.',
    tag: 'Playwright',
    icon: svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
  },
]
</script>

<style scoped>
.rel {
  width: 100%;
  margin-bottom: 2rem;
  text-align: left;
}

.rel__header {
  max-width: 640px;
  margin-bottom: 2.5rem;
}

.rel__eyebrow {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4285f4;
  margin-bottom: 0.75rem;
}

.rel__header h2 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  letter-spacing: -2px;
  font-weight: 800;
  color: #0a0a0c;
  margin: 0 0 0.6rem;
}

.rel__header p {
  color: #5f6368;
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0;
}

.rel__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.rel__card {
  position: relative;
  padding: 1.6rem 1.5rem 1.4rem;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 22px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.rel__card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px -12px rgba(50, 50, 93, 0.14);
}

.rel__icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(66, 133, 244, 0.1);
  color: #1a56c4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.rel__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.rel__card h3 {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: #0a0a0c;
  margin: 0.35rem 0 0;
  line-height: 1.2;
}

.rel__card p {
  margin: 0;
  color: #5f6368;
  font-size: 0.92rem;
  line-height: 1.6;
  flex: 1;
}

.rel__tag {
  align-self: flex-start;
  margin-top: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #1e8e3e;
  background: #e6f4ea;
  border-radius: 100px;
  padding: 3px 9px;
}

@media (max-width: 1024px) {
  .rel__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .rel__grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .rel__card {
    padding: 1.35rem 1.25rem 1.2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rel__card {
    transition: none;
  }
}
</style>

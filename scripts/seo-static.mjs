// Writes one static HTML file per public marketing page after `vite build`, so crawlers and link
// previews get the right title, description and canonical (and some real text) before JavaScript runs.
// Page data comes from src/seo/publicPages.json, the same file the router uses at runtime.
// Vercel serves dist/pricing.html for /pricing (cleanUrls) before the SPA rewrite applies.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const seo = JSON.parse(readFileSync(join(root, 'src/seo/publicPages.json'), 'utf8'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')

// The SPA fallback (app routes like /dashboard) gets the untouched shell, without the home page's text.
writeFileSync(join(dist, 'spa.html'), template)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function setTag(html, regex, replacement, label) {
  if (!regex.test(html)) throw new Error(`seo-static: ${label} not found in dist/index.html`)
  return html.replace(regex, replacement)
}

for (const [path, page] of Object.entries(seo.pages)) {
  const canonical = `${seo.siteUrl}${path === '/' ? '/' : path}`
  let html = template
  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`, 'title')
  html = setTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(page.description)}" />`, 'description')
  html = setTag(html, /<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="${esc(page.robots)}" />`, 'robots')
  html = setTag(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(canonical)}" />`, 'canonical')
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(page.title)}" />`)
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(page.description)}" />`)
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${esc(canonical)}" />`)
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(page.title)}" />`)
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(page.description)}" />`)
  if (page.ogImage) {
    const img = `${seo.siteUrl}${page.ogImage}`
    html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${esc(img)}" />`)
    html = html.replace(/<meta property="og:image:secure_url" content="[^"]*"\s*\/?>/, `<meta property="og:image:secure_url" content="${esc(img)}" />`)
    html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${esc(img)}" />`)
    html = html.replace(/<meta property="og:image:alt" content="[^"]*"\s*\/?>/, `<meta property="og:image:alt" content="${esc(page.title)}" />`)
  }

  // Real text inside #app; Vue replaces it when it mounts.
  const sections = (page.sections ?? []).map((s) => `<section><h2>${esc(s.h2)}</h2>${s.text.map((t) => `<p>${esc(t)}</p>`).join('')}</section>`).join('')
  const faq = (page.faq ?? []).length
    ? `<section><h2>Frequently asked questions</h2>${page.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</section>`
    : ''
  const body = `<main style="max-width:720px;margin:12vh auto;padding:0 1.5rem;font-family:system-ui,sans-serif;color:#0a0a0c">`
    + `<h1>${esc(page.h1)}</h1>` + page.text.map((t) => `<p>${esc(t)}</p>`).join('') + sections + faq + `</main>`
  html = setTag(html, /<div id="app"><\/div>/, `<div id="app">${body}</div>`, '#app')

  if ((page.faq ?? []).length) {
    const ld = { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: page.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script></head>`)
  }

  const file = path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  console.log(`seo-static: ${path} -> ${file.replace(root + '/', '')}`)
}

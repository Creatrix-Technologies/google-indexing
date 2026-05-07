/** mailto: often appears inert when no default mail app is configured (common on Windows). */
const SALES_EMAIL = 'sales@nopbooster.com'

export function enhanceSalesMailtoLinks(root: ParentNode = document): void {
  const selector = `a[href^="mailto:${SALES_EMAIL}"]`
  root.querySelectorAll(selector).forEach((node) => {
    const link = node
    if (!(link instanceof HTMLAnchorElement) || link.dataset.mailtoEnhanced === '1') return
    link.dataset.mailtoEnhanced = '1'
    link.setAttribute('title', 'Open in your email app')
    const wrap = document.createElement('span')
    wrap.className = 'email-with-copy'
    link.parentNode?.insertBefore(wrap, link)
    wrap.appendChild(link)
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'copy-email-btn'
    btn.textContent = 'Copy'
    btn.title = 'Copy email address'
    btn.setAttribute('aria-label', 'Copy email address')
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(SALES_EMAIL)
        const prev = btn.textContent
        btn.textContent = 'Copied'
        window.setTimeout(() => {
          btn.textContent = prev || 'Copy'
        }, 2000)
      } catch {
        btn.textContent = 'Copy failed'
        window.setTimeout(() => {
          btn.textContent = 'Copy'
        }, 2000)
      }
    })
    wrap.appendChild(btn)
  })
}

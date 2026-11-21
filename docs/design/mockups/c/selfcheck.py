# Self-check for Mockup C. Usage: pip install playwright && playwright install chromium && python selfcheck.py
# Rewrites screenshots/. Prints per-page sizes, overflow, external requests, contrast, tap targets and homepage copy rules.
import json, re, sys, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
C = ROOT / "c"; SHOTS = C / "screenshots"; SHOTS.mkdir(exist_ok=True)
PAGES = ["index", "checker-result", "signup", "pricing", "dashboard", "crawl-index", "sites", "first-run"]
VIEWS = {"1440": (1440, 900), "390": (390, 844), "375": (375, 812)}

JS = r"""
() => {
  const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4) }; return [0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2]), m[3]===undefined?1:m[3]] };
  const bgOf = el => { while (el) { const b = getComputedStyle(el).backgroundColor; const m = b.match(/[\d.]+/g); if (m && (m[3]===undefined || +m[3] > 0.5)) return b; el = el.parentElement; } return 'rgb(255,255,255)'; };
  const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none' && !el.closest('[aria-hidden=true]') && !el.closest('.sr-only'); };
  const sizes = new Set(), lowContrast = [], smallTargets = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue;
    const own = [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim());
    if (!own) continue;
    const s = getComputedStyle(el); const fs = parseFloat(s.fontSize); sizes.add(fs);
    const [lf] = lum(s.color), [lb] = lum(bgOf(el));
    const ratio = (Math.max(lf,lb)+0.05)/(Math.min(lf,lb)+0.05);
    const large = fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700);
    if (ratio < (large ? 3 : 4.5)) lowContrast.push(el.tagName + ' "' + el.textContent.trim().slice(0,30) + '" ' + ratio.toFixed(2));
  }
  for (const el of document.querySelectorAll('a,button,input,select,summary,label.cb-hit')) {
    if (!vis(el)) continue;
    if (el.matches('input[type=checkbox]')) continue;
    const inline = el.tagName==='A' && getComputedStyle(el).display==='inline';
    if (inline) continue; // WCAG 2.5.8 inline exception
    const r = el.getBoundingClientRect();
    if (r.height < 44 || r.width < 44) smallTargets.push(el.tagName + ' "' + (el.textContent.trim()||el.id).slice(0,24) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height));
  }
  return { sizes: [...sizes].sort((a,b)=>a-b), lowContrast, smallTargets,
           hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth };
}
"""

def text(pg): return pg.evaluate("document.querySelector('main').innerText")

fails = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for vk, (w, h) in VIEWS.items():
        for name in PAGES:
            ctx = b.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page()
            ext = []
            pg.on("request", lambda r: ext.append(r.url) if not r.url.startswith("file://") else None)
            errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto((C / f"{name}.html").as_uri()); pg.wait_for_timeout(100)
            r = pg.evaluate(JS)
            line = f"{vk:>4} {name:15} sizes={r['sizes']} hscroll={r['hscroll']} ext={len(ext)} errs={errs}"
            bad = len(r['sizes']) > 3 or r['hscroll'] or ext or errs or r['lowContrast'] or r['smallTargets']
            print(("FAIL " if bad else "ok   ") + line)
            if r['lowContrast']: print("     contrast:", r['lowContrast'][:6])
            if r['smallTargets']: print("     targets:", r['smallTargets'][:6])
            if bad: fails.append(f"{vk} {name}")
            if name == "index" and vk in ("1440", "390"):
                bb = pg.locator(".hero form .btn").bounding_box(); ib = pg.locator("#u").bounding_box()
                print(f"     checker above fold: input bottom {ib['y']+ib['height']:.0f}, button bottom {bb['y']+bb['height']:.0f} of {h}")
                if bb['y'] + bb['height'] > h: fails.append(f"{vk} fold")
                pg.screenshot(path=str(SHOTS / f"index-{vk}-fold.png"))
            if vk in ("1440", "390"):
                if name == "first-run":
                    for _ in range(3): pg.click(".stepper li.active [data-next]")
                if name == "crawl-index":
                    pg.click("#filters [data-k=not]"); pg.check("tbody tr:not([hidden]) input >> nth=0")
                if name == "index":
                    pg.click(".faq details:first-child summary")
                pg.screenshot(path=str(SHOTS / f"{name}-{vk}.png"), full_page=True)
            ctx.close()

    # Homepage copy rules
    ctx = b.new_context(viewport={"width": 1440, "height": 900}); pg = ctx.new_page()
    pg.goto((C / "index.html").as_uri()); pg.wait_for_timeout(100)
    body = pg.evaluate("document.body.innerText")
    pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
    body_open = pg.evaluate("document.body.innerText")
    print("homepage: 'Start free' x", body.count("Start free"))
    print("homepage: trial line x", body_open.count("14-day trial"))
    print("homepage: caveat (JobPosting) x", body_open.count("JobPosting"), "(FAQ + footer)")
    print("homepage: main sections", pg.evaluate("document.querySelectorAll('main > section').length"))
    print("homepage: FAQ items", pg.evaluate("document.querySelectorAll('.faq details').length"))
    h1 = pg.inner_text("h1"); print("homepage: h1 words", len(h1.split()), repr(h1))
    print("homepage: primary buttons per section", pg.evaluate("[...document.querySelectorAll('main > section')].map(s=>s.querySelectorAll('.btn-primary').length)"))
    a_ctx = b.new_page(); a_ctx.goto((ROOT / "a" / "index.html").as_uri()); a_ctx.wait_for_timeout(200)
    a_words = len(a_ctx.evaluate("(()=>{document.querySelectorAll('details').forEach(d=>d.open=true);return document.querySelector('main').innerText})()").split())
    c_words = len(pg.evaluate("document.querySelector('main').innerText").split())
    print(f"homepage words in main: A={a_words} C={c_words} ({c_words/a_words:.0%})")
    b.close()

css = (C / "shared.css").read_text()
for bad in ["gradient", "box-shadow", "backdrop-filter", "animation", "@keyframes", "transition", "glow", "@import", "url("]:
    if bad in css: print("CSS contains", bad); fails.append("css " + bad)
html = "".join((C / f"{n}.html").read_text() for n in PAGES) + (C / "shared.js").read_text()
for bad in ["http://", "https://fonts", "{{", "glow", "gradient"]:
    hits = [m.start() for m in re.finditer(re.escape(bad), html)]
    if hits: print("markup contains", bad, len(hits))
radii = sorted(set(re.findall(r"border-radius:\s*([^;]+);", css))); print("radii:", radii)
print("FAILS:", fails)

/* Mockup A: shared nav, footer, theme toggle, pipeline demo. No dependencies. */
(function () {
  var root = document.documentElement;
  var KEY = 'mc-theme';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- theme (dark-first; honours system light preference until the user chooses) ---- */
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function initialTheme() {
    var s = stored();
    if (s === 'light' || s === 'dark') return s;
    return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    var b = document.getElementById('theme-toggle');
    if (b) {
      b.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
      b.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }
  root.setAttribute('data-theme', initialTheme());

  /* ---- shared pieces ---- */
  var LOGO =
    '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
    '<rect width="32" height="32" rx="9" fill="#0b0d14"/>' +
    '<circle cx="16" cy="16" r="9" fill="none" stroke="#6366f1" stroke-width="3" opacity=".55"/>' +
    '<path d="M16 7a9 9 0 0 1 9 9" fill="none" stroke="#c6ff3d" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="16" cy="16" r="2.6" fill="#c6ff3d"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var page = (location.pathname.split('/').pop() || 'index.html');

  function cur(href) { return page === href ? ' aria-current="page"' : ''; }

  function header(layout) {
    var nav;
    if (layout === 'app') {
      nav = '<nav class="nav" id="nav" aria-label="Account">' +
        '<a href="index.html">Marketing site</a>' +
        '<a class="btn btn-ghost btn-sm" href="index.html">Log out</a></nav>';
    } else {
      nav = '<nav class="nav" id="nav" aria-label="Main">' +
        '<a href="checker-result.html"' + cur('checker-result.html') + '>Free checker</a>' +
        '<a href="pricing.html"' + cur('pricing.html') + '>Pricing</a>' +
        '<a href="dashboard.html">Log in</a>' +
        '<a class="btn btn-primary btn-sm" href="signup.html?plan=trial">Start free</a></nav>';
    }
    var tabs = '';
    if (layout === 'app') {
      tabs = '<div class="wrap"><nav class="app-tabs" aria-label="App">' +
        '<a href="dashboard.html"' + cur('dashboard.html') + '>Dashboard</a>' +
        '<a href="crawl-index.html"' + cur('crawl-index.html') + '>Crawl &amp; index</a>' +
        '<a href="sites.html"' + cur('sites.html') + '>Sites</a>' +
        '<a href="first-run.html"' + cur('first-run.html') + '>First run</a></nav></div>';
    }
    return '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="wrap bar">' +
      '<a class="logo" href="index.html" aria-label="GoogleIndexing.com home">' + LOGO +
      '<span class="wm"><b>Google</b><strong>Indexing</strong><i>.com</i></span></a>' +
      nav +
      '<button class="icon-btn" id="theme-toggle" type="button" aria-pressed="false">' + SUN + '</button>' +
      '<button class="icon-btn menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu">' + MENU + '</button>' +
      '</div>' + tabs + '</header>';
  }

  function footer() {
    return '<footer class="site-footer"><div class="wrap foot-grid">' +
      '<div><a class="logo" href="index.html" aria-label="GoogleIndexing.com home">' + LOGO +
      '<span class="wm"><b>Google</b><strong>Indexing</strong><i>.com</i></span></a>' +
      '<p class="disclaimer" style="margin-top:14px">GoogleIndexing.com is an independent service that automates Google\'s publicly documented Indexing API. We are not affiliated with or endorsed by Google LLC. Google is a trademark of Google LLC.</p></div>' +
      '<div><h4>Product</h4><ul>' +
      '<li><a href="pricing.html">Pricing</a></li>' +
      '<li><a href="checker-result.html">Free indexability checker</a></li>' +
      '<li><a href="/terms">Terms of Service</a></li>' +
      '<li><a href="/privacy">Privacy Policy</a></li></ul></div>' +
      '<div><h4>Mockup pages</h4><ul>' +
      '<li><a href="index.html">Home</a></li><li><a href="signup.html?plan=trial">Signup</a></li>' +
      '<li><a href="dashboard.html">Dashboard</a></li><li><a href="crawl-index.html">Crawl &amp; index</a></li>' +
      '<li><a href="sites.html">Sites</a></li><li><a href="first-run.html">First run</a></li></ul></div>' +
      '</div></footer>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var layout = document.body.getAttribute('data-layout') || 'marketing';
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) h.outerHTML = header(layout);
    if (f) f.outerHTML = footer();
    setTheme(root.getAttribute('data-theme'));

    var tb = document.getElementById('theme-toggle');
    if (tb) tb.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
    var mb = document.getElementById('menu-btn'), nav = document.getElementById('nav');
    if (mb && nav) mb.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    initPipeline();
    initPlanChip();
    initFilters();
    initFirstRun();
  });

  /* ---- hero pipeline: example URL rows flip Queued -> Submitted -> Indexed ---- */
  var STATES = [
    { k: 'queued', t: 'Queued' },
    { k: 'submitted', t: 'Submitted' },
    { k: 'indexed', t: 'Indexed' }
  ];
  function initPipeline() {
    var box = document.getElementById('pipe-rows');
    if (!box) return;
    var paths = ['/blog/crawl-budget-guide', '/products/blue-widget', '/docs/getting-started', '/blog/robots-txt-mistakes',
      '/products/red-widget', '/pricing-faq', '/blog/canonical-tags', '/case/launch-checklist', '/products/green-widget'];
    var host = 'example.com';
    var rows = [], next = 6, i;
    var init = [2, 2, 1, 1, 0, 0];
    for (i = 0; i < 6; i++) rows.push({ path: paths[i], s: reduce ? init[i] : [2, 1, 1, 0, 0, 0][i] });
    var ring = document.getElementById('ring-val'), num = document.getElementById('ring-num');
    var C = 2 * Math.PI * 46;
    box.innerHTML = '';
    var els = rows.map(function (r) {
      var d = document.createElement('div'); d.className = 'prow';
      d.innerHTML = '<span class="url"></span><span class="st"></span>';
      box.appendChild(d); return d;
    });
    function paint(idx, flip) {
      var r = rows[idx], e = els[idx], s = STATES[r.s];
      e.querySelector('.url').textContent = host + r.path;
      var st = e.querySelector('.st'); st.className = 'st st-' + s.k; st.textContent = s.t;
      if (flip) { e.classList.remove('flip'); void e.offsetWidth; e.classList.add('flip'); }
    }
    function update() {
      var n = rows.filter(function (r) { return r.s === 2; }).length;
      var pct = Math.round(n / rows.length * 100);
      if (ring) { ring.setAttribute('stroke-dasharray', C.toFixed(1)); ring.setAttribute('stroke-dashoffset', (C * (1 - pct / 100)).toFixed(1)); }
      if (num) num.textContent = pct + '%';
      var sub = document.getElementById('ring-sub');
      if (sub) sub.textContent = n + ' of ' + rows.length + ' indexed';
    }
    for (i = 0; i < rows.length; i++) paint(i, false);
    update();
    if (reduce) return; /* static final state, no motion */
    var cursor = 0;
    setInterval(function () {
      var tries = rows.length;
      while (tries--) {
        var r = rows[cursor % rows.length];
        var idx = cursor % rows.length; cursor++;
        if (r.s < 2) { r.s++; paint(idx, true); break; }
        if (Math.random() < .35) { r.path = paths[next++ % paths.length]; r.s = 0; paint(idx, true); break; }
      }
      update();
    }, 1500);
  }

  /* ---- signup: show plan from ?plan= ---- */
  function initPlanChip() {
    var c = document.getElementById('plan-chip');
    if (!c) return;
    var p = 'trial';
    try { p = new URLSearchParams(location.search).get('plan') || 'trial'; } catch (e) {}
    c.textContent = 'plan=' + p.replace(/[^a-z0-9-]/gi, '');
  }

  /* ---- crawl-index: status filter chips ---- */
  function initFilters() {
    var f = document.getElementById('filters');
    if (!f) return;
    var rows = document.querySelectorAll('#url-table tbody tr');
    f.addEventListener('click', function (e) {
      var b = e.target.closest('button.filter'); if (!b) return;
      f.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var k = b.getAttribute('data-k');
      rows.forEach(function (r) { r.hidden = !(k === 'all' || r.getAttribute('data-k') === k); });
      var c = document.getElementById('filter-count');
      if (c) c.textContent = document.querySelectorAll('#url-table tbody tr:not([hidden])').length + ' URLs shown';
    });
  }

  /* ---- first-run stepper ---- */
  function initFirstRun() {
    var list = document.getElementById('stepper');
    if (!list) return;
    var items = list.querySelectorAll('li');
    list.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-next]'); if (!b) return;
      var li = b.closest('li'), idx = Array.prototype.indexOf.call(items, li);
      li.classList.remove('active'); li.classList.add('done');
      b.disabled = true;
      if (items[idx + 1]) { items[idx + 1].classList.add('active'); }
      else { var w = document.getElementById('win'); if (w) { w.classList.add('show'); w.setAttribute('tabindex', '-1'); w.focus(); } }
    });
  }
})();

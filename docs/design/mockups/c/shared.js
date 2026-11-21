/* Mockup C shared behaviour. No network requests, no animation. */
(function () {
  'use strict';

  var page = (location.pathname.split('/').pop() || 'index.html');

  // Logo mark: same drawing as logo.svg (favicon). Two colours: accent and white.
  var MARK = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
    '<rect width="32" height="32" rx="8" fill="#1f5fbf"/>' +
    '<path d="M9 6h10l5 5v15H9z" fill="#fff"/>' +
    '<path d="M19 6v5h5" fill="none" stroke="#1f5fbf" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M12.5 18l3 3 5-6" fill="none" stroke="#1f5fbf" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var LOGO = function (href) { return '<a class="logo" href="' + href + '">' + MARK + 'GoogleIndexing.com</a>'; };

  function marketingHeader(showStart) {
    var cur = function (f) { return page === f ? ' aria-current="page"' : ''; };
    return '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="wrap">' +
      LOGO('index.html') +
      '<button class="btn btn-secondary menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
      '<nav class="nav" id="site-nav" aria-label="Main">' +
      '<a href="index.html#how-it-works">How it works</a>' +
      '<a href="pricing.html"' + cur('pricing.html') + '>Pricing</a>' +
      '<a href="signup.html">Sign in</a>' +
      (showStart ? '<a class="btn btn-secondary" href="signup.html?plan=trial">Start free</a>' : '') +
      '</nav></div></header>';
  }

  function appHeader() {
    return '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="wrap" style="max-width:none">' +
      LOGO('dashboard.html') +
      '<nav class="nav" style="display:flex;position:static;flex-direction:row;padding:0;border:0" aria-label="Account">' +
      '<a href="index.html">Sign out</a></nav>' +
      '</div></header>';
  }

  function appNav() {
    var items = [['dashboard.html', 'Dashboard'], ['crawl-index.html', 'Crawl & index'], ['sites.html', 'Sites'], ['first-run.html', 'Get started']];
    return items.map(function (i) {
      return '<a href="' + i[0] + '"' + (page === i[0] ? ' aria-current="page"' : '') + '>' + i[1].replace('&', '&amp;') + '</a>';
    }).join('');
  }

  var FOOTER =
    '<footer class="site-footer"><div class="wrap">' + LOGO('index.html') +
    '<nav aria-label="Footer"><a href="pricing.html">Pricing</a><a href="checker-result.html">Free indexability checker</a><a href="#">Terms of Service</a><a href="#">Privacy Policy</a></nav>' +
    '<p>Google officially supports the Indexing API only for pages with JobPosting or BroadcastEvent structured data. For other pages a submission asks Google to crawl sooner but cannot guarantee indexing.</p>' +
    '<p>GoogleIndexing.com is an independent service that automates Google\'s publicly documented Indexing API. We are not affiliated with or endorsed by Google LLC. Google is a trademark of Google LLC.</p>' +
    '</div></footer>';

  document.addEventListener('DOMContentLoaded', function () {
    var h = document.getElementById('site-header');
    if (h) h.outerHTML = h.dataset.kind === 'app' ? appHeader() : marketingHeader(h.dataset.start !== 'no');
    var f = document.getElementById('site-footer');
    if (f) f.outerHTML = FOOTER;
    var n = document.getElementById('app-nav');
    if (n) n.innerHTML = appNav();

    // Mobile menu
    var mb = document.querySelector('.menu-btn');
    if (mb) mb.addEventListener('click', function () {
      var nav = document.getElementById('site-nav');
      var open = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', String(open));
    });

    // Crawl & index: filter + selection
    var seg = document.getElementById('filters');
    var table = document.getElementById('url-table');
    if (seg && table) {
      var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
      var count = document.getElementById('filter-count');
      var selCount = document.getElementById('sel-count');
      var submit = document.getElementById('submit-selected');
      var clearSel = function () {
        rows.forEach(function (r) { var c = r.querySelector('input[type=checkbox]'); if (c) c.checked = false; });
        updateSel();
      };
      var updateSel = function () {
        var n = table.querySelectorAll('tbody input[type=checkbox]:checked').length;
        selCount.textContent = n ? n + ' selected' : 'None selected';
        submit.disabled = n === 0;
        submit.className = n ? 'btn btn-primary' : 'btn';
      };
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var k = b.dataset.k, shown = 0;
        rows.forEach(function (r) { var on = k === 'all' || r.dataset.k === k; r.hidden = !on; if (on) shown++; });
        count.textContent = shown + (shown === 1 ? ' URL' : ' URLs');
        clearSel(); // selection never carries over to a different set of rows
      });
      table.addEventListener('change', updateSel);
      updateSel();
    }

    // First run: stepper
    var stepper = document.getElementById('stepper');
    if (stepper) {
      stepper.addEventListener('click', function (e) {
        var b = e.target.closest('[data-next]'); if (!b) return;
        var li = b.closest('li'); li.classList.remove('active'); li.classList.add('done');
        var next = li.nextElementSibling;
        if (next) { next.classList.add('active'); var nb = next.querySelector('.btn'); if (nb) nb.focus(); }
        else { var w = document.getElementById('win'); w.hidden = false; w.querySelector('h2').focus(); }
      });
    }
  });
})();

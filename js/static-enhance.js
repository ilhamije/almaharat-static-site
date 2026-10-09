/* Replaces the behaviour Blazor Server provided on the original site (reveal on scroll,
   counters, hero rotation) so the exported static pages work without a live connection. */
(function () {
  // Drop any service worker left over from the previous version of the site.
  if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {}); }

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile column count for the brand grid
  document.querySelectorAll('[data-mobile-cols]').forEach(function (el) {
    el.style.setProperty('--mil-mobile-cols', el.getAttribute('data-mobile-cols'));
  });

  // Reveal sections as they scroll into view
  var fades = document.querySelectorAll('.ys-scroll-fade');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('ys-visible'); e.target.classList.remove('ys-hidden'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    fades.forEach(function (el) { io.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add('ys-visible'); });
  }

  // Count-up numbers
  function format(n) { return n.toLocaleString('en-US'); }
  function count(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    if (reduce) { el.textContent = format(target); return; }
    var start = null, dur = 1800;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = format(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.counter[data-target]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = format(parseFloat(el.getAttribute('data-target')) || 0); });
  }

  // Hero slideshow
  document.querySelectorAll('.ys-hero-carousel').forEach(function (hero) {
    var slides = hero.querySelectorAll('.ys-hero-slide');
    var secs = parseFloat(hero.getAttribute('data-autoplay')) || 0;
    if (slides.length < 2 || !secs || reduce) return;
    var i = 0;
    for (var k = 0; k < slides.length; k++) if (slides[k].classList.contains('active')) i = k;
    setInterval(function () {
      slides[i].classList.remove('active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('active');
    }, secs * 1000);
  });

  var isAr = document.documentElement.lang === 'ar' || location.pathname.indexOf('/ar/') === 0 || location.pathname === '/ar';
  var lang = isAr ? 'ar' : 'en';

  // Header turns solid white on scroll or while the products menu is open
  var header = document.querySelector('header.win-header');
  var menuOpen = false;
  function syncHeader() {
    if (!header) return;
    var solid = menuOpen || (window.pageYOffset || document.documentElement.scrollTop) > 50;
    header.classList.toggle('solid', solid);
    var logo = header.querySelector('img.mega-logo');
    if (logo) logo.setAttribute('src', solid ? '/IconLibrary/Logo-12.PNG' : '/IconLibrary/LogoWhite-39.PNG');
  }
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  // "Our Products" dropdown with category preview image
  (function () {
    var data = window.__MENU && window.__MENU[lang];
    var wrapper = document.querySelector('.mega-menu-wrapper');
    if (!data || !data.length || !wrapper) return;
    var link = document.querySelector('.menu-level-1 a[href*="our-products"]');
    var li = link && link.closest('li.top-item');
    if (!li) return;
    var scope = Array.prototype.filter.call(wrapper.attributes, function (a) { return a.name.indexOf('b-') === 0; })[0];
    function el(tag, cls, attrs) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (scope) e.setAttribute(scope.name, '');
      for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
      return e;
    }
    var panel = null, closeTimer = null;
    function build() {
      var p = el('div', 'mega-menu-panel');
      var c = el('div', 'container'), inner = el('div', 'mega-menu-inner'), cols = el('div', 'mega-menu-columns');
      var colEls = [el('div', 'mega-menu-col links-col'), el('div', 'mega-menu-col links-col'), el('div', 'mega-menu-col links-col')];
      var prevCol = el('div', 'mega-menu-col preview-col');
      var card = el('a', 'preview-card', { href: data[0].href });
      var img = el('img', 'preview-image', { src: data[0].img, alt: data[0].alt });
      card.appendChild(img); prevCol.appendChild(card);
      var links = data.map(function (it, i) {
        var a = el('a', 'mega-link' + (i === 0 ? ' hovered' : ''), { href: it.href });
        var sp = el('span'); sp.textContent = it.label; a.appendChild(sp);
        a.addEventListener('mouseenter', function () {
          links.forEach(function (x) { x.classList.remove('hovered'); });
          a.classList.add('hovered');
          img.setAttribute('src', it.img); img.setAttribute('alt', it.alt); card.setAttribute('href', it.href);
        });
        (colEls[Math.min(it.col || 0, 2)]).appendChild(a);
        return a;
      });
      colEls.forEach(function (c2) { cols.appendChild(c2); });
      cols.appendChild(prevCol); inner.appendChild(cols); c.appendChild(inner); p.appendChild(c);
      return p;
    }
    function open() {
      clearTimeout(closeTimer);
      if (panel) return;
      panel = build(); li.appendChild(panel); li.classList.add('active'); menuOpen = true; syncHeader();
    }
    function close() {
      closeTimer = setTimeout(function () {
        if (panel) { panel.remove(); panel = null; }
        li.classList.remove('active'); menuOpen = false; syncHeader();
      }, 120);
    }
    li.addEventListener('mouseenter', open);
    li.addEventListener('mouseleave', close);
    li.addEventListener('focusin', open);
    li.addEventListener('focusout', close);
  })();

  // Language picker (English / Arabic) linking the two static versions
  (function () {
    var icon = document.querySelector('img.language-icon');
    if (!icon) return;
    var T = isAr
      ? { title: 'اللغة', en: 'الإنجليزية', ar: 'العربية', ok: 'موافق' }
      : { title: 'Language', en: 'English', ar: 'Arabic', ok: 'OK' };
    var css = document.createElement('style');
    css.textContent =
      '.lp-back{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;display:none}' +
      '.lp-panel{position:fixed;top:0;bottom:0;' + (isAr ? 'left:0' : 'right:0') + ';width:min(400px,92vw);background:#fff;z-index:2001;padding:28px 24px;box-shadow:0 0 30px rgba(0,0,0,.25);display:none;direction:' + (isAr ? 'rtl' : 'ltr') + ';font-family:var(--ys-DefaultFont,sans-serif)}' +
      '.lp-panel h3{margin:0 0 16px;font-size:1.4rem}' +
      '.lp-list{list-style:none;padding:0;margin:0}' +
      '.lp-item{padding:12px 16px;margin:8px 0;border:1px solid #ddd;border-radius:8px;background:#f9f9f9;cursor:pointer;display:flex;align-items:center;gap:10px;transition:all .25s}' +
      '.lp-item:hover{background:#e9f5ff;border-color:#b8daff}' +
      '.lp-item.selected{background:#d1e7ff;border-color:#86b7fe;font-weight:700}' +
      '.lp-ok{margin-top:18px;width:100%;padding:12px;border:0;border-radius:8px;background:#0d6efd;color:#fff;font-size:1rem;cursor:pointer}' +
      '.lp-open .lp-back,.lp-open .lp-panel{display:block}';
    document.head.appendChild(css);
    var back = document.createElement('div'); back.className = 'lp-back';
    var panel = document.createElement('div'); panel.className = 'lp-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
    var choice = lang;
    panel.innerHTML = '<h3></h3><ul class="lp-list"></ul><button type="button" class="lp-ok"></button>';
    panel.querySelector('h3').textContent = T.title;
    panel.querySelector('.lp-ok').textContent = T.ok;
    var list = panel.querySelector('.lp-list');
    [['en', T.en], ['ar', T.ar]].forEach(function (o) {
      var item = document.createElement('li'); item.className = 'lp-item' + (o[0] === choice ? ' selected' : ''); item.dataset.l = o[0];
      item.innerHTML = '<input type="radio" name="lp"' + (o[0] === choice ? ' checked' : '') + '> <span></span>';
      item.querySelector('span').textContent = o[1];
      item.addEventListener('click', function () {
        choice = o[0];
        list.querySelectorAll('.lp-item').forEach(function (x) { x.classList.toggle('selected', x.dataset.l === choice); x.querySelector('input').checked = x.dataset.l === choice; });
      });
      list.appendChild(item);
    });
    document.body.appendChild(back); document.body.appendChild(panel);
    function show(on) { document.documentElement.classList.toggle('lp-open', on); }
    icon.style.cursor = 'pointer';
    icon.addEventListener('click', function () { choice = lang; show(true); });
    back.addEventListener('click', function () { show(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') show(false); });
    panel.querySelector('.lp-ok').addEventListener('click', function () {
      if (choice === lang) { show(false); return; }
      var path = location.pathname.replace(/^\/ar(\/|$)/, '/');
      var target = choice === 'ar' ? (path === '/' ? '/ar/' : '/ar' + path) : path;
      location.href = target + location.hash;
    });
  })();
})();

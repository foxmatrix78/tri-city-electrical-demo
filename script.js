/* ============================================================
   RAPIDFLOW PLUMBING & DRAIN — Shared Script
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Active nav link ───────────────────────────────────── */
  (function setActive() {
    const path = window.location.pathname
      .replace(/index\.html$/, '')
      .replace(/\/$/, '');
    document.querySelectorAll('.nav__link').forEach(a => {
      const href = a.getAttribute('href')
        .replace(/index\.html$/, '')
        .replace(/\/$/, '');
      if (href === path || (path.endsWith(href) && href !== '')) {
        a.classList.add('active');
      }
    });
  })();

  /* ── Mobile nav ─────────────────────────────────────────── */
  (function mobileNav() {
    const toggle = document.getElementById('navToggle');
    const nav    = document.getElementById('nav');
    if (!toggle || !nav) return;

    // Remember nav's original DOM position so we can return it on close
    const navParent = nav.parentNode;
    const navNextSib = nav.nextSibling;

    const close = () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      // Return nav to its original position in the header
      if (nav.parentNode === document.body) {
        navParent.insertBefore(nav, navNextSib);
      }
    };

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('open');
      if (isOpen) { close(); return; }

      // Teleport nav to <body> so it escapes sticky header stacking context
      // This fixes iOS Safari's fixed-inside-sticky clipping bug
      document.body.appendChild(nav);

      // Measure actual offset of topbar + header before opening
      const hdr    = document.getElementById('header');
      const topbar = document.querySelector('.topbar');
      const topbarBottom = topbar ? topbar.getBoundingClientRect().bottom : 0;
      const hdrBottom    = hdr   ? hdr.getBoundingClientRect().bottom    : 68;
      const offset = Math.max(topbarBottom, hdrBottom);
      nav.style.paddingTop = (offset + 12) + 'px';

      // Trigger open state after appending to body
      requestAnimationFrame(() => {
        nav.classList.add('open');
        toggle.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      });
    });

    nav.querySelectorAll('.nav__link').forEach(a => a.addEventListener('click', close));

    document.addEventListener('click', e => {
      if (nav.classList.contains('open') &&
          !nav.contains(e.target) &&
          !toggle.contains(e.target)) close();
    });
  })();

  /* ── Header shadow ──────────────────────────────────────── */
  (function headerShadow() {
    const h = document.getElementById('header');
    if (!h) return;
    const check = () => h.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', check, { passive: true });
    check();
  })();

  /* ── Mobile sticky bar ──────────────────────────────────── */
  (function mobBar() {
    const bar = document.getElementById('mobBar');
    if (!bar || window.innerWidth > 820) return;
    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      bar.classList.add('visible');
      window.removeEventListener('scroll', show, { passive: true });
    };
    window.addEventListener('scroll', show, { passive: true });
    setTimeout(show, 700);
  })();

  /* ── Scroll reveal ──────────────────────────────────────── */
  (function reveal() {
    if (prefersReduced()) {
      document.querySelectorAll('.sr').forEach(el => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.sr').forEach(el => io.observe(el));
  })();

  /* ── FAQ accordion ──────────────────────────────────────── */
  (function faq() {
    const list = document.getElementById('faqList');
    if (!list) return;
    list.addEventListener('click', e => {
      const btn  = e.target.closest('.faq-trigger');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const open = item.classList.contains('open');
      list.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!open) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  })();

  /* ── Contact form ───────────────────────────────────────── */
  (function form() {
    const f   = document.getElementById('contactForm');
    const btn = document.getElementById('formSubmit');
    if (!f || !btn) return;
    const orig = btn.innerHTML;

    f.querySelectorAll('.form-input').forEach(el => {
      el.addEventListener('blur', () => {
        el.style.borderColor = el.value.trim() ? 'var(--green)' : 'var(--ink-100)';
        el.style.boxShadow   = '';
      });
    });

    f.addEventListener('submit', async e => {
      e.preventDefault();
      const name  = f.querySelector('[name="name"]');
      const phone = f.querySelector('[name="phone"]');
      let ok = true;
      [name, phone].forEach(el => {
        if (!el || !el.value.trim()) { if (el) el.style.borderColor = 'var(--red)'; ok = false; }
      });
      if (!ok) { if (name) name.focus(); return; }

      btn.disabled = true; btn.style.opacity = '.7'; btn.innerHTML = 'Sending…';
      await new Promise(r => setTimeout(r, 1200));

      btn.disabled = false; btn.style.opacity = '1';
      btn.style.background = 'var(--green)';
      btn.style.boxShadow  = '0 6px 20px rgba(16,185,129,.3)';
      btn.innerHTML = '&#10003; Sent — We\'ll call you shortly';
      f.reset();
      f.querySelectorAll('.form-input').forEach(el => { el.style.borderColor = 'var(--ink-100)'; el.style.boxShadow = ''; });
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.boxShadow = ''; }, 5000);
    });
  })();

  /* ── Animated counters ──────────────────────────────────── */
  (function counters() {
    if (prefersReduced()) return;
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let done = false;
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || done) return;
        done = true; io.disconnect();
        let start = null;
        const step = ts => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1800, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * target).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.3 });
      io.observe(el);
    });
  })();

})();

/**
 * Site-wide progressive enhancement: mobile navigation, FAQ accordion,
 * scroll reveal, sticky mobile CTA visibility, and footer year.
 *
 * Everything here is small and self-contained on purpose: the site works
 * (links, forms, content) without any of it running.
 */
(function () {
  'use strict';
  document.documentElement.classList.add('js-enabled');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------- */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      menu.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    }

    function openMenu() {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      menu.classList.add('is-open');
      document.body.classList.add('nav-open');
      const firstLink = menu.querySelector('a, button');
      if (firstLink) firstLink.focus();
    }

    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        toggle.focus();
      }
    });

    // Keep in sync with the nav breakpoint in css/styles.css.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1140) closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
     ------------------------------------------------------------------- */
  function initFaq() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      const button = item.querySelector('.faq-question');
      const panel = item.querySelector('.faq-answer');
      if (!button || !panel) return;
      panel.hidden = true;

      button.addEventListener('click', function () {
        const isOpen = item.classList.contains('is-open');
        item.classList.toggle('is-open', !isOpen);
        button.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal (skipped entirely for reduced-motion users)
     ------------------------------------------------------------------- */
  function initReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Sticky mobile "Book" CTA: appears once the hero has been scrolled
     past, so it never competes with the primary hero CTAs.
     ------------------------------------------------------------------- */
  function initStickyCta() {
    const bar = document.querySelector('.sticky-cta');
    const hero = document.querySelector('.hero, .page-hero');
    if (!bar || !hero) return;

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle('is-visible', !entry.isIntersecting);
        document.body.classList.toggle('has-sticky-cta', !entry.isIntersecting);
      });
    }, { threshold: 0 });

    observer.observe(hero);
  }

  /* ---------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------- */
  function initFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initFaq();
    initReveal();
    initStickyCta();
    initFooterYear();
  });
})();

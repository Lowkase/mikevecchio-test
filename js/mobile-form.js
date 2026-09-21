/**
 * Mobile RMT enquiry form: validation, accessible error handling,
 * loading/success states, and a swappable submission adapter.
 *
 * SUBMISSION ADAPTER
 * -------------------
 * `submitMobileRequest(payload)` is the only function that talks to a
 * backend. Right now it does not send data anywhere — replace its body to
 * connect a real service. Two common options:
 *
 *   Formspree:
 *     return fetch('https://formspree.io/f/YOUR_FORM_ID', {
 *       method: 'POST',
 *       headers: { Accept: 'application/json' },
 *       body: new FormData(formEl),
 *     });
 *
 *   Netlify Forms (requires a hidden static form + `data-netlify="true"` on
 *   this <form>, and a `form-name` hidden field):
 *     return fetch('/', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
 *       body: new URLSearchParams(payload).toString(),
 *     });
 *
 *   A custom serverless endpoint:
 *     return fetch('/api/mobile-request', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(payload),
 *     });
 *
 * SPAM PREVENTION
 * -----------------
 * - A honeypot field (`website`) is hidden from sighted users via CSS and
 *   from screen readers via `aria-hidden`/`tabindex="-1"`. Real visitors
 *   never fill it in; bots often do. Submissions with it filled are
 *   silently dropped.
 * - A minimum time-on-page check discards near-instant submissions, which
 *   are almost always automated.
 * - When a real backend is connected, pair this with a server-side check
 *   (and/or a provider's built-in spam filtering, e.g. Formspree's) —
 *   client-side checks alone are not sufficient.
 */
(function () {
  'use strict';

  const FORM_ID = 'mobile-request-form';
  const MIN_SECONDS_BEFORE_SUBMIT = 3;

  function submitMobileRequest(payload) {
    // No backend connected yet. Simulate a network call so the UI can be
    // fully exercised end-to-end. Replace with one of the adapters above.
    return new Promise(function (resolve) {
      window.setTimeout(function () { resolve({ ok: true }); }, 900);
    });
  }

  function initMobileForm() {
    const form = document.getElementById(FORM_ID);
    if (!form) return;

    // The status banner is a sibling of the form in the markup (so it can
    // sit above it visually), not a descendant — look it up from the page.
    const statusEl = document.querySelector('.form-status');
    const successEl = document.getElementById('mobile-form-success');
    const submitBtn = form.querySelector('button[type="submit"]');
    const loadedAt = Date.now();
    let started = false;

    const validators = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please enter your name.'; },
      email: function (v) {
        if (!v.trim()) return 'Please enter your email.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address.';
      },
      phone: function (v) { return v.trim().length >= 7 ? '' : 'Please enter a phone number we can reach you at.'; },
      location: function (v) { return v.trim().length > 2 ? '' : 'Please enter your general location or postal code.'; },
      people: function (v) { return v ? '' : 'Please choose the number of people.'; },
      preferred_time: function (v) { return v.trim().length > 1 ? '' : 'Let Mike know roughly when works for you.'; },
      message: function () { return ''; } // optional
    };

    function fieldWrap(input) { return input.closest('.form-field'); }

    function setError(input, message) {
      const wrap = fieldWrap(input);
      if (!wrap) return;
      const errorEl = wrap.querySelector('.error-message');
      wrap.classList.toggle('has-error', Boolean(message));
      if (errorEl) errorEl.textContent = message;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validateField(input) {
      const validator = validators[input.name];
      if (!validator) return true;
      const message = validator(input.value);
      setError(input, message);
      return !message;
    }

    function validateAll() {
      let valid = true;
      Object.keys(validators).forEach(function (name) {
        const input = form.elements.namedItem(name);
        if (!input) return;
        if (!validateField(input)) valid = false;
      });
      return valid;
    }

    Object.keys(validators).forEach(function (name) {
      const input = form.elements.namedItem(name);
      if (!input) return;
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if (!started) {
          started = true;
          if (window.mvAnalytics) window.mvAnalytics.track('mobile_form_start', { page: window.location.pathname });
        }
        if (fieldWrap(input) && fieldWrap(input).classList.contains('has-error')) validateField(input);
      });
    });

    function showStatus(message, type) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = 'form-status is-visible form-status--' + type;
    }

    function setLoading(isLoading) {
      if (!submitBtn) return;
      submitBtn.disabled = isLoading;
      submitBtn.setAttribute('data-loading', String(isLoading));
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Honeypot: if filled, pretend to succeed and stop — don't tip off bots.
      const honeypot = form.elements.namedItem('website');
      if (honeypot && honeypot.value) {
        form.reset();
        return;
      }

      // Basic timing check.
      const elapsedSeconds = (Date.now() - loadedAt) / 1000;
      if (elapsedSeconds < MIN_SECONDS_BEFORE_SUBMIT) {
        showStatus('Please take a moment to review your request, then submit again.', 'error');
        return;
      }

      if (!validateAll()) {
        showStatus('Please fix the highlighted fields and try again.', 'error');
        const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      const payload = {
        name: form.elements.namedItem('name').value.trim(),
        email: form.elements.namedItem('email').value.trim(),
        phone: form.elements.namedItem('phone').value.trim(),
        location: form.elements.namedItem('location').value.trim(),
        people: form.elements.namedItem('people').value,
        preferred_time: form.elements.namedItem('preferred_time').value.trim(),
        message: form.elements.namedItem('message').value.trim(),
        page: window.location.pathname
      };

      setLoading(true);
      statusEl && statusEl.classList.remove('is-visible');

      submitMobileRequest(payload)
        .then(function () {
          setLoading(false);
          form.hidden = true;
          if (successEl) {
            successEl.classList.add('is-visible');
            successEl.setAttribute('tabindex', '-1');
            successEl.focus();
          }
          if (window.mvAnalytics) window.mvAnalytics.track('mobile_form_submit', { page: window.location.pathname, people: payload.people });
        })
        .catch(function () {
          setLoading(false);
          showStatus('Something went wrong sending your request. Please call or text 519-859-1419 instead.', 'error');
        });
    });
  }

  document.addEventListener('DOMContentLoaded', initMobileForm);
})();

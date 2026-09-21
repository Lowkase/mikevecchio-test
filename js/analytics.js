/**
 * Lightweight analytics abstraction.
 *
 * This does NOT load any third-party analytics script. It gives the rest of
 * the site a single `track(eventName, data)` function to call, and queues
 * events on `window.__mvAnalyticsQueue` until a real provider is wired up.
 *
 * To connect GA4 (or any other tool) later:
 *   1. Load the provider's script (e.g. gtag.js) in the page <head>.
 *   2. Replace `dispatch()` below with a call into that provider, e.g.:
 *        function dispatch(name, data) { gtag('event', name, data); }
 *   3. Optionally flush `window.__mvAnalyticsQueue` on load so events fired
 *      before the provider was ready are not lost.
 *
 * Event names used across the site (see README for the full table):
 *   booking_click, mobile_service_view, mobile_cta_click,
 *   mobile_form_start, mobile_form_submit, phone_click, email_click,
 *   facility_cta_click
 *
 * Do not pass medical or otherwise sensitive personal information as event
 * data — location text, names, etc. from the mobile enquiry form are never
 * sent to analytics.
 */
(function (window) {
  'use strict';

  window.__mvAnalyticsQueue = window.__mvAnalyticsQueue || [];

  function dispatch(name, data) {
    // No analytics provider connected yet. Events are queued so nothing is
    // lost once one is. Swap this for a real provider call when ready.
    window.__mvAnalyticsQueue.push({ name: name, data: data || {}, at: Date.now() });

    if (window.location.search.indexOf('debug_analytics') !== -1) {
      // eslint-disable-next-line no-console
      console.info('[analytics]', name, data || {});
    }
  }

  function track(name, data) {
    if (!name) return;
    dispatch(name, data);
  }

  /**
   * Wires up automatic tracking for elements marked with
   * `data-analytics-event="event_name"`. Extra context can be supplied via
   * `data-analytics-*` attributes, e.g. `data-analytics-location="hero"`.
   */
  function bindAutoTracking(root) {
    (root || document).addEventListener('click', function (event) {
      const el = event.target.closest('[data-analytics-event]');
      if (!el) return;

      const name = el.getAttribute('data-analytics-event');
      const data = {};
      Array.prototype.forEach.call(el.attributes, function (attr) {
        const match = /^data-analytics-(?!event$)(.+)$/.exec(attr.name);
        if (match) data[match[1]] = attr.value;
      });
      data.page = window.location.pathname;
      track(name, data);
    });
  }

  window.mvAnalytics = { track: track, bindAutoTracking: bindAutoTracking };

  document.addEventListener('DOMContentLoaded', function () {
    bindAutoTracking(document);
  });
})(window);

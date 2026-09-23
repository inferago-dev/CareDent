/**
 * Google Analytics 4 (gtag.js) utilities
 * Measurement ID: G-T3NF4LYMH9
 */

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) ||
  'G-T3NF4LYMH9';

/**
 * Safely track a custom event in Google Analytics
 * @param {string} eventName
 * @param {Record<string, any>} [params]
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/**
 * Track lead generation event (e.g. quote request or contact inquiry)
 * @param {string} type
 * @param {Record<string, any>} [details]
 */
export function trackLead(type, details = {}) {
  trackEvent('generate_lead', {
    lead_type: type,
    ...details,
  });
}

/**
 * src/hooks/useAnalytics.js
 *
 * Central analytics hook — single source of truth for all tracking.
 * Works with Яндекс Метрика (window.ym) + optional future integrations.
 *
 * USAGE:
 *   const { track, goal, hit } = useAnalytics();
 *
 *   // Track a goal (conversion event):
 *   track('form_submit', { form: 'project', company: 'Acme' });
 *
 *   // Fire a Metrika goal:
 *   goal('CTA_CLICK_COMPANY');
 *
 *   // Manual page hit (for SPA route changes):
 *   hit('/company-path');
 */

import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// ── Яндекс Метрика counter ID ──────────────────────
// Replace XXXXXXXX with your real counter number from metrika.yandex.ru
const METRIKA_ID = window.__YM_COUNTER_ID__ || 'XXXXXXXX';

/**
 * Low-level ym() wrapper — safe to call even if script hasn't loaded yet.
 * Яндекс Метрика queues calls made before init completes.
 */
function ym(action, ...args) {
  if (typeof window !== 'undefined' && typeof window.ym === 'function') {
    window.ym(METRIKA_ID, action, ...args);
  } else {
    // Queue for when metrika loads (it processes window.ym.a array on init)
    window.ym = window.ym || function() {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym(METRIKA_ID, action, ...args);
  }
}

// ── Named Metrika goal constants ───────────────────
// Define all goal identifiers here — create matching goals in Metrika UI
export const GOALS = {
  // Navigation / engagement
  NAV_COMPANY:          'NAV_CLICK_COMPANY',
  NAV_STUDENT:          'NAV_CLICK_STUDENT',
  NAV_HOW_IT_WORKS:     'NAV_CLICK_HOW_IT_WORKS',

  // Hero CTA
  HERO_CTA_COMPANY:     'HERO_CTA_COMPANY',
  HERO_CTA_STUDENT:     'HERO_CTA_STUDENT',
  HERO_SCROLL_PROCESS:  'HERO_SCROLL_PROCESS',

  // Company path
  COMPANY_FORM_START:   'COMPANY_FORM_START',
  COMPANY_FORM_SUBMIT:  'COMPANY_FORM_SUBMIT',
  COMPANY_FORM_SUCCESS: 'COMPANY_FORM_SUCCESS',
  COMPANY_FORM_ERROR:   'COMPANY_FORM_ERROR',

  // Student path
  STUDENT_FORM_START:   'STUDENT_FORM_START',
  STUDENT_FORM_SUBMIT:  'STUDENT_FORM_SUBMIT',
  STUDENT_FORM_SUCCESS: 'STUDENT_FORM_SUCCESS',

  // Contact page
  CONTACT_FORM_SUBMIT:  'CONTACT_FORM_SUBMIT',
  CONTACT_FORM_SUCCESS: 'CONTACT_FORM_SUCCESS',
  CONTACT_CHANNEL_CLICK:'CONTACT_CHANNEL_CLICK',

  // Subscribe
  SUBSCRIBE_SUBMIT:     'SUBSCRIBE_SUBMIT',
  SUBSCRIBE_SUCCESS:    'SUBSCRIBE_SUCCESS',

  // Messenger / external links
  OPEN_MAX_CHANNEL:     'OPEN_MAX_CHANNEL',
  OPEN_VK_GROUP:        'OPEN_VK_GROUP',
  OPEN_TELEGRAM:        'OPEN_TELEGRAM',
  EMAIL_CLICK:          'EMAIL_CLICK',

  // FAQ / content engagement
  FAQ_OPEN:             'FAQ_OPEN',
  PROCESS_STEP_VIEW:    'PROCESS_STEP_VIEW',
  PRICING_VIEW:         'PRICING_VIEW',
};

/**
 * Main hook — use inside any component.
 */
export function useAnalytics() {
  const location = useLocation();

  /**
   * Fire a named Metrika goal.
   * Also creates the goal in Metrika UI: Цели → Добавить цель → JavaScript-событие
   * Identifier = the string you pass here.
   *
   * @param {string} goalName  — one of GOALS.* constants
   * @param {object} [params]  — optional parameters (shown in Metrika reports)
   */
  const goal = useCallback((goalName, params = {}) => {
    ym('reachGoal', goalName, params);

    if (import.meta.env.DEV) {
      console.log(`[Analytics] goal: ${goalName}`, params);
    }
  }, []);

  /**
   * Track a custom event with arbitrary parameters.
   * Uses Metrika's params() for detailed segmentation.
   *
   * @param {string} eventName — descriptive name
   * @param {object} [data]    — arbitrary key/value pairs
   */
  const track = useCallback((eventName, data = {}) => {
    ym('params', {
      event: eventName,
      page: location.pathname,
      timestamp: new Date().toISOString(),
      ...data,
    });

    if (import.meta.env.DEV) {
      console.log(`[Analytics] track: ${eventName}`, data);
    }
  }, [location.pathname]);

  /**
   * Fire a manual page hit (for SPA route changes if automatic tracking
   * isn't catching them — usually not needed with trackLinks: true).
   *
   * @param {string} [url] — defaults to current location
   * @param {string} [title] — page title
   * @param {string} [referer] — referer URL
   */
  const hit = useCallback((url, title, referer) => {
    ym('hit', url || location.pathname, {
      title: title || document.title,
      referer: referer || document.referrer,
    });

    if (import.meta.env.DEV) {
      console.log(`[Analytics] hit: ${url || location.pathname}`);
    }
  }, [location.pathname]);

  /**
   * Track an external link click (messenger, VK, Telegram, email).
   *
   * @param {string} channel  — 'max' | 'vk' | 'telegram' | 'email'
   * @param {string} href     — destination URL
   */
  const trackExternalLink = useCallback((channel, href) => {
    goal(GOALS.CONTACT_CHANNEL_CLICK, { channel });
    track('external_link_click', { channel, href });
  }, [goal, track]);

  /**
   * Track scroll depth milestones (25%, 50%, 75%, 100%).
   * Call once per page, typically in a useEffect.
   * Returns a cleanup function.
   *
   * @param {string} pageName — label for the current page
   */
  const trackScrollDepth = useCallback((pageName) => {
    const milestones = [25, 50, 75, 100];
    const reached = new Set();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);

      milestones.forEach((m) => {
        if (pct >= m && !reached.has(m)) {
          reached.add(m);
          track('scroll_depth', { page: pageName, depth: m });
          if (import.meta.env.DEV) {
            console.log(`[Analytics] scroll depth: ${m}% on ${pageName}`);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [track]);

  return { goal, track, hit, trackExternalLink, trackScrollDepth, GOALS };
}

/**
 * src/hooks/useAnalytics.js
 *
 * Central analytics hook — single source of truth for all tracking.
 * Works with Яндекс Метрика (window.ym) + optional future integrations.
 *
 * USAGE:
 *   const { track, goal, hit } = useAnalytics();
 *   track('form_submit', { form: 'project', company: 'Acme' });
 *   goal('CTA_CLICK_COMPANY');
 *   hit('/company-path');
 */

import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { COUNTER_ID, ANALYTICS_CONFIG } from '../config/analytics';

/**
 * Low-level ym() wrapper — safe to call even if script hasn't loaded yet.
 * Яндекс Метрика queues calls made before init completes.
 */
function ym(action, ...args) {
  if (typeof window === 'undefined') return;
  if (!COUNTER_ID || !ANALYTICS_CONFIG.enabled) return;

  if (typeof window.ym === 'function') {
    window.ym(COUNTER_ID, action, ...args);
    return;
  }

  // Queue calls if ym not loaded yet
  window.ym = window.ym || function() {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym(COUNTER_ID, action, ...args);
}

// ── Named Metrika goal constants ───────────────────
export const GOALS = {
  // Navigation / engagement
  NAV_COMPANY: 'NAV_CLICK_COMPANY',
  NAV_STUDENT: 'NAV_CLICK_STUDENT',
  NAV_HOW_IT_WORKS: 'NAV_CLICK_HOW_IT_WORKS',

  // Hero CTA
  HERO_CTA_COMPANY: 'HERO_CTA_COMPANY',
  HERO_CTA_STUDENT: 'HERO_CTA_STUDENT',
  HERO_SCROLL_PROCESS: 'HERO_SCROLL_PROCESS',

  // Company path
  COMPANY_FORM_START: 'COMPANY_FORM_START',
  COMPANY_FORM_SUBMIT: 'COMPANY_FORM_SUBMIT',
  COMPANY_FORM_SUCCESS: 'COMPANY_FORM_SUCCESS',
  COMPANY_FORM_ERROR: 'COMPANY_FORM_ERROR',

  // Student path
  STUDENT_FORM_START: 'STUDENT_FORM_START',
  STUDENT_FORM_SUBMIT: 'STUDENT_FORM_SUBMIT',
  STUDENT_FORM_SUCCESS: 'STUDENT_FORM_SUCCESS',

  // Contact page
  CONTACT_FORM_SUBMIT: 'CONTACT_FORM_SUBMIT',
  CONTACT_FORM_SUCCESS: 'CONTACT_FORM_SUCCESS',
  CONTACT_CHANNEL_CLICK: 'CONTACT_CHANNEL_CLICK',

  // Subscribe
  SUBSCRIBE_SUBMIT: 'SUBSCRIBE_SUBMIT',
  SUBSCRIBE_SUCCESS: 'SUBSCRIBE_SUCCESS',

  // Messenger / external links
  OPEN_MAX_CHANNEL: 'OPEN_MAX_CHANNEL',
  OPEN_VK_GROUP: 'OPEN_VK_GROUP',
  OPEN_TELEGRAM: 'OPEN_TELEGRAM',
  EMAIL_CLICK: 'EMAIL_CLICK',

  // FAQ / content engagement
  FAQ_OPEN: 'FAQ_OPEN',
  PROCESS_STEP_VIEW: 'PROCESS_STEP_VIEW',
  PRICING_VIEW: 'PRICING_VIEW',

  // Auto-capture events
  CTA_CLICK: 'cta_click',
  EXTERNAL_LINK_CLICK: 'external_link_click',
  NAVIGATION_CLICK: 'navigation_click',
  FORM_FIELD_FOCUS: 'form_field_focus',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',

  // Web Vitals
  WEB_VITAL_FCP: 'web-vital-fcp',
  WEB_VITAL_LCP: 'web-vital-lcp',
  WEB_VITAL_CLS: 'web-vital-cls',
  WEB_VITAL_FID: 'web-vital-fid',
};

/**
 * Main hook — use inside any component.
 */
export function useAnalytics() {
  const location = useLocation();

  const goal = useCallback((goalName, params = {}) => {
    if (!ANALYTICS_CONFIG.enabled) return;
    ym('reachGoal', goalName, params);
    if (ANALYTICS_CONFIG.isDev) {
      console.log(`[Analytics] goal: ${goalName}`, params);
    }
  }, []);

  const track = useCallback((eventName, data = {}) => {
    if (!ANALYTICS_CONFIG.enabled) return;
    ym('params', {
      event: eventName,
      page: location.pathname,
      timestamp: new Date().toISOString(),
      ...data,
    });
    if (ANALYTICS_CONFIG.isDev) {
      console.log(`[Analytics] track: ${eventName}`, data);
    }
  }, [location.pathname]);

  const hit = useCallback((url, title, referer) => {
    if (!ANALYTICS_CONFIG.enabled) return;
    ym('hit', url || location.pathname, {
      title: title || document.title,
      referer: referer || document.referrer,
    });
    if (ANALYTICS_CONFIG.isDev) {
      console.log(`[Analytics] hit: ${url || location.pathname}`);
    }
  }, [location.pathname]);

  const trackExternalLink = useCallback((channel, href) => {
    goal(GOALS.CONTACT_CHANNEL_CLICK, { channel });
    track('external_link_click', { channel, href });
  }, [goal, track]);

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
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [track]);

  const trackTimeOnPage = useCallback((pageName, thresholds = [30, 60, 120]) => {
    const timers = thresholds.map((sec) => window.setTimeout(() => {
      track('time_on_page', { page: pageName, seconds: sec });
    }, sec * 1000));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [track]);

  const attachAutoTracking = useCallback(() => {
    const onClick = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const el = target.closest('a,button');
      if (!el) return;
      const analyticsType = el.getAttribute('data-analytics');
      const text = (el.textContent || '').trim().slice(0, 80);
      if (analyticsType === 'cta') {
        track('cta_click', { text, path: location.pathname });
      }
      if (el.tagName === 'A') {
        const href = el.getAttribute('href') || '';
        if (href.startsWith('http')) {
          track('external_link_click', { href, text, path: location.pathname });
        } else if (href.startsWith('/')) {
          track('navigation_click', { href, text, path: location.pathname });
        }
      }
    };
    const onFocus = (event) => {
      const target = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement ? event.target : null;
      if (!target) return;
      const form = target.form?.getAttribute('name') || target.form?.id || 'unknown_form';
      const field = target.name || target.id || 'unknown_field';
      track('form_field_focus', { form, field, path: location.pathname });
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('focusin', onFocus, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('focusin', onFocus, true);
    };
  }, [location.pathname, track]);

  return { goal, track, hit, trackExternalLink, trackScrollDepth, trackTimeOnPage, attachAutoTracking, GOALS };
}

export function useAnalyticsAutoCapture() {
  const { attachAutoTracking } = useAnalytics();
  useEffect(() => attachAutoTracking(), [attachAutoTracking]);
}
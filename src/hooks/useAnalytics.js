/**
 * src/hooks/useAnalytics.js
 *
 * Central analytics hook — single source of truth for all tracking.
 * Works with Яндекс Метрика (window.ym) + optional future integrations.
 *
 * USAGE:
 * const { track, goal, hit } = useAnalytics();
 * track('form_submit', { form: 'project', company: 'Acme' });
 * goal('CTA_CLICK_COMPANY');
 * hit('/company-path');
 */

import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { COUNTER_ID, ANALYTICS_CONFIG } from '../config/analytics';

/**
 * Low-level ym() wrapper — safe to call even if script hasn't loaded yet.
 * Яндекс Метрика queues calls made before init completes.
 */
function ym(action,...args) {
  if (typeof window === 'undefined') return;
  if (!COUNTER_ID ||!ANALYTICS_CONFIG.enabled) return;

  if (typeof window.ym === 'function') {
    window.ym(COUNTER_ID, action,...args);
    return;
  }

  // Queue calls if ym not loaded yet
  window.ym = window.ym || function() {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym(COUNTER_ID, action,...args);
}

// ── Named Metrika goal constants ───────────────────
export const GOALS = {
  // Public goals — Russian identifiers (match Yandex Metrika)
  OPEN_TELEGRAM: 'Переход в Telegram',
  OPEN_VK_GROUP: 'Переход во ВКонтакте',
  OPEN_MAX_CHANNEL: 'Переход в Max',
  COMPANY_FORM_SUCCESS: 'Заявка компании — успех',
  STUDENT_FORM_SUCCESS: 'Заявка студента — успех',
  HERO_CTA_COMPANY: 'Hero CTA — компании',
  HERO_CTA_STUDENT: 'Hero CTA — студенты',
  CONTACT_FORM_SUCCESS: 'Контакт форма — успех',
  SUBSCRIBE_SUCCESS: 'Подписка на дайджест',
  CONTACT_CHANNEL_CLICK: 'Клик по каналу связи',

  // New goals for Hermes demo
  HERMES_LAUNCH: 'Запуск Hermes',
  DEMO_VIEW: 'Просмотр демо',

  // Internal goals — English keys (not sent to Metrika directly)
  NAV_COMPANY: 'NAV_CLICK_COMPANY',
  NAV_STUDENT: 'NAV_CLICK_STUDENT',
  NAV_HOW_IT_WORKS: 'NAV_CLICK_HOW_IT_WORKS',
  COMPANY_FORM_START: 'COMPANY_FORM_START',
  COMPANY_FORM_SUBMIT: 'COMPANY_FORM_SUBMIT',
  COMPANY_FORM_ERROR: 'COMPANY_FORM_ERROR',
  STUDENT_FORM_START: 'STUDENT_FORM_START',
  STUDENT_FORM_SUBMIT: 'STUDENT_FORM_SUBMIT',
  CONTACT_FORM_SUBMIT: 'CONTACT_FORM_SUBMIT',
  SUBSCRIBE_SUBMIT: 'SUBSCRIBE_SUBMIT',
  OPEN_TELEGRAM_LEGACY: 'OPEN_TELEGRAM',
  OPEN_VK_GROUP_LEGACY: 'OPEN_VK_GROUP',
  OPEN_MAX_CHANNEL_LEGACY: 'OPEN_MAX_CHANNEL',
  EMAIL_CLICK: 'EMAIL_CLICK',
  FAQ_OPEN: 'FAQ_OPEN',
  PROCESS_STEP_VIEW: 'PROCESS_STEP_VIEW',
  PRICING_VIEW: 'PRICING_VIEW',
  CTA_CLICK: 'cta_click',
  EXTERNAL_LINK_CLICK: 'external_link_click',
  NAVIGATION_CLICK: 'navigation_click',
  FORM_FIELD_FOCUS: 'form_field_focus',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  WEB_VITAL_FCP: 'web-vital-fcp',
  WEB_VITAL_LCP: 'web-vital-lcp',
  WEB_VITAL_CLS: 'web-vital-cls',
  WEB_VITAL_FID: 'web-vital-fid',
};

// Legacy to Russian mapping for normalization
const LEGACY_GOAL_MAP = {
  'OPEN_TELEGRAM': GOALS.OPEN_TELEGRAM,
  'OPEN_VK_GROUP': GOALS.OPEN_VK_GROUP,
  'OPEN_MAX_CHANNEL': GOALS.OPEN_MAX_CHANNEL,
  'COMPANY_FORM_SUCCESS': GOALS.COMPANY_FORM_SUCCESS,
  'STUDENT_FORM_SUCCESS': GOALS.STUDENT_FORM_SUCCESS,
  'HERO_CTA_COMPANY': GOALS.HERO_CTA_COMPANY,
  'HERO_CTA_STUDENT': GOALS.HERO_CTA_STUDENT,
  'CONTACT_FORM_SUCCESS': GOALS.CONTACT_FORM_SUCCESS,
  'SUBSCRIBE_SUCCESS': GOALS.SUBSCRIBE_SUCCESS,
  'CONTACT_CHANNEL_CLICK': GOALS.CONTACT_CHANNEL_CLICK,
  'HERMES_LAUNCH': GOALS.HERMES_LAUNCH,
  'DEMO_VIEW': GOALS.DEMO_VIEW,
};

/**
 * Main hook — use inside any component.
 */
export function useAnalytics() {
  const location = useLocation();

  const goal = useCallback((goalName, params = {}) => {
    if (!ANALYTICS_CONFIG.enabled) return;

    // Normalize legacy English keys to Russian identifiers
    const normalizedGoal = LEGACY_GOAL_MAP[goalName] || goalName;

    ym('reachGoal', normalizedGoal, params);
    if (ANALYTICS_CONFIG.isDev) {
      console.log(`[Analytics] goal: ${normalizedGoal}`, params);
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

  // ── UPDATED: trackExternalLink now maps to specific goals ──
  const trackExternalLink = useCallback((channel, href) => {
    const channelGoalMap = {
      telegram: GOALS.OPEN_TELEGRAM,
      vk: GOALS.OPEN_VK_GROUP,
      max: GOALS.OPEN_MAX_CHANNEL,
    };
    const goalName = channelGoalMap[channel] || GOALS.CONTACT_CHANNEL_CLICK;
    goal(goalName, { channel, href });
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
        if (pct >= m &&!reached.has(m)) {
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
      const target = event.target instanceof Element? event.target : null;
      if (!target) return;
      const el = target.closest('a,button');
      if (!el) return;
      const analyticsType = el.getAttribute('data-analytics');
      const text = (el.textContent || '').trim().slice(0, 80);
      const ymGoal = el.getAttribute('data-ym-goal');

      if (ymGoal) {
        goal(ymGoal, { text, path: location.pathname });
      }

      if (analyticsType === 'cta') {
        track('cta_click', { text, path: location.pathname });
      }

      // Fire HERO_CTA_COMPANY for "Связаться" or "Инвестировать" buttons
      if ((text.includes('Связаться') || text.includes('Инвестировать'))) {
        goal(GOALS.HERO_CTA_COMPANY, { text, path: location.pathname });
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
      const target = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement? event.target : null;
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
  }, [location.pathname, track, goal]);

  return { goal, track, hit, trackExternalLink, trackScrollDepth, trackTimeOnPage, attachAutoTracking, GOALS };
}

export function useAnalyticsAutoCapture() {
  const { attachAutoTracking } = useAnalytics();
  useEffect(() => attachAutoTracking(), [attachAutoTracking]);
}
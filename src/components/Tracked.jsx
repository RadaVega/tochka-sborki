/**
 * src/components/Tracked.jsx
 *
 * Drop-in analytics-aware wrappers for buttons and links.
 * Replace CTAs with these to get automatic goal tracking
 * without cluttering business logic.
 *
 * USAGE:
 *
 *   // Instead of:
 *   <button onClick={handleSubmit}>Отправить ТЗ</button>
 *
 *   // Use:
 *   <TrackedButton goal="COMPANY_FORM_SUBMIT" onClick={handleSubmit}>
 *     Отправить ТЗ
 *   </TrackedButton>
 *
 *   // External link with channel tracking:
 *   <TrackedExternalLink href="https://vk.com/..." channel="vk">
 *     Открыть ВКонтакте
 *   </TrackedExternalLink>
 *
 *   // React Router Link with goal:
 *   <TrackedLink to="/company-path" goal="NAV_COMPANY">
 *     Для компаний
 *   </TrackedLink>
 */

import { Link } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

// ── TrackedButton ───────────────────────────────────
export function TrackedButton({
  goal: goalName,
  trackParams = {},
  onClick,
  children,
  className = 'primary-button',
  ...rest
}) {
  const { goal, track } = useAnalytics();

  const handleClick = (e) => {
    if (goalName) goal(goalName, trackParams);
    track('button_click', { label: typeof children === 'string' ? children : goalName, ...trackParams });
    if (onClick) onClick(e);
  };

  return (
    <button className={className} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}

// ── TrackedLink (React Router) ──────────────────────
export function TrackedLink({
  goal: goalName,
  trackParams = {},
  to,
  children,
  className = '',
  ...rest
}) {
  const { goal, track } = useAnalytics();

  const handleClick = () => {
    if (goalName) goal(goalName, trackParams);
    track('internal_link_click', { to, label: typeof children === 'string' ? children : goalName });
  };

  return (
    <Link to={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

// ── TrackedExternalLink ─────────────────────────────
export function TrackedExternalLink({
  href,
  channel,       // 'vk' | 'max' | 'telegram' | 'email' | 'github'
  goalName,      // optional override — defaults to CONTACT_CHANNEL_CLICK
  children,
  className = '',
  ...rest
}) {
  const { trackExternalLink, goal } = useAnalytics();

  const handleClick = () => {
    trackExternalLink(channel || 'external', href);
    if (goalName) {
      goal(goalName);
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}

// ── TrackedFormField — fires event on first focus ──
// Useful for knowing which step of a form users abandon.
export function useFormFieldTracking(formName) {
  const { track } = useAnalytics();
  const tracked = new Set();

  return function onFirstFocus(fieldName) {
    return () => {
      if (!tracked.has(fieldName)) {
        tracked.add(fieldName);
        if (tracked.size === 1) {
          // First field focus = form started
          track('form_start', { form: formName });
        }
        track('form_field_focus', { form: formName, field: fieldName });
      }
    };
  };
}

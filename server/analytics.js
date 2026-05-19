/**
 * server/analytics.js
 *
 * Drop-in middleware + helper for server-side event logging to Prisma.
 * Add one line to each existing route: await logEvent(prisma, { ... })
 *
 * SETUP:
 *   In server/app.js, add:
 *     // import { analyticsMiddleware, logEvent } from './analytics.js'
 *     app.use(analyticsMiddleware);   // ← before all routes
 */

'use strict';

// ── IP anonymiser (store only first 2 octets for privacy) ──
function anonymiseIp(raw) {
  if (!raw) return null;
  const clean = raw.split(',')[0].trim(); // handle X-Forwarded-For
  const parts = clean.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;     // IPv4
  if (clean.includes(':')) return clean.split(':').slice(0, 3).join(':') + ':x:x'; // IPv6
  return null;
}

// ── Request timing middleware ───────────────────────────────
// Attaches start time so routes can log response duration.
export function analyticsMiddleware(req, _res, next) {
  req._startAt = Date.now();
  next();
}

/**
 * Log a server-side analytics event to the AnalyticsEvent table.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {object} opts
 * @param {import('express').Request} opts.req     - Express request object
 * @param {string}  opts.eventType   - 'form_submit' | 'form_success' | 'form_error' | 'subscribe' | 'api_call'
 * @param {string}  opts.eventName   - e.g. 'project_submission', 'contact', 'subscribe'
 * @param {boolean} [opts.success]   - default true
 * @param {string}  [opts.error]     - error message if failed
 * @param {number}  [opts.entityId]  - ID of the related DB record
 * @param {string}  [opts.entityType] - 'ProjectSubmission' | 'Contact' | 'Subscriber'
 * @param {object}  [opts.meta]      - any extra data to store as JSON
 */
export async function logEvent(prisma, opts) {
  // Skip if analytics disabled
  if (process.env.ANALYTICS_ENABLED === 'false') return;

  try {
    const { req, eventType, eventName, success = true, error, entityId, entityType, meta } = opts;

    await prisma.analyticsEvent.create({
      data: {
        eventType,
        eventName,
        page:       req?.headers?.referer || req?.body?.page || null,
        userAgent:  req?.headers?.['user-agent']?.slice(0, 300) || null,
        ip:         anonymiseIp(
                      req?.headers?.['x-forwarded-for'] ||
                      req?.headers?.['x-real-ip']       ||
                      req?.socket?.remoteAddress
                    ),
        success,
        error:      error ? String(error).slice(0, 500) : null,
        entityId:   entityId || null,
        entityType: entityType || null,
        meta:       {
          ...(meta || {}),
          durationMs: req?._startAt ? Date.now() - req._startAt : null
        },
      },
    });
  } catch (loggingError) {
    // Never let analytics logging crash the main request
    console.warn('[analytics] logEvent failed silently:', loggingError?.message);
  }
}
function anonymiseIp(raw) {
  if (!raw) return null;
  const clean = raw.split(',')[0].trim();
  const parts = clean.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
  if (clean.includes(':')) return `${clean.split(':').slice(0, 3).join(':')}:x:x`;
  return null;
}

export function analyticsMiddleware(req, _res, next) {
  req._startAt = Date.now();
  next();
}

export async function logEvent(prisma, opts) {
  if (process.env.ANALYTICS_ENABLED === 'false') return;

  try {
    const { req, eventType, eventName, success = true, error, entityId, entityType, meta } = opts;
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        eventName,
        page: req?.headers?.referer || req?.body?.page || null,
        userAgent: req?.headers?.['user-agent']?.slice(0, 300) || null,
        ip: anonymiseIp(req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || req?.socket?.remoteAddress),
        success,
        error: error ? String(error).slice(0, 500) : null,
        entityId: entityId || null,
        entityType: entityType || null,
        meta: {
          ...(meta || {}),
          durationMs: req?._startAt ? Date.now() - req._startAt : null
        }
      }
    });
  } catch (loggingError) {
    console.warn('[analytics] logEvent failed silently:', loggingError?.message);
  }
}

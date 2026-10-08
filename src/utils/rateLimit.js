export const createRateLimiter = ({ windowMs = 60_000, max = 30, keyFn = null } = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    const key = keyFn
      ? keyFn(req)
      : req.ip || req.headers["x-forwarded-for"] || "unknown";

    const now = Date.now();
    const entry = hits.get(key) || { count: 0, reset: now + windowMs };

    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + windowMs;
    }

    entry.count += 1;
    hits.set(key, entry);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.reset / 1000));

    if (entry.count > max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  };
};
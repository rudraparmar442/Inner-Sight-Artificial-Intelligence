// ── middleware/auth.js ────────────────────────────────────────
// Simple API-key auth for the /admin routes
// In production use a proper auth system (JWT, sessions, etc.)

function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;

  if (!process.env.ADMIN_KEY) {
    // No key configured — allow in dev, block in prod
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        error:   'Admin key not configured on server.',
      });
    }
    return next(); // dev: allow through
  }

  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      error:   'Unauthorised. Provide a valid X-Admin-Key header.',
    });
  }

  next();
}

module.exports = adminAuth;

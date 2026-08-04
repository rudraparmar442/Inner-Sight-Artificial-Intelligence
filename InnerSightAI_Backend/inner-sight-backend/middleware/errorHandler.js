// ── middleware/errorHandler.js ────────────────────────────────
// Global error handler — catches all unhandled errors

function errorHandler(err, req, res, next) {
  const isDev  = process.env.NODE_ENV === 'development';
  const status = err.status || err.statusCode || 500;

  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  if (isDev && err.stack) console.error(err.stack);

  // CORS error
  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ success: false, error: err.message });
  }

  // Validation error (express-validator)
  if (err.type === 'validation') {
    return res.status(422).json({
      success: false,
      error:   'Validation failed',
      details: err.errors,
    });
  }

  res.status(status).json({
    success: false,
    error:   isDev ? err.message : 'Something went wrong. Please try again.',
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;

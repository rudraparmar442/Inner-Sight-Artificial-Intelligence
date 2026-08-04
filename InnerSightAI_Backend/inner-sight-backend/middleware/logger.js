// ── middleware/logger.js ──────────────────────────────────────
// Attaches request ID and logs each request with timing

const { v4: uuidv4 } = require('uuid');

function logger(req, res, next) {
  const id    = uuidv4().slice(0, 8);
  const start = Date.now();

  req.requestId = id;
  res.setHeader('X-Request-ID', id);

  res.on('finish', () => {
    const ms     = Date.now() - start;
    const status = res.statusCode;
    const color  = status >= 500 ? '\x1b[31m'
                 : status >= 400 ? '\x1b[33m'
                 : status >= 300 ? '\x1b[36m'
                 : '\x1b[32m';
    const reset  = '\x1b[0m';
    console.log(
      `  [${id}] ${color}${status}${reset} ${req.method} ${req.path} — ${ms}ms`
    );
  });

  next();
}

module.exports = logger;

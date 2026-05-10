/**
 * middleware/logger.js — Request logging middleware.
 * Applied globally in server.js so it runs on every incoming request.
 * Logs: timestamp, HTTP method, URL path, response status code, and duration.
 * Uses the 'finish' event on the response object to capture the status code
 * after the response has been sent (since it's not known at request time).
 */
function logger(req, res, next) {
  const start = Date.now(); // Record the time the request arrived (for duration calculation)
  const now = new Date().toISOString(); // Human-readable timestamp for the log entry

  // The 'finish' event fires after Express has sent the response to the client.
  // At that point res.statusCode is set, so we can log it.
  res.on('finish', () => {
    const duration = Date.now() - start; // How long the request took to process (ms)
    console.log(`[${now}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });

  next(); // Pass control to the next middleware / route handler
}

module.exports = logger;

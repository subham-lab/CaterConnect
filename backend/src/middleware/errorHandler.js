/**
 * Wrap async route handlers to forward errors to Express error handler
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/**
 * Custom error class with HTTP status
 */
class AppError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.status = status
    this.name   = 'AppError'
  }

  static badRequest(msg)    { return new AppError(msg, 400) }
  static unauthorized(msg)  { return new AppError(msg || 'Unauthorized', 401) }
  static forbidden(msg)     { return new AppError(msg || 'Forbidden', 403) }
  static notFound(msg)      { return new AppError(msg || 'Not found', 404) }
  static conflict(msg)      { return new AppError(msg || 'Conflict', 409) }
  static internal(msg)      { return new AppError(msg || 'Internal error', 500) }
}

/**
 * Global Express error handler — register last in server.js
 */
const globalErrorHandler = (err, req, res, next) => {
  const status  = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'

  // Log in dev only
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${status} ${req.method} ${req.path}`)
    console.error(err.stack)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: errors.join('. ') })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0]
    return res.status(409).json({ message: `${field || 'Value'} already exists` })
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}` })
  }

  res.status(status).json({ message })
}

module.exports = { asyncHandler, AppError, globalErrorHandler }

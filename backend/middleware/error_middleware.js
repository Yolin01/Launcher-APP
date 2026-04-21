// Intercepte toutes les erreurs non gérées dans les routes
const errorMiddleware = (err, req, res, next) => {
  console.error(`[${req.method}] ${req.path} → ${err.message}`)
  const status  = err.statusCode || err.status || 500
  const message = err.message    || 'Erreur serveur interne'
  res.status(status).json({
    success: false,
    message,
    // Expose la stack uniquement en développement
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  })
}
module.exports = { errorMiddleware }
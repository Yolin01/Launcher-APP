const { verifyToken } = require('../utils/jwt_utils')
// ── Vérifie le JWT dans l'en-tête Authorization ──
const protect = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé — token manquant' })
  }
  try {
    const token   = auth.split(' ')[1]
    req.user = verifyToken(token) // { id, role, iat, exp }
    next()
  } catch {
    res.status(401).json({ message: 'Token invalide ou expiré' })
  }
}
// ── Réserve l'accès aux admins ────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' })
  }
  next()
}
module.exports = { protect, adminOnly }
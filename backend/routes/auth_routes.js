const router   = require('express').Router()
const ctrl     = require('../controllers/auth_controller')
const { protect } = require('../middleware/auth_middleware')
// ── Routes publiques ──────────────────────────
router.post('/register', ctrl.register)
router.post('/login',    ctrl.login)
// ── Routes protégées (JWT requis) ─────────────
router.post('/logout',   protect, ctrl.logout)
router.get('/me',        protect, ctrl.getMe)
module.exports = router
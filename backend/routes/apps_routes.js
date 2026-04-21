const router = require('express').Router()
const ctrl   = require('../controllers/apps_controller')
const { protect, adminOnly } = require('../middleware/auth_middleware')

router.use(protect)

// ── Routes spécifiques EN PREMIER ────────────────────
router.get('/user/my',           ctrl.getMyApps)
router.post('/user/pin/:id',     ctrl.togglePin)
router.delete('/user/remove/:id',ctrl.removeFromUser)
router.post('/user/scan',        ctrl.scanAndSave)

// ── Catalogue global ──────────────────────────────────
router.get('/',               ctrl.getAll)
router.post('/',              ctrl.create)
router.get('/:id',            ctrl.getOne)
router.put('/:id',            adminOnly, ctrl.update)
router.delete('/:id',         adminOnly, ctrl.remove)
router.post('/:id/launch',    ctrl.recordLaunch)

module.exports = router
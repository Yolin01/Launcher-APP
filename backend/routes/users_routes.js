const router     = require('express').Router()
const ctrl       = require('../controllers/auth_controller')
const { protect } = require('../middleware/auth_middleware')
router.use(protect)
router.get('/profile',  ctrl.getMe)
router.put('/profile',  ctrl.updateProfile)
router.put('/password', ctrl.changePassword)
module.exports = router
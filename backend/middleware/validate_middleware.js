// Middleware de validation avec Joi
// Usage : router.post('/login', validate(loginSchema), ctrl.login)
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,  // toutes les erreurs d'un coup
    stripUnknown: true, // ignore les champs non déclarés
  })
  if (error) {
    const errors = error.details.map(d => d.message)
    return res.status(422).json({
      success: false,
      message: 'Données invalides',
      errors
    })
  }
  req.body = value // remplace par les données nettoyées
  next()
}
module.exports = { validate }
// ── Schémas Joi prêts à l'emploi ──────────────
const Joi = require('joi')
const registerSchema = Joi.object({
  email:       Joi.string().email().required(),
  password:    Joi.string().min(6).required(),
  displayName: Joi.string().max(50)
})
const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required()
})
module.exports = { validate, registerSchema, loginSchema }
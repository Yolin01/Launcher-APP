const User = require('../models/User')
const { hashPassword, comparePassword } = require('../utils/hash_utils')
const { signToken } = require('../utils/jwt_utils')
// ── Inscription ───────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body
    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email déjà utilisé' })
    const passwordHash = await hashPassword(password)
    const user  = await User.create({ email, passwordHash, displayName })
    const token = signToken({ id: user._id, role: user.role })
    res.status(201).json({ token, user: user.toPublic() })
  } catch (e) { next(e) }
}
// ── Connexion ─────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    const ok   = user && await comparePassword(password, user.passwordHash)
    if (!ok)
      return res.status(401).json({ message: 'Identifiants invalides' })
    const token = signToken({ id: user._id, role: user.role })
    res.json({ token, user: user.toPublic() })
  } catch (e) { next(e) }
}
// ── Profil connecté ───────────────────────────
exports.getMe  = (req, res) => res.json(req.user)
exports.logout = (req, res) => res.json({ message: 'Déconnecté' })
// ── Mise à jour du profil ─────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = { displayName: req.body.displayName }
    const user = await User.findByIdAndUpdate(
      req.user.id, allowed, { new: true }
    )
    res.json(user.toPublic())
  } catch (e) { next(e) }
}
// ── Changement de mot de passe ────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user.id)
    const ok   = await comparePassword(oldPassword, user.passwordHash)
    if (!ok)
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' })
    user.passwordHash = await hashPassword(newPassword)
    await user.save()
    res.json({ message: 'Mot de passe mis à jour' })
  } catch (e) { next(e) }
}
const Theme = require('../models/Theme')
const User  = require('../models/User')
// ── Thèmes de l'utilisateur ───────────────────
exports.getAll = async (req, res, next) => {
  try {
    const themes = await Theme
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
    res.json(themes)
  } catch (e) { next(e) }
}
// ── Créer un thème ────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const theme = await Theme.create({
      ...req.body, userId: req.user.id
    })
    res.status(201).json(theme)
  } catch (e) { next(e) }
}
// ── Modifier un thème ─────────────────────────
exports.update = async (req, res, next) => {
  try {
    const theme = await Theme.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!theme)
      return res.status(404).json({ message: 'Thème non trouvé' })
    res.json(theme)
  } catch (e) { next(e) }
}
// ── Activer un thème (1 seul actif à la fois) ─
exports.activate = async (req, res, next) => {
  try {
    // Désactive tous les thèmes de l'utilisateur
    await Theme.updateMany(
      { userId: req.user.id },
      { isDefault: false }
    )
    // Active le thème choisi
    await Theme.findByIdAndUpdate(req.params.id, { isDefault: true })
    // Enregistre sur le profil utilisateur
    await User.findByIdAndUpdate(req.user.id, {
      activeThemeId: req.params.id
    })
    res.json({ message: 'Thème activé avec succès' })
  } catch (e) { next(e) }
}
// ── Supprimer un thème ────────────────────────
exports.remove = async (req, res, next) => {
  try {
    await Theme.findOneAndDelete({
      _id: req.params.id, userId: req.user.id
    })
    res.json({ message: 'Thème supprimé' })
  } catch (e) { next(e) }
}
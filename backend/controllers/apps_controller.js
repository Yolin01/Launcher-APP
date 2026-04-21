const Application = require('../models/Application')
const UserApp     = require('../models/UserApp')
const Category    = require('../models/Category')
// ── Toutes les apps (catalogue) ───────────────
exports.getAll = async (req, res, next) => {
  try {
    const apps = await Application.find().populate('categoryId')
    res.json(apps)
  } catch (e) { next(e) }
}

// ── Apps de l'utilisateur connecté ───────────
exports.getMyApps = async (req, res, next) => {
  try {
    const userApps = await UserApp
      .find({ 
        userId: req.user.id,
        isHidden: { $ne: true }
       })
      .populate({ path: 'appId', populate: { path: 'categoryId' } })
      .sort({ position: 1, createdAt: -1 })

    const result = userApps
      .filter(ua => ua.appId) // ignore les entrées corrompues
      .map(ua => ({
        ...ua.appId.toObject(),
        isPinned:   ua.isPinned,
        lastUsed:   ua.lastUsed,
        usageCount: ua.usageCount,
      }))

    res.json(result)
  } catch (e) { next(e) }
}

// ── Créer une app manuellement ────────────────
exports.create = async (req, res, next) => {
  try {
    const app = await Application.create({
      ...req.body,
      createdBy: req.user.id
    })

    // Crée automatiquement le lien UserApp
    await UserApp.create({
      userId: req.user.id,
      appId:  app._id,
    })

    res.status(201).json(app)
  } catch (e) { next(e) }
}

// ── Épingler / désépingler ────────────────────
exports.togglePin = async (req, res, next) => {
  try {
    const ua = await UserApp.findOne({
      userId: req.user.id,
      appId:  req.params.id
    })
    if (!ua)
      return res.status(404).json({ message: 'Application non trouvée' })
    ua.isPinned = !ua.isPinned
    await ua.save()
    res.json(ua)
  } catch (e) { next(e) }
}

// ── Enregistrer un lancement ──────────────────
exports.recordLaunch = async (req, res, next) => {
  try {
    await UserApp.findOneAndUpdate(
      { userId: req.user.id, appId: req.params.id },
      { lastUsed: new Date(), $inc: { usageCount: 1 } }
    )
    res.json({ message: 'Lancement enregistré' })
  } catch (e) { next(e) }
}

// ── Détail d'une app ──────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id)
    if (!app) return res.status(404).json({ message: 'Non trouvé' })
    res.json(app)
  } catch (e) { next(e) }
}

// ── Mettre à jour une app ─────────────────────
exports.update = async (req, res, next) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id, req.body,
      { new: true, runValidators: true }
    )
    res.json(app)
  } catch (e) { next(e) }
}

// ── Supprimer une app ─────────────────────────
exports.remove = async (req, res, next) => {
  try {
    await Application.findByIdAndDelete(req.params.id)
    await UserApp.deleteMany({ appId: req.params.id })
    res.json({ message: 'Application supprimée' })
  } catch (e) { next(e) }
}

// ── Supprimer une app de la liste de l'utilisateur ────
exports.removeFromUser = async (req, res, next) => {
  try {
    // Supprime le lien UserApp seulement
    await UserApp.findOneAndDelete({
      userId: req.user.id,
      appId:  req.params.id
    })
    res.json({ message: 'Application supprimée' })
  } catch (e) { next(e) }
}

exports.hideApp = async (req, res, next) => {
  try {
    await UserApp.findOneAndUpdate(
      { userId: req.user.id, appId: req.params.id },
      { isHidden: true }
    )
    res.json({ message: 'Application masquée' })
  } catch (e) { next(e) }
}

// ── Sauvegarde les apps scannées depuis Electron ──
exports.scanAndSave = async (req, res, next) => {
  try {
    const { apps } = req.body

    if (!apps || !Array.isArray(apps) || apps.length === 0) {
      return res.status(400).json({ message: 'Aucune application reçue' })
    }

    const userId = req.user.id
    const saved   = []
    const skipped = []

    for (const app of apps) {
      // Cherche si l'app existe déjà dans la collection
      let existingApp = await Application.findOne({ name: app.name })

      if (!existingApp) {
        // Crée l'app si elle n'existe pas encore
        existingApp = await Application.create({
          name:       app.name,
          iconUrl:    app.iconUrl   || '',
          launchUrl:  app.launchUrl || '',
          exePath:    app.exePath   || '',
          isLocalApp: true,
          isGlobal:   false,
          createdBy:  userId,
        })
      }

      // Vérifie si le lien UserApp existe déjà
      const existingLink = await UserApp.findOne({
        userId,
        appId: existingApp._id
      })

      if (existingLink) {
        skipped.push(app.name)
        continue
      }

      // Crée le lien entre l'utilisateur et l'app
      await UserApp.create({
        userId,
        appId:    existingApp._id,
        position: 0,
        isPinned: false,
      })

      saved.push(app.name)
    }

    res.json({
      message: `${saved.length} app(s) sauvegardée(s), ${skipped.length} déjà existante(s)`,
      saved,
      skipped,
      total: saved.length + skipped.length
    })

  } catch (e) { next(e) }
}
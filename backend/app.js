const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const morgan  = require('morgan')
const { errorMiddleware } = require('./middleware/error_middleware')

const app = express()

// ── Charge tous les modèles Mongoose au démarrage ────────
require('./models/User')
require('./models/Application')
require('./models/Category')
require('./models/UserApp')
require('./models/Theme')

// ── Sécurité & logging ────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────
app.use('/api/auth',   require('./routes/auth_routes'))
app.use('/api/apps',   require('./routes/apps_routes'))
app.use('/api/themes', require('./routes/themes_routes'))
app.use('/api/users',  require('./routes/users_routes'))

app.get('/', (req, res) => {
  res.send('API is running ')
})

// ── Health check ──────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ── Gestion d'erreurs globale (doit être en dernier) ──
app.use(errorMiddleware)

module.exports = app
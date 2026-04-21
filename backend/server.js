require('dotenv').config()

const app = require('./app')
const { connectDB } = require('./config/db')

const PORT = process.env.PORT || 5000
const start = async () => {
  try {
    await connectDB()
    console.log('😁 MongoDB connecté')
    app.listen(PORT, () => {
      console.log(` Serveur démarré → http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Erreur démarrage :', err.message)
    process.exit(1)
  }
}
start()
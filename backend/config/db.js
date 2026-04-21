const mongoose = require('mongoose')

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI)

  console.log(`MongoDB → ${conn.connection.host}`)
  return conn
}

// Événements de connexion
mongoose.connection.on('disconnected', () =>
  console.warn('⚠ MongoDB déconnecté')
)

mongoose.connection.on('error', (err) =>
  console.error('MongoDB erreur :', err)
)

module.exports = { connectDB }
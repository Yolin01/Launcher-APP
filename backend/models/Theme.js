const { Schema, model } = require('mongoose')
const themeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  name:           { type: String, required: true, trim: true },
  primaryColor:   { type: String, default: '#6C63FF' },
  secondaryColor: { type: String, default: '#FF6584' },
  bgColor:        { type: String, default: '#F7F8FC' },
  fontFamily:     { type: String, default: 'Inter' },
  isDark:         { type: Boolean, default: false },
  isDefault: {
    type: Boolean, default: false,
    // Un seul thème par défaut par user → géré dans le controller
  },
}, { timestamps: true })
module.exports = model('Theme', themeSchema)
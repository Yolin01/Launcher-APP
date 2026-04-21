const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: '', trim: true },
  activeThemeId: { type: Schema.Types.ObjectId, ref: 'Theme', default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true })

// Méthode publique
userSchema.methods.toPublic = function() {
  return {
    _id: this._id,
    email: this.email,
    displayName: this.displayName,
    activeThemeId: this.activeThemeId,
    role: this.role,
    createdAt: this.createdAt,
  }
}


module.exports = model('User', userSchema)
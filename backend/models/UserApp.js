const { Schema, model } = require('mongoose')
const userAppSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  appId: {
    type: Schema.Types.ObjectId, ref: 'Application',
    required: true
  },
  position:   { type: Number, default: 0 },
  isPinned:   { type: Boolean, default: false },
  lastUsed:   { type: Date, default: null },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true })
// Index unique : un user ne peut avoir qu'une entrée par app
userAppSchema.index({ userId: 1, appId: 1 }, { unique: true })
module.exports = model('UserApp', userAppSchema)
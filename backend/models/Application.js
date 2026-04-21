const { Schema, model } = require('mongoose')

const appSchema = new Schema({
  name: {
    type: String, required: true, trim: true
  },
  iconUrl:    { type: String, default: '' },
  launchUrl:  { type: String, default: '' },
  exePath:    { type: String, default: '' }, 
  isLocalApp: { type: Boolean, default: false }, 
  description:{ type: String, default: '' },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  isGlobal:   { type: Boolean, default: false },
  createdBy:  { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

appSchema.index({ name: 'text' })

module.exports = model('Application', appSchema)
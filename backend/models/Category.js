const { Schema, model } = require('mongoose')
const categorySchema = new Schema({
  name:  { type: String, required: true, unique: true, trim: true },
  color: { type: String, default: '#888888' },
  icon:  { type: String, default: 'grid' },
  order: { type: Number, default: 0 },
})
module.exports = model('Category', categorySchema)
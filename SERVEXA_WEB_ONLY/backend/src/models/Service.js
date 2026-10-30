const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '🛠️' },
  active: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Service', schema);

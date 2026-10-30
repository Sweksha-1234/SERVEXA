const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  address: { type: String, default: '' },
  serviceArea: { type: String, default: '' },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  skills: [{ type: String }],
  experienceYears: { type: Number, default: 0, min: 0 },
  hourlyRate: { type: Number, default: 0, min: 0 },
  availability: { type: String, default: 'Contact for availability' },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  verificationNote: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);

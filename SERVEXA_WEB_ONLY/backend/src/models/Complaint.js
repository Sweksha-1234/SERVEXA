const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  subject: { type: String, required: true, maxlength: 120 },
  message: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ['open','in_review','resolved','closed'], default: 'open' },
  adminResponse: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Complaint', schema);

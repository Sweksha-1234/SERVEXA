const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  problemDescription: { type: String, required: true, maxlength: 1500 },
  problemImageUrl: { type: String, default: '' },
  address: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  estimatedPrice: { type: Number, min: 0, default: 0 },
  finalPrice: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['pending','accepted','rejected','in_progress','completed','cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid','demo_paid','refunded'], default: 'unpaid' },
  paymentReference: { type: String, default: '' },
  invoiceNumber: { type: String, default: '' },
  review: { rating: { type: Number, min: 1, max: 5 }, comment: { type: String, maxlength: 1000 } }
}, { timestamps: true });
module.exports = mongoose.model('Booking', schema);

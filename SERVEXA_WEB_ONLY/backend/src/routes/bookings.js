const router = require('express').Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const { auth, allow } = require('../middleware/auth');
const crypto = require('crypto');
const populated = q => q.populate('customer','name email phone').populate('provider','name email phone serviceArea').populate('service','name icon');
router.get('/', auth, async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : req.user.role === 'provider' ? { provider: req.user._id } : { customer: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  res.json(await populated(Booking.find(filter).sort({ createdAt: -1 })));
});
router.post('/', auth, allow('customer'), async (req, res) => {
  const { provider, service, problemDescription, address, scheduledAt, estimatedPrice = 0, problemImageUrl = '' } = req.body;
  if (!provider || !service || !problemDescription || !address || !scheduledAt) return res.status(400).json({ message: 'Provider, service, problem details, address and date/time are required.' });
  const [p, s] = await Promise.all([User.findOne({ _id: provider, role: 'provider', verificationStatus: 'verified', isActive: true }), Service.findOne({ _id: service, active: true })]);
  if (!p || !s) return res.status(400).json({ message: 'Choose an active service and verified provider.' });
  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime()) || when < new Date(Date.now() - 60000)) return res.status(400).json({ message: 'Choose a valid future date and time.' });
  const booking = await Booking.create({ customer: req.user._id, provider, service, problemDescription, address, scheduledAt: when, estimatedPrice: Math.max(0, Number(estimatedPrice) || 0), problemImageUrl });
  res.status(201).json(await populated(Booking.findById(booking._id)));
});
router.patch('/:id/status', auth, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  const { status } = req.body;
  const isProvider = String(booking.provider) === String(req.user._id) && req.user.role === 'provider';
  const isCustomer = String(booking.customer) === String(req.user._id) && req.user.role === 'customer';
  const isAdmin = req.user.role === 'admin';
  const transitions = {
    provider: { pending: ['accepted','rejected'], accepted: ['in_progress'], in_progress: ['completed'] },
    customer: { pending: ['cancelled'] },
    admin: { pending: ['accepted','rejected','cancelled'], accepted: ['in_progress','cancelled'], in_progress: ['completed','cancelled'], rejected: [], completed: [], cancelled: [] }
  };
  const role = isAdmin ? 'admin' : isProvider ? 'provider' : isCustomer ? 'customer' : null;
  if (!role) return res.status(403).json({ message: 'This booking does not belong to your account.' });
  if (!(transitions[role][booking.status] || []).includes(status)) return res.status(400).json({ message: `Cannot change booking from ${booking.status} to ${status}.` });
  booking.status = status;
  if (status === 'completed') {
    booking.finalPrice = Math.max(0, Number(req.body.finalPrice ?? booking.estimatedPrice) || 0);
    booking.invoiceNumber = booking.invoiceNumber || `SVX-${Date.now().toString(36).toUpperCase()}`;
  }
  await booking.save();
  res.json(await populated(Booking.findById(booking._id)));
});
router.post('/:id/payment', auth, allow('customer'), async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || String(booking.customer) !== String(req.user._id)) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.status !== 'completed') return res.status(400).json({ message: 'Payment can be recorded after completion only.' });
  if (booking.paymentStatus === 'demo_paid') return res.json({ message: 'Already marked paid.', booking });
  booking.paymentStatus = 'demo_paid';
  booking.paymentReference = `DEMO-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  await booking.save();
  res.json({ message: 'Demo payment recorded. No real money was charged.', booking });
});
router.post('/:id/reviews', auth, allow('customer'), async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || String(booking.customer) !== String(req.user._id)) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.status !== 'completed') return res.status(400).json({ message: 'Only completed bookings can be reviewed.' });
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be an integer from 1 to 5.' });
  booking.review = { rating, comment: String(req.body.comment || '').slice(0,1000) };
  await booking.save();
  res.json(await populated(Booking.findById(booking._id)));
});
module.exports = router;

const router = require('express').Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Complaint = require('../models/Complaint');
const { auth, allow } = require('../middleware/auth');
const safeUser = require('../utils/safeUser');
router.use(auth, allow('admin'));
router.get('/summary', async (_req, res) => {
  const [users, providers, pendingProviders, bookings, openComplaints, revenue] = await Promise.all([
    User.countDocuments({ role: 'customer' }), User.countDocuments({ role: 'provider' }),
    User.countDocuments({ role: 'provider', verificationStatus: 'pending' }), Booking.countDocuments(),
    Complaint.countDocuments({ status: { $in: ['open','in_review'] } }),
    Booking.aggregate([{ $match: { paymentStatus: 'demo_paid' } }, { $group: { _id: null, total: { $sum: '$finalPrice' } } }])
  ]);
  res.json({ customers: users, providers, pendingProviders, bookings, openComplaints, demoPaidTotal: revenue[0]?.total || 0, serviceCategories: await Service.countDocuments({ active: true }) });
});
router.get('/users', async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;
  res.json((await User.find(filter).sort({ createdAt: -1 }).limit(300)).map(safeUser));
});
router.patch('/users/:id/verify', async (req, res) => {
  if (!['verified','rejected','pending'].includes(req.body.verificationStatus)) return res.status(400).json({ message: 'Invalid verification status.' });
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'provider' }, { verificationStatus: req.body.verificationStatus, verificationNote: String(req.body.note || '').slice(0,500) }, { new: true });
  if (!user) return res.status(404).json({ message: 'Provider not found.' });
  res.json(safeUser(user));
});
router.patch('/users/:id/active', async (req, res) => {
  if (typeof req.body.isActive !== 'boolean') return res.status(400).json({ message: 'isActive must be true or false.' });
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(safeUser(user));
});
router.get('/bookings', async (_req, res) => res.json(await Booking.find().populate('customer','name email').populate('provider','name email').populate('service','name').sort({ createdAt: -1 }).limit(500)));
module.exports = router;

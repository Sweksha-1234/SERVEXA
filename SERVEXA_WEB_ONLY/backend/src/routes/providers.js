const router = require('express').Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { auth, allow } = require('../middleware/auth');
const safeUser = require('../utils/safeUser');
router.get('/', async (req, res) => {
  const filter = { role: 'provider', isActive: true, verificationStatus: 'verified' };
  if (req.query.serviceArea) filter.serviceArea = new RegExp(String(req.query.serviceArea).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (req.query.q) filter.$or = [{ name: new RegExp(req.query.q, 'i') }, { skills: new RegExp(req.query.q, 'i') }];
  if (req.query.service) filter.services = req.query.service;
  const providers = await User.find(filter).select('-passwordHash').populate('services', 'name icon');
  const ids = providers.map(p => p._id);
  const reviews = await Booking.aggregate([{ $match: { provider: { $in: ids }, 'review.rating': { $exists: true } } }, { $group: { _id: '$provider', avg: { $avg: '$review.rating' }, count: { $sum: 1 } } }]);
  res.json(providers.map(p => ({ ...safeUser(p), rating: reviews.find(r => String(r._id) === String(p._id))?.avg || null, reviewCount: reviews.find(r => String(r._id) === String(p._id))?.count || 0 })));
});
router.get('/:id', async (req, res) => {
  const provider = await User.findOne({ _id: req.params.id, role: 'provider', verificationStatus: 'verified', isActive: true }).select('-passwordHash').populate('services', 'name icon');
  if (!provider) return res.status(404).json({ message: 'Verified provider not found.' });
  res.json(safeUser(provider));
});
router.patch('/me/services', auth, allow('provider'), async (req, res) => {
  req.user.services = Array.isArray(req.body.services) ? req.body.services : [];
  req.user.skills = Array.isArray(req.body.skills) ? req.body.skills : req.user.skills;
  await req.user.save();
  res.json({ message: 'Provider services updated.', user: safeUser(req.user) });
});
module.exports = router;

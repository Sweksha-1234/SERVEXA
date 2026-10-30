const router = require('express').Router();
const Complaint = require('../models/Complaint');
const { auth, allow } = require('../middleware/auth');
router.get('/', auth, async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
  res.json(await Complaint.find(filter).populate('createdBy','name email').populate('booking','status invoiceNumber').sort({ createdAt: -1 }));
});
router.post('/', auth, async (req, res) => {
  if (!req.body.subject || !req.body.message) return res.status(400).json({ message: 'Subject and message are required.' });
  const complaint = await Complaint.create({ createdBy: req.user._id, booking: req.body.booking || undefined, subject: req.body.subject, message: req.body.message });
  res.status(201).json(complaint);
});
router.patch('/:id', auth, allow('admin'), async (req, res) => {
  const fields = {};
  if (['open','in_review','resolved','closed'].includes(req.body.status)) fields.status = req.body.status;
  if (req.body.adminResponse !== undefined) fields.adminResponse = String(req.body.adminResponse).slice(0,2000);
  const c = await Complaint.findByIdAndUpdate(req.params.id, { $set: fields }, { new: true });
  if (!c) return res.status(404).json({ message: 'Complaint not found.' });
  res.json(c);
});
module.exports = router;

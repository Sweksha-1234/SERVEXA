const router = require('express').Router();
const Service = require('../models/Service');
const { auth, allow } = require('../middleware/auth');
router.get('/', async (_req, res) => res.json(await Service.find({ active: true }).sort('name')));
router.post('/', auth, allow('admin'), async (req, res) => {
  const service = await Service.create({ name: req.body.name, description: req.body.description || '', icon: req.body.icon || '🛠️' });
  res.status(201).json(service);
});
router.patch('/:id', auth, allow('admin'), async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { $set: { name: req.body.name, description: req.body.description, icon: req.body.icon, active: req.body.active } }, { new: true, runValidators: true });
  if (!service) return res.status(404).json({ message: 'Service not found.' });
  res.json(service);
});
module.exports = router;

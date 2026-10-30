const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const safeUser = require('../utils/safeUser');

function tokenFor(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'development_only_change_me', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'customer', phone = '' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
  if (String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  if (!['customer','provider'].includes(role)) return res.status(400).json({ message: 'Invalid registration role.' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role, phone });
  res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
});
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  if (!user.isActive) return res.status(403).json({ message: 'Account is disabled. Contact support.' });
  res.json({ token: tokenFor(user), user: safeUser(user) });
});
router.get('/me', auth, (req, res) => res.json({ user: safeUser(req.user) }));
router.patch('/me', auth, async (req, res) => {
  const allowed = ['name','phone','address','serviceArea','skills','experienceYears','hourlyRate','availability'];
  allowed.forEach(k => { if (req.body[k] !== undefined && req.user.role !== 'admin') req.user[k] = req.body[k]; });
  await req.user.save();
  res.json({ user: safeUser(req.user) });
});
module.exports = router;

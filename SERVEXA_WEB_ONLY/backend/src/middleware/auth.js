const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.auth = async (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'development_only_change_me');
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ message: 'Account unavailable.' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ message: 'Invalid or expired token.' }); }
};
exports.allow = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have permission for this action.' });
  next();
};

module.exports = user => {
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.passwordHash;
  delete u.__v;
  return u;
};

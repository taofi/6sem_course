function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.redirect('/');
    if (req.user.role !== role) return res.redirect('/');
    next();
  };
}

module.exports = requireRole;

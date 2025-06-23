function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.redirect('/');
    if (!roles.includes(req.user.role)) return res.redirect('/');
    next();
  };
}

module.exports = requireRole;

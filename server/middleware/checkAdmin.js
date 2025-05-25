module.exports = function checkAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    return res.status(403).send('Доступ запрещён');
  };
  
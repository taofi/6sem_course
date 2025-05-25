const passport = require('passport');
const {UsersDAO} = require('../DB/dao');

module.exports.showLogin = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/'); 
  }
  res.render('pages/login', {
    title: 'Главная',
    styles: ['styles', 'auth'],
    scripts: ['search-menu'],
    error: req.query.error 
  });
};

module.exports.showRegister = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/'); 
  }
  res.render('pages/register', {
    title: 'Главная',
    styles: ['styles', 'auth'],
    scripts: ['search-menu'],
    error: req.query.error 
  });
};

module.exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return res.redirect('/login?error=' + encodeURIComponent('Ошибка сервера.'));
    }
    if (!user) {
      const errorMsg = info?.message || 'Ошибка входа';
      return res.redirect('/login?error=' + encodeURIComponent(errorMsg));
    }
    console.log(user);
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return res.redirect('/login?error=' + encodeURIComponent('Ошибка входа. Повторите попытку.'));
      }
      const redirectTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      return res.redirect(redirectTo);
    });
  })(req, res, next);
};


module.exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
};



module.exports.register = async (req, res) => {
  const { login, pass, name, last_name, user_number } = req.body;

  const result = await UsersDAO.Register({ login, pass, name, last_name, user_number });

  if (result.error) {
    return res.redirect('/register?error=' + encodeURIComponent(result.error));
  }

  req.login(result.user, (err) => {
    if (err) {
      console.error('Ошибка входа после регистрации:', err);
      return res.redirect('/register?error=' + encodeURIComponent('Ошибка входа после регистрации.'));
    }
    return res.redirect('/profile');
  });
};


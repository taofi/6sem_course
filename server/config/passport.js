const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const {UsersDAO} = require('../DB/dao');


passport.use(new LocalStrategy(
  async (username, password, done) => {
    const result = await UsersDAO.Login(username, password);
    if (result.error) {
      return done(null, false, { message: result.error });
    }
    return done(null, result.user);
  }
));



passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UsersDAO.GetById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;

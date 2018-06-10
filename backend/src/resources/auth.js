"use strict";

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
  function(username, password, done) {
    if( password === 'passw0rd' )
      return done(null, { name: username, authenticated: true });
    else 
      return done(null, false);
  }
));

module.exports = { passport: passport };
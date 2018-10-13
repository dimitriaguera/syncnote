const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const config = require("../../config.server");
const mongodb = require("../db/mongodb");

module.exports = {
  init: function(app, passport) {
    app.use(passport.initialize());
    setStrategy(passport);
    return passport;
  }
};

function setStrategy(passport) {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.security.jwtSecret
      },

      async function(jwt_payload, done) {
        try {
          const _id = jwt_payload._id;
          const user = await mongodb
            .getDb()
            .collection("user")
            .findOne({ _id: _id });
          return done(null, user || false);
        } catch (e) {
          return done(e, false);
        }
      }
    )
  );
}

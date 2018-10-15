const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const { extractToken } = require("./service");
const config = require("../../config.server");
const mongodb = require("../db/mongodb");

module.exports = {
  init: function(app, passport) {
    app.use(passport.initialize());
    setStrategy(passport);
    return passport;
  },
  socketStrategy: socketStrategy
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

function socketStrategy() {
  return (socket, next) => {
    console.log("Socket: Check token validity");

    // Extract token from headers.
    let token = extractToken(socket.handshake.query.token);

    // Test token validity.
    jwt.verify(token, config.security.jwtSecret, async function(
      err,
      jwt_payload
    ) {
      // If error, return.
      if (err) {
        console.log("Socket: Authentication error");
        return next(new Error("Socket: Authentication error"));
      }

      try {
        const _id = jwt_payload._id;
        const user = await mongodb
          .getDb()
          .collection("user")
          .findOne({ _id: _id });
        socket.userId = user ? user._id : null;
        return next();
      } catch (e) {
        return next(e, false);
      }
    });
  };
}

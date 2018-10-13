const jwt = require("jsonwebtoken");
const path = require("path");
const config = require("../../config.server");
const bcrypt = require("bcrypt");

module.exports = {
  hashPassword: function(password) {
    return new Promise(function(resolve, reject) {
      bcrypt.hash(password, config.security.bcryptSaltRounds, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },
  comparePassword: function(user, password) {
    return new Promise(function(resolve, reject) {
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  },

  secureUser: function(user) {
    delete user.password;
    return user;
  },

  validateUsername: function(username) {
    const usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;
    return (
      username &&
      usernameRegex.test(username) &&
      config.security.illegalUsernames.indexOf(username) < 0
    );
  },

  validatePassword: function(password) {
    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
    // no space
    // WARNING YOU HAVE TO OPPOSITE TEST !passwordRegex.test(password)
    const passwordRegex = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*|[^\s]*\s.*)$/;

    // no characters repeated more than 3 times consecutively (like aaaaa)
    const testIfRepeatCarRegex = /^(?!.*(\w)\1{3,}).+$/;
    return (
      password &&
      !passwordRegex.test(password) &&
      testIfRepeatCarRegex.test(password)
    );
  },

  getToken: function(headers) {
    if (headers && headers.authorization) {
      // Extract token from headers.
      let token = headers.authorization;

      // Extract 'BEARER ' from token.
      let extractedToken = token.substr(7);
      return extractedToken;
    }
    return null;
  },

  getUserFromToken: function(req, done) {
    let token = this.getToken(req.headers);

    if (token) {
      // Test token validity.
      jwt.verify(token, config.security.jwtSecret, function(err, jwt_payload) {
        // If error, return.
        if (err) {
          return done(null);
        }

        // Else, return decoded.
        return done(jwt_payload);
      });
    } else {
      return done(null);
    }
  }
};

const passport = require('passport');
const { asyncMiddleware } = require('../utils/tools');

module.exports = function(app) {
  const { getSharableUsers } = require('./share.controller');

  // Here user must be authenticated
  app.route('/api/share*').all(
    passport.authenticate('jwt', {
      session: false
    })
  );

  app.route('/api/share/users').get(asyncMiddleware(getSharableUsers));
};

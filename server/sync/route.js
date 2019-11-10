const passport = require('passport');
const { asyncMiddleware } = require('../utils/tools');

module.exports = function(app) {
  const sync = require('./sync.controller');

  app.route('/api/sync*').all(passport.authenticate('jwt', { session: false }));
  app.route('/api/sync').get(asyncMiddleware(sync.getUserNode));
};

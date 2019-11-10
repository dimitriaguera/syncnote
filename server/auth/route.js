const { asyncMiddleware } = require('../utils/tools');

module.exports = function(app) {
  const auth = require('./controller.js');

  app.route('/api/auth/login').post(asyncMiddleware(auth.login));
  app.route('/api/auth/register').post(asyncMiddleware(auth.register));
  app.route('/api/auth/getAll').get(auth.getAll);
};

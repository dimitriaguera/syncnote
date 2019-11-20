const passport = require('passport');
const { asyncMiddleware } = require('../utils/tools');
const { isNodeOwner, isNodeShared } = require('./model');

module.exports = function(app) {
  const node = require('./controller');

  // Here user must be authenticated
  app.route('/api/node*').all(passport.authenticate('jwt', { session: false }));

  // Get all user nodes
  app
    .route('/api/node/all/:uid')
    .get(asyncMiddleware(node.routerGetAllUserNode));

  // Get one node
  app.route('/api/node/:nid').get(node.routerGet);

  // Attach node to req
  // Check authorization access to node
  app.param('nid', async function(req, res, next, id) {
    try {
      // Get node
      const nodeItem = await node.getNodeById(id);
      // If no node found, res 404
      if (!nodeItem) {
        res.status(404);
        res.send({ success: false, message: 'Node not found.' });
      }
      // Check if authentificated user have access to this node
      // At this point, user must be auth
      if (
        isNodeOwner(req.user._id, nodeItem) ||
        isNodeShared(req.user._id, nodeItem)
      ) {
        // If success, attach node to req
        req._currentNode = nodeItem;
        next();
      } else {
        res.status(403);
        res.send({ success: false, message: 'Not permitted for this user.' });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

  // Attach uid to req
  app.param('uid', function(req, res, next, id) {
    // Check if path request uid is the user auth id
    if (!req.user || !id || req.user._id !== id) {
      res.status(403);
      res.send({ success: false, message: 'Not permitted for this user.' });
    }
    // If it is, attach uid to req
    req._userId = id;
    next();
  });
};

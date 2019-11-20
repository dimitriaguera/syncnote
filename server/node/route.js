const passport = require('passport');
const { asyncMiddleware } = require('../utils/tools');
const { authByUserId } = require('../auth/authorization');
const { isNodeOwner, isNodeShared } = require('./model');

module.exports = function(app) {
  const node = require('./controller');

  app.route('/api/node*').all(passport.authenticate('jwt', { session: false }));
  // app.route('/api/node').post(asyncMiddleware(node.routerPost));

  app
    .route('/api/node/all/:uid')
    .get(authByUserId, asyncMiddleware(node.routerGetAllUserNode));

  // app
  //   .route('/api/node/:nid')
  //   .get(asyncMiddleware(node.routerGet))
  //   .put(asyncMiddleware(node.routerPut));

  // app
  //   .route('/api/node/delete/:nid_delete')
  //   .delete(asyncMiddleware(node.routerDeleteNode));

  app.route('/api/node/:nid').get(node.routerGet);

  app.param('uid', function(req, res, next, id) {
    req._userId = id;
    next();
  });

  app.param('nid', async function(req, res, next, id) {
    try {
      // Get node
      const nodeItem = await node.getNodeById(id);
      // If no node found, res 404
      if (!nodeItem) {
        res.status(404);
        res.json({ success: false, message: 'Node not found.' });
      }
      // Check if authentificated user have access to this node
      // At this point, user must be auth
      if (
        isNodeOwner(req.user._id, nodeItem) ||
        isNodeShared(req.user._id, nodeItem)
      ) {
        req._currentNode = nodeItem;
        next();
      } else {
        res.status(403);
        res.json({ success: false, message: 'Not permitted for this user.' });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

  // app.param('nid_delete', function(req, res, next, id) {
  //   try {
  //     req._nodeId = id;
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   next();
  // });
};

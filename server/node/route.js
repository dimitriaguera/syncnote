const mongodb = require("mongodb");
const passport = require("passport");
const { asyncMiddleware } = require("../utils/tools");
const { authByUserId } = require("../auth/authorization");

module.exports = function(app) {
  const node = require("./controller.js");

  app.route("/api/node*").all(passport.authenticate("jwt", { session: false }));
  app.route("/api/node").post(asyncMiddleware(node.post));
  app
    .route("/api/node/:user_id")
    .get(authByUserId, asyncMiddleware(node.getAllUserNode));
  app.route("/api/node/:node_id").put(asyncMiddleware(node.put));
  app
    .route("/api/node/delete/:node_id_delete")
    .delete(asyncMiddleware(node.deleteNode));

  app.param("user_id", function(req, res, next, id) {
    req._userId = id;
    next();
  });

  app.param("node_id", async function(req, res, next, id) {
    try {
      id = new mongodb.ObjectId(id);
      req._currentNode = await node.getNodeById(id);
    } catch (e) {
      console.error(e);
    }
    next();
  });

  app.param("node_id_delete", function(req, res, next, id) {
    try {
      req._nodeId = new mongodb.ObjectId(id);
      //req._nodeId = id;
    } catch (e) {
      console.error(e);
    }
    next();
  });
};

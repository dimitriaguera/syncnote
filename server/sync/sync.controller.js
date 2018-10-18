const { updateNodeById, getNodeByUserId } = require("../node/controller");
const { broadcastOwnerAndShare } = require("../socket/manager");
const { preparNodeToUpdate } = require("../node/model");

module.exports = {
  registerToSync: socket => {
    socket.on("push", push);

    async function push(data, callback) {
      try {
        const _node = preparNodeToUpdate(data);
        const rapport = await updateNodeById(_node._id, _node);
        broadcastOwnerAndShare(socket, "pull", _node);
        callback(rapport);
      } catch (err) {
        console.error(err);
        callback(err);
      }
    }
  },

  getUserNode: async (req, res, next) => {
    const nodes = await getNodeByUserId(req.user._id);
    res.json(nodes);
  }
};

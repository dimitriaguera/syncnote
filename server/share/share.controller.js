//const chalk = require('chalk');
const { getNodeById, updateNodeById } = require('../node/controller');
const { preparNodeToShare } = require('../node/model');

module.exports = {
  registerToShare: socket => {
    // Register on socket event.
    socket.on('share', shareHanlerBuilder(socket, 'share_ok', 'share_errors'));
  }
};

function shareHanlerBuilder(socket, roomOk, roomError) {
  return async (share, send) => {
    try {
      console.log('SHARE', share);
      // Need node _id to share
      if (!share._id) {
        return socket.emit(roomError, 'Share fail. No node id.');
      }

      // Get user's ID connected on current socket.
      const _uId = socket.userId;

      // Get node in remote db.
      const remoteNode = await getNodeById(share._id);

      // Need a node to share.
      if (!remoteNode) {
        return socket.emit(roomError, 'Share fail. No node to share.');
      }

      // Only node owner can update shared propery
      if (_uId !== remoteNode.owner) {
        return socket.emit(roomError, 'Share fail. No authorization.');
      }

      // Prepare node to update
      const shareUpdate = preparNodeToShare(share, remoteNode);

      // If nothing to update, abord
      if (!shareUpdate.shared.length) {
        return socket.emit(roomOk, 'Share abord. Nothing to update.');
      }

      // Update in db
      const op = await updateNodeById(share._id, shareUpdate);

      // Send result to owner
      socket.emit(roomOk, op);
    } catch (err) {
      socket.emit(
        roomError,
        'Share fail. Error during process. ' + err.message
      );
    }
  };
}

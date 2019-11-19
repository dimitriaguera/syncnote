import {
  putNodeToLocalDb,
  updateNodeToLocalDb,
  deleteNodeToLocalDb
} from '../db/db.local';

import {
  prepareSyncedLocalNodeToAdd,
  prepareSyncedLocalNodeToShare
} from '../node/node.factory';

class LocalShare {
  async handleRemoteStream(streamData = {}) {
    try {
      switch (streamData.type) {
        case 'add':
          putNodeToLocalDb(prepareSyncedLocalNodeToAdd(streamData.node));
          break;

        case 'remove':
          deleteNodeToLocalDb(streamData.node._id);
          break;

        case 'update':
          updateNodeToLocalDb(
            streamData.node._id,
            prepareSyncedLocalNodeToShare(streamData.node)
          );
          break;

        default:
          break;
      }
    } catch (err) {
      throw new Error(
        `Sharing error. Error on handling sharing remote stream. ${err}`
      );
    }
  }
}

export { LocalShare };

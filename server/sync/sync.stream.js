const chalk = require('chalk');
const broker = require('../broker/broker');
const { emitToConcernedUsers } = require('../socket/manager');
const { _nodeStream } = require('../node/stream');
const { getNodeById } = require('../node/controller');

module.exports = {
  registerToNodesStream: io => {
    let cuIds;

    // register to remote DB change stream.
    // First handle changes to update broker state.
    _nodeStream().on('change', data => {
      switch (data.operationType) {
        case 'insert':
          broker.store(data.fullDocument);
          cuIds = broker.get(data.documentKey._id);
          break;
        case 'update':
          // We test if sharing update is concerned
          // If we are on sharing update case,
          // we leave push logic and entering on sharing logic
          if (_isSharingConcern(data)) {
            return _emitOnShareMode(io, data);
          }
          cuIds = broker.get(data.documentKey._id);
          break;
        case 'replace':
          broker.store(data.fullDocument);
          cuIds = broker.get(data.documentKey._id);
          break;
        case 'delete':
          cuIds = broker.delete(data.documentKey._id);
          break;
        default:
          cuIds = [];
          break;
      }

      // Then emit changes to all concerned users sockets.
      // The handler emit changes on room "sync_change" to sockets clients if concerned.
      console.log(chalk.yellow('EMITED DATA : '));
      console.log(data);
      console.log(chalk.yellow('------------------------------'));
      emitToConcernedUsers(io, 'sync_change', cuIds, data);
    });
  }
};

function _isSharingConcern(data) {
  const isShare =
    data.updateDescription.updatedFields.shared ||
    data.updateDescription.updatedFields.owner;

  return isShare;
}

async function _emitOnShareMode(io, data) {
  // Get node id
  const _id = data.documentKey._id;

  // Get remote node
  const remoteNode = await getNodeById(_id);

  // Update broker data
  // And get new / old / still concerned users after update
  const filtered_cuids = broker.update(
    _id,
    data.updateDescription.updatedFields,
    remoteNode.owner
  );

  // Send delete request for old users
  if (filtered_cuids.removed_cuids.length) {
    console.log(chalk.blue('SHARE REMOVE: '));
    console.log(filtered_cuids.removed_cuids);
    console.log(chalk.blue('------------------------------'));

    emitToConcernedUsers(io, 'share_change', filtered_cuids.removed_cuids, {
      type: 'remove',
      node: { _id }
    });
  }

  // Send create request for new users
  if (filtered_cuids.added_cuids.length) {
    console.log(chalk.blue('SHARE ADD: '));
    console.log(filtered_cuids.added_cuids);
    console.log(chalk.blue('------------------------------'));

    emitToConcernedUsers(io, 'share_change', filtered_cuids.added_cuids, {
      type: 'add',
      node: remoteNode
    });
  }

  // Send update request for still here users
  if (filtered_cuids.updated_cuids.length) {
    console.log(chalk.blue('SHARE UPDATE: '));
    console.log(filtered_cuids.updated_cuids);
    console.log(chalk.blue('------------------------------'));

    emitToConcernedUsers(io, 'share_change', filtered_cuids.updated_cuids, {
      type: 'update',
      node: { _id, shared: data.updateDescription.updatedFields.shared }
    });
  }
}

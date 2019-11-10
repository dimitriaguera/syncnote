import { LocalSyncBulk, LocalSync } from './sync.class';
import {
  populateLocalDb,
  putNodeToLocalDb,
  getLocalNodeById,
  updateNodeToLocalDb
} from '../db/db.local';
import { isOffline } from '../state/app.state';
import { get } from '../fetch';
import {
  prepareLocalNodeBeforeCreatePush,
  prepareLocalNodeBeforeUpdatePush,
  prepareLocalNodeBeforeDeletePush,
  prepareLocalNodeBeforeConflictPush,
  prepareSyncedLocalNodeToConflict
} from '../node/node.factory';
import { SYNC_WAIT_OK, SYNC_STATUS_DONE } from '../../globals/_sync_status';
import { remoteInterface } from './sync.remote';
import { queue } from './sync.queue';

// Socket "s.on()" events registration.
// This is data entry point from remoteDB changes.
remoteInterface.eventRegister(socket => {
  socket.eventRegister('push_ok', pushOkHandler);
  socket.eventRegister('push_errors', pushErrorsHandler);
  socket.eventRegister('sync_ok', syncOkHandler);
  socket.eventRegister('sync_errors', syncErrorsHandler);
  socket.eventRegister('sync_change', syncChange);
});

// register running function
// execution during loop queue local push event handler
queue.setOnRun(async _action => {
  // handle action and prepare local node
  // to be saved localy
  const { node, localDbAction, conflictFlag } = await prepareNodeToLocalPush(
    _action
  );

  // save localy
  await localDbAction();

  // If conflict, no send to remote
  if (conflictFlag) return;

  // @TODO : TO REMOTE !!!
  // Simulate offline mode.
  // If offline mode, abord.
  if (isOffline()) return;

  // Calling queue system to avoid network flooding,
  // and avoid the specific case sending node push
  // before getting last push node confirmation with last _rev.
  // Before pushing, we need to have last _rev in our node.
  // Emit on push room.
  remoteInterface.push(node, resp => {
    console.log('resp after push: ', resp);
    //@Todo : handle direct response to manage conflicts.
    handleRemoteResponse(resp);
  });
});

// Get data from remote DB and populate localDB.
// This function is called during login phase.
// LocalDB nodes collection need to already be empty.
export const populateLocalDbFromRemote = async user => {
  const { data } = await get(`/node/${user._id}`);
  const result = await populateLocalDb(data, {
    _sync_wait: SYNC_WAIT_OK,
    _sync_status: SYNC_STATUS_DONE
  });
  return result;
};

// Main booter for sync process.
export const syncLocalDbToRemote = async () => {
  // Create bulk sync instance.
  const bulkSync = new LocalSyncBulk();
  // Init : get local nodes to sync,
  // Prepare change status node on local DB,
  // Create remote node formatted to send on remote DB.
  await bulkSync.start();

  remoteInterface.sync(bulkSync.getRemote(), _actions => {
    // remote send _actions to localy perform, and conflicts.
    console.log('resp after sync: ', _actions);
    // Make localy wht need to be made : CRUD/conflict management.
    try {
      bulkSync.handleRemoteResponse(_actions);
    } catch (err) {
      console.error(err);
    }
    //console.log(_syncLocalStatus);
    //@Todo : handle later response to manage remote db writing errors.
  });
};

// Push new data to remoteDB.
export const push = async _action => {
  try {
    queue.add(_action);
  } catch (err) {
    console.error(err);
  }
};

async function prepareNodeToLocalPush(_action) {
  const { type, data } = _action;
  let localDbAction = null;
  let node = null;
  let conflictFlag = false;

  switch (type) {
    case 'add':
      node = prepareLocalNodeBeforeCreatePush(data);
      localDbAction = putNodeToLocalDb.bind(null, node);
      break;
    case 'update':
      const localNode = await getLocalNodeById(_action.data._id);
      console.log('local update node', localNode);
      if (localNode._sync_conflict) {
        conflictFlag = true;
        node = prepareLocalNodeBeforeConflictPush(data, localNode);
      } else {
        node = prepareLocalNodeBeforeUpdatePush(data, localNode);
      }
      localDbAction = updateNodeToLocalDb.bind(null, node._id, node);
      break;
    case 'remove':
      // @TODO Gerer les conflicts !!!
      node = prepareLocalNodeBeforeDeletePush(data);
      localDbAction = updateNodeToLocalDb.bind(null, node._id, node);
      break;
    default:
      break;
  }
  return {
    node,
    localDbAction,
    conflictFlag
  };
}

// Handler listening socket blabla.
function pushOkHandler(data) {
  //console.log("from remote after push is OK: ", data);
}

// Handler listening socket blabla.
function pushErrorsHandler(data) {
  console.log('from remote after push is ERROR: ', data);
}

// Handler listening server for errors druning CRUD operation on remote DB.
function syncErrorsHandler(data) {
  console.log('from sync_errors: ', data);
}

function syncOkHandler(data) {
  console.log('from sync_ok: ', data);
}

async function syncChange(data) {
  // @TODO TO REMOVE !!!
  // Simulate offline mode.
  // If offline mode, abord.
  if (isOffline()) return;

  const sync = new LocalSync();
  await sync.handleRemoteStream(data);
}

function handleRemoteResponse(_actions) {
  if (_actions) {
    _actions.forEach(action => {
      switch (action.type) {
        case 'conflict':
          const node = prepareSyncedLocalNodeToConflict(action.data);
          console.log('CONFLICT PREPARED NODE', node);
          updateNodeToLocalDb(node._id, node);
          break;

        default:
          break;
      }
    });
  }
}

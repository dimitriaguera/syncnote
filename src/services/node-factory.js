import uuidv1 from "uuid/v1";
import { getLocalUser } from "./session";
import {
  SYNC_WAIT_OK,
  SYNC_WAIT_CREA,
  SYNC_WAIT_UPT,
  SYNC_WAIT_DEL,
  SYNC_STATUS_DONE,
  SYNC_STATUS_PENDING,
  SYNC_STATUS_CONFLICT
} from "../globals/_sync_status";

// Create local node model.
export const buildNode = (name, shared = [], parent = "", content = null) => {
  return {
    _id: uuidv1(),
    _tId: uuidv1(),
    owner: getLocalUser()._id,
    parent: parent,
    name: name,
    content: content,
    shared: shared,
    _sync_wait: SYNC_WAIT_CREA,
    _sync_status: SYNC_STATUS_PENDING
  };
};

// Prepair local node to update.
export const updateNode = (node, update = {}) => {
  return Object.assign(node, {
    ...update,
    _tId: uuidv1(),
    _sync_wait: SYNC_WAIT_UPT,
    _sync_status: SYNC_STATUS_PENDING
  });
};

// Format local node before sync transaction.
export const prepareLocalNodeBeforeCreatePush = localNode => {
  const { name, shared = [], parent = "", content = null } = localNode;
  const tId = uuidv1();
  return Object.assign(localNode, {
    _id: uuidv1(),
    _tId: tId,
    _sync_wait: SYNC_WAIT_CREA,
    _sync_status: SYNC_STATUS_PENDING,
    _sync_pool: [tId],
    owner: getLocalUser()._id,
    parent: parent,
    content: content,
    name: name,
    shared: shared
  });
};

// Format local node before sync transaction.
export const prepareLocalNodeBeforeUpdatePush = (update, localNode) => {
  const tId = uuidv1();
  return Object.assign(update, {
    _id: localNode._id, // Utile ???
    _tId: tId,
    _rev: localNode._rev,
    _sync_wait: SYNC_WAIT_UPT,
    _sync_status: SYNC_STATUS_PENDING,
    _sync_pool: [tId].concat(localNode._sync_pool || [])
  });
};

// Format local node before sync transaction.
export const prepareLocalNodeBeforeDeletePush = localNode => {
  const tId = uuidv1();
  return Object.assign(
    {},
    {
      _id: localNode._id,
      _tId: tId,
      _rev: localNode._rev,
      _sync_wait: SYNC_WAIT_DEL,
      _sync_status: SYNC_STATUS_PENDING,
      _sync_pool: [tId].concat(localNode._sync_pool || [])
    }
  );
};

// Format local node after received from sync stream
export const prepareSyncedLocalNodeToAdd = remoteNode => {
  return Object.assign(remoteNode, {
    _sync_status: SYNC_STATUS_DONE,
    _sync_wait: SYNC_WAIT_OK,
    _sync_pool: []
  });
};

// Refresh local node's _rev to match remote state
export const prepareSyncedLocalNodeToRefresh = remoteNode => {
  return {
    _rev: remoteNode._rev
  };
}

// Format local node after received from sync stream
export const prepareSyncedLocalNodeToUpdate = remoteNode => {
  //console.log("REMOTE NODE");
  return Object.assign({}, remoteNode, {
    _sync_status: SYNC_STATUS_DONE,
    _sync_wait: SYNC_WAIT_OK
  });
};

// Format local node after received from sync stream
export const prepareSyncedLocalNodeToRemove = remoteNode => {
  return typeof remoteNode === "string" ? remoteNode : remoteNode._id;
};

// Format local node after received from sync stream
export const prepareSyncedLocalNodeToOk = remoteNode => {
  const n = {
    _id: remoteNode._id,
    _sync_status: SYNC_STATUS_DONE,
    _sync_wait: SYNC_WAIT_OK,
    _sync_pool: getCleanTransaction(remoteNode)
  };

  if (remoteNode._rev) {
    n._rev = remoteNode._rev;
  }

  return n;
};

// Format local node after received from sync stream
export const prepareSyncedLocalNodeToConflict = conflictObject => {
  //console.log("CONFLICT OBJ: ", conflictObject);
  return {
    _id: conflictObject.rNode._id,
    _sync_status: SYNC_STATUS_CONFLICT,
    _sync_wait: SYNC_WAIT_OK
  };
};

// Format nodes received from remote DB.
// Need to prepar before inserting in localDB :
// Adding _sync status values.
export const formatUploadedNodes = (data, opt = {}) => {
  if (Array.isArray(data)) {
    return data.map(node => {
      return formatUploadedSoloNode(node, opt);
    });
  } else {
    return formatUploadedSoloNode(data, opt);
  }
};

// Format one node for localDB.
export const formatUploadedSoloNode = (node, opt) => {
  return Object.assign(node, { ...opt, _sync_pool: [] });
};

// Convert array to object with specified key.
// Apply func to each node in array.
export const prepareNodesToSync = (array, key) => {
  const toRemote = {};
  const toLocal = [];
  const tId = uuidv1();
  for (let i = 0, l = array.length; i < l; i++) {
    const id = array[i][key];
    toRemote[id] = clearNodeToRemoteSync(array[i], tId);
    toLocal.push(prepareNodeBeforeSync(array[i], tId));
  }
  return { toRemote: toRemote, toLocal: toLocal };
};

// Clear node properties that can't be send to remote db.
export const clearNodeToRemoteSync = (node, tId) => {
  const toRemote = Object.assign({}, node);
  toRemote._tId = tId;
  delete toRemote._sync_pool;
  return toRemote;
};

// Format node to local db before syncing.
export const prepareNodeBeforeSync = (node, tId) => {
  return Object.assign(node, {
    _id: node._id,
    _tId: tId,
    _sync_status: SYNC_STATUS_PENDING,
    _sync_pool: [tId].concat(node._sync_pool)
  });
};

//Transaction helpers.
export const isLastTransaction = (_tId, node) => {
  // test if last transaction
  const last = _tId === node._tId;

  // If is last, clear _sync_pool array
  if( last ) {
    node._sync_pool.splice(0 , node._sync_pool.length);
  }

  // return bool
  return last;
};

export const isOwnerOfThisTransaction = (_tId, node) => {
  // get position
  const index = node._sync_pool.indexOf(_tId);

  // if element in array
  if( index > -1 ) {
    // remove _tid from array
    node._sync_pool.splice( index, 1 );
    console.log('******************** Transaction owner');
    return true;
  }
  console.log('******************** No transaction owner', _tId, node._sync_pool);
  return false;
};

export const getCleanTransaction = node => {
  const _pool = node._sync_pool ? [].concat(node._sync_pool) : [];
  if (_pool.length) {
    const index = node._sync_pool.indexOf(node._tId);
    if (index > -1) {
      _pool.splice(index, 1);
    }
  }
  return _pool;
};

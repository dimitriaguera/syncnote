import uuidv1 from "uuid/v1";
import {
  populateLocalDb,
  putNodeToLocalDb,
  getNodesToSync,
  bulkAddNodeToLocalDb,
  bulkPutNodeToLocalDb,
  bulkDeleteNodeToLocalDb
} from "./local-db";
import { get, post } from "./fetch";
import {
  SYNC_WAIT_OK,
  SYNC_WAIT_CREA,
  SYNC_WAIT_UPT,
  SYNC_WAIT_DEL,
  SYNC_STATUS_DONE,
  SYNC_STATUS_PENDING,
  SYNC_STATUS_CONFLICT
} from "../globals/_sync_status";
import socket from "../services/socket";

// Socket "s.on()" events registration.
// This is data entry point from remoteDB changes.
socket.eventRegister("pull", pullHandler);
socket.eventRegister("sync_errors", syncErrorsHandler);
socket.eventRegister("sync_ok", syncOkHandler);
socket.eventRegister("sync_change", syncChange);

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
  // @TODO: filtrer les nodes non synchronisés.
  // Get local nodes.
  const localNodes = await getNodesToSync();
  // Format local nodes.
  const formatedNodes = arrayToObject(localNodes, "_id");
  // Emit local DB to sync room. Start remote sync process.
  socket.emit("sync", formatedNodes, _actions => {
    // remote send _actions to localy perform, and conflicts.
    console.log("resp after sync: ", _actions);
    // Make localy wht need to be made : CRUD/conflict management.
    const _syncLocalStatus = syncLocalDb(_actions);
    console.log(_syncLocalStatus);
    //@Todo : handle later response to manage remote db writing errors.
  });
};

// Compare local to remote and spread actions to perform.
function syncLocalDb(_actions) {
  const actionsRunner = new LocalSyncAction(_actions);
  // conflicts: [],
  // add: [],
  // update: [],
  // remove: [],
  // ok: []

  actionsRunner.run();
}

class SyncAction {
  constructor(data = {}) {
    this.status = null;
    this.addQueue = [];
    this.updateQueue = [];
    this.removeQueue = [];
    this.okQueue = [];
    this.conflictQueue = [];
    this.init(data);
  }

  init(data) {
    if (data.add) {
      data.add.forEach(node => {
        this.add(node);
      });
    }
    if (data.update) {
      data.update.forEach(node => {
        this.update(node);
      });
    }
    if (data.remove) {
      data.remove.forEach(node => {
        this.remove(node);
      });
    }
    if (data.ok) {
      data.ok.forEach(nId => {
        this.ok(nId);
      });
    }
    if (data.conflict) {
      data.conflict.forEach(conflictObject => {
        this.conflict(conflictObject);
      });
    }
  }

  add(node) {
    this.addQueue.push(this.prepToAdd(node));
  }

  update(node) {
    this.updateQueue.push(this.prepToUpdate(node));
  }

  remove(node) {
    this.removeQueue.push(this.prepToRemove(node));
  }

  ok(nId) {
    this.okQueue.push(this.prepToOk(nId));
  }

  conflict(conflictObject) {
    this.conflictQueue.push(this.prepToConflict(conflictObject));
  }
}

class LocalSyncAction extends SyncAction {
  async run() {
    const running = [];
    console.log(
      "LOCAL RUN QUEUES: ",
      this.addQueue,
      this.updateQueue,
      this.removeQueue,
      this.okQueue,
      this.conflictQueue
    );
    if (this.addQueue.length) running.push(this.addAction());
    if (this.updateQueue.length) running.push(this.updateAction());
    if (this.removeQueue.length) running.push(this.removeAction());
    if (this.okQueue.length) running.push(this.okAction());
    if (this.conflictQueue.length) running.push(this.conflictAction());
    try {
      const soWhat = await Promise.all(running);
      console.log("LOCAL RUN REPORT: ", soWhat);
    } catch (err) {
      console.log("LOCAL RUNNER ERRORS: ", err);
    }
  }

  addAction() {
    return bulkAddNodeToLocalDb(this.addQueue);
  }

  updateAction() {
    return bulkPutNodeToLocalDb(this.updateQueue);
  }

  removeAction() {
    return bulkDeleteNodeToLocalDb(this.removeQueue);
  }

  okAction() {
    return bulkPutNodeToLocalDb(this.okQueue);
  }

  conflictAction() {
    // TODO : make a bulkUpdate function...
    return bulkPutNodeToLocalDb(this.conflictQueue);
  }

  prepToAdd(node) {
    return Object.assign(node, {
      _sync_status: SYNC_STATUS_DONE,
      _sync_wait: SYNC_WAIT_OK
    });
  }

  prepToUpdate(node) {
    return Object.assign(node, {
      _sync_status: SYNC_STATUS_DONE,
      _sync_wait: SYNC_WAIT_OK
    });
  }

  prepToRemove(node) {
    return typeof node === "object" ? node._id : node;
  }

  prepToOk(nId) {
    return {
      _id: nId,
      _sync_status: SYNC_STATUS_DONE,
      _sync_wait: SYNC_WAIT_OK
    };
  }

  prepToConflict(conflictObject) {
    return Object.assign(
      {},
      {
        _id: conflictObject.rNode._id,
        _sync_status: SYNC_STATUS_CONFLICT,
        _sync_wait: SYNC_WAIT_OK
      }
    );
  }
}

// Push new data to remoteDB.
export const push = async data => {
  try {
    // Update local indexDBbefore emtting to remote.
    // This is to allow working offline.
    putNodeToLocalDb(data);
    // Emit on push room.
    socket.emit("push", data, resp => {
      console.log("resp after push: ", resp);
      //@Todo : handle response to manage conflicts.
    });
  } catch (err) {
    console.log(err);
  }
};

// Handler listening socket blabla.
async function pullHandler(data) {
  console.log("from pull: ", data);
  putNodeToLocalDb(data);
}

// Handler listening server for errors druning CRUD operation on remote DB.
function syncErrorsHandler(data) {
  console.log("from sync_errors: ", data);
}
function syncOkHandler(data) {
  console.log("from sync_ok: ", data);
}
function syncChange(data) {
  console.log("from sync_change: ", data);
}

// Convert array to object with specified key.
function arrayToObject(array, key) {
  const obj = {};
  for (let i = 0, l = array.length; i < l; i++) {
    const id = array[i][key];
    obj[id] = array[i];
  }
  return obj;
}

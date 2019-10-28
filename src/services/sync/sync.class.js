import chalk from "chalk";
import {
  putNodeToLocalDb,
  updateNodeToLocalDb,
  deleteNodeToLocalDb,
  getNodesToSync,
  getLocalNodeById,
  bulkAddNodeToLocalDb,
  bulkPutNodeToLocalDb,
  bulkUpdateNodeToLocalDb,
  bulkDeleteNodeToLocalDb
} from "../local-db";

import {
  prepareSyncedLocalNodeToAdd,
  prepareSyncedLocalNodeToUpdate,
  prepareSyncedLocalNodeToRefresh,
  prepareSyncedLocalNodeToRemove,
  prepareSyncedLocalNodeToOk,
  prepareSyncedLocalNodeToConflict,
  prepareNodesToSync,
  isLastTransaction,
  isOwnerOfThisTransaction
} from "../node-factory";

import {
  SYNC_WAIT_OK
  /*SYNC_WAIT_CREA,
  SYNC_WAIT_UPT,
  SYNC_WAIT_DEL,
  SYNC_STATUS_DONE,
  SYNC_STATUS_PENDING,
  SYNC_STATUS_CONFLICT*/
} from "../../globals/_sync_status";

import { remoteInterface } from './sync.remote';

class LocalSyncBulk {
  constructor() {
    this.toRemote = {};
    this.queue = { add: [], update: [], remove: [], ok: [], conflict: [] };
  }

  async start() {
    // Get local nodes.
    const localNodes = await getNodesToSync();
    // Format local nodes.
    const { toRemote, toLocal } = prepareNodesToSync(localNodes, "_id");
    // Store remote on memory.
    this.toRemote = toRemote;
    // Update local transaction pool for each node.
    // Await can be removed to parallel run.
    await bulkUpdateNodeToLocalDb(toLocal);
    // TODO Check if remote connection enabled.
  }

  async handleRemoteResponse(response) {
    for (let i = 0, l = response.length; i < l; i++) {
      const { type, data } = response[i];
      // No switch case used because serveur resp formatted for checkConflict.
      // TODO !!! checkConflict for OK and CONFLICT type
      const _action = await checkConflict(data._id, data, type);
      this[_action.type](_action.data);
    }

    await this.run();
  }

  async run() {
    //console.log(chalk.yellow("LOCAL RUNNER : "));
    //console.log(this.queue);
    //console.log(chalk.yellow("------------------------------"));
    const running = [];
    if (this.queue.add.length)
      running.push(bulkAddNodeToLocalDb(this.queue.add));
    if (this.queue.update.length)
      running.push(bulkUpdateNodeToLocalDb(this.queue.update));
    if (this.queue.remove.length)
      running.push(bulkDeleteNodeToLocalDb(this.queue.remove));
    if (this.queue.ok.length)
      running.push(bulkUpdateNodeToLocalDb(this.queue.ok));
    if (this.queue.conflict.length) {
      // running.push(bulkPutNodeToLocalDb(this.queue.conflict));
      const logAllConflicts = new Promise((res, rej) => {
        this.queue.conflict.forEach(x => console.warn("conflictObj : ", x));
        res();
      });
      running.push(logAllConflicts);
    }
    try {
      await Promise.all(running);
    } catch (err) {
      console.log("LOCAL RUNNER ERRORS: ", err);
    }
  }

  getRemote() {
    return this.toRemote;
  }

  add(node) {
    this.queue.add.push(prepareSyncedLocalNodeToAdd(node));
  }

  update(node) {
    this.queue.update.push(prepareSyncedLocalNodeToUpdate(node));
  }

  remove(node) {
    this.queue.remove.push(prepareSyncedLocalNodeToRemove(node));
  }

  ok(node) {
    this.queue.ok.push(prepareSyncedLocalNodeToOk(node));
  }

  conflict(conflictObject) {
    this.queue.conflict.push(prepareSyncedLocalNodeToConflict(conflictObject));
  }
}

class LocalSync {
  constructor() {
    this.type = null;
    this.func = null;
    this.callback = null;
  }

  async handleRemoteStream(streamData = {}) {
    let _action = null;
    switch (streamData.operationType) {
      case "insert":
        _action = await checkConflict(
          streamData.documentKey._id,
          streamData.fullDocument,
          "add"
        );
        break;
      case "update":
        _action = await checkConflict(
          streamData.documentKey._id,
          streamData.updateDescription.updatedFields,
          "update"
        );
        break;
      case "replace":
        _action = await checkConflict(
          streamData.documentKey._id,
          streamData.fullDocument,
          "update"
        );
        break;
      case "delete":
        _action = new Action();
        _action.remove(streamData.documentKey._id);
        break;
      default:
        break;
    }
    //console.log("local _action after stream: ", _action);

    if (!_action) {
      console.log("Let it be...");
    } else {
      this.init(_action);
      return this.run();
    }
  }

  init(_action) {
    if (_action) {
      if (this[_action.type] && typeof this[_action.type] === "function") {
        this[_action.type](_action.data);
      } else {
        throw new Error(
          `Init LocalSyncAction error. Not valid argument: ${_action}`
        );
      }
    }
  }

  add(node) {
    this.func = putNodeToLocalDb.bind(null, prepareSyncedLocalNodeToAdd(node));
  }

  update(node) {
    this.func = updateNodeToLocalDb.bind(
      null,
      node._id,
      prepareSyncedLocalNodeToUpdate(node)
    );
  }

  refresh(node) {
    this.callback = () => remoteInterface.nextPush(node._id, node._rev);
    this.func = updateNodeToLocalDb.bind(
      null,
      node._id,
      prepareSyncedLocalNodeToRefresh(node)
    );
  }

  remove(nid) {
    this.func = deleteNodeToLocalDb.bind(null, nid);
  }

  ok(node) {
    this.callback = () => remoteInterface.nextPush( node._id, node._rev );
    this.func = updateNodeToLocalDb.bind(
      null,
      node._id,
      prepareSyncedLocalNodeToOk(node)
    );
  }

  conflict(conflictObject) {
    this.func = putNodeToLocalDb.bind(
      null,
      prepareSyncedLocalNodeToConflict(conflictObject)
    );
  }

  async run() {
    if (this.func) {
      try {
        const soWhat = await this.func();
        if( this.callback ) {
          this.callback();
        }
        //console.log("LOCAL RUN REPORT: ", soWhat);
      } catch (err) {
        console.log("LOCAL RUNNER ERRORS: ", err);
      }
    }
  }
}

class Action {
  constructor() {
    this.type = null;
    this.data = null;
  }
  add(data) {
    this.type = "add";
    this.data = data;
    return this;
  }
  update(data) {
    this.type = "update";
    this.data = data;
    return this;
  }
  refresh(data) {
    this.type = "refresh";
    this.data = data;
    return this;
  }
  remove(data) {
    this.type = "remove";
    this.data = data;
    return this;
  }
  ok(data) {
    this.type = "ok";
    this.data = data;
    return this;
  }
  conflict(data) {
    this.type = "conflict";
    this.data = data;
    return this;
  }
  getType() {
    return this.type;
  }
  getData() {
    return this.data;
  }
}

async function checkConflict(_id, node, type) {
  const { _tId, _rev } = node;
  const _action = new Action();

  // If type conflict.
  if (type === "conflict") {
    console.log('============= check-conflict : CONFLICT', _rev);
    _action.conflict(node);
    return _action;
  }

  // If no _id, can't do anything.
  if (!_id || !_tId) {
    console.log('============= check-conflict : NO ID');
    throw new Error(`No _id or _tId for node ${JSON.stringify(node)}`);
  }

  // Store last _rev to queue
  remoteInterface.storeRev( _id, _rev );

  // Get local node.
  const localNode = await getLocalNodeById(_id);

  // If no local node, add it.
  if (!localNode) {
    console.log('============= check-conflict : NO CONFLICT 1', _rev);
    _action.add(node);
    return _action;
  }

  // If node streamed from current client sync transaction, just say sync ok.
  if (isLastTransaction(_tId, localNode)) {
    console.log('============= check-conflict : NO CONFLICT 2', _rev);
    _action.ok(
      Object.assign(localNode, {
        _rev: node._rev
      })
    );

    // proceed next waiting push sync for this node
    return _action;
  }

  // If node streamed from old client sync transaction
  // Just update the local _rev id to match current remote state
  if (isOwnerOfThisTransaction(_tId, localNode)) {
    console.log('============= check-conflict : NOT LAST TRANSACTION', _rev);
    console.log('===================== old _rev', localNode._rev);
    console.log('===================== new _rev', _rev);
    _action.refresh({ _id, _rev });
    return _action;
  }

  // If not same transaction but node not pending, no conflict, we can create or update.
  if (localNode._sync_wait === SYNC_WAIT_OK) {
    console.log('============= check-conflict : NO CONFLICT 3', _rev);
    _action[type](Object.assign({}, localNode, node));
    return _action;
  }

  console.log('============= check-conflict : CONFLICT....', _rev, node._tid, localNode);
  // Else, localNode change not saved, go conflict.
  _action.conflict({
    code: "LOCAL_NO_SAVE",
    from: "local",
    text: "Local node change not saved",
    rNode: localNode
  });
  return _action;
}

export { LocalSyncBulk, LocalSync };

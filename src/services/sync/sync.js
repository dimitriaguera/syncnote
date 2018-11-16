import { LocalSyncBulk, LocalSync } from "./sync.class";
import { populateLocalDb, putNodeToLocalDb } from "../local-db";
import { get } from "../fetch";
import {
  prepareLocalNodeBeforeCreatePush,
  prepareLocalNodeBeforeUpdatePush,
  prepareLocalNodeBeforeDeletePush,
  clearNodeToRemoteSync
} from "../node-factory";
import { SYNC_WAIT_OK, SYNC_STATUS_DONE } from "../../globals/_sync_status";
import socket from "../../services/socket";

// Socket "s.on()" events registration.
// This is data entry point from remoteDB changes.
socket.eventRegister("push_ok", pushOkHandler);
socket.eventRegister("push_errors", pushErrorsHandler);
socket.eventRegister("sync_ok", syncOkHandler);
socket.eventRegister("sync_errors", syncErrorsHandler);
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
  // Create bulk sync instance.
  const bulkSync = new LocalSyncBulk();
  // Init : get local nodes to sync,
  // Prepare change status node on local DB,
  // Create remote node formatted to send on remote DB.
  await bulkSync.start();

  socket.emit("sync", bulkSync.getRemote(), _actions => {
    // remote send _actions to localy perform, and conflicts.
    console.log("resp after sync: ", _actions);
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
    // Prepare node to sync.

    const { toRemote, toLocal } = prepareNodeToPush(_action, "_id");

    console.log("Push remote data: ", toRemote);
    console.log("Push local data: ", toLocal);

    // Update local indexDBbefore emtting to remote.
    // This is to allow working offline.
    await putNodeToLocalDb(toLocal);

    // Emit on push room.
    socket.emit("push", toRemote, resp => {
      console.log("resp after push: ", resp);
      //@Todo : handle direct response to manage conflicts.
    });
  } catch (err) {
    console.log(err);
  }
};

// Prepare data before sending to remote via push socket room.
// Need to be formatted for both local and remote DB.
// Need to be formatted according to action type: add, update or remove.
function prepareNodeToPush(_action, key) {
  const { type, data } = _action;
  let node = null;
  switch (type) {
    case "add":
      node = prepareLocalNodeBeforeCreatePush(data);
      break;
    case "update":
      node = prepareLocalNodeBeforeUpdatePush(data);
      break;
    case "remove":
      node = prepareLocalNodeBeforeDeletePush(data);
      break;
    default:
      break;
  }
  return { toRemote: clearNodeToRemoteSync(node, node._tId), toLocal: node };
}

// Handler listening socket blabla.
async function pushOkHandler(data) {
  console.log("from remote after push is OK: ", data);
}

// Handler listening socket blabla.
async function pushErrorsHandler(data) {
  console.log("from remote after push is ERROR: ", data);
}

// Handler listening server for errors druning CRUD operation on remote DB.
function syncErrorsHandler(data) {
  console.log("from sync_errors: ", data);
}
function syncOkHandler(data) {
  console.log("from sync_ok: ", data);
}
async function syncChange(data) {
  console.log("from sync_change: ", data);
  const sync = new LocalSync();
  await sync.handleRemoteStream(data);
}

import Dexie from "dexie";
import "dexie-observable";
import { changeInAppState } from "./app-state";
import { formatUploadedNodes } from "./node-factory";
import { SYNC_STATUS_OK } from "../globals/_sync_status";

let _DB = null;

function getDbName(userId) {
  return `__syncnote__${userId}`;
}

export const initLocalDb = async user => {
  if (_DB) {
    await _DB.delete();
  }
  _DB = new Dexie(getDbName(user._id));
  _DB.version(1).stores({ nodes: "&_id, _sync, name, parent, owner, *shared" });
  await _DB.open();
  _DB.on("changes", changeInAppState);
};

export const populateLocalDb = async (data, opt) => {
  return _DB.transaction("rw", _DB.nodes, async () => {
    const nodes = formatUploadedNodes(data, opt);
    return await _DB.nodes.bulkPut(nodes);
  });
};

export const getAllLocalNodes = async () => {
  const data = await Promise.all([_DB.nodes.toArray()]);
  return {
    nodes: data[0]
  };
};

export const clearLocalDb = async () => {
  if (!_DB) return null;
  return await _DB.nodes.clear();
};

export const updateLocalDb = async data => {
  return await _DB.nodes.put(data);
};

// FAKE !!!! CHANGE TO BUILD TRUE ARRAY.
export const getNodesToSync = async () => {
  return await _DB.nodes
    //.where("_sync")
    //.equals(SYNC_STATUS_OK)
    .toArray();
};

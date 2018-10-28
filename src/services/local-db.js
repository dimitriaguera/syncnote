import Dexie from "dexie";
import "dexie-observable";
import { changeInAppState } from "./app-state";
import { formatUploadedNodes } from "./node-factory";
import {
  SYNC_WAIT_OK,
  SYNC_WAIT_CREA,
  SYNC_WAIT_UPT,
  SYNC_WAIT_DEL,
  SYNC_STATUS_DONE,
  SYNC_STATUS_PENDING,
  SYNC_STATUS_CONFLICT,
  SYNC_STATUS_ERROR
} from "../globals/_sync_status";

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

export const getAllLocalNodes = async () => {
  const data = await Promise.all([_DB.nodes.toArray()]);
  return {
    nodes: data[0]
  };
};

export const getNodesToSync = async () => {
  return await _DB.nodes.toArray();
};

export const populateLocalDb = async (data, opt) => {
  return _DB.transaction("rw", _DB.nodes, async () => {
    const nodes = formatUploadedNodes(data, opt);
    return await _DB.nodes.bulkPut(nodes);
  });
};

export const clearLocalDb = async () => {
  if (!_DB) return null;
  return await _DB.nodes.clear();
};

export const putNodeToLocalDb = async node => {
  return await _DB.nodes.put(node);
};

export const updateNodeToLocalDb = async (id, update) => {
  return await _DB.nodes.update(id, update);
};

export const deleteNodeToLocalDb = async id => {
  return await _DB.nodes.delete(id);
};

export const bulkAddNodeToLocalDb = async nodes => {
  return await _DB.nodes.bulkAdd(nodes);
};

export const bulkUpdateNodeToLocalDb = async nodes => {
  return await Promise.all(
    nodes.map(node => {
      return _DB.nodes.update(node._id, node);
    })
  );
};

export const bulkPutNodeToLocalDb = async nodes => {
  return await _DB.nodes.bulkPut(nodes);
};

export const bulkDeleteNodeToLocalDb = async id => {
  return await _DB.nodes.bulkDelete(id);
};

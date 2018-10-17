import Dexie from "dexie";
import "dexie-observable";
import { changeInAppState } from "./app-state";

let _DB = null;

function getDbName(userId) {
  return `__syncnote__${userId}`;
}

export const initLocalDb = user => {
  if (_DB) {
    _DB.delete();
  }
  _DB = new Dexie(getDbName(user._id));
  _DB.version(1).stores({ nodes: "&_id, name, parent, owner, *shared" });
  _DB.on("changes", changeInAppState);
};

export const populateLocalDb = async data => {
  return _DB.transaction("rw", _DB.nodes, async () => {
    //await _DB.nodes.clear();
    await _DB.nodes.bulkPut(data);
  });
};

export const getAllTables = async () => {
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

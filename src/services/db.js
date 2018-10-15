import Dexie from "dexie";
import "dexie-observable";
import { changeInStore } from "./store";
import { getLocalUser } from "./session";

let _DB = null;

function getDbName(userId) {
  return `__syncnote__${userId}`;
}

export const initDb = user => {
  try {
    if (_DB) {
      _DB.close();
    }
    _DB = new Dexie(getDbName(user._id));
    _DB.version(1).stores({ nodes: "&_id, name, parent, owner, *shared" });
    _DB.on("changes", changeInStore);
  } catch (e) {
    console.log(e);
  }
};

export const createDb = async data => {
  return _DB.transaction("rw", _DB.nodes, async () => {
    await _DB.nodes.clear();
    await _DB.nodes.bulkPut(data);
  });
};

export const getAllTables = async () => {
  const data = await Promise.all([_DB.nodes.toArray()]);
  return {
    nodes: data[0]
  };
};

export const clearDb = async () => {
  if (!_DB) return null;
  return await _DB.nodes.clear();
};

export const updateDb = async data => {
  return await _DB.nodes.put(data);
};

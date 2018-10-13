import Dexie from "dexie";
import "dexie-observable";
import { changeInStore } from "./store";

const db = new Dexie("syncnote");

db.version(1).stores({
  nodes: "&_id, name, parent, owner, *shared"
});

db.on("changes", changeInStore);

export const createDb = async data => {
  try {
    await db.nodes.clear();
    await db.nodes.bulkPut(data);
  } catch (err) {
    console.log(err);
  }
};

export const clearDb = async () => {
  try {
    return await db.nodes.clear();
  } catch (err) {
    console.log(err);
  }
};

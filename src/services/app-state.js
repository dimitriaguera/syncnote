import { store } from "./store";
import { MODE_OFFLINE_ID } from "../globals/_sync_status";
import {
  //create_node,
  bulk_crud_node,
  bulk_node_state_router
  //update_node,
  //delete_node
} from "../redux/actions";

// Get App mode ID (offline, online, etc)
export const getAppMode = () => {
  const state = store.getState();
  return state.mode.id;
}

export const isOffline = () => {
  return getAppMode() === MODE_OFFLINE_ID;
}

export const changeInAppState = changes => {
  console.log("CHANGES BY DEXIE OBS: ", changes);
  const data = buildBulkRequest(changes);
  console.log("DATA SEND TO STATE: ", data);
  onBulk(data);
};

export const getReferentNode = id => {
  const state = store.getState();
  return Object.assign({}, state.nodes[id]);
};

/*function onCreate(change, partial) {
  store.dispatch(create_node(change.obj));
}

function onUpdate(change, partial) {
  store.dispatch(update_node(change.obj));
}

function onDelete(change, partial) {
  store.dispatch(delete_node(change.key));
}*/

function onBulk(data) {
  //store.dispatch(bulk_crud_node(data));
  store.dispatch(bulk_node_state_router(data));
}

function buildBulkRequest(changes) {
  const bulk = {
    create: [],
    update: [],
    delete: []
  };
  changes.forEach(function(change, partial) {
    switch (change.type) {
      case 1:
        bulk.create.push(change.obj);
        break;
      case 2:
        bulk.update.push(change.obj);
        break;
      case 3:
        bulk.delete.push(change.key);
        break;

      default:
        console.log(`Change type ${change.type} no handled.`);
    }
  });

  return bulk;
}

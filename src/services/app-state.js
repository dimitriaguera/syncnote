import { store } from "./store";
import {
  //create_node,
  bulk_node
  //update_node,
  //delete_node
} from "../redux/actions";

export const changeInAppState = changes => {
  console.log("CHANGES : ", changes);
  const data = buildBulkRequest(changes);
  console.log("DATA : ", data);
  onBulk(data);
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
  store.dispatch(bulk_node(data));
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

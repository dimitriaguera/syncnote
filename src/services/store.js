import { store } from "./reduxServ";
import { create_node, update_node, delete_node } from "../redux/actions";

export const changeInStore = changes => {
  changes.forEach(function(change, partial) {
    switch (change.type) {
      case 1:
        onCreate(change, partial);
        break;
      case 2:
        onUpdate(change, partial);
        break;
      case 3:
        onDelete(change, partial);
        break;

      default:
        console.log(`Change type ${change.type} no handled.`);
    }
  });
};

function onCreate(change, partial) {
  console.log("An object was created: " + JSON.stringify(change.obj));
  store.dispatch(create_node(change.obj));
}

function onUpdate(change, partial) {
  console.log(
    "An object with key " +
      change.key +
      " was updated with modifications: " +
      JSON.stringify(change.mods)
  );
  store.dispatch(update_node(change.obj));
}

function onDelete(change, partial) {
  console.log(change);
  console.log("An object was deleted: " + JSON.stringify(change.oldObj));
  store.dispatch(delete_node(change.key));
}

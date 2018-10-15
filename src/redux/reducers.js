import { combineReducers } from "redux";
import { auth } from "./modules/auth";
import { alert } from "./modules/alert";
import { nodes } from "./modules/nodes";
import { boot } from "./modules/boot";

export default combineReducers({
  boot,
  auth,
  alert,
  nodes
});

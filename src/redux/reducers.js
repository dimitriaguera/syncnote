import { combineReducers } from "redux";
import { auth } from "./modules/auth";
import { alert } from "./modules/alert";
import { nodes } from "./modules/nodes";

export default combineReducers({
  auth,
  alert,
  nodes
});

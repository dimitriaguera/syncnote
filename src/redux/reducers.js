import { combineReducers } from "redux";
import { auth } from "./modules/auth";
import { alert } from "./modules/alert";
import nodeDisplayModes from "./modules/nodes";
import { mode } from "./modules/mode";
import { boot } from "./modules/boot";

export default combineReducers({
  boot,
  auth,
  alert,
  mode,
  ...nodeDisplayModes
});

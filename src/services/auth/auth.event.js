import { store } from "../store";
import { switchLogin, logout } from "../../redux/actions";
import { onUserChange } from "../session";

onUserChange(
  () => {
    store.dispatch(logout);
  },
  user => {
    store.dispatch(switchLogin(user));
  }
);

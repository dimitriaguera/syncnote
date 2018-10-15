import { loginFetch } from "../services/authentication";
import { createDbFromRemote } from "../services/sync";
import { initDb, clearDb, getAllTables } from "../services/db";
import socket from "../services/socket";
import {
  setLocalToken,
  setLocalUser,
  getLocalUser,
  clearLocalStorage
} from "../services/session";

import { BOOT_START, BOOT_SUCCESS, BOOT_FAILURE } from "./_constants";

export const boot_start = () => {
  return { type: BOOT_START };
};

export const boot_success = () => {
  return { type: BOOT_SUCCESS };
};

export const boot_failure = err => {
  return { type: BOOT_FAILURE, err };
};

export const startBootLocalProcess = async dispatch => {
  try {
    const user = getLocalUser();
    if (user) {
      // Login user.
      await dispatch(login_success(user));
      // Create local user db.
      initDb(user);
      // Get IndexDb datas.
      const data = await getAllTables();
      // Set app state from datas.
      await dispatch(bulk_create_nodes(data.nodes));
      // Connecy to socket.
      socket.open();
      // End boot process.
      dispatch(boot_success());
    } else {
      dispatch(boot_success());
    }
  } catch (err) {
    clearDb();
    clearLocalStorage();
    dispatch(boot_failure(err));
  }
};

export const ALERT_SUCCESS = "app/alert/ALERT_SUCCESS";
export const ALERT_ERROR = "app/alert/ALERT_ERROR";
export const ALERT_WARNING = "app/alert/ALERT_WARNING";
export const ALERT_INFO = "app/alert/ALERT_INFO";
export const ALERT_CLEAR = "app/alert/ALERT_CLEAR";

export const msg_success = message => {
  return { type: ALERT_SUCCESS, message };
};

export const msg_warning = message => {
  return { type: ALERT_WARNING, message };
};

export const msg_info = message => {
  return { type: ALERT_INFO, message };
};

export const msg_error = error => {
  let message = error.message || error;
  return { type: ALERT_ERROR, message };
};

export const msg_clear = () => {
  return { type: ALERT_CLEAR };
};

export const LOGIN_REQUEST = "app/auth/LOGIN_REQUEST";
export const LOGIN_SUCCESS = "app/auth/LOGIN_SUCCESS";
export const LOGIN_FAILURE = "app/auth/LOGIN_FAILURE";
export const LOGOUT = "app/auth/LOGOUT";

export const login = (username, password) => {
  return async dispatch => {
    dispatch(login_request());
    try {
      const data = await loginFetch(username, password);
      socket.close();
      setLocalToken(data.token);
      setLocalUser(data.user);
      dispatch(login_success(data.user));
      initDb(data.user);
      createDbFromRemote(data.user);
      socket.open();
      dispatch(msg_success(`Successful logged as ${data.user.username}`));
    } catch (err) {
      socket.close();
      clearDb();
      clearLocalStorage();
      dispatch(login_failure());
      dispatch(msg_error(err));
    }
  };
};

export const logout = dispatch => {
  clearLocalStorage();
  clearDb();
  socket.close();
  dispatch(logout_request());
};

export const login_request = () => {
  return {
    type: LOGIN_REQUEST
  };
};

export const login_success = user => {
  return {
    type: LOGIN_SUCCESS,
    user: user
  };
};

export const login_failure = () => {
  return {
    type: LOGIN_FAILURE
  };
};

export const logout_request = () => {
  return {
    type: LOGOUT
  };
};

export const CREATE_NODE = "app/alert/CREATE_NODE";
export const BULK_CREATE_NODE = "app/alert/BULK_CREATE_NODE";
export const BULK_NODE = "app/alert/BULK_NODE";
export const UPDATE_NODE = "app/alert/UPDATE_NODE";
export const DELETE_NODE = "app/alert/DELETE_NODE";
export const CLEAR_NODE = "app/alert/CLEAR_NODE";

export const bulk_node = data => {
  return { type: BULK_NODE, data };
};

export const bulk_create_nodes = nodes => {
  return { type: BULK_CREATE_NODE, nodes };
};

export const create_node = node => {
  return { type: CREATE_NODE, node };
};

export const update_node = node => {
  return { type: UPDATE_NODE, node };
};

export const delete_node = id => {
  return { type: DELETE_NODE, id };
};

export const clear_node = () => {
  return { type: CLEAR_NODE };
};

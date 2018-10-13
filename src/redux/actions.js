import { loginFetch } from "../services/authentication";
import { createDbFromRemote } from "../services/sync";
import { clearDb } from "../services/db";
import {
  setLocalToken,
  setLocalUser,
  clearLocalStorage
} from "../services/session";

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

export const msg_error = message => {
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
      setLocalToken(data.token);
      setLocalUser(data.user);
      dispatch(login_success(data.user));
      dispatch(msg_success(`Successful logged as ${data.user.username}`));
      createDbFromRemote(data.user);
    } catch (err) {
      dispatch(login_failure());
      dispatch(msg_error(err));
    }
  };
};

export const logout = dispatch => {
  clearLocalStorage();
  clearDb();
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
export const UPDATE_NODE = "app/alert/UPDATE_NODE";
export const DELETE_NODE = "app/alert/DELETE_NODE";
export const CLEAR_NODE = "app/alert/CLEAR_NODE";

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

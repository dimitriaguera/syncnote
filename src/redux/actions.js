import { store } from "../services/store";
import { loginFetch } from "../services/auth/auth.api";
import {
  populateLocalDbFromRemote,
  syncLocalDbToRemote
} from "../services/sync/sync";
import {
  initLocalDb,
  clearLocalDb,
  getAllLocalNodes,
  getLocalNodeById
} from "../services/db/db.local";
import socket from "../services/socket";
import {
  setLocalToken,
  setLocalUser,
  getLocalUser,
  clearLocalStorage
} from "../services/session";
import {
  BOOT_START,
  BOOT_SUCCESS,
  BOOT_FAILURE,
  CREATE_NODE,
  BULK_CREATE_NODE,
  BULK_CRUD_NODE,
  UPDATE_NODE,
  DELETE_NODE,
  CLEAR_NODE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  ALERT_SUCCESS,
  ALERT_WARNING,
  ALERT_INFO,
  ALERT_CLEAR,
  ALERT_ERROR,
  ADD_WINDOW_NODE,
  UPDATE_WINDOW_NODE,
  CLEAR_WINDOW_NODE,
  SET_WINDOW_READ_MODE,
  SET_WINDOW_EDIT_MODE,
  SET_WINDOW_EDIT_READ_MODE,
  MODE_ONLINE,
  MODE_OFFLINE
} from "../globals/_action_types";

export const boot_start = () => {
  return { type: BOOT_START };
};

export const boot_success = () => {
  return { type: BOOT_SUCCESS };
};

export const boot_failure = err => {
  return { type: BOOT_FAILURE, err };
};

export const mode_online = () => {
  return { type: MODE_ONLINE };
};

export const mode_offline = () => {
  return { type: MODE_OFFLINE };
};

export const startBootLocalProcess = async dispatch => {
  try {
    const user = getLocalUser();
    if (user) {
      // Login user.
      await dispatch(login_success(user));
      // Create local user db.
      await initLocalDb(user);
      // Get IndexDb datas.
      const data = await getAllLocalNodes();
      // Set app state from datas.
      await dispatch(bulk_create_nodes(data.nodes));
      // Connecy to socket.
      socket.open();
      // End boot process.
      await dispatch(boot_success());
      // Return user booted.
      return user;
    } else {
      dispatch(boot_success());
      return null;
    }
  } catch (err) {
    clearLocalDb();
    clearLocalStorage();
    dispatch(boot_failure(err));
    return null;
  }
};

export const startSynchingProcess = async dispatch => {
  try {
    const user = getLocalUser();
    if (user) {
      console.log("Start syncing process...");
      syncLocalDbToRemote();
    }
  } catch (err) {
    console.log("Error during synching process launch...", err);
  }
};

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

export const login = (username, password) => {
  return async dispatch => {
    try {
      // Get user.
      const lastUser = getLocalUser();
      // Test if already logged.
      if (lastUser && lastUser.username === username) {
        return dispatch(msg_success(`${username} already logged.`));
      }
      // Start Login process.
      dispatch(login_request());
      // Get token form server.
      const { user, token } = await loginFetch(username, password);
      // Close current socket.
      socket.close();
      // Store roken and user object.
      setLocalToken(token);
      setLocalUser(user);
      // Login ok.
      dispatch(login_success(user));
      // Create localDb.
      await initLocalDb(user);
      // Populate localDb.
      await populateLocalDbFromRemote(user);
      socket.open();
      dispatch(msg_success(`Successful logged as ${user.username}`));
      await dispatch(startSynchingProcess);
    } catch (err) {
      socket.close();
      clearLocalDb();
      clearLocalStorage();
      dispatch(login_failure());
      dispatch(msg_error(err));
    }
  };
};

export const switchLogin = async user => {
  return async dispatch => {
    dispatch(login_request());
    try {
      socket.close();
      dispatch(login_success(user));
      await initLocalDb(user);
      await populateLocalDbFromRemote(user);
      socket.open();
      dispatch(msg_success(`Successful logged as ${user.username}`));
    } catch (err) {
      socket.close();
      clearLocalDb();
      dispatch(login_failure());
      dispatch(msg_error(err));
    }
  };
};

export const logout = dispatch => {
  clearLocalStorage();
  clearLocalDb();
  socket.close();
  dispatch(logout_request());
  dispatch(msg_success("Logged out."));
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

export const bulk_node_state_router = data => {
  return dispatch => {
    // get state
    const state = store.getState();
    // dispatch crud on nodeTree state
    dispatch(bulk_crud_node(data));
    // check if a node is displayed
    if( state.windowNode._id ) {
      // check if the displayed node is touch by crud
      // first check updated nodes
      for( let i = 0, l = data.update.length; i < l; i++ ) {
        const node = data.update[i];
        // if node updated is already displayed
        if( node._id === state.windowNode._id ) {
          // if content change
          if( node.content !== state.windowNode.content ) {
            // dispatch changes on windowNode state
            dispatch(update_window_node({ content: node.content }));
            break;
          }
        }
      }
      // then check deleted nodes
      for( let i = 0, l = data.delete.length; i < l; i++ ) {
        const _id = data.delete[i];
        // if node updated is already displayed
        if( _id === state.windowNode._id ) {
          // dispatch changes on windowNode state
          dispatch(clear_window_node());
          break;
        }
      }
    }
  };
};

export const bulk_crud_node = data => {
  return { type: BULK_CRUD_NODE, data };
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

export const readThisNode = async id => {
  return async dispatch => {
    const node = await getLocalNodeById(id);
    dispatch(add_window_node(id, node.content, node.conflicts, "read"));
  };
};

export const editThisNode = async id => {
  return async dispatch => {
    const node = await getLocalNodeById(id);
    dispatch(add_window_node(node._id, node.content, node.conflicts, "edit"));
  };
};

export const add_window_node = (id, content, conflicts, mode) => {
  return {
    type: ADD_WINDOW_NODE,
    _id: id,
    content: content,
    conflicts: conflicts,
    mode: mode
  };
};

export const update_window_node = update => {
  return {
    type: UPDATE_WINDOW_NODE,
    content: update.content
  };
};

export const clear_window_node = () => {
  return { type: CLEAR_WINDOW_NODE };
};

export const set_window_read_mode = () => {
  return { type: SET_WINDOW_READ_MODE };
};

export const set_window_edit_mode = () => {
  return { type: SET_WINDOW_EDIT_MODE };
};

export const set_window_edit_read_mode = () => {
  return { type: SET_WINDOW_EDIT_READ_MODE };
}

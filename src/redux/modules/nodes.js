import {
  CREATE_NODE,
  BULK_CREATE_NODE,
  BULK_CRUD_NODE,
  UPDATE_NODE,
  DELETE_NODE,
  CLEAR_NODE,
  ADD_WINDOW_NODE,
  UPDATE_WINDOW_NODE,
  CLEAR_WINDOW_NODE,
  SET_WINDOW_READ_MODE,
  SET_WINDOW_EDIT_MODE,
  SET_WINDOW_EDIT_READ_MODE
} from "../../globals/_action_types";
import { bindActionCreators } from "redux";

const initialState = {};

const treeNode = (state = initialState, action) => {
  let nState;
  switch (action.type) {
    case CREATE_NODE:
      nState = Object.assign({}, state);
      nState[action.node._id] = action.node;
      return nState;
    case BULK_CREATE_NODE:
      nState = Object.assign({}, state);
      action.nodes.forEach(node => {
        nState[node._id] = node;
      });
      return nState;
    case BULK_CRUD_NODE:
      nState = Object.assign({}, state);
      action.data.create.forEach(node => {
        nState[node._id] = node;
      });
      action.data.update.forEach(node => {
        nState[node._id] = Object.assign({}, state[node._id], node);
      });
      action.data.delete.forEach(id => {
        delete nState[id];
      });
      return nState;
    case UPDATE_NODE:
      return {
        ...state,
        [action.node._id]: Object.assign(
          {},
          state[action.node._id],
          action.node
        )
      };
    case DELETE_NODE:
      nState = Object.assign({}, state);
      delete nState[action.id];
      return nState;
    case CLEAR_NODE:
      return {};
    default:
      return state;
  }
};

const windowNode = (
  state = { _id: null, content: null, conflicts: null, mode: "read" },
  action
) => {
  switch (action.type) {
    case ADD_WINDOW_NODE:
      return {
        ...state,
        _id: action._id,
        content: action.content,
        conflicts: action.conflict,
        mode: action.mode ? action.mode : state.mode
      };
    case UPDATE_WINDOW_NODE:
      return {
        ...state,
        content: action.content
      };
    case CLEAR_WINDOW_NODE:
      return {
        ...state,
        _id: null,
        content: null,
        conflicts: null,
        mode: "read"
      };
    case SET_WINDOW_READ_MODE:
      return { ...state, mode: "read" };
    case SET_WINDOW_EDIT_MODE:
      return { ...state, mode: "edit" };
    case SET_WINDOW_EDIT_READ_MODE:
        return { ...state, mode: "edit-read" };
    default:
      return state;
  }
};

export default { treeNode, windowNode };

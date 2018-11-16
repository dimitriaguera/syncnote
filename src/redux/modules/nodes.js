import {
  CREATE_NODE,
  BULK_CREATE_NODE,
  BULK_NODE,
  UPDATE_NODE,
  DELETE_NODE,
  CLEAR_NODE
} from "../../globals/_action_types";

const initialState = {};

export function nodes(state = initialState, action) {
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
    case BULK_NODE:
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
}

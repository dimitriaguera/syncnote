import { CREATE_NODE, UPDATE_NODE, DELETE_NODE, CLEAR_NODE } from "../actions";

const initialState = {};

export function nodes(state = initialState, action) {
  let nState;
  switch (action.type) {
    case CREATE_NODE:
      nState = Object.assign({}, state);
      nState[action.node._id] = action.node;
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

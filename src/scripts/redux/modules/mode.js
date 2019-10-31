import {
  MODE_ONLINE,
  MODE_OFFLINE
} from "../../globals/_action_types";
import {
  MODE_ONLINE_ID,
  MODE_OFFLINE_ID
} from "../../globals/_sync_status";

// Default online mode.
const initialState = { id: MODE_ONLINE_ID };

export function mode(state = initialState, action) {
  switch (action.type) {
    case MODE_ONLINE:
      return { id: MODE_ONLINE_ID };
    case MODE_OFFLINE:
      return { id: MODE_OFFLINE_ID };
    default:
      return state;
  }
}

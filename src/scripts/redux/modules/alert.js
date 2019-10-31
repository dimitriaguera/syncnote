import {
  ALERT_SUCCESS,
  ALERT_WARNING,
  ALERT_INFO,
  ALERT_CLEAR,
  ALERT_ERROR
} from "../../globals/_action_types";

const initialState = {};

export function alert(state = initialState, action) {
  switch (action.type) {
    case ALERT_SUCCESS:
      return { type: "success", message: action.message };
    case ALERT_WARNING:
      return { type: "warning", message: action.message };
    case ALERT_INFO:
      return { type: "info", message: action.message };
    case ALERT_ERROR:
      return { type: "error", message: action.message };
    case ALERT_CLEAR:
      return {};
    default:
      return state;
  }
}

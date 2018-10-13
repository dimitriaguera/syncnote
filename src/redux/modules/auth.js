import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT
} from "../actions";
import { getLocalUser } from "../../services/session";

const user = getLocalUser();
const initialState = user ? { loggedIn: true, user } : {};

export function auth(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { loggingIn: true, user: action.user };
    case LOGIN_SUCCESS:
      return { loggedIn: true, user: action.user };
    case LOGIN_FAILURE:
      return {};
    case LOGOUT:
      return {};
    default:
      return state;
  }
}

import {
  BOOT_START,
  BOOT_SUCCESS,
  BOOT_FAILURE
} from "../../globals/_action_types";

const initialState = { bootStatus: 0 };

export function boot(state = initialState, action) {
  switch (action.type) {
    case BOOT_START:
      return { bootStatus: 1 };
    case BOOT_SUCCESS:
      return { bootStatus: 2 };
    case BOOT_FAILURE:
      return { bootStatus: 3, err: action.err || "Error during boot process." };
    default:
      return state;
  }
}

import uuidv1 from "uuid/v1";
import { getLocalUser } from "./session";
import {
  SYNC_WAIT_OK,
  SYNC_WAIT_CREA,
  SYNC_WAIT_UPT,
  SYNC_WAIT_DEL,
  SYNC_STATUS_DONE
} from "../globals/_sync_status";

export const buildNode = (name, shared, parent = "") => {
  return {
    _id: uuidv1(),
    owner: getLocalUser()._id,
    parent: parent,
    name: name,
    shared: shared,
    _sync_wait: SYNC_WAIT_CREA
  };
};

// Format nodes received from remote DB.
// Need to prepar before inserting in localDB :
// Adding _sync status values.
export const formatUploadedNodes = (data, opt = {}) => {
  if (Array.isArray(data)) {
    return data.map(node => {
      return formatUploadedSoloNode(node, opt);
    });
  } else {
    return formatUploadedSoloNode(data, opt);
  }
};

// Format one node for localDB.
export const formatUploadedSoloNode = (node, opt) => {
  return Object.assign(node, opt);
};
